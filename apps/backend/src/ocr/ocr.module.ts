import { forwardRef, Module } from '@nestjs/common'
import { OcrController } from './ocr.controller'
import { OcrService } from './ocr.service'
import { OcrResultRepository } from './ocr-result.repository'
import { OcrResultEntity } from './ocr-result.entity'
import { OcrModelEntity } from './ocr-model.entity'
import { OcrModelRepository } from './ocr-model.repository'
import { OcrModelService } from './ocr-model.service'
import { CommonModule } from 'src/common/common.module'
import { AiModule } from 'src/ai/ai.module'
import { DirectoryModule } from 'src/directory/directory.module'
import { FileModule } from 'src/file/file.module'
import { SegmentManagementModule } from 'src/segment-management/segment-management.module'
import { DatabaseModule } from 'src/database/database.module'
import { ActivityModule } from 'src/activity/activity.module'

@Module({
  imports: [
    DatabaseModule.forFeature([OcrResultEntity, OcrModelEntity]),
    CommonModule,
    forwardRef(() => AiModule),
    DirectoryModule,
    FileModule,
    SegmentManagementModule,
    forwardRef(() => ActivityModule),
  ],
  controllers: [OcrController],
  providers: [
    OcrService,
    OcrResultRepository,
    OcrModelRepository,
    OcrModelService,
  ],
  exports: [
    OcrService,
    OcrModelRepository,
    OcrModelService,
    OcrResultRepository,
  ],
})
export class OcrModule {}
