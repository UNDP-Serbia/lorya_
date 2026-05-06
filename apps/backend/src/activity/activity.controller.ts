import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { InjectMapper } from '@automapper/nestjs'
import { Mapper } from '@automapper/core'
import { ActivityService } from './activity.service'
import { ActivityEntity } from './activity.entity'
import {
  ActivityDto,
  ActivityDetailDto,
  ListModelExecutionsQueryDto,
} from './dto'

@Controller()
@ApiTags('Activity')
@ApiBearerAuth('bearerToken')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  @Get('file/:fileId')
  @ApiOperation({
    summary: 'Get activity history for a file (per-file timeline)',
  })
  @ApiOkResponse({ type: ActivityDto, isArray: true })
  async getByFile(
    @Param('fileId', ParseUUIDPipe) fileId: string
  ): Promise<ActivityDto[]> {
    const rows = await this.activityService.findByFileId(fileId)
    const enriched = await this.activityService.enrichWithModelNames(rows)
    return this.mapper.mapArray(enriched, ActivityEntity, ActivityDto)
  }

  @Get('model-executions')
  @ApiOperation({ summary: 'List AI model executions across all files' })
  @ApiOkResponse({ type: ActivityDto, isArray: true })
  async listModelExecutions(
    @Query() query: ListModelExecutionsQueryDto
  ): Promise<ActivityDto[]> {
    const rows = await this.activityService.listModelExecutions(query)
    const enriched = await this.activityService.enrichWithModelNames(rows)
    return this.mapper.mapArray(enriched, ActivityEntity, ActivityDto)
  }

  @Get('model-executions/:id')
  @ApiOperation({ summary: 'Get a single AI model execution detail' })
  @ApiOkResponse({ type: ActivityDetailDto })
  async getModelExecution(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ActivityDetailDto> {
    const row = await this.activityService.findModelExecutionById(id)
    const [enriched] = await this.activityService.enrichWithModelNames([row])
    return this.mapper.map(enriched, ActivityEntity, ActivityDetailDto)
  }
}
