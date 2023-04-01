import { Test, TestingModule } from '@nestjs/testing'
import { FilesService } from './files.service'
import { ConfigModule } from '@nestjs/config'
import { FilesResolver } from '@files/files.resolver'
import { PrismaService } from '@common/services/prisma.service'
import { MinioModuleTest } from '@files/files.resolver.spec'

describe('FilesService', () => {
  let service: FilesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MinioModuleTest, ConfigModule],
      providers: [FilesResolver, FilesService, PrismaService],
      exports: [FilesResolver, FilesService],
    }).compile()

    service = module.get<FilesService>(FilesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
