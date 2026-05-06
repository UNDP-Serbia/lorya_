// apps/backend/src/common/multer/model-file-fields.ts
import { BadRequestException } from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import * as path from 'path'

export const MODEL_FILE_FIELDS = [
  { name: 'configFile', maxCount: 1 },
  { name: 'inputMapperFile', maxCount: 1 },
  { name: 'outputMapperFile', maxCount: 1 },
] as const

export const MODEL_FILE_EXTENSIONS = {
  configFile: '.json',
  inputMapperFile: '.py',
  outputMapperFile: '.py',
} as const

export type ModelFileMap = {
  configFile?: Express.Multer.File[]
  inputMapperFile?: Express.Multer.File[]
  outputMapperFile?: Express.Multer.File[]
}

export const pickSingleModelFile = (map: ModelFileMap) => ({
  configFile: map.configFile?.[0],
  inputMapperFile: map.inputMapperFile?.[0],
  outputMapperFile: map.outputMapperFile?.[0],
})

export const modelFileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  callback: (err: Error | null, acceptFile?: boolean) => void
): void => {
  const expected = (MODEL_FILE_EXTENSIONS as Record<string, string>)[
    file.fieldname
  ]
  if (!expected) {
    callback(
      new BadRequestException(`Unexpected file field: ${file.fieldname}`)
    )
    return
  }
  const actual = path.extname(file.originalname).toLowerCase()
  if (actual !== expected) {
    callback(
      new BadRequestException(`${file.fieldname} must be a ${expected} file`)
    )
    return
  }
  callback(null, true)
}

export const MODEL_FILE_INTERCEPTOR = FileFieldsInterceptor(
  [...MODEL_FILE_FIELDS],
  { fileFilter: modelFileFilter }
)
