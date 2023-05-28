import { Test, TestingModule } from '@nestjs/testing'
import { FilesModule } from '@files/files.module'
import { PrismaService } from '@common/services/prisma.service'
import { OrdersResolver } from '@orders/orders.resolver'
import { OrdersService } from './orders.service'
import { ProductsService } from '@products/products.service'
import { ItemsService } from '@items/items.service'

describe('OrdersService', () => {
  let service: OrdersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FilesModule],
      providers: [PrismaService, ProductsService, OrdersService, OrdersResolver, ItemsService],
      exports: [OrdersService],
    }).compile()

    service = module.get<OrdersService>(OrdersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
