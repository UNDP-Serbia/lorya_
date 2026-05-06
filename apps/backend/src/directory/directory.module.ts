import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/database/database.module'
import { DirectoryEntity } from './directory.entity'
import { DirectoryRepository } from './directory.repository'
import { DirectoryService } from './directory.service'

@Module({
  imports: [DatabaseModule.forFeature([DirectoryEntity])],
  providers: [DirectoryRepository, DirectoryService],
  exports: [DirectoryService],
})
export class DirectoryModule {}
