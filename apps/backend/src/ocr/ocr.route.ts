import { RouteTree } from '@nestjs/core'
import { OcrModule } from './ocr.module'

export const ocrRoutes: RouteTree = {
  path: 'ocrs',
  module: OcrModule,
}
