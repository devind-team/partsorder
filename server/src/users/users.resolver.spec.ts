import { Test, TestingModule } from '@nestjs/testing'
import { UsersResolver } from './users.resolver'
import { FilesModule } from '@files/files.module'
import { PrismaService } from '@common/services/prisma.service'
import { UsersService } from '@users/users.service'
import { ConfigModule } from '@nestjs/config'
import { MinioModuleTest } from '@files/files.resolver.spec'

describe('UsersResolver', () => {
  let resolver: UsersResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FilesModule, ConfigModule, MinioModuleTest],
      providers: [PrismaService, UsersService, UsersResolver],
    }).compile()

    resolver = module.get<UsersResolver>(UsersResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
