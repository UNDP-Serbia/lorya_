import { forwardRef, Module } from '@nestjs/common'
import { SegmentManagementController } from './segment-management.controller'
import { SegmentManagementService } from './segment-management.service'
import { SegmentRepository } from './segment.repository'
import { SegmentEntity } from './segment.entity'
import { OcrResultEntity } from '../ocr/ocr-result.entity'
import { OcrResultRepository } from '../ocr/ocr-result.repository'
import { PostOcrCorrectionResultEntity } from '../post-ocr-correction/post-ocr-correction-result.entity'
import { PostOcrCorrectionResultRepository } from '../post-ocr-correction/post-ocr-correction-result.repository'
import { CommonModule } from 'src/common/common.module'
import { AiModule } from 'src/ai/ai.module'
import { DirectoryModule } from 'src/directory/directory.module'
import { FileModule } from 'src/file/file.module'
import { DatabaseModule } from 'src/database/database.module'
import { ActivityModule } from 'src/activity/activity.module'

@Module({
  imports: [
    DatabaseModule.forFeature([
      SegmentEntity,
      OcrResultEntity,
      PostOcrCorrectionResultEntity,
    ]),
    CommonModule,
    forwardRef(() => AiModule),
    DirectoryModule,
    FileModule,
    forwardRef(() => ActivityModule),
  ],
  controllers: [SegmentManagementController],
  providers: [
    SegmentManagementService,
    SegmentRepository,
    OcrResultRepository,
    PostOcrCorrectionResultRepository,
  ],
  exports: [SegmentManagementService, SegmentRepository],
})
export class SegmentManagementModule {}
