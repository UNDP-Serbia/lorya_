import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator'
import { IsPath, TransformPath } from 'src/common/decorators'
import { DirectoryEntryType } from 'src/file-manager/types/directory-entry-type.enum'

export class ModelProcessDto {
  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'Directory containing the image file to process',
    example: '/path/to/images',
  })
  inputDir: string

  @IsString()
  @ApiProperty({
    type: String,
    description: 'Image file name including extension',
    example: 'image.jpg',
  })
  fileName: string

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description:
      'Run history grouping id (returned by POST /run-history/start)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789',
  })
  modelRunId?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    description:
      'Override prompt (LITELLM models only; ignored for built-in models)',
  })
  prompt?: string

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    type: Object,
    description:
      'Override LLM parameters, e.g. { temperature, max_tokens } (LITELLM only)',
  })
  parameters?: Record<string, unknown>
}
