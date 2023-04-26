import { ArgsType, IntersectionType } from '@nestjs/graphql'
import { PaginationArgs } from '@common/relay/dto/pagination.args'
import { FindManyProductArgs } from '@generated/product'

@ArgsType()
export class ProductConnectionArgs extends IntersectionType(FindManyProductArgs, PaginationArgs) {}
