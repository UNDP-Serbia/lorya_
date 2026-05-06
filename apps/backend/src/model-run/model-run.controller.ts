import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { InjectMapper } from '@automapper/nestjs'
import { Mapper } from '@automapper/core'
import { Payload } from '../common/decorators/payload.decorator'
import { JwtPayload } from '../common/types'
import { ModelRunEntity } from './model-run.entity'
import { ModelRunService } from './model-run.service'
import {
  ModelRunCompletedDto,
  ModelRunListQueryDto,
  ModelRunListResponseDto,
  ModelRunSegmentDto,
  StartModelRunDto,
  StartModelRunResponseDto,
} from './dto'

@Controller()
@ApiTags('Run History')
@ApiBearerAuth('bearerToken')
export class ModelRunController {
  constructor(
    private readonly service: ModelRunService,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  @Post('start')
  @ApiOperation({
    summary: 'Start a new model run',
    description:
      'Creates a ModelRun parent record in IN_PROGRESS state. Frontend passes the returned id as modelRunId in subsequent processModel calls.',
  })
  @ApiBody({ type: StartModelRunDto })
  @ApiCreatedResponse({ type: StartModelRunResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async start(
    @Body() body: StartModelRunDto,
    @Payload() payload: JwtPayload
  ): Promise<StartModelRunResponseDto> {
    const entity = await this.service.start({
      userId: payload.sub,
      modelType: body.modelType,
      modelId: body.modelId,
      selectionCount: body.selectionCount,
    })
    return this.mapper.map(entity, ModelRunEntity, StartModelRunResponseDto)
  }

  @Post(':runId/complete')
  @ApiOperation({
    summary: 'Complete a model run, computing aggregates',
    description:
      'Aggregates child Activity records, computes resultStatus and aggregateConfidence, sets finishedAt and durationMs.',
  })
  @ApiOkResponse({ type: ModelRunCompletedDto })
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('runId', ParseUUIDPipe) runId: string
  ): Promise<ModelRunCompletedDto> {
    const entity = await this.service.complete(runId)
    return this.mapper.map(entity, ModelRunEntity, ModelRunCompletedDto)
  }

  @Get()
  @ApiOperation({
    summary: 'List model runs with files inline',
    description:
      'Returns paginated list of model runs sorted by createdAt DESC. Each item includes its child file rows (Activity records). Segments are not included; fetch them lazily via the segments endpoint.',
  })
  @ApiOkResponse({ type: ModelRunListResponseDto })
  async list(
    @Query() query: ModelRunListQueryDto
  ): Promise<ModelRunListResponseDto> {
    return this.service.list(query)
  }

  @Get(':runId/files/:fileId/segments')
  @ApiOperation({
    summary: 'List segments for a file within a model run',
    description:
      'Returns segments only for OCR / Post-OCR runs. Empty array for other model types.',
  })
  @ApiOkResponse({ type: ModelRunSegmentDto, isArray: true })
  async segments(
    @Param('runId', ParseUUIDPipe) runId: string,
    @Param('fileId', ParseUUIDPipe) fileId: string
  ): Promise<ModelRunSegmentDto[]> {
    return this.service.getSegments(runId, fileId)
  }
}
