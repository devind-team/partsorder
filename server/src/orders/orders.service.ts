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
import { ProductsService } from '@products/products.service'
import { orderItemValidator } from '@orders/validators'
import { DeleteOrderItemsType } from '@orders/dto/delete-order-items.type'
import { DeleteManyItemArgs } from '@generated/item'

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productsService: ProductsService,
    private readonly fileService: FilesService,
  ) {}

  /**
   * Выбираем заказа по идентификатору
   * @param orderId
   */
  async getOrder(orderId: number): Promise<Order> {
    // 
    return this.prismaService.order.findUnique({
      include: {
        statuses: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
        comments: true,
        items: {
          include: {
            user: true,
            product: true,
            price: true,
            statuses: {
              include: { user: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        manager: true,
        user: true,
      },
      where: { id: orderId },
    })
  }

  /**
   * Получение relay запросов для пагинации
   * Если роль админ, получаем всех, если роль пользователь, то только свое.
   * @param user: пользователь
   * @param params: параметры фильтрации
   */
  async getOrderConnection(user: User, params: OrderConnectionArgs): Promise<OrderConnectionType> {
    const where = user.role === Role.USER ? { ...params.where, userId: user.id } : params.where
    return await findManyCursorConnection(
      (args) =>
        this.prismaService.order.findMany({
          include: { statuses: { include: { user: true }, orderBy: { createdAt: 'asc' } }, user: true, manager: true },
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
    const { values } = await this.fileService.getExcelValues(file)
    const { products, createdProducts } = await this.productsService.getOrCreateProducts(values)
    const order = await this.prismaService.order.create({
      data: {
        address: orderInput.address,
        userId: user.id,
        statuses: {
          create: {
            userId: user.id,
          },
        },
      },
    })
    const makeOrderItemsForWrite = async () => {
      return values
        .map((value) =>
          orderItemValidator.safeParse({
            ...Object.fromEntries(value),
            orderId: order.id,
            userId: user.id,
            productId:
              products.get(String(value.get('vendorCode'))) || createdProducts.get(String(value.get('vendorCode'))),
          }),
        )
        .filter((validationResult) => validationResult.success)
        .map((validationResult) => validationResult['data'])
    }
    const orderItemForWrite = await makeOrderItemsForWrite()
    await this.prismaService.item.createMany({ data: orderItemForWrite })
    const createdItems = await this.prismaService.item.findMany({
      select: { id: true },
      where: { order },
    })
    await this.prismaService.statusItem.createMany({
      data: createdItems.map((createdItem) => ({
        itemId: createdItem.id,
        userId: user.id,
      })),
    })
    return { order }
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
