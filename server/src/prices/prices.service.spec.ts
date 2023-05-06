import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@common/services/prisma.service'
import { FilesModule } from '@files/files.module'
import { PricesService } from './prices.service'
import { PricesResolver } from './prices.resolver'
import { ProductsService } from '@products/products.service'

describe('PricesService', () => {
  let service: PricesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FilesModule],
      providers: [PrismaService, ProductsService, PricesService, PricesResolver],
      exports: [PrismaService],
    }).compile()

    service = module.get<PricesService>(PricesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
