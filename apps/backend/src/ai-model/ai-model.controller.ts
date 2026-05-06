import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { AiModelService } from './ai-model.service'
import { Controller, Get } from '@nestjs/common'
import { AiModelDictionaryDto } from './dto'

@Controller()
@ApiTags('AI Models')
@ApiBearerAuth('bearerToken')
export class AiModelController {
  constructor(private readonly aiModelService: AiModelService) {}

  @Get('')
  @ApiOperation({ summary: 'Get all models' })
  @ApiOkResponse({
    description: 'Model dictionary',
    type: () => AiModelDictionaryDto,
  })
  async getModelDictionary() {
    return this.aiModelService.getModelDictionary()
  }
}
