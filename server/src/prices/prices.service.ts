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
import { productValidator } from '@products/validators'
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
    const vendorCodes = values
      .map((v) => v.get('vendorCode'))
      .filter(Boolean)
      .map(String)
    const productsIndex = await this.productsService.findIdsByVendorCodes(vendorCodes)

    const makeProductsForWrite = async (vs: Map<string, unknown>[]) => {
      return vs
        .filter((v) => Boolean(v.get('vendorCode')))
        .map((v) =>
          productValidator.safeParse({
            ...Object.fromEntries(v),
            vendorCode: String(v.get('vendorCode')),
          }),
        )
        .filter((validationResult) => validationResult.success)
        .map((validationResult) => validationResult['data'])
        .filter((createProductData) => !productsIndex.has(createProductData.vendorCode))
    }
    const createProductsData = await makeProductsForWrite(values)
    await this.prismaService.product.createMany({ data: createProductsData, skipDuplicates: true })
    const createdProductIndex = await this.productsService.findIdsByVendorCodes(
      createProductsData.map((createProductData) => createProductData.vendorCode),
    )
    const { data, rows } = await this.#makePricesForWrite(values, productsIndex, createdProductIndex)
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
          data.push({ ...(validateData as PriceCreateManyInput), price: new Decimal(price) })
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
