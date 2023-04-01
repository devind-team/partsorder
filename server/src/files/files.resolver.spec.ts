import { Test, TestingModule } from '@nestjs/testing'
import { FilesResolver } from './files.resolver'
import { FilesService } from '@files/files.service'
import { PrismaService } from '@common/services/prisma.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MinioModule } from '@minio/minio.module'

export const MinioModuleTest = MinioModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    accessKey: config.get<string>('MINIO_ROOT_USER'),
    secretKey: config.get<string>('MINIO_ROOT_PASSWORD'),
    endPoint: config.get<string>('MINIO_END_POINT'),
    port: Number(config.get<number>('MINIO_PORT', 9000)),
    useSSL: false,
  }),
  inject: [ConfigService],
})

describe('FilesResolver', () => {
  let resolver: FilesResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MinioModuleTest, ConfigModule],
      providers: [FilesResolver, FilesService, PrismaService],
    }).compile()

    resolver = module.get<FilesResolver>(FilesResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
