import { Test, TestingModule } from '@nestjs/testing'
import { ItemsService } from './items.service'
import { PrismaService } from '@common/services/prisma.service'
import { ItemsResolver } from '@items/items.resolver'

describe('ItemsService', () => {
  let service: ItemsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ItemsResolver, ItemsService],
      exports: [ItemsService],
    }).compile()

    service = module.get<ItemsService>(ItemsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
