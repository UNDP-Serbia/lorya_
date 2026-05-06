import { Global, Module } from '@nestjs/common'
import { AutomapperModule } from '@automapper/nestjs'
import { ConfigService } from '@nestjs/config'
import type { CreateMapperOptions } from '@automapper/core'
import { Config } from '../config/types'
import {
  AccountProfile,
  ActivityProfile,
  ImageEnhancementModelProfile,
  LayoutIdentificationModelProfile,
  ModelRunProfile,
  OcrModelProfile,
  PostOcrCorrectionModelProfile,
} from './profiles'

@Global()
@Module({
  imports: [
    AutomapperModule.forRootAsync({
      useFactory: (config: ConfigService): CreateMapperOptions =>
        config.get(Config.AUTOMAPPER) as CreateMapperOptions,
      inject: [ConfigService],
    }),
  ],
  providers: [
    AccountProfile,
    ActivityProfile,
    ImageEnhancementModelProfile,
    LayoutIdentificationModelProfile,
    ModelRunProfile,
    OcrModelProfile,
    PostOcrCorrectionModelProfile,
  ],
  exports: [
    AccountProfile,
    ActivityProfile,
    ImageEnhancementModelProfile,
    LayoutIdentificationModelProfile,
    ModelRunProfile,
    OcrModelProfile,
    PostOcrCorrectionModelProfile,
  ],
})
export class MapperModule {}
