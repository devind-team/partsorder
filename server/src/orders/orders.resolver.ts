import { File } from '@generated/file'
import { FilesService } from '@files/files.service'
import { Args, Mutation, Resolver, Query, Int } from '@nestjs/graphql'
import { UploadedFile, UseGuards, flatten } from '@nestjs/common'
import { GqlAuthGuard } from '@auth/auth.guard'
import { CurrentUser } from '@auth/auth.decorators'
import { OrdersService } from '@orders/orders.service'
import { CreateOrderInput } from '@orders/dto/create-order.input'
import { CreateOrderType } from '@orders/dto/create-order.type'
import { OrderConnectionType } from '@orders/dto/order-connection.type'
import { OrderConnectionArgs } from '@orders/dto/order-connection.args'
import { DeleteOrderItemsType } from '@orders/dto/delete-order-items.type'
import { User } from '@generated/user'
import { Order } from '@generated/order'
import { DeleteManyItemArgs } from '@generated/item'

@UseGuards(GqlAuthGuard)
@Resolver()
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => Order)
  async order(@CurrentUser() user: User, @Args({ name: 'orderId', type: () => Int }) orderId: number): Promise<Order> {
    return await this.ordersService.getOrder(orderId)
  }

  @Query(() => OrderConnectionType)
  async orders(@CurrentUser() user: User, @Args() params: OrderConnectionArgs): Promise<OrderConnectionType> {
    return await this.ordersService.getOrderConnection(user, params)
  }

  @Mutation(() => CreateOrderType)
  async createOrder(
    @CurrentUser() user: User,
    @Args({
      name: 'order',
      type: () => CreateOrderInput,
    })
    order: CreateOrderInput,
  ): Promise<CreateOrderType> {
    return await this.ordersService.createOrder(user, order)
  }

  /**
   * Удаление элементов из заказа
   * @param user
   * @param orderId
   * @param deleteManyItemArgs
   */
  @Mutation(() => DeleteOrderItemsType)
  async deleteOrderItems(
    @CurrentUser() user: User,
    @Args({ type: () => Int, name: 'orderId', description: 'Идентификатор заказа' }) orderId: number,
    @Args() deleteManyItemArgs: DeleteManyItemArgs,
  ): Promise<DeleteOrderItemsType> {
    return await this.ordersService.deleteItems(user, orderId, deleteManyItemArgs)
  }

  /**
   * Выгрузка заказа
   * @param user
   * @param orderId
   */
  @Mutation(() => File)
  async unloadOrder(
    @CurrentUser() user: User,
    @Args({ type: () => Int, name: 'orderId', description: 'Идентификатор заказа' }) orderId: number,
  ): Promise<File> {
    return await this.ordersService.unloadOrder(user, orderId)
  }
}
