import { RouteTree } from '@nestjs/core'
import { AiModelModule } from './ai-model.module'
import { postOcrCorrectionRoutes } from 'src/post-ocr-correction/post-ocr-correction.route'
import { layoutIdentificationRoutes } from 'src/layout-identification/layout-identification.route'
import { ocrRoutes } from 'src/ocr/ocr.route'
import { imageEnhancementRoutes } from 'src/image-enhancement/image-enhancement.route'
import { segmentManagementRoutes } from 'src/segment-management/segment-management.route'
import { batchRoutes } from 'src/batch/batch.route'

export const aiModelRoutes: RouteTree = {
  path: 'models',
  module: AiModelModule,
  children: [
    imageEnhancementRoutes,
    layoutIdentificationRoutes,
    segmentManagementRoutes,
    ocrRoutes,
    postOcrCorrectionRoutes,
    batchRoutes,
  ],
}
