import GraphQLJSON from 'graphql-type-json'
import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class CreateUploadPriceRowType {
  @Field({ description: 'Статус', nullable: false, defaultValue: true })
  success!: boolean
  @Field({ description: 'Новый продукт', nullable: false, defaultValue: false })
  productCreate!: boolean
  @Field(() => GraphQLJSON, { description: 'Строка переданных данных', nullable: false })
  data!: any
  @Field(() => GraphQLJSON, { description: 'Ошибка создания объекта', nullable: true })
  error?: any
}
