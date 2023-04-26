import { Module } from '@nestjs/common'
import { ProductsService } from './products.service'
import { ProductsResolver } from './products.resolver'
import { PrismaService } from '@common/services/prisma.service'

@Module({
  providers: [PrismaService, ProductsService, ProductsResolver],
  exports: [ProductsService],
})
export class ProductsModule {}
