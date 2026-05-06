import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { AiModelDto } from 'src/ai-model/dto'
import { RevertDto } from 'src/common/dto/revert.dto'
import { Payload } from 'src/common/decorators/payload.decorator'
import { JwtPayload } from 'src/common/types'
import {
  AdjustSegmentDto,
  AdjustSegmentResultDto,
  CropSegmentsDto,
  CropSegmentsResultDto,
  SegmentModelProcessDto,
  SegmentResponseDto,
} from './dto'
import { SegmentManagementService } from './segment-management.service'

@Controller()
@ApiTags('Segment Management')
@ApiBearerAuth('bearerToken')
export class SegmentManagementController {
  constructor(
    private readonly segmentManagementService: SegmentManagementService
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get segment management models',
    description:
      'Returns all available segment management models with name, slug and optional path.',
  })
  @ApiOkResponse({
    description: 'List of segment management models',
    type: AiModelDto,
    isArray: true,
  })
  getModels() {
    return this.segmentManagementService.getModels()
  }

  @Post('revert')
  @ApiOperation({
    summary: 'Revert segmentation',
    description:
      'Deletes all segments for a file and resets its status to INITIALIZED.',
  })
  @ApiBody({ type: () => RevertDto })
  @ApiOkResponse({
    description: 'Segmentation reverted successfully',
  })
  @HttpCode(HttpStatus.OK)
  revertSegmentation(
    @Body() body: RevertDto,
    @Payload() payload: JwtPayload
  ): Promise<{ success: boolean }> {
    return this.segmentManagementService.revertSegmentation(
      body.inputDir,
      body.fileName,
      payload.sub
    )
  }

  @Post('segments/:id/revert')
  @ApiOperation({
    summary: 'Revert a single segment',
    description:
      'Reverts a single segment by copying its original image over the modified version.',
  })
  @ApiOkResponse({
    description: 'Segment reverted successfully',
  })
  @HttpCode(HttpStatus.OK)
  revertSegment(
    @Param('id') id: string,
    @Payload() payload: JwtPayload
  ): Promise<{ success: boolean }> {
    return this.segmentManagementService.revertSegment(id, payload.sub)
  }

  @Get('segments/:fileId')
  @ApiOperation({
    summary: 'Get segments for a file',
    description:
      'Returns all segments belonging to a file, ordered by their position.',
  })
  @ApiOkResponse({
    description: 'List of segments for the file',
    type: SegmentResponseDto,
    isArray: true,
  })
  getSegmentsByFileId(@Param('fileId') fileId: string) {
    return this.segmentManagementService.getSegmentsByFileId(fileId)
  }

  @Post('crop')
  @ApiOperation({
    summary: 'Crop segments from an image',
    description:
      'Crops individual segments from an image based on bounding box coordinates and stores them as separate files.',
  })
  @ApiBody({ type: () => CropSegmentsDto })
  @ApiOkResponse({
    type: () => CropSegmentsResultDto,
    description: 'Crop segments result with output paths',
  })
  @HttpCode(HttpStatus.OK)
  cropSegments(@Body() body: CropSegmentsDto, @Payload() payload: JwtPayload) {
    return this.segmentManagementService.cropSegments(body, payload.sub)
  }

  @Post('adjust')
  @ApiOperation({
    summary: 'Adjust a segment image',
    description:
      'Adjusts brightness, contrast and sharpness of a segment image.',
  })
  @ApiBody({ type: () => AdjustSegmentDto })
  @ApiOkResponse({
    type: () => AdjustSegmentResultDto,
    description: 'Adjust segment result',
  })
  @HttpCode(HttpStatus.OK)
  adjustSegment(
    @Body() body: AdjustSegmentDto,
    @Payload() payload: JwtPayload
  ) {
    return this.segmentManagementService.adjustSegment(body, payload.sub)
  }

  @Post(':slug/process')
  @ApiOperation({ summary: 'Process a segment using a model' })
  @ApiBody({ type: () => SegmentModelProcessDto })
  @ApiOkResponse({
    description: 'Model processing result',
  })
  @HttpCode(HttpStatus.OK)
  processModel(
    @Param('slug') slug: string,
    @Body() body: SegmentModelProcessDto
  ) {
    return this.segmentManagementService.processModel(slug, body)
  }
}
