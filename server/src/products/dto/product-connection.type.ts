import Pagination from '@common/relay/pagination'
import { ObjectType } from '@nestjs/graphql'
import { Product } from '@generated/product'

@ObjectType()
export class ProductConnectionType extends Pagination(Product) {}
