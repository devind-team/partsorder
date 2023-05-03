import * as ExcelJS from 'exceljs'
import { Readable as ReadableStream } from 'stream'

export class ExcelReader {
  readonly #stream: ReadableStream
  readonly #workbook: ExcelJS.Workbook

  constructor(stream: ReadableStream) {
    this.#stream = stream
    this.#workbook = new ExcelJS.Workbook()
  }

  /**
   * Загрука xlsx файла из стрима.
   */
  async load() {
    await this.#workbook.xlsx.read(this.#stream)
  }

  /**
   * Получение листов.
   */
  get sheets(): ExcelJS.Worksheet[] {
    return this.#workbook.worksheets
  }

  /**
   * Получение работчего первого листа.
   */
  get workSheet(): ExcelJS.Worksheet {
    return this.#workbook.getWorksheet(1)
  }

  /**
   * Возвращается массив данных.
   * Первая строка содержит названия столбцов, остальные строчки содердат значения.
   * @param sheet - лист
   */
  static async getValues(sheet: ExcelJS.Worksheet): Promise<{ headers: string[]; values: Map<string, unknown>[] }> {
    const sheetValues: ExcelJS.RowValues[] = sheet.getSheetValues()
    const values: Map<string, unknown>[] = []
    for (const i in sheetValues) {
      if (i === '1') {
        continue
      }
      const value = new Map<string, unknown>()
      for (const hi in sheetValues[1]) {
        value.set(sheetValues[1][hi], sheetValues[i][hi])
      }
      values.push(value)
    }
    return {
      headers: (sheet.getSheetValues()['1'] as Array<string>).map(String),
      values,
    }
  }
}
