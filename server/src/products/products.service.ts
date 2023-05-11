import { Injectable } from '@nestjs/common'
import { ProductConnectionArgs } from './dto/product-connection.args'
import { ProductConnectionType } from './dto/product-connection.type'
import { findManyCursorConnection } from '@common/relay/find-many-cursor-connection'
import { PrismaService } from '@common/services/prisma.service'
import { productValidator } from '@products/validators'

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Поиск продуктов
   * @param params
   */
  async getProductsConnection(params: ProductConnectionArgs): Promise<ProductConnectionType> {
    return await findManyCursorConnection(
      (args) =>
        this.prismaService.product.findMany({
          include: { prices: { orderBy: { updatedAt: 'desc' } } },
          where: params.where,
          orderBy: params.orderBy,
          ...args,
        }),
      () => this.prismaService.product.count({ where: params.where }),
      params,
    )
  }

  /**
   * Поиск идентификаторов продуктов по из артикулам
   * @param vendorCodes
   */
  async findIdsByVendorCodes(vendorCodes: string[]): Promise<Map<string, number>> {
    const findProducts = await this.prismaService.product.findMany({
      select: { id: true, vendorCode: true },
      where: { vendorCode: { in: vendorCodes } },
    })
    return new Map<string, number>(findProducts.map((product) => [product.vendorCode, product.id]))
  }

  /**
   * Функция для выборки и создания продектов по артиклу.
   * vendorCode - обазательное поле
   * @param values
   */
  async getOrCreateProducts(
    values: Map<string, unknown>[],
  ): Promise<{ products: Map<string, number>; createdProducts: Map<string, number> }> {
    const vendorCodes = values
      .map((v) => v.get('vendorCode'))
      .filter(Boolean)
      .map(String)
    const products = await this.findIdsByVendorCodes(vendorCodes)
    const makeProductsForWrite = async () => {
      return values
        .filter((v) => Boolean(v.get('vendorCode')))
        .map((v) =>
          productValidator.safeParse({
            ...Object.fromEntries(v),
            vendorCode: String(v.get('vendorCode')),
          }),
        )
        .filter((validationResult) => validationResult.success)
        .map((validationResult) => validationResult['data'])
        .filter((createProductData) => !products.has(createProductData.vendorCode))
    }
    const createProductsData = await makeProductsForWrite()
    await this.prismaService.product.createMany({ data: createProductsData, skipDuplicates: true })
    const createdProducts = await this.findIdsByVendorCodes(
      createProductsData.map((createProductData) => createProductData.vendorCode),
    )
    return { products, createdProducts }
  }
}
