import { Module } from '@nestjs/common'
import { BatchController } from './batch.controller'
import { BatchService } from './batch.service'
import { FileModule } from 'src/file/file.module'

@Module({
  imports: [FileModule],
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
