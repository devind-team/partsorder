import { Field, ObjectType } from '@nestjs/graphql'
import { Order } from '@generated/order'

@ObjectType()
export class CreateOrderType {
  @Field()
  order!: Order
}
