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
