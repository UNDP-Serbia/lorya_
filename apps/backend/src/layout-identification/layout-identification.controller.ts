import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import {
  MODEL_FILE_INTERCEPTOR,
  ModelFileMap,
  pickSingleModelFile,
} from 'src/common/multer/model-file-fields'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Payload } from 'src/common/decorators/payload.decorator'
import { JwtPayload } from 'src/common/types'
import {
  CreateLayoutIdentificationModelDto,
  LayoutIdentificationModelDto,
  ModelProcessDto,
  ModelProcessingResultDto,
  UpdateLayoutIdentificationModelDto,
} from './dto'
import { LayoutIdentificationService } from './layout-identification.service'
import { LayoutIdentificationModelService } from './layout-identification-model.service'

@Controller()
@ApiTags('Layout Identification')
@ApiBearerAuth('bearerToken')
export class LayoutIdentificationController {
  constructor(
    private readonly layoutIdentificationService: LayoutIdentificationService,
    private readonly modelService: LayoutIdentificationModelService
  ) {}

  @Get('models')
  @ApiOperation({ summary: 'List layout identification models' })
  @ApiOkResponse({ type: LayoutIdentificationModelDto, isArray: true })
  listModels() {
    return this.modelService.list()
  }

  @Get('models/:id')
  @ApiOperation({ summary: 'Get layout identification model by id' })
  @ApiOkResponse({ type: LayoutIdentificationModelDto })
  getModel(@Param('id', ParseUUIDPipe) id: string) {
    return this.modelService.findById(id)
  }

  @Post('models')
  @ApiOperation({ summary: 'Create HuggingFace layout identification model' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateLayoutIdentificationModelDto })
  @ApiCreatedResponse({ type: LayoutIdentificationModelDto })
  @UseInterceptors(MODEL_FILE_INTERCEPTOR)
  createModel(
    @Body() body: CreateLayoutIdentificationModelDto,
    @UploadedFiles() files: ModelFileMap,
    @Payload() payload: JwtPayload
  ) {
    return this.modelService.create(
      body,
      pickSingleModelFile(files),
      payload.sub
    )
  }

  @Patch('models/:id')
  @ApiOperation({ summary: 'Update HuggingFace layout identification model' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateLayoutIdentificationModelDto })
  @ApiOkResponse({ type: LayoutIdentificationModelDto })
  @UseInterceptors(MODEL_FILE_INTERCEPTOR)
  updateModel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateLayoutIdentificationModelDto,
    @UploadedFiles() files: ModelFileMap
  ) {
    return this.modelService.update(id, body, pickSingleModelFile(files))
  }

  @Delete('models/:id')
  @ApiOperation({ summary: 'Delete layout identification model' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteModel(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.modelService.delete(id)
  }

  @Post(':id/process')
  @ApiOperation({
    summary: 'Process an image using a layout identification model',
  })
  @ApiBody({ type: () => ModelProcessDto })
  @ApiOkResponse({ type: () => ModelProcessingResultDto })
  @HttpCode(HttpStatus.OK)
  processModel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ModelProcessDto,
    @Payload() payload: JwtPayload
  ) {
    return this.layoutIdentificationService.processModel(id, body, payload.sub)
  }
}
