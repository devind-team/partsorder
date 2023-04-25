import { Injectable } from '@nestjs/common'
import { User } from '@generated/user'
import { CreateOrderInput } from '@orders/dto/create-order.input'
import { PrismaService } from '@common/services/prisma.service'
import { FilesService } from '@files/files.service'
import { CreateOrderType } from '@orders/dto/create-order.type'
import { Order } from '@generated/order'
import { OrderConnectionArgs } from '@orders/dto/order-connection.args'
import { OrderConnectionType } from '@orders/dto/order-connection.type'
import { findManyCursorConnection } from '@common/relay/find-many-cursor-connection'
import { Role } from '@generated/prisma'

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService, private readonly fileService: FilesService) {}

  /**
   * Выбираем заказа по идентификатору
   * @param orderId
   */
  async getOrder(orderId: number): Promise<Order> {
    return this.prismaService.order.findUnique({
      include: { statuses: true, comments: true, manager: true, item: true },
      where: { id: orderId },
    })
  }

  /**
   * Получение relay запросов для пагинации
   * Если роль админ, получаем всех, если роль пользователь, то только свое.
   * @param user
   * @param params
   */
  async getOrderConnection(user: User, params: OrderConnectionArgs): Promise<OrderConnectionType> {
    const where = user.role === Role.USER ? { ...params.where, userId: user.id } : params.where
    return await findManyCursorConnection(
      (args) =>
        this.prismaService.order.findMany({
          include: { statuses: true, user: true, manager: true },
          where,
          orderBy: params.orderBy,
          ...args,
        }),
      () => this.prismaService.order.count({ where }),
      params,
    )
  }
  async createOrder(user: User, orderInput: CreateOrderInput): Promise<CreateOrderType> {
    const file = await this.fileService.add(orderInput.file, user)
    // Вытаскиваем файл из minio, через fileService и парсим его
    // Все раскладываем по полочкам
    const order = await this.prismaService.order.create({
      data: {
        address: orderInput.address,
        userId: user.id,
      },
    })
    return { order }
  }
}
