import { Module } from '@nestjs/common'
import { PrismaService } from '@common/services/prisma.service'
import { FilesModule } from '@files/files.module'
import { UsersService } from './users.service'
import { UsersResolver } from './users.resolver'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule, FilesModule],
  providers: [PrismaService, UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
