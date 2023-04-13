import { Injectable } from '@nestjs/common'
import { User } from '@generated/user'
import { CreateOrderInput } from '@orders/dto/create-order.input'
import { PrismaService } from '@common/services/prisma.service'
import { FilesService } from '@files/files.service'
import { CreateOrderType } from '@orders/dto/create-order.type'

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService, private readonly fileService: FilesService) {}
  async createOrder(user: User, orderInput: CreateOrderInput): Promise<CreateOrderType> {
    const file = await this.fileService.add(orderInput.file, user)
    // Вытаскиваем файл из minio, через fileService и парсим его
    // Все раскладываем по полочкам
    const order = await this.prismaService.order.create({
      data: {
        address: orderInput.address,
        userId: user.id,
      },
    })
    return { order }
  }
}
