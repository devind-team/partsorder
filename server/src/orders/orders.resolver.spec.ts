import { Test, TestingModule } from '@nestjs/testing'
import { FilesModule } from '@files/files.module'
import { PrismaService } from '@common/services/prisma.service'
import { OrdersService } from '@orders/orders.service'
import { OrdersResolver } from './orders.resolver'
import { ProductsService } from '@products/products.service'
import { ItemsService } from '@items/items.service'

describe('OrdersResolver', () => {
  let resolver: OrdersResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FilesModule],
      providers: [PrismaService, ProductsService, OrdersService, OrdersResolver, ItemsService],
      exports: [OrdersService],
    }).compile()

    resolver = module.get<OrdersResolver>(OrdersResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
