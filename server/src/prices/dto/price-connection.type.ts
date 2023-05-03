import Pagination from '@common/relay/pagination'
import { ObjectType } from '@nestjs/graphql'
import { Price } from '@generated/price'

@ObjectType()
export class PriceConnectionType extends Pagination(Price) {}
