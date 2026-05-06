import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsNumber, IsString, Min, ValidateNested } from 'class-validator'
import { IsPath, TransformPath } from 'src/common/decorators'
import { DirectoryEntryType } from 'src/file-manager/types/directory-entry-type.enum'

export class CropCoordinateDto {
  @ApiProperty({ type: Number, description: 'X coordinate', example: 0 })
  @IsNumber()
  @IsInt()
  @Min(0)
  x: number

  @ApiProperty({ type: Number, description: 'Y coordinate', example: 0 })
  @IsNumber()
  @IsInt()
  @Min(0)
  y: number
}

export class CropImageDto {
  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'Directory containing the image file to crop',
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
    type: () => CropCoordinateDto,
    description: 'Top-left corner (x, y)',
  })
  @ValidateNested()
  @Type(() => CropCoordinateDto)
  topLeft: CropCoordinateDto

  @ApiProperty({
    type: () => CropCoordinateDto,
    description: 'Bottom-right corner (x, y)',
  })
  @ValidateNested()
  @Type(() => CropCoordinateDto)
  bottomRight: CropCoordinateDto

  @IsString()
  @TransformPath()
  @ApiProperty({
    type: String,
    description:
      'Directory where the cropped image will be saved (created if it does not exist)',
    example: '/path/to/output',
  })
  outputDir: string
}
