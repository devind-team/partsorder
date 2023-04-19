import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/services/prisma.service'
import { User } from '@generated/user'
import { FilesService } from '@files/files.service'
import { FileUploadInput } from '@files/dto/file-upload.input'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly fileService: FilesService,
  ) {}

  async findOne(username: string) {
    return this.prismaService.user.findUnique({
      where: { username },
    })
  }

  async updateAvatar(uploadFile: FileUploadInput, user: User): Promise<User> {
    const file = await this.fileService.add(uploadFile, user)
    const avatar = new URL(
      `/${file.bucket}/${file.key}`,
      `${this.configService.get<string>('MINIO_PROTOCOL', 'https')}://${this.configService.get<string>(
        'MINIO_END_POINT',
        'localhost',
      )}`,
    ).toString()
    return this.prismaService.user.update({
      where: { id: user.id },
      data: { avatar },
    })
  }
}
