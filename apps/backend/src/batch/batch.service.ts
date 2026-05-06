import { Injectable, BadRequestException } from '@nestjs/common'
import { FileService } from 'src/file/file.service'
import type { ValidateBatchResultDto } from './dto/validate-batch-result.dto'

@Injectable()
export class BatchService {
  constructor(private readonly fileService: FileService) {}

  async validate(fileIds: string[]): Promise<ValidateBatchResultDto> {
    const files = await this.fileService.findByIds(fileIds)

    if (files.length !== fileIds.length) {
      const foundIds = new Set(files.map(f => f.id))
      const missing = fileIds.filter(id => !foundIds.has(id))
      throw new BadRequestException(`Files not found: ${missing.join(', ')}`)
    }

    const firstStatus = files[0].status
    const invalidFiles = files
      .filter(f => f.status !== firstStatus)
      .map(f => ({ fileId: f.id, status: f.status }))

    if (invalidFiles.length > 0) {
      return {
        valid: false,
        status: firstStatus,
        invalidFiles,
      }
    }

    return {
      valid: true,
      status: firstStatus,
    }
  }
}
