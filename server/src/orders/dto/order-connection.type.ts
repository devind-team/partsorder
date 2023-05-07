import Pagination from '@common/relay/pagination'
import { ObjectType } from '@nestjs/graphql'
import { Order } from '@generated/order'

@ObjectType()
export class OrderConnectionType extends Pagination(Order) {}
