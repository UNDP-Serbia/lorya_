import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, Max, Min } from 'class-validator'
import { Transform } from 'class-transformer'
import { IsPath, TransformPath } from 'src/common/decorators'
import { DirectoryEntryType } from 'src/file-manager/types/directory-entry-type.enum'

export class RotateImageDto {
  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'Directory containing the image file to rotate',
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
    description: 'Rotation angle in degrees (positive = counterclockwise)',
    example: 90,
    minimum: -360,
    maximum: 360,
  })
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : undefined
  )
  @IsNumber()
  @Min(-360)
  @Max(360)
  angle: number

  @IsString()
  @TransformPath()
  @ApiProperty({
    type: String,
    description:
      'Directory where the rotated image will be saved (created if it does not exist)',
    example: '/path/to/output',
  })
  outputDir: string
}
