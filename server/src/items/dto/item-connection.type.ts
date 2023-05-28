import Pagination from '@common/relay/pagination'
import { Item } from '@generated/item'
import { ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ItemConnectionType extends Pagination(Item) {}
