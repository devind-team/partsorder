import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@auth/auth.guard'
import { PricesService } from '@prices/prices.service'
import { CreatePriceType } from '@prices/dto/create-price.type'
import { CurrentUser } from '@auth/auth.decorators'
import { PriceConnectionType } from '@prices/dto/price-connection.type'
import { PriceConnectionArgs } from '@prices/dto/price-connection.args'
import { CreateUploadPricesType } from '@prices/dto/create-upload-prices.type'
import { FileUploadInput } from '@files/dto/file-upload.input'
import { FilesService } from '@files/files.service'
import { CreatePriceInput } from '@prices/dto/create-price.input'
import { User } from '@generated/user'

@UseGuards(GqlAuthGuard)
@Resolver()
export class PricesResolver {
  constructor(private readonly pricesService: PricesService, private readonly fileService: FilesService) {}

  @Query(() => PriceConnectionType)
  async prices(@CurrentUser() user: User, @Args() params: PriceConnectionArgs): Promise<PriceConnectionType> {
    return await this.pricesService.getPriceConnection(user, params)
  }

  @Mutation(() => CreatePriceType)
  async createPrice(
    @Args({ name: 'price', type: () => CreatePriceInput, nullable: false }) price: CreatePriceInput,
  ): Promise<CreatePriceType> {
    return { price: await this.pricesService.createPrice(price) }
  }

  /**
   * Мутация для загрузки цен из xlsx файла.
   * Пользователь загружает xlsx файл со следующими полями:
   * Относится к Price:
   *    - price - цена в евро
   *    - duration? - срок поставки
   *    - supplierName? - название поставщика
   *    - country? - страна постащика
   *    - site? - сайт
   *    - comment? - комментарий
   *    - validAt? - дата запроса цены
   * Относится к Product:
   *    - vendorCode - артикул
   *    - name? - название
   *    - manufacturer? - производитель
   * @param user: пользователь
   * @param fileUpload: файл для загрузки
   */
  @Mutation(() => CreateUploadPricesType)
  async uploadPrices(
    @CurrentUser() user: User,
    @Args({ name: 'fileUpload', type: () => FileUploadInput }) fileUpload: FileUploadInput,
  ): Promise<CreateUploadPricesType> {
    const file = await this.fileService.add(fileUpload, user)
    const { headers, values } = await this.fileService.getExcelValues(file)
    return await this.pricesService.addPricesFromValues(headers, values)
  }
}
