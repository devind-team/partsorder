import { findManyCursorConnection } from '@common/relay/find-many-cursor-connection'
import { PrismaService } from '@common/services/prisma.service'
import { DeleteManyItemArgs, Item } from '@generated/item'
import { ItemStatus } from '@generated/prisma'
import { User } from '@generated/user'
import { DeleteOrderItemsType } from '@items/dto/delete-order-items.type'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { ItemConnectionArgs } from './dto/item-connection.args'
import { ItemConnectionType } from './dto/item-connection.type'

@Injectable()
export class ItemsService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Получение записи
   * @param id
   * @param include
   */
  async getItem(
    id: number,
    include?: Prisma.ItemInclude,
  ): Promise<Prisma.ItemGetPayload<{ include: Prisma.ItemInclude; where: { id: number } }>> {
    return this.prismaService.item.findUnique({ include, where: { id } })
  }

  /**
   * Получение relay запросов для пагинации
   * @param params: параметры фильтрации
   */
  async getItemConnection(params: ItemConnectionArgs): Promise<ItemConnectionType> {
    return await findManyCursorConnection(
      (args) =>
        this.prismaService.item.findMany({
          include: {
            order: true,
            product: true,
            statuses: { orderBy: { createdAt: 'asc' } },
            price: true,
            commentItem: { orderBy: { createdAt: 'desc' } },
          },
          where: params.where,
          orderBy: params.orderBy,
          ...args,
        }),
      () => this.prismaService.item.count({ where: params.where }),
      params,
    )
  }

  /**
   * Получение позиций по последнему статусу
   * @param status: последний установленный статус
   * @param params: параметры фильтрации
   */
  async getItemsByLastStatusConnection(status: ItemStatus, params: ItemConnectionArgs): Promise<ItemConnectionType> {
    console.log('-----------------------')
    console.log(status)
    const availableItems = await this.prismaService.$queryRaw<{ id: number }[]>`
        select item.id as id
        from (select i.id                                        as id,
                     si.created_at                               as created_at,
                     si.status                                   as status,
                     max(si.created_at) over (partition by i.id) as created_at_max
              from items i
                       left join status_items si on i.id = si.item_id) item
        where item.created_at = item.created_at_max
          and status = '${Prisma.raw(status.toString())}'
    `
    console.log(availableItems)
    const extendParams = { ...params, where: { ...params.where, id: { in: availableItems.map((i) => i.id) } } }
    return await this.getItemConnection(extendParams)
  }

  /**
   * Получение позиций в заказе
   * @param orderId
   * @param include
   */
  async getItems(
    orderId: number,
    include?: Prisma.ItemInclude,
  ): Promise<Array<Prisma.ItemGetPayload<{ include: Prisma.ItemInclude; where: { orderId: number } }>>> {
    return this.prismaService.item.findMany({ include, where: { orderId } })
  }

  /**
   * Получение идентификаторов позиций, привязанных к заказу
   * @param orderId: идентификатор заказа
   * @param itemsId: идентификаторы записей
   */
  async getOrderItems(orderId: number, itemsId: number[]): Promise<number[]> {
    const items = await this.prismaService.item.findMany({
      select: { id: true },
      where: {
        id: { in: itemsId },
        orderId,
      },
    })
    return items.map((item) => item.id)
  }

  /**
   * Добавляем статус к записям
   * @param user: пользователь
   * @param itemsId: идентификаторы записей
   * @param status: тип добавляемого статуса
   */
  async addStatuses(user: User, itemsId: number[], status: ItemStatus): Promise<Prisma.BatchPayload> {
    return this.prismaService.statusItem.createMany({
      data: itemsId.map((itemId) => ({
        itemId,
        status,
        userId: user.id,
      })),
    })
  }

  /**
   * Алгоритм автоматического проценивания
   * @param user: пользователь
   * @param itemsId: идентификаторы записей
   */
  async recountPrices(user: User, itemsId: number[]): Promise<void> {
    const itemPrices = await this.prismaService.$queryRaw<{ price: number; item: number }[]>`
      select pi.id as price, pi.item_id as item
      from (select pr.id,
                   pr.item_id,
                   pr.price,
                   pr.product_id,
                   min(pr.price) over (partition by pr.product_id) as min_price
            from (select p.id,
                         i.id                                                                as item_id,
                         p.price,
                         p.created_at,
                         p.product_id,
                         p.supplier_name,
                         max(p.created_at) over (partition by p.product_id, p.supplier_name) as created_at_max,
                         min(p.price) over (partition by p.product_id, p.supplier_name)      as price_min
                  from prices p
                         left join products product on product.id = p.product_id
                         left join items i on product.id = i.product_id
                  where i.id in (${Prisma.join(itemsId)})) pr
            where pr.created_at = pr.created_at_max
              and pr.price = pr.price_min) pi
      where pi.price = pi.min_price
    `
    await this.prismaService.$transaction(
      itemPrices.map(({ price, item }) =>
        this.prismaService.item.update({
          where: { id: item },
          data: { priceId: price },
        }),
      ),
    )
  }

  /**
   * Изменение коэффицнетов заказа
   * @param itemsId: идентификаторы позиций
   * @param coefficient: значение коэффициента
   */
  async changeCoefficients(itemsId: number[], coefficient: number): Promise<Prisma.BatchPayload> {
    return this.prismaService.item.updateMany({
      where: { id: { in: itemsId } },
      data: { coefficient },
    })
  }

  /**
   * Мутация изменения цены продажи за счет изменения коэффициента
   * @param id: идентификатор позиции
   * @param price: значение цены
   */
  async changeSellingPriceItem(id: number, price: number): Promise<Item> {
    const item = await this.prismaService.item.findUnique({
      select: { price: { select: { price: true } } },
      where: { id },
    })
    return this.prismaService.item.update({
      where: { id },
      data: { coefficient: price / Number(item.price.price) },
    })
  }

  /**
   * Обновление количества элементов заказа
   * @param itemId: идентификатор позиции
   * @param quantity: количество
   */
  async changeQuantityItem(itemId: number, quantity: number): Promise<Item> {
    return this.prismaService.item.update({
      where: { id: itemId },
      data: { quantity },
    })
  }

  /**
   * Удаление элементво из заказа
   * @param user: пользователь
   * @param orderId: идентификатор заказа
   * @param deleteManyItemArgs: условие даления
   */
  async deleteItems(
    user: User,
    orderId: number,
    deleteManyItemArgs: DeleteManyItemArgs,
  ): Promise<DeleteOrderItemsType> {
    const where = {
      ...deleteManyItemArgs.where,
      orderId,
      ...(user.role === 'ADMIN' ? {} : { userId: user.id }),
    } as Prisma.ItemWhereInput
    const items = await this.prismaService.item.findMany({
      where,
      select: {
        id: true,
      },
    })
    const deleteIds = items.map((item) => item.id)
    await this.prismaService.item.deleteMany({
      where: { id: { in: deleteIds } },
    })
    return { deleteIds }
  }
}
