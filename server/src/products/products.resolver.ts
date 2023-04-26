import { Args, Query, Resolver } from '@nestjs/graphql'
import { ProductsService } from './products.service'
import { ProductConnectionArgs } from './dto/product-connection.args'
import { ProductConnectionType } from './dto/product-connection.type'

@Resolver()
export class ProductsResolver {
  constructor(private readonly productService: ProductsService) {}

  /**
   * Запрос на продукты
   * @param params
   */
  @Query(() => ProductConnectionType)
  async products(@Args() params: ProductConnectionArgs): Promise<ProductConnectionType> {
    return await this.productService.getProductsConnection(params)
  }
}
