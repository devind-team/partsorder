import { Test, TestingModule } from '@nestjs/testing'
import { ItemsResolver } from './items.resolver'
import { PrismaService } from '@common/services/prisma.service'
import { ItemsService } from '@items/items.service'

describe('ItemsResolver', () => {
  let resolver: ItemsResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ItemsResolver, ItemsService],
      exports: [ItemsService],
    }).compile()

    resolver = module.get<ItemsResolver>(ItemsResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
