import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/services/prisma.service'
import { findManyCursorConnection } from '@common/relay/find-many-cursor-connection'
import { Decimal } from '@prisma/client/runtime'
import { PriceConnectionArgs } from '@prices/dto/price-connection.args'
import { PriceConnectionType } from '@prices/dto/price-connection.type'
import { CreateUploadPricesType } from '@prices/dto/create-upload-prices.type'
import { CreateUploadPriceRowType } from '@prices/dto/create-upload-price-row.type'
import { CreatePriceInput } from '@prices/dto/create-price.input'
import { Price, PriceCreateManyInput } from '@generated/price'
import { User } from '@generated/user'
import { ProductsService } from '@products/products.service'
import { priceValidator } from '@prices/validators'

@Injectable()
export class PricesService {
  constructor(private readonly prismaService: PrismaService, private readonly productsService: ProductsService) {}

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
  async createPrice(price: CreatePriceInput): Promise<Price> {
    return this.prismaService.price.create({
      data: price,
    })
  }

  /**
   * Создание цен из значений
   * @param headers: передаваемый список заголовков, первые символы обызятальные
   * @param values: массив значений
   */
  async addPricesFromValues(headers: string[], values: Map<string, unknown>[]): Promise<CreateUploadPricesType> {
    const { products, createdProducts } = await this.productsService.getOrCreateProducts(values)
    const { data, rows } = await this.#makePricesForWrite(values, products, createdProducts)
    await this.prismaService.price.createMany({ data })
    return { headers, rows }
  }

  /**
   * Подготовка цен для зависи в БД
   * @param values: значения цен
   * @param productsIndex: найденные индексы продуктов
   * @param createdProductIndex: созданные индексы продуктов
   */
  async #makePricesForWrite(
    values: Map<string, unknown>[],
    productsIndex: Map<string, number>,
    createdProductIndex: Map<string, number>,
  ): Promise<{ rows: CreateUploadPriceRowType[]; data: PriceCreateManyInput[] }> {
    const rows: CreateUploadPriceRowType[] = []
    const data: PriceCreateManyInput[] = []
    for (const value of values) {
      const vendorCode = value.get('vendorCode')
      const productId = productsIndex.get(String(vendorCode)) || createdProductIndex.get(String(vendorCode))
      if (productId) {
        const validatedPrice = await priceValidator.safeParseAsync({
          ...Object.fromEntries(value),
          price: Number(value.get('price')),
          productId,
        })
        if (validatedPrice.success) {
          const { price, ...validateData } = validatedPrice.data
          data.push({ ...(validateData as Omit<PriceCreateManyInput, 'price'>), price: new Decimal(price) })
        }
        rows.push({
          success: validatedPrice.success,
          productCreate: createdProductIndex.has(String(value.get('vendorCode'))),
          data: Object.fromEntries(value),
          error: validatedPrice.success ? null : validatedPrice['error']['issues'],
        })
      }
    }
    return { rows, data }
  }
}
