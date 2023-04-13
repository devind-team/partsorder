import { Test, TestingModule } from '@nestjs/testing'
import { OrdersService } from './orders.service'
import { FilesModule } from '@files/files.module'
import { PrismaService } from '@common/services/prisma.service'
import { OrdersResolver } from '@orders/orders.resolver'

describe('OrdersService', () => {
  let service: OrdersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FilesModule],
      providers: [PrismaService, OrdersService, OrdersResolver],
      exports: [OrdersResolver, OrdersService],
    }).compile()

    service = module.get<OrdersService>(OrdersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
