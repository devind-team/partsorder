import Pagination from '@common/relay/pagination'
import { Order } from '@generated/order'
import { ObjectType } from '@nestjs/graphql'

@ObjectType()
export class OrderConnectionType extends Pagination(Order) {}
