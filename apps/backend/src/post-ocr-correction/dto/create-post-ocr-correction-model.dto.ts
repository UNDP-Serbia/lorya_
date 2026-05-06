import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreatePostOcrCorrectionModelDto {
  @ApiProperty({ type: String })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ type: String })
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  huggingfaceId: string

  @ApiProperty({ type: 'string', format: 'binary' })
  configFile?: Express.Multer.File

  @ApiProperty({ type: 'string', format: 'binary' })
  inputMapperFile?: Express.Multer.File

  @ApiProperty({ type: 'string', format: 'binary' })
  outputMapperFile?: Express.Multer.File
}
