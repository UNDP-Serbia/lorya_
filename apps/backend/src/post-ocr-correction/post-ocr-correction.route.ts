import { RouteTree } from '@nestjs/core'
import { PostOcrCorrectionModule } from './post-ocr-correction.module'

export const postOcrCorrectionRoutes: RouteTree = {
  path: 'post-ocr-corrections',
  module: PostOcrCorrectionModule,
}
