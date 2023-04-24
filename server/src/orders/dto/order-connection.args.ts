import { ArgsType, IntersectionType } from '@nestjs/graphql'
import { FindManyOrderArgs } from '@generated/order'
import { PaginationArgs } from '@common/relay/dto/pagination.args'

@ArgsType()
export class OrderConnectionArgs extends IntersectionType(FindManyOrderArgs, PaginationArgs) {}
