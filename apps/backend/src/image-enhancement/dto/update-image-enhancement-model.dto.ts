import { PartialType } from '@nestjs/swagger'
import { CreateImageEnhancementModelDto } from './create-image-enhancement-model.dto'

export class UpdateImageEnhancementModelDto extends PartialType(
  CreateImageEnhancementModelDto
) {}
