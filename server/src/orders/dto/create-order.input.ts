import { OrderCreateInput } from '@generated/order'
import { InputType, Field, PickType } from '@nestjs/graphql'
import { FileUploadInput } from '@files/dto/file-upload.input'

@InputType()
export class CreateOrderInput extends PickType(OrderCreateInput, ['address'] as const) {
  @Field(() => FileUploadInput)
  file: FileUploadInput
}
