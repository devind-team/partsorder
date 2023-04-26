import { Test, TestingModule } from '@nestjs/testing'
import { ProductsService } from './products.service'
import { PrismaService } from '@common/services/prisma.service'
import { ProductsResolver } from './products.resolver'

describe('ProductsService', () => {
  let service: ProductsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ProductsService, ProductsResolver],
      exports: [ProductsService],
    }).compile()

    service = module.get<ProductsService>(ProductsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
