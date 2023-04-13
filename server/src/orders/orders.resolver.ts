import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@auth/auth.guard'
import { CurrentUser } from '@auth/auth.decorators'
import { OrdersService } from '@orders/orders.service'
import { CreateOrderInput } from '@orders/dto/create-order.input'
import { CreateOrderType } from '@orders/dto/create-order.type'
import { User } from '@generated/user'

@Resolver()
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(GqlAuthGuard)
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
