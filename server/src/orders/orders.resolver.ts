import { File } from '@generated/file'
import { Args, Mutation, Resolver, Query, Int } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@auth/auth.guard'
import { CurrentUser } from '@auth/auth.decorators'
import { OrdersService } from '@orders/orders.service'
import { CreateOrderInput } from '@orders/dto/create-order.input'
import { CreateOrderType } from '@orders/dto/create-order.type'
import { OrderConnectionType } from '@orders/dto/order-connection.type'
import { OrderConnectionArgs } from '@orders/dto/order-connection.args'
import { User } from '@generated/user'
import { Order } from '@generated/order'
import { DeleteOrderType } from '@orders/dto/delete-order.type'

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

  /**
   * Мутация для создания заказа
   * @param user: пользователь
   * @param order: данные заказа
   */
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
   * Мутация для удаления заказа
   * @param user: пользователь
   * @param orderId: иднетификатор заказа
   */
  @Mutation(() => DeleteOrderType)
  async deleteOrder(
    @CurrentUser() user: User,
    @Args({ type: () => Number, name: 'orderId', description: 'Идентификатор заказа' }) orderId: number,
  ): Promise<DeleteOrderType> {
    return { deleteId: await this.ordersService.deleteOrder(user, orderId) }
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
