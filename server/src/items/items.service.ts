import { Injectable } from '@nestjs/common'
import { User } from '@generated/user'
import { DeleteManyItemArgs } from '@generated/item'
import { DeleteOrderItemsType } from '@items/dto/delete-order-items.type'
import { PrismaService } from '@common/services/prisma.service'
import { Item } from '@prisma/client'
import { ItemStatus } from '@generated/prisma'

@Injectable()
export class ItemsService {
  constructor(private readonly prismaService: PrismaService) {}

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
   * @param user: пользователь
   * @param orderId: идентификатор заказа
   * @param itemsId: идентификаторы позиций
   * @param coefficient: значение коэффициента
   */
  async changeCoefficients(user: User, orderId: number, itemsId: number[], coefficient: number): Promise<Item[]> {
    await this.prismaService.item.updateMany({
      where: {
        orderId,
        id: { in: itemsId },
        ...(user.role === 'ADMIN' ? {} : { userId: user.id }),
      },
      data: { coefficient },
    })
    return this.prismaService.item.findMany({ where: { orderId } })
  }

  /**
   * Добавляем статус к записям
   * @param user: пользователь
   * @param itemsId: идентификаторы записей
   * @param status: тип добавляемого статуса
   */
  async addStatuses(user: User, itemsId: number[], status: ItemStatus): Promise<Item[]> {
    await this.prismaService.statusItem.createMany({
      data: itemsId.map((itemId) => ({
        itemId,
        status,
        userId: user.id,
      })),
    })
    return this.prismaService.item.findMany({
      include: { statuses: true },
      where: { id: { in: itemsId } },
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
    const where = { ...deleteManyItemArgs.where, orderId, ...(user.role === 'ADMIN' ? {} : { userId: user.id }) }
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
