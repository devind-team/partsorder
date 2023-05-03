import { Field, ObjectType } from '@nestjs/graphql'
import { Price } from '@generated/price'

@ObjectType()
export class CreatePriceType {
  @Field()
  price: Price
}
