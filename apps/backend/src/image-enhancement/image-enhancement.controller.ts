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
import { RevertDto } from 'src/common/dto/revert.dto'
import { Payload } from 'src/common/decorators/payload.decorator'
import { JwtPayload } from 'src/common/types'
import {
  CreateImageEnhancementModelDto,
  ImageEnhancementModelDto,
  ModelProcessDto,
  ModelProcessingResultDto,
  UpdateImageEnhancementModelDto,
} from './dto'
import { ImageEnhancementService } from './image-enhancement.service'
import { ImageEnhancementModelService } from './image-enhancement-model.service'

@Controller()
@ApiTags('Image Enhancement')
@ApiBearerAuth('bearerToken')
export class ImageEnhancementController {
  constructor(
    private readonly imageEnhancementService: ImageEnhancementService,
    private readonly modelService: ImageEnhancementModelService
  ) {}

  @Get('models')
  @ApiOperation({ summary: 'List image enhancement models' })
  @ApiOkResponse({ type: ImageEnhancementModelDto, isArray: true })
  listModels() {
    return this.modelService.list()
  }

  @Get('models/:id')
  @ApiOperation({ summary: 'Get image enhancement model by id' })
  @ApiOkResponse({ type: ImageEnhancementModelDto })
  getModel(@Param('id', ParseUUIDPipe) id: string) {
    return this.modelService.findById(id)
  }

  @Post('models')
  @ApiOperation({ summary: 'Create HuggingFace image enhancement model' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateImageEnhancementModelDto })
  @ApiCreatedResponse({ type: ImageEnhancementModelDto })
  @UseInterceptors(MODEL_FILE_INTERCEPTOR)
  createModel(
    @Body() body: CreateImageEnhancementModelDto,
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
  @ApiOperation({ summary: 'Update HuggingFace image enhancement model' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateImageEnhancementModelDto })
  @ApiOkResponse({ type: ImageEnhancementModelDto })
  @UseInterceptors(MODEL_FILE_INTERCEPTOR)
  updateModel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateImageEnhancementModelDto,
    @UploadedFiles() files: ModelFileMap
  ) {
    return this.modelService.update(id, body, pickSingleModelFile(files))
  }

  @Delete('models/:id')
  @ApiOperation({ summary: 'Delete image enhancement model' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteModel(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.modelService.delete(id)
  }

  @Post('revert')
  @ApiOperation({ summary: 'Revert an enhanced image to its original' })
  @ApiBody({ type: () => RevertDto })
  @ApiOkResponse({ description: 'Image reverted successfully' })
  @HttpCode(HttpStatus.OK)
  revert(
    @Body() body: RevertDto,
    @Payload() payload: JwtPayload
  ): Promise<{ success: boolean }> {
    return this.imageEnhancementService.revert(
      body.inputDir,
      body.fileName,
      payload.sub
    )
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process an image using a model' })
  @ApiBody({ type: () => ModelProcessDto })
  @ApiOkResponse({ type: () => ModelProcessingResultDto })
  @HttpCode(HttpStatus.OK)
  processModel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ModelProcessDto,
    @Payload() payload: JwtPayload
  ) {
    return this.imageEnhancementService.processModel(id, body, payload.sub)
  }
}
