import * as ExcelJS from 'exceljs'
import { object, z } from 'zod'
import { flatten } from 'flat'
import { Readable as ReadableStream } from 'stream'
import { Injectable, NotAcceptableException } from '@nestjs/common'
import { PrismaService } from '@common/services/prisma.service'
import { MinioService } from '@minio/minio.service'
import { FileUploadType } from '@files/dto/file-upload.type'
import { FileUploadInput } from '@files/dto/file-upload.input'
import { ExcelReader } from '@common/readers/excel.reader'
import { User } from '@generated/user'
import { File } from '@generated/file'

@Injectable()
export class FilesService {
  constructor(private readonly prismaService: PrismaService, private readonly minioService: MinioService) {}

  /**
   * Получаем информацию о нахождении сервера файлов.
   */
  storageInfo(): { serverUrl: string; bucket: string } {
    return {
      serverUrl: this.minioService.getServerUrl(),
      bucket: this.minioService.getBucket(),
    }
  }
  /**
   * Функция для добавления файла
   * @param uploadFile Загруженный с помощью minio файл
   * @param user Пользователь
   */
  async add(uploadFile: FileUploadInput, user?: User): Promise<File> {
    return this.prismaService.file.create({
      data: {
        name: uploadFile.fileName,
        serverUrl: this.minioService.getServerUrl(),
        bucket: this.minioService.getBucket(),
        key: uploadFile.name,
        userId: user?.id,
      },
    })
  }

  /**
   * Получение файла для чтения
   * @param file
   */
  async getFileStream(file: File): Promise<ReadableStream> {
    return await this.minioService.getFileObject(file.key)
  }
  /**
   * Проверка правильности файлового имени
   * @param name
   */
  async checkFileName(name: string): Promise<boolean> {
    const nameSchema = z.string().trim().min(3)
    try {
      await nameSchema.parseAsync(name)
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * Получение ссылки на загрузку файла
   * @param fileName - имя предполагаемого файла
   */
  async getPresignedPutUrl(fileName: string): Promise<FileUploadType> {
    if (await this.checkFileName(fileName)) {
      const [bucket, name, presignedUrl] = await this.minioService.getPresignedPutUrl(fileName)
      return {
        fileName,
        bucket,
        name,
        presignedUrl,
      }
    }
    throw new NotAcceptableException('Неверное название файла')
  }

  /**
   * Получаем значения из первого листа Excel файла.
   * Первая строка является заголовочной, остальные строки представляют из себя набор данных.
   * @param file
   */
  async getExcelValues(file: File): Promise<{ headers: string[]; values: Map<string, unknown>[] }> {
    const stream = await this.getFileStream(file)
    const excelReader = new ExcelReader()
    await excelReader.load(stream)
    return await ExcelReader.getValues(excelReader.workSheet)
  }

  /**
   * Записываем значения из заказа в Excel файл.
   * @param sheetName: string
   * @param values: Array<{}> - [{id: 1, name: 1, 'status.id': 1, 'status.name': 1}, {}]
   */
  async getExcelFile(sheetName: string, values: Array<Record<string, unknown>>, user?: User): Promise<File> {
    const workbook = await this.createAndFillWorkbook(sheetName, values)
    const fileName = `UnloadOrder_${new Date().toJSON().slice(0, 10)}.xlsx`
    const name = await this.minioService.uploadObject({
      fileName,
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: await workbook.xlsx.writeBuffer(),
    })
    return await this.add({ fileName, name, bucket: this.minioService.getBucket() }, user)
  }

  async createAndFillWorkbook(sheetName: string, values: Array<Record<string, unknown>>): Promise<ExcelJS.Workbook> {
    const data: Array<Record<string, string>> = values.map((item) => flatten(item))
    const headers = Object.keys(data[0]).map((key) => ({ header: key, key }))
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet(sheetName)
    ws.columns = headers
    const rows = data
    ws.addRows(rows)
    return wb
  }
}
