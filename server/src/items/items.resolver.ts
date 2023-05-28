import { UseGuards } from '@nestjs/common'
import { Args, Float, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { CurrentUser } from '@auth/auth.decorators'
import { GqlAuthGuard } from '@auth/auth.guard'
import { DeleteOrderItemsType } from '@items/dto/delete-order-items.type'
import { ItemsService } from '@items/items.service'
import { ItemConnectionArgs } from './dto/item-connection.args'
import { ItemConnectionType } from './dto/item-connection.type'
import { DeleteManyItemArgs, Item } from '@generated/item'
import { ItemStatus } from '@generated/prisma'
import { User } from '@generated/user'

@UseGuards(GqlAuthGuard)
@Resolver()
export class ItemsResolver {
  constructor(private readonly itemsService: ItemsService) {}

  @Query(() => ItemConnectionType)
  async items(@Args() params: ItemConnectionArgs): Promise<ItemConnectionType> {
    return await this.itemsService.getItemConnection(params)
  }

  /**
   * Получение позиций по последнему статусу
   * @param status: последний установленный статус
   * @param params: параметры фильтрации
   */
  @Query(() => ItemConnectionType)
  async itemsByLastStatus(
    @Args({ type: () => ItemStatus, name: 'status', description: 'Текущий статус позиции' }) status: ItemStatus,
    @Args() params: ItemConnectionArgs,
  ): Promise<ItemConnectionType> {
    return await this.itemsService.getItemsByLastStatusConnection(status, params)
  }
  /**
   * Добавление статуса к заказу
   * @param user: пользователь
   * @param orderId: идентификатор заказа
   * @param itemIds: идентификаторы позиций
   * @param status: добавляемый статус
   */
  @Mutation(() => [Item])
  async addStatusItems(
    @CurrentUser() user: User,
    @Args({ type: () => Int, name: 'orderId', description: 'Идентификатор заказа' }) orderId: number,
    @Args({ type: () => [Int], name: 'itemIds', description: 'Идентификаторы позиций' }) itemIds: number[],
    @Args({ type: () => ItemStatus, name: 'status', description: 'Статус позиции заказа' }) status: ItemStatus,
  ): Promise<Item[]> {
    await this.itemsService.addStatuses(user, await this.itemsService.getOrderItems(orderId, itemIds), status)
    return await this.itemsService.getItems(orderId, { statuses: { include: { user: true } } })
  }
  /**
   * Мутация для автоматического проценивания
   * @param user: пользователь
   * @param orderId: идентификтор заказа
   * @param itemIds: идентификаторы позиций
   */
  @Mutation(() => [Item])
  async recountPrices(
    @CurrentUser() user: User,
    @Args({ type: () => Int, name: 'orderId', description: 'Идентификатор заказа' }) orderId: number,
    @Args({ type: () => [Int], name: 'itemIds', description: 'Идентификаторы позиций' }) itemIds: number[],
  ): Promise<Item[]> {
    await this.itemsService.recountPrices(user, await this.itemsService.getOrderItems(orderId, itemIds))
    return await this.itemsService.getItems(orderId, { price: true })
  }
  /**
   * Мутация для изменения наценки заказа
   * @param user: Пользователь
   * @param orderId: Идентификатор заказа
   * @param itemIds: Идентификаторы позиций
   * @param coefficient: Новое значение коэффицнета
   */
  @Mutation(() => [Item])
  async changeCoefficientItems(
    @CurrentUser() user: User,
    @Args({ type: () => Int, name: 'orderId', description: 'Идентификатор заказа' }) orderId: number,
    @Args({ type: () => [Int], name: 'itemIds', description: 'Идентификаторы позиций' }) itemIds: number[],
    @Args({ type: () => Float, name: 'coefficient', description: 'Коэффициент' }) coefficient: number,
  ): Promise<Item[]> {
    console.log(coefficient)
    await this.itemsService.changeCoefficients(await this.itemsService.getOrderItems(orderId, itemIds), coefficient)
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

  /**
   * Изменение количества позиций в заказе
   * @param user
   * @param itemId
   * @param quantity
   */
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
