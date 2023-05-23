import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class DeleteOrderType {
  @Field(() => Number, { description: 'Идентификатор удаленного заказа', nullable: false })
  deleteId!: number
}
