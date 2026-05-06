import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common'
import { AiService } from './ai.service'
import {
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import {
  AdjustAllDto,
  AdjustAllResultDto,
  AdjustBrightnessDto,
  AdjustBrightnessResultDto,
  AdjustContrastDto,
  AdjustContrastResultDto,
  AdjustSharpnessDto,
  AdjustSharpnessResultDto,
  CropImageDto,
  CropResultDto,
  ExitStatusDto,
  RotateImageDto,
  RotateResultDto,
  SplitPdfDto,
} from './dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileCleanupFilter } from '../common/filters/file-cleanup.filter'
import { Payload } from '../common/decorators/payload.decorator'
import { JwtPayload } from '../common/types'

@Controller()
@ApiTags('AI')
@ApiBearerAuth('bearerToken')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('pdf/split')
  @ApiOperation({ summary: 'Split a PDF file into page images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: () => SplitPdfDto })
  @ApiOkResponse({ type: () => ExitStatusDto, description: 'Split result' })
  @UseFilters(FileCleanupFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (_req, file, cb) => {
        const isPdf = file.mimetype === 'application/pdf'
        if (!isPdf) {
          return cb(
            new BadRequestException('Only PDF files are allowed'),
            false
          )
        }
        return cb(null, true)
      },
    })
  )
  @HttpCode(HttpStatus.OK)
  async splitPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: SplitPdfDto,
    @Payload() payload: JwtPayload
  ) {
    return await this.aiService.splitPdf(file, body.outputDir, payload.sub)
  }

  @Post('image/rotate')
  @ApiOperation({ summary: 'Rotate an image' })
  @ApiBody({ type: () => RotateImageDto })
  @ApiOkResponse({
    type: () => RotateResultDto,
    description: 'Rotation result',
  })
  @HttpCode(HttpStatus.OK)
  async rotateImage(
    @Body() body: RotateImageDto,
    @Payload() payload: JwtPayload
  ) {
    return await this.aiService.rotateImage(
      body.inputDir,
      body.fileName,
      body.angle,
      body.outputDir,
      payload.sub
    )
  }

  @Post('image/crop')
  @ApiOperation({ summary: 'Crop an image' })
  @ApiBody({ type: () => CropImageDto })
  @ApiOkResponse({
    type: () => CropResultDto,
    description: 'Crop result',
  })
  @HttpCode(HttpStatus.OK)
  async cropImage(@Body() body: CropImageDto, @Payload() payload: JwtPayload) {
    return await this.aiService.cropImage(
      body.inputDir,
      body.fileName,
      body.topLeft,
      body.bottomRight,
      body.outputDir,
      payload.sub
    )
  }

  @Post('image/adjust')
  @ApiOperation({
    summary: 'Adjust image brightness, contrast and sharpness',
  })
  @ApiBody({ type: () => AdjustAllDto })
  @ApiOkResponse({
    type: () => AdjustAllResultDto,
    description: 'Adjust all result',
  })
  @HttpCode(HttpStatus.OK)
  async adjustAll(@Body() body: AdjustAllDto, @Payload() payload: JwtPayload) {
    return await this.aiService.adjustAll(
      body.inputDir,
      body.fileName,
      body.brightness,
      body.contrast,
      body.sharpness,
      body.outputDir,
      payload.sub
    )
  }

  @Post('image/adjust/brightness')
  @ApiOperation({ summary: 'Adjust image brightness' })
  @ApiBody({ type: () => AdjustBrightnessDto })
  @ApiOkResponse({
    type: () => AdjustBrightnessResultDto,
    description: 'Brightness adjustment result',
  })
  @HttpCode(HttpStatus.OK)
  async adjustBrightness(
    @Body() body: AdjustBrightnessDto,
    @Payload() payload: JwtPayload
  ) {
    return await this.aiService.adjustBrightness(
      body.inputDir,
      body.fileName,
      body.brightness,
      body.outputDir,
      payload.sub
    )
  }

  @Post('image/adjust/contrast')
  @ApiOperation({ summary: 'Adjust image contrast' })
  @ApiBody({ type: () => AdjustContrastDto })
  @ApiOkResponse({
    type: () => AdjustContrastResultDto,
    description: 'Contrast adjustment result',
  })
  @HttpCode(HttpStatus.OK)
  async adjustContrast(
    @Body() body: AdjustContrastDto,
    @Payload() payload: JwtPayload
  ) {
    return await this.aiService.adjustContrast(
      body.inputDir,
      body.fileName,
      body.contrast,
      body.outputDir,
      payload.sub
    )
  }

  @Post('image/adjust/sharpness')
  @ApiOperation({ summary: 'Adjust image sharpness' })
  @ApiBody({ type: () => AdjustSharpnessDto })
  @ApiOkResponse({
    type: () => AdjustSharpnessResultDto,
    description: 'Sharpness adjustment result',
  })
  @HttpCode(HttpStatus.OK)
  async adjustSharpness(
    @Body() body: AdjustSharpnessDto,
    @Payload() payload: JwtPayload
  ) {
    return await this.aiService.adjustSharpness(
      body.inputDir,
      body.fileName,
      body.sharpness,
      body.outputDir,
      payload.sub
    )
  }
}
