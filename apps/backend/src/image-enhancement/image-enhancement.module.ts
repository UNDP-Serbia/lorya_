import { forwardRef, Module } from '@nestjs/common'
import { ImageEnhancementController } from './image-enhancement.controller'
import { ImageEnhancementService } from './image-enhancement.service'
import { CommonModule } from 'src/common/common.module'
import { AiModule } from 'src/ai/ai.module'
import { DirectoryModule } from 'src/directory/directory.module'
import { FileModule } from 'src/file/file.module'
import { DatabaseModule } from 'src/database/database.module'
import { ActivityModule } from 'src/activity/activity.module'
import { ImageEnhancementModelEntity } from './image-enhancement-model.entity'
import { ImageEnhancementModelRepository } from './image-enhancement-model.repository'
import { ImageEnhancementModelService } from './image-enhancement-model.service'

@Module({
  imports: [
    DatabaseModule.forFeature([ImageEnhancementModelEntity]),
    CommonModule,
    forwardRef(() => AiModule),
    DirectoryModule,
    FileModule,
    forwardRef(() => ActivityModule),
  ],
  controllers: [ImageEnhancementController],
  providers: [
    ImageEnhancementService,
    ImageEnhancementModelService,
    ImageEnhancementModelRepository,
  ],
  exports: [
    ImageEnhancementService,
    ImageEnhancementModelService,
    ImageEnhancementModelRepository,
  ],
})
export class ImageEnhancementModule {}
