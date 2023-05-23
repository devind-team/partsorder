import { Module } from '@nestjs/common'
import { ItemsResolver } from './items.resolver'
import { ItemsService } from './items.service'
import { PrismaService } from '@common/services/prisma.service'

@Module({
  providers: [PrismaService, ItemsResolver, ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
