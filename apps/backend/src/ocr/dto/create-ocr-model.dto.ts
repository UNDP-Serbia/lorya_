import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'

export class CreateOcrModelDto {
  @ApiProperty({ type: String })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isLlm?: boolean

  @ApiProperty({ type: String, required: false })
  @ValidateIf(o => !o.isLlm)
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  huggingfaceId?: string

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  outputFormatPrompt?: string

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  configFile?: Express.Multer.File

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  inputMapperFile?: Express.Multer.File

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  outputMapperFile?: Express.Multer.File
}
