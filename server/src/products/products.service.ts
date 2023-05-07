import { Injectable } from '@nestjs/common'
import { ProductConnectionArgs } from './dto/product-connection.args'
import { ProductConnectionType } from './dto/product-connection.type'
import { findManyCursorConnection } from '@common/relay/find-many-cursor-connection'
import { PrismaService } from '@common/services/prisma.service'

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
}
