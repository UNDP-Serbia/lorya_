import { forwardRef, Module } from '@nestjs/common'
import { CommonModule } from 'src/common/common.module'
import { FileManagerController } from './file-manager.controller'
import { FileManagerService } from './file-manager.service'
import { MulterModule } from '@nestjs/platform-express'
import * as path from 'path'
import { diskStorage } from 'multer'
import { pathHelpers } from 'src/common/helpers/path.helper'
import * as fs from 'fs'
import { BadRequestException } from '@nestjs/common'
import { DirectoryModule } from '../directory/directory.module'
import { FileModule } from '../file/file.module'
import { AiModule } from 'src/ai/ai.module'
import { ActivityModule } from 'src/activity/activity.module'
import { SegmentManagementModule } from 'src/segment-management/segment-management.module'
import { OcrModule } from 'src/ocr/ocr.module'
import { PostOcrCorrectionModule } from 'src/post-ocr-correction/post-ocr-correction.module'

@Module({
  imports: [
    CommonModule,
    DirectoryModule,
    FileModule,
    AiModule,
    forwardRef(() => ActivityModule),
    SegmentManagementModule,
    OcrModule,
    PostOcrCorrectionModule,
    MulterModule.registerAsync({
      useFactory: (rootPath: string) => {
        return {
          storage: diskStorage({
            destination: (req, _file, cb) => {
              try {
                const relativePath = pathHelpers.formatPath(req?.body?.path)
                const dest = path.join(rootPath, relativePath)
                if (relativePath && !fs.existsSync(dest)) {
                  return cb(
                    new BadRequestException(
                      `Directory does not exist: ${req?.body?.path}`
                    ),
                    ''
                  )
                }
                cb(null, dest)
              } catch (err) {
                cb(err as Error, '')
              }
            },
            filename: (req, file, cb) => {
              try {
                const relativePath = pathHelpers.formatPath(req?.body?.path)
                const dest = path.join(rootPath, relativePath)
                const filename = file.originalname
                const fullPath = path.join(dest, filename)
                if (fs.existsSync(fullPath)) {
                  return cb(
                    new BadRequestException(`File ${filename} already exists`),
                    filename
                  )
                }
                cb(null, filename)
              } catch (err) {
                cb(err as Error, file.originalname)
              }
            },
          }),
        }
      },
      inject: ['ROOT_PATH'],
      imports: [CommonModule],
    }),
  ],
  controllers: [FileManagerController],
  providers: [FileManagerService],
  exports: [FileManagerService],
})
export class FileManagerModule {}
