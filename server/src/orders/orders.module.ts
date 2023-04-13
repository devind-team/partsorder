import { Module } from '@nestjs/common'
import { FilesModule } from '@files/files.module'
import { PrismaService } from '@common/services/prisma.service'
import { OrdersService } from './orders.service'
import { OrdersResolver } from './orders.resolver'

@Module({
  imports: [FilesModule],
  providers: [PrismaService, OrdersService, OrdersResolver],
  exports: [OrdersService],
})
export class OrdersModule {}
