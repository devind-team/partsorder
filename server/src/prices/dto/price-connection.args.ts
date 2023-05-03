import { ArgsType, IntersectionType } from '@nestjs/graphql'
import { FindManyPriceArgs } from '@generated/price'
import { PaginationArgs } from '@common/relay/dto/pagination.args'

@ArgsType()
export class PriceConnectionArgs extends IntersectionType(FindManyPriceArgs, PaginationArgs) {}
