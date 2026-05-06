import { PartialType } from '@nestjs/swagger'
import { CreateOcrModelDto } from './create-ocr-model.dto'

export class UpdateOcrModelDto extends PartialType(CreateOcrModelDto) {}
