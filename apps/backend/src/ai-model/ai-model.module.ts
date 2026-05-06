import { Module } from '@nestjs/common'
import { AiModelController } from './ai-model.controller'
import { AiModelService } from './ai-model.service'
import { ImageEnhancementModule } from 'src/image-enhancement/image-enhancement.module'
import { LayoutIdentificationModule } from 'src/layout-identification/layout-identification.module'
import { OcrModule } from 'src/ocr/ocr.module'
import { PostOcrCorrectionModule } from 'src/post-ocr-correction/post-ocr-correction.module'
import { SegmentManagementModule } from 'src/segment-management/segment-management.module'
import { BatchModule } from 'src/batch/batch.module'

@Module({
  imports: [
    ImageEnhancementModule,
    LayoutIdentificationModule,
    SegmentManagementModule,
    OcrModule,
    PostOcrCorrectionModule,
    BatchModule,
  ],
  controllers: [AiModelController],
  providers: [AiModelService],
  exports: [],
})
export class AiModelModule {}
