import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@common/services/prisma.service'
import { FilesModule } from '@files/files.module'
import { PricesResolver } from './prices.resolver'
import { PricesService } from './prices.service'

describe('PricesResolver', () => {
  let resolver: PricesResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FilesModule],
      providers: [PrismaService, PricesService, PricesResolver],
      exports: [PrismaService],
    }).compile()

    resolver = module.get<PricesResolver>(PricesResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
