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
import { SaveWordEditDto } from 'src/common/dto/save-word-edit.dto'
import { Payload } from 'src/common/decorators/payload.decorator'
import { JwtPayload } from 'src/common/types'
import {
  CreateOcrModelDto,
  ModelProcessDto,
  OcrModelDto,
  OcrProcessingResultDto,
  OcrResultsResponseDto,
  UpdateOcrModelDto,
} from './dto'
import { OcrService } from './ocr.service'
import { OcrModelService } from './ocr-model.service'

@Controller()
@ApiTags('OCR')
@ApiBearerAuth('bearerToken')
export class OcrController {
  constructor(
    private readonly ocrService: OcrService,
    private readonly modelService: OcrModelService
  ) {}

  @Get('models')
  @ApiOperation({ summary: 'List OCR models' })
  @ApiOkResponse({ type: OcrModelDto, isArray: true })
  listModels() {
    return this.modelService.list()
  }

  @Get('models/:id')
  @ApiOperation({ summary: 'Get OCR model by id' })
  @ApiOkResponse({ type: OcrModelDto })
  getModel(@Param('id', ParseUUIDPipe) id: string) {
    return this.modelService.findById(id)
  }

  @Post('models')
  @ApiOperation({ summary: 'Create HuggingFace OCR model' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateOcrModelDto })
  @ApiCreatedResponse({ type: OcrModelDto })
  @UseInterceptors(MODEL_FILE_INTERCEPTOR)
  createModel(
    @Body() body: CreateOcrModelDto,
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
  @ApiOperation({ summary: 'Update HuggingFace OCR model' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateOcrModelDto })
  @ApiOkResponse({ type: OcrModelDto })
  @UseInterceptors(MODEL_FILE_INTERCEPTOR)
  updateModel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateOcrModelDto,
    @UploadedFiles() files: ModelFileMap
  ) {
    return this.modelService.update(id, body, pickSingleModelFile(files))
  }

  @Delete('models/:id')
  @ApiOperation({ summary: 'Delete OCR model' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteModel(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.modelService.delete(id)
  }

  @Post('revert')
  @ApiOperation({
    summary: 'Revert OCR',
    description:
      'Deletes all OCR results for a file and resets its status to SEGMENTED.',
  })
  @ApiBody({ type: () => RevertDto })
  @ApiOkResponse({ description: 'OCR reverted successfully' })
  @HttpCode(HttpStatus.OK)
  revert(
    @Body() body: RevertDto,
    @Payload() payload: JwtPayload
  ): Promise<{ success: boolean }> {
    return this.ocrService.revert(body.inputDir, body.fileName, payload.sub)
  }

  @Get('results/:fileId')
  @ApiOperation({
    summary: 'Get saved OCR results for a file',
  })
  @ApiOkResponse({ type: () => OcrResultsResponseDto })
  getOcrResults(@Param('fileId') fileId: string) {
    return this.ocrService.getOcrResultsByFileId(fileId)
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process an image using an OCR model' })
  @ApiBody({ type: () => ModelProcessDto })
  @ApiOkResponse({ type: () => OcrProcessingResultDto })
  @HttpCode(HttpStatus.OK)
  processModel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ModelProcessDto,
    @Payload() payload: JwtPayload
  ) {
    return this.ocrService.processModel(id, body, payload.sub)
  }

  @Patch('word')
  @ApiOperation({ summary: 'Save a word edit' })
  @ApiBody({ type: () => SaveWordEditDto })
  @ApiOkResponse({ description: 'Word edit saved successfully' })
  @HttpCode(HttpStatus.OK)
  saveWordEdit(@Body() body: SaveWordEditDto, @Payload() payload: JwtPayload) {
    return this.ocrService.saveWordEdit(body, payload.sub)
  }
}
