import { UseGuards } from '@nestjs/common'
import { Args, Float, Int, Mutation, Resolver } from '@nestjs/graphql'
import { CurrentUser } from '@auth/auth.decorators'
import { GqlAuthGuard } from '@auth/auth.guard'
import { DeleteOrderItemsType } from '@items/dto/delete-order-items.type'
import { ItemsService } from '@items/items.service'
import { User } from '@generated/user'
import { DeleteManyItemArgs, Item } from '@generated/item'
import { ItemStatus } from '@generated/prisma'

@UseGuards(GqlAuthGuard)
@Resolver()
export class ItemsResolver {
  constructor(private readonly itemsService: ItemsService) {}
  /**
   * Добавление статуса к заказу
   * @param user: пользователь
   * @param orderId: идентификатор заказа
   * @param itemsId: идентификаторы позиций
   * @param status: добавляемый статус
   */
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
  /**
   * Мутация для автоматического проценивания
   * @param user: пользователь
   * @param orderId: идентификтор заказа
   * @param itemsId: идентификаторы позиций
   */
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
    console.log(coefficient)
    await this.itemsService.changeCoefficients(await this.itemsService.getOrderItems(orderId, itemsId), coefficient)
    return await this.itemsService.getItems(orderId)
  }
  /**
   * Мутация дл изменение цены прожади
   * @param user
   * @param itemId
   * @param price
   */
  @Mutation(() => Item)
  async changeSellingPriceItem(
    @CurrentUser() user: User,
    @Args({ type: () => Int, name: 'itemId', description: 'Идентификатор позиции' }) itemId: number,
    @Args({ type: () => Float, name: 'price', description: 'Цена продажи' }) price: number,
  ): Promise<Item> {
    return await this.itemsService.changeSellingPriceItem(itemId, price)
  }
  @Mutation(() => Item)
  async changeQuantityItem(
    @CurrentUser() user: User,
    @Args({ type: () => Int, name: 'itemId', description: 'Идентификатор позиции' }) itemId: number,
    @Args({ type: () => Int, name: 'quantity', description: 'Количество позиций' }) quantity: number,
  ): Promise<Item> {
    return await this.itemsService.changeQuantityItem(itemId, quantity)
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
