import { forwardRef, Module } from '@nestjs/common'
import { DatabaseModule } from 'src/database/database.module'
import { ActivityEntity } from './activity.entity'
import { ActivityRepository } from './activity.repository'
import { ActivityService } from './activity.service'
import { ActivityController } from './activity.controller'
import { OcrModule } from 'src/ocr/ocr.module'
import { LayoutIdentificationModule } from 'src/layout-identification/layout-identification.module'
import { ImageEnhancementModule } from 'src/image-enhancement/image-enhancement.module'
import { PostOcrCorrectionModule } from 'src/post-ocr-correction/post-ocr-correction.module'

@Module({
  imports: [
    DatabaseModule.forFeature([ActivityEntity]),
    forwardRef(() => OcrModule),
    forwardRef(() => LayoutIdentificationModule),
    forwardRef(() => ImageEnhancementModule),
    forwardRef(() => PostOcrCorrectionModule),
  ],
  controllers: [ActivityController],
  providers: [ActivityRepository, ActivityService],
  exports: [ActivityRepository, ActivityService],
})
export class ActivityModule {}
