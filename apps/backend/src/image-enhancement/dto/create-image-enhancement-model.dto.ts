import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateImageEnhancementModelDto {
  @ApiProperty({ type: String })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    type: String,
    description: 'HuggingFace model id',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  huggingfaceId: string

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Config file (required)',
  })
  configFile?: Express.Multer.File

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Input mapper file (required)',
  })
  inputMapperFile?: Express.Multer.File

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Output mapper file (required)',
  })
  outputMapperFile?: Express.Multer.File
}
