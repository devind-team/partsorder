import { Injectable } from '@nestjs/common'
import { User } from '@generated/user'
import { DeleteManyItemArgs } from '@generated/item'
import { DeleteOrderItemsType } from '@items/dto/delete-order-items.type'
import { PrismaService } from '@common/services/prisma.service'
import { Prisma } from '@prisma/client'
import { ItemStatus } from '@generated/prisma'

@Injectable()
export class ItemsService {
  constructor(private readonly prismaService: PrismaService) {}

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
