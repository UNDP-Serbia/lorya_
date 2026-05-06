import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, Max, Min } from 'class-validator'
import { Transform } from 'class-transformer'
import { IsPath, TransformPath } from 'src/common/decorators'
import { DirectoryEntryType } from 'src/file-manager/types/directory-entry-type.enum'

export class AdjustContrastDto {
  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'Directory containing the image file to adjust',
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

  @ApiProperty({
    type: Number,
    description:
      'Contrast factor (1.0 = original, >1 = higher contrast, <1 = lower contrast). Must be greater than 0 and less than or equal to 2.',
    example: 1.5,
    minimum: 0.01,
    maximum: 2,
  })
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : undefined
  )
  @IsNumber()
  @Min(0.01, { message: 'contrast must be greater than 0' })
  @Max(2, { message: 'contrast must be less than or equal to 2' })
  contrast: number

  @IsString()
  @TransformPath()
  @ApiProperty({
    type: String,
    description:
      'Directory where the adjusted image will be saved (created if it does not exist)',
    example: '/path/to/output',
  })
  outputDir: string
}
