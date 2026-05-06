import { BadRequestException, forwardRef, Module } from '@nestjs/common'
import { AiService } from './ai.service'
import { AiController } from './ai.controller'
import { CommonModule } from 'src/common/common.module'
import { MulterModule } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import * as path from 'path'
import * as fs from 'fs'
import { AiModelModule } from 'src/ai-model/ai-model.module'
import { DirectoryModule } from 'src/directory/directory.module'
import { FileModule } from 'src/file/file.module'
import { ActivityModule } from 'src/activity/activity.module'

@Module({
  imports: [
    CommonModule,
    AiModelModule,
    DirectoryModule,
    FileModule,
    forwardRef(() => ActivityModule),
    MulterModule.registerAsync({
      useFactory: () => {
        return {
          storage: diskStorage({
            destination: (_req, _file, cb) => {
              try {
                const dest = path.join(process.cwd(), '.tmp')
                fs.mkdirSync(dest, { recursive: true })
                cb(null, dest)
              } catch (err) {
                cb(err as Error, '')
              }
            },
            filename: (_req, file, cb) => {
              try {
                const dest = path.join(process.cwd(), '.tmp')
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
    }),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
