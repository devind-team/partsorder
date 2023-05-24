import { PaginationArgs } from '@common/relay/dto/pagination.args'
import { FindManyItemArgs } from '@generated/item'
import { ArgsType, IntersectionType } from '@nestjs/graphql'

@ArgsType()
export class ItemConnectionArgs extends IntersectionType(FindManyItemArgs, PaginationArgs) {}
