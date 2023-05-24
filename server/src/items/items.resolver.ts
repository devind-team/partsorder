import { CurrentUser } from '@auth/auth.decorators'
import { GqlAuthGuard } from '@auth/auth.guard'
import { DeleteManyItemArgs, Item } from '@generated/item'
import { ItemStatus } from '@generated/prisma'
import { User } from '@generated/user'
import { DeleteOrderItemsType } from '@items/dto/delete-order-items.type'
import { ItemsService } from '@items/items.service'
import { UseGuards } from '@nestjs/common'
import { Args, Float, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ItemConnectionArgs } from './dto/item-connection.args'
import { ItemConnectionType } from './dto/item-connection.type'

@UseGuards(GqlAuthGuard)
@Resolver()
export class ItemsResolver {
  constructor(private readonly itemsService: ItemsService) {}

  @Query(() => ItemConnectionType)
  async items(@Args() params: ItemConnectionArgs): Promise<ItemConnectionType> {
    return await this.itemsService.getItemConnection(params)
  }

  @Mutation(() => [Item])
  async addStatuses(
    @CurrentUser() user: User,
    @Args({ type: () => Int, name: 'orderId', description: 'Идентификатор заказа' }) orderId: number,
    @Args({ type: () => [Int], name: 'itemIds', description: 'Идентификаторы позиций' }) itemsId: number[],
    @Args({ type: () => ItemStatus, name: 'status', description: 'Статус заказа' }) status: ItemStatus,
  ): Promise<Item[]> {
    await this.itemsService.addStatuses(user, await this.itemsService.getOrderItems(orderId, itemsId), status)
    return await this.itemsService.getItems(orderId, { statuses: true })
  }

  @Mutation(() => [Item])
  async recountPrices(
    @CurrentUser() user: User,
    @Args({ type: () => Int, name: 'orderId', description: 'Идентификатор заказа' }) orderId: number,
    @Args({ type: () => [Int], name: 'itemIds', description: 'Идентификаторы позиций' }) itemsId: number[],
  ): Promise<Item[]> {
    await this.itemsService.recountPrices(user, await this.itemsService.getOrderItems(orderId, itemsId))
    return await this.itemsService.getItems(orderId, { price: true })
  }
  /**
   * Мутация для изменения наценки заказа
   * @param user: Пользователь
   * @param orderId: Идентификатор заказа
   * @param itemsId: Идентификаторы позиций
   * @param coefficient: Новое значение коэффицнета
   */
  @Mutation(() => [Item])
  async changeCoefficientItems(
    @CurrentUser() user: User,
    @Args({ type: () => Int, name: 'orderId', description: 'Идентификатор заказа' }) orderId: number,
    @Args({ type: () => [Int], name: 'itemIds', description: 'Идентификаторы позиций' }) itemsId: number[],
    @Args({ type: () => Float, name: 'coefficient', description: 'Коэффициент' }) coefficient: number,
  ): Promise<Item[]> {
    await this.itemsService.changeCoefficients(await this.itemsService.getOrderItems(orderId, itemsId), coefficient)
    return await this.itemsService.getItems(orderId)
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
    return await this.itemsService.deleteItems(user, orderId, deleteManyItemArgs)
  }
}
