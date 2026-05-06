import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger'
import { BatchService } from './batch.service'
import { ValidateBatchDto } from './dto/validate-batch.dto'
import { ValidateBatchResultDto } from './dto/validate-batch-result.dto'

@Controller()
@ApiTags('Batch')
@ApiBearerAuth('bearerToken')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate batch files have same status' })
  @ApiBody({ type: () => ValidateBatchDto })
  @ApiOkResponse({
    type: () => ValidateBatchResultDto,
    description: 'Validation result',
  })
  @HttpCode(HttpStatus.OK)
  async validate(@Body() body: ValidateBatchDto) {
    return this.batchService.validate(body.fileIds)
  }
}
