import { Args, Mutation, Resolver, Query } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@auth/auth.guard'
import { CurrentUser } from '@auth/auth.decorators'
import { OrdersService } from '@orders/orders.service'
import { CreateOrderInput } from '@orders/dto/create-order.input'
import { CreateOrderType } from '@orders/dto/create-order.type'
import { User } from '@generated/user'
import { OrderConnectionType } from '@orders/dto/order-connection.type'
import { OrderConnectionArgs } from '@orders/dto/order-connection.args'
import { findManyCursorConnection } from '@common/relay/find-many-cursor-connection'
import { PrismaService } from '@common/services/prisma.service'

@UseGuards(GqlAuthGuard)
@Resolver()
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService, private readonly prismaService: PrismaService) {}

  /**
   * Запрос заказов пользователя
   */
  @Query(() => OrderConnectionType)
  async orders(@CurrentUser() user: User, @Args() params: OrderConnectionArgs): Promise<OrderConnectionType> {
    return findManyCursorConnection(
      (args) =>
        this.prismaService.order.findMany({
          where: params.where,
          orderBy: params.orderBy,
          ...args,
        }),
      () => this.prismaService.order.count({ where: params.where }),
      params,
    )
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
}
