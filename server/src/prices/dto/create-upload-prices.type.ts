import { Field, ObjectType } from '@nestjs/graphql'
import { CreateUploadPriceRowType } from '@prices/dto/create-upload-price-row.type'

@ObjectType()
export class CreateUploadPricesType {
  @Field(() => [String], { nullable: true, description: 'Заголовки передаваемого файла' })
  headers: string[]

  @Field(() => [CreateUploadPriceRowType], { description: 'Переданные строки' })
  rows: CreateUploadPriceRowType[]
}
