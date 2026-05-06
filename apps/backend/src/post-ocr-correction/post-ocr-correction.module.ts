import { forwardRef, Module } from '@nestjs/common'
import { PostOcrCorrectionController } from './post-ocr-correction.controller'
import { PostOcrCorrectionService } from './post-ocr-correction.service'
import { PostOcrCorrectionResultRepository } from './post-ocr-correction-result.repository'
import { PostOcrCorrectionResultEntity } from './post-ocr-correction-result.entity'
import { PostOcrCorrectionModelEntity } from './post-ocr-correction-model.entity'
import { PostOcrCorrectionModelRepository } from './post-ocr-correction-model.repository'
import { PostOcrCorrectionModelService } from './post-ocr-correction-model.service'
import { CommonModule } from 'src/common/common.module'
import { AiModule } from 'src/ai/ai.module'
import { DirectoryModule } from 'src/directory/directory.module'
import { FileModule } from 'src/file/file.module'
import { OcrModule } from 'src/ocr/ocr.module'
import { SegmentManagementModule } from 'src/segment-management/segment-management.module'
import { DatabaseModule } from 'src/database/database.module'
import { ActivityModule } from 'src/activity/activity.module'

@Module({
  imports: [
    DatabaseModule.forFeature([
      PostOcrCorrectionResultEntity,
      PostOcrCorrectionModelEntity,
    ]),
    CommonModule,
    forwardRef(() => AiModule),
    DirectoryModule,
    FileModule,
    OcrModule,
    SegmentManagementModule,
    forwardRef(() => ActivityModule),
  ],
  controllers: [PostOcrCorrectionController],
  providers: [
    PostOcrCorrectionService,
    PostOcrCorrectionResultRepository,
    PostOcrCorrectionModelRepository,
    PostOcrCorrectionModelService,
  ],
  exports: [
    PostOcrCorrectionService,
    PostOcrCorrectionModelRepository,
    PostOcrCorrectionModelService,
    PostOcrCorrectionResultRepository,
  ],
})
export class PostOcrCorrectionModule {}
