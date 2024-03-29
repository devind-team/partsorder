import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CreateOrderInput } from '@orders/dto/create-order.input'
import { PrismaService } from '@common/services/prisma.service'
import { FilesService } from '@files/files.service'
import { CreateOrderType } from '@orders/dto/create-order.type'
import { OrderConnectionArgs } from '@orders/dto/order-connection.args'
import { OrderConnectionType } from '@orders/dto/order-connection.type'
import { findManyCursorConnection } from '@common/relay/find-many-cursor-connection'
import { ProductsService } from '@products/products.service'
import { orderItemValidator } from '@items/validators'
import { Order } from '@generated/order'
import { ItemStatus, OrderStatus, Role } from '@generated/prisma'
import { User } from '@generated/user'
import { File } from '@generated/file'
import { Status } from '@generated/status'
import { ItemsService } from '@items/items.service'

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productsService: ProductsService,
    private readonly itemsService: ItemsService,
    private readonly fileService: FilesService,
  ) {}

  /**
   * Выбираем заказа по идентификатору
   * @param orderId
   */
  async getOrder(orderId: number): Promise<Order> {
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
    const where = (
      user.role === Role.USER ? { ...params.where, userId: user.id } : params.where
    ) as Prisma.OrderWhereInput
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
   * Удаление заказа
   * Удаляем заказ если пользователь сам его создал или пользователь админ
   * @param user: пользователь
   * @param orderId: идентификатор заказа
   */
  async deleteOrder(user: User, orderId: number): Promise<number> {
    const order = await this.prismaService.order.findUnique({
      select: { id: true, userId: true },
      where: { id: orderId },
    })
    if (order.userId === user.id || user.role === 'ADMIN') {
      await this.prismaService.order.delete({ where: { id: orderId } })
    }
    return orderId
  }

  /**
   * Добавляем статус к заказу.
   * В случае, если добавляем к заказу согласован, то все позиции получают такой же статус
   * @param user: пользователь
   * @param orderId: идентификатор заказа
   * @param status: статус заказа
   */
  async addStatus(user: User, orderId: number, status: OrderStatus): Promise<Status> {
    if (status === 'APPROVED') {
      const itemIds = await this.prismaService.item.findMany({ select: { id: true }, where: { orderId } })
      await this.itemsService.addStatuses(
        user,
        itemIds.map((item) => item.id),
        ItemStatus.APPROVED,
      )
    }
    return this.prismaService.status.create({
      include: { user: true },
      data: {
        orderId,
        status,
        userId: user.id,
      },
    })
  }
  /**
   * Выгрузка заказа
   * @param user
   * @param orderId
   */
  async unloadOrder(user: User, orderId: number): Promise<File> {
    const headers: Record<string, string> = {
      id: '#',
      'product.vendorCode': 'Артикул',
      'product.manufacturer': 'Производитель',
      quantity: 'Количество',
      price: 'Цена Евро без НДС',
      bill: 'Сумма Евро без НДС',
    }
    const orderItems = await this.prismaService.item.findMany({
      select: {
        quantity: true,
        price: true,
        product: {
          select: { vendorCode: true, manufacturer: true },
        },
      },
      where: { orderId },
    })
    return await this.fileService.getExcelFile(
      `order#${orderId}`,
      headers,
      orderItems.map((item, index) => ({
        ...item,
        price: Number(item.price.price),
        bill: Number(item.price.price) * item.quantity,
        id: index + 1,
      })),
      user,
    )
  }
}
