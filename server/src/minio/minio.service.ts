import * as crypto from 'crypto'
import { BucketItemStat } from 'minio'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectMinioClient } from '@minio/minio.decorators'
import { MinioClient } from '@minio/minio.interfaces'
import { ConfigService } from '@nestjs/config'
import { GraphQLError } from 'graphql'

@Injectable()
export class MinioService {
  private readonly serverUrl: string
  private readonly endPoint: string
  private readonly bucket: string

  constructor(
    private readonly configService: ConfigService,
    @InjectMinioClient() private readonly minioClient: MinioClient,
  ) {
    this.serverUrl = this.configService.get<string>('MINIO_SERVER_URL')
    this.endPoint = this.configService.get<string>('MINIO_END_POINT')
    this.bucket = configService.get<string>('MINIO_BUCKET', 'bucket')
  }

  /**
   * Server url minio.
   */
  getServerUrl(): string {
    return this.serverUrl
  }
  /**
   * Bucket s3.
   */
  getBucket(): string {
    return this.bucket
  }

  /**
   * End point s3.
   */
  getEndPoint(): string {
    return this.configService.get<string>('MINIO_END_POINT')
  }

  async listBuckets() {
    return await this.minioClient.listBuckets()
  }

  /**
   * Загружаем файл в S3
   * @param file
   * @return objectName
   */
  async uploadObject(file): Promise<string> {
    const [hashedFileName, ext] = this.hashedName(file.filename)

    const objectName = `${hashedFileName}${ext}`
    const metaData = {
      'Content-Type': file.mimetype,
    }
    try {
      await this.minioClient.putObject(this.bucket, objectName, file.buffer, metaData)
    } catch (e) {
      throw new HttpException(`Error put object to s3: ${e}`, HttpStatus.BAD_REQUEST)
    }
    return objectName
  }

  /**
   * Получение хешированного имени файла
   * @param name
   */
  hashedName(name: string): string[] {
    const hashedFileName = crypto.createHash('md5').update(Date.now().toString()).digest('hex')
    const ext = name.substring(name.lastIndexOf('.'), name.length)
    return [hashedFileName, ext]
  }

  /**
   * Получение ссылки для загрузки файла в s3
   * @param fileName
   */
  async getPresignedPutUrl(fileName: string): Promise<[string, string, string]> {
    const [hashedFileName, ext] = this.hashedName(fileName)
    try {
      const fileName = `${hashedFileName}${ext}`
      const presignedUrl = await this.minioClient.presignedPutObject(this.bucket, fileName)
      return [this.bucket, fileName, presignedUrl]
    } catch (e) {
      throw new GraphQLError(`Error create presigned url: ${e}`)
    }
  }

  /**
   * Проверяем, если ли объект в s3
   * @param name
   * @return информацию или false - если файла нет
   */
  async existsObject(name: string): Promise<BucketItemStat | boolean> {
    try {
      return await this.minioClient.statObject(this.bucket, name)
    } catch {
      return false
    }
  }
}
