import { ApiProperty } from '@nestjs/swagger'
import { IsFile, IsPath, TransformPath } from 'src/common/decorators'
import { DirectoryEntryType } from '../types'
import { ArrayMinSize, ValidateNested } from 'class-validator'

export class UploadFilesDto {
  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'The path to the entry',
    example: '/path/to/directory',
  })
  path: string

  @ApiProperty({
    type: String,
    format: 'binary',
    isArray: true,
  })
  @ArrayMinSize(1, { message: 'Files cannot be empty' })
  @ValidateNested({ each: true })
  @IsFile({})
  files: Express.Multer.File[]
}
