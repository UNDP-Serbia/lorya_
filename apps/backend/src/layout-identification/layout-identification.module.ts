import { forwardRef, Module } from '@nestjs/common'
import { LayoutIdentificationController } from './layout-identification.controller'
import { LayoutIdentificationService } from './layout-identification.service'
import { CommonModule } from 'src/common/common.module'
import { AiModule } from 'src/ai/ai.module'
import { DatabaseModule } from 'src/database/database.module'
import { DirectoryModule } from 'src/directory/directory.module'
import { FileModule } from 'src/file/file.module'
import { ActivityModule } from 'src/activity/activity.module'
import { LayoutIdentificationModelEntity } from './layout-identification-model.entity'
import { LayoutIdentificationModelRepository } from './layout-identification-model.repository'
import { LayoutIdentificationModelService } from './layout-identification-model.service'

@Module({
  imports: [
    DatabaseModule.forFeature([LayoutIdentificationModelEntity]),
    CommonModule,
    forwardRef(() => AiModule),
    DirectoryModule,
    FileModule,
    forwardRef(() => ActivityModule),
  ],
  controllers: [LayoutIdentificationController],
  providers: [
    LayoutIdentificationService,
    LayoutIdentificationModelService,
    LayoutIdentificationModelRepository,
  ],
  exports: [
    LayoutIdentificationService,
    LayoutIdentificationModelService,
    LayoutIdentificationModelRepository,
  ],
})
export class LayoutIdentificationModule {}
