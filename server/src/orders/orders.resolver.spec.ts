import { Test, TestingModule } from '@nestjs/testing'
import { OrdersResolver } from './orders.resolver'
import { FilesModule } from '@files/files.module'
import { PrismaService } from '@common/services/prisma.service'
import { OrdersService } from '@orders/orders.service'

describe('OrdersResolver', () => {
  let resolver: OrdersResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FilesModule],
      providers: [PrismaService, OrdersService, OrdersResolver],
      exports: [OrdersResolver, OrdersService],
    }).compile()

    resolver = module.get<OrdersResolver>(OrdersResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})