import { PartialType } from '@nestjs/swagger'
import { CreatePostOcrCorrectionModelDto } from './create-post-ocr-correction-model.dto'

export class UpdatePostOcrCorrectionModelDto extends PartialType(
  CreatePostOcrCorrectionModelDto
) {}
