import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { ActivityModule } from '../activity/activity.module'
import { ImageEnhancementModule } from '../image-enhancement/image-enhancement.module'
import { LayoutIdentificationModule } from '../layout-identification/layout-identification.module'
import { OcrModule } from '../ocr/ocr.module'
import { PostOcrCorrectionModule } from '../post-ocr-correction/post-ocr-correction.module'
import { SegmentManagementModule } from '../segment-management/segment-management.module'
import { ModelRunController } from './model-run.controller'
import { ModelRunEntity } from './model-run.entity'
import { ModelRunRepository } from './model-run.repository'
import { ModelRunService } from './model-run.service'

@Module({
  imports: [
    DatabaseModule.forFeature([ModelRunEntity]),
    ActivityModule,
    OcrModule,
    LayoutIdentificationModule,
    ImageEnhancementModule,
    PostOcrCorrectionModule,
    SegmentManagementModule,
  ],
  controllers: [ModelRunController],
  providers: [ModelRunRepository, ModelRunService],
  exports: [ModelRunRepository, ModelRunService],
})
export class ModelRunModule {}
