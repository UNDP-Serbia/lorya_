import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/database/database.module'
import { FileEntity } from './file.entity'
import { FileRepository } from './file.repository'
import { FileService } from './file.service'
import { DirectoryModule } from 'src/directory/directory.module'

@Module({
  imports: [DatabaseModule.forFeature([FileEntity]), DirectoryModule],
  providers: [FileRepository, FileService],
  exports: [FileService],
})
export class FileModule {}
