import { PartialType } from '@nestjs/swagger'
import { CreateLayoutIdentificationModelDto } from './create-layout-identification-model.dto'

export class UpdateLayoutIdentificationModelDto extends PartialType(
  CreateLayoutIdentificationModelDto
) {}
