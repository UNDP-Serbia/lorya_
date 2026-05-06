import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID } from 'class-validator'
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

  @IsString()
  @TransformPath()
  @ApiProperty({
    type: String,
    description:
      'Directory where the thresholded image will be saved (created if it does not exist)',
    example: '/path/to/output',
  })
  outputDir: string

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
}
