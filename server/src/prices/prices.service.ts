import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/services/prisma.service'
import { findManyCursorConnection } from '@common/relay/find-many-cursor-connection'
import { PriceConnectionArgs } from '@prices/dto/price-connection.args'
import { PriceConnectionType } from '@prices/dto/price-connection.type'
import { CreateUploadPricesType } from '@prices/dto/create-upload-prices.type'
import { Price, PriceCreateInput } from '@generated/price'
import { User } from '@generated/user'

@Injectable()
export class PricesService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Получение relay запросов для пагинации
   * @param user: пользователь
   * @param params: парметры фильтрации
   */
  async getPriceConnection(user: User, params: PriceConnectionArgs): Promise<PriceConnectionType> {
    return findManyCursorConnection(
      (args) =>
        this.prismaService.price.findMany({
          where: params.where,
          orderBy: params.orderBy,
          ...args,
        }),
      () => this.prismaService.price.count({ where: params.where }),
      params,
    )
  }

  /**
   * Сервис для добавления цены
   * @param price
   */
  async createPrice(price: PriceCreateInput): Promise<Price> {
    return this.prismaService.price.create({
      data: price,
    })
  }

  /**
   * Создание цен из значений
   * @param headers: передаваемый список заголовков
   * @param values: массив значений
   */
  async addPricesFromValues(headers: string[], values: Map<string, unknown>[]): Promise<CreateUploadPricesType> {
    return {
      headers,
      rows: [],
    }
  }
}
