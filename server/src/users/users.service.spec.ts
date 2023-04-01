import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { PrismaService } from '@common/services/prisma.service'
import { FilesModule } from '@files/files.module'
import { UsersResolver } from '@users/users.resolver'
import { ConfigModule } from '@nestjs/config'
import { MinioModuleTest } from '@files/files.resolver.spec'

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FilesModule, ConfigModule, MinioModuleTest],
      providers: [PrismaService, UsersService, UsersResolver],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
