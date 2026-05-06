import { Module } from '@nestjs/common'
import { HashService, ModelFilesService, PathService } from './services'
import * as path from 'path'
import { IsPathConstraint } from './decorators'
import { ConfigService } from '@nestjs/config'

@Module({
  providers: [
    HashService,
    ModelFilesService,
    {
      provide: 'ROOT_PATH',
      useFactory: configService => {
        return path.resolve(
          configService.get('STORAGE_DIR') ||
            path.join(process.cwd(), 'storage')
        )
      },
      inject: [ConfigService],
    },
    {
      provide: 'ROOT_PATH_SERVICE',
      useFactory: (rootPath: string) => new PathService(rootPath),
      inject: ['ROOT_PATH'],
    },
    {
      provide: 'ORIGINALS_PATH',
      useFactory: (configService: ConfigService) => {
        return path.resolve(
          configService.get<string>('ORIGINALS_DIR') ??
            path.join(process.cwd(), 'originals')
        )
      },
      inject: [ConfigService],
    },
    {
      provide: 'ORIGINALS_PATH_SERVICE',
      useFactory: (originalsPath: string) => new PathService(originalsPath),
      inject: ['ORIGINALS_PATH'],
    },
    {
      provide: 'SEGMENTS_PATH',
      useFactory: (configService: ConfigService) => {
        return path.resolve(
          configService.get<string>('SEGMENTS_DIR') ??
            path.join(process.cwd(), 'segments')
        )
      },
      inject: [ConfigService],
    },
    {
      provide: 'SEGMENTS_PATH_SERVICE',
      useFactory: (segmentsPath: string) => new PathService(segmentsPath),
      inject: ['SEGMENTS_PATH'],
    },
    {
      provide: 'MODEL_FILES_PATH',
      useFactory: (configService: ConfigService) => {
        return path.resolve(
          configService.get<string>('MODEL_FILES_DIR') ??
            path.join(process.cwd(), 'model-files')
        )
      },
      inject: [ConfigService],
    },
    {
      provide: 'MODEL_FILES_PATH_SERVICE',
      useFactory: (modelFilesPath: string) => new PathService(modelFilesPath),
      inject: ['MODEL_FILES_PATH'],
    },
    {
      provide: 'SCRIPT_DIR',
      useFactory: configService => {
        return (
          configService.get('SCRIPT_DIR') ||
          path.join(process.cwd(), '..', '..', 'scripts', 'ai')
        )
      },
      inject: [ConfigService],
    },
    {
      provide: 'CONDA_ENV',
      useFactory: configService => {
        return configService.get('CONDA_ENV')
      },
      inject: [ConfigService],
    },
    IsPathConstraint,
  ],
  exports: [
    HashService,
    ModelFilesService,
    'ROOT_PATH_SERVICE',
    'ROOT_PATH',
    'ORIGINALS_PATH',
    'ORIGINALS_PATH_SERVICE',
    'SEGMENTS_PATH',
    'SEGMENTS_PATH_SERVICE',
    'MODEL_FILES_PATH',
    'MODEL_FILES_PATH_SERVICE',
    'SCRIPT_DIR',
    'CONDA_ENV',
    IsPathConstraint,
  ],
})
export class CommonModule {}
