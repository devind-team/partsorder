import { Module } from '@nestjs/common'
import { FilesModule } from '@files/files.module'
import { PrismaService } from '@common/services/prisma.service'
import { ProductsService } from '@products/products.service'
import { ItemsService } from '@items/items.service'
import { OrdersService } from './orders.service'
import { OrdersResolver } from './orders.resolver'

@Module({
  imports: [FilesModule],
  providers: [PrismaService, ProductsService, OrdersService, OrdersResolver, ItemsService],
  exports: [OrdersService],
})
export class OrdersModule {}
