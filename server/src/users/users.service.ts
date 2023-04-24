import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/services/prisma.service'
import { User } from '@generated/user'
import { FilesService } from '@files/files.service'
import { FileUploadInput } from '@files/dto/file-upload.input'

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService, private readonly fileService: FilesService) {}

  async findOne(username: string) {
    return this.prismaService.user.findUnique({
      where: { username },
    })
  }

  async updateAvatar(uploadFile: FileUploadInput, user: User): Promise<User> {
    const file = await this.fileService.add(uploadFile, user)
    const { bucket, serverUrl } = this.fileService.storageInfo()
    const avatar = new URL(`/${bucket}/${file.key}`, serverUrl).toString()
    return this.prismaService.user.update({
      where: { id: user.id },
      data: { avatar },
    })
  }
}
