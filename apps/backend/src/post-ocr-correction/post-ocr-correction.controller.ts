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
import { ModelProcessDto } from 'src/ocr/dto'
import { SaveWordEditDto } from 'src/common/dto/save-word-edit.dto'
import { Payload } from 'src/common/decorators/payload.decorator'
import { JwtPayload } from 'src/common/types'
import {
  CreatePostOcrCorrectionModelDto,
  PostOcrCorrectionModelDto,
  PostOcrCorrectionProcessingResultDto,
  PostOcrCorrectionResultsResponseDto,
  UpdatePostOcrCorrectionModelDto,
} from './dto'
import { PostOcrCorrectionService } from './post-ocr-correction.service'
import { PostOcrCorrectionModelService } from './post-ocr-correction-model.service'

@Controller()
@ApiTags('Post OCR Correction')
@ApiBearerAuth('bearerToken')
export class PostOcrCorrectionController {
  constructor(
    private readonly postOcrCorrectionService: PostOcrCorrectionService,
    private readonly modelService: PostOcrCorrectionModelService
  ) {}

  @Get('models')
  @ApiOperation({ summary: 'List post-OCR correction models' })
  @ApiOkResponse({ type: PostOcrCorrectionModelDto, isArray: true })
  listModels() {
    return this.modelService.list()
  }

  @Get('models/:id')
  @ApiOperation({ summary: 'Get post-OCR correction model by id' })
  @ApiOkResponse({ type: PostOcrCorrectionModelDto })
  getModel(@Param('id', ParseUUIDPipe) id: string) {
    return this.modelService.findById(id)
  }

  @Post('models')
  @ApiOperation({ summary: 'Create HuggingFace post-OCR correction model' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePostOcrCorrectionModelDto })
  @ApiCreatedResponse({ type: PostOcrCorrectionModelDto })
  @UseInterceptors(MODEL_FILE_INTERCEPTOR)
  createModel(
    @Body() body: CreatePostOcrCorrectionModelDto,
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
  @ApiOperation({ summary: 'Update HuggingFace post-OCR correction model' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePostOcrCorrectionModelDto })
  @ApiOkResponse({ type: PostOcrCorrectionModelDto })
  @UseInterceptors(MODEL_FILE_INTERCEPTOR)
  updateModel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePostOcrCorrectionModelDto,
    @UploadedFiles() files: ModelFileMap
  ) {
    return this.modelService.update(id, body, pickSingleModelFile(files))
  }

  @Delete('models/:id')
  @ApiOperation({ summary: 'Delete post-OCR correction model' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteModel(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.modelService.delete(id)
  }

  @Post('revert')
  @ApiOperation({ summary: 'Revert post-OCR correction' })
  @ApiBody({ type: () => RevertDto })
  @ApiOkResponse({ description: 'Post-OCR correction reverted successfully' })
  @HttpCode(HttpStatus.OK)
  revert(
    @Body() body: RevertDto,
    @Payload() payload: JwtPayload
  ): Promise<{ success: boolean }> {
    return this.postOcrCorrectionService.revert(
      body.inputDir,
      body.fileName,
      payload.sub
    )
  }

  @Get('results/:fileId')
  @ApiOperation({ summary: 'Get saved post-OCR correction results for a file' })
  @ApiOkResponse({ type: () => PostOcrCorrectionResultsResponseDto })
  getResults(@Param('fileId') fileId: string) {
    return this.postOcrCorrectionService.getResultsByFileId(fileId)
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process using a post-OCR correction model' })
  @ApiBody({ type: () => ModelProcessDto })
  @ApiOkResponse({ type: () => PostOcrCorrectionProcessingResultDto })
  @HttpCode(HttpStatus.OK)
  processModel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ModelProcessDto,
    @Payload() payload: JwtPayload
  ) {
    return this.postOcrCorrectionService.processModel(id, body, payload.sub)
  }

  @Patch('word')
  @ApiOperation({ summary: 'Save a word edit' })
  @ApiBody({ type: () => SaveWordEditDto })
  @ApiOkResponse({ description: 'Word edit saved successfully' })
  @HttpCode(HttpStatus.OK)
  saveWordEdit(@Body() body: SaveWordEditDto, @Payload() payload: JwtPayload) {
    return this.postOcrCorrectionService.saveWordEdit(body, payload.sub)
  }
}
