import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class DeleteOrderItemsType {
  @Field(() => [Number], { description: 'Идентификаторы удаленных записей', nullable: false })
  deleteIds!: number[]
}
