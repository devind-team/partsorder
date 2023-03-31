import { Test, TestingModule } from '@nestjs/testing'
import { UsersResolver } from './users.resolver'
import { FilesModule } from '@files/files.module'
import { PrismaService } from '@common/services/prisma.service'
import { UsersService } from '@users/users.service'

describe('UsersResolver', () => {
  let resolver: UsersResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FilesModule],
      providers: [PrismaService, UsersService, UsersResolver],
      exports: [UsersService],
    }).compile()

    resolver = module.get<UsersResolver>(UsersResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
