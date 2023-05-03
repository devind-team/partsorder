import { Module } from '@nestjs/common'
import { PricesService } from './prices.service'
import { PricesResolver } from './prices.resolver'
import { PrismaService } from '@common/services/prisma.service'
import { FilesModule } from '@files/files.module'

@Module({
  imports: [FilesModule],
  providers: [PrismaService, PricesService, PricesResolver],
  exports: [PrismaService],
})
export class PricesModule {}
