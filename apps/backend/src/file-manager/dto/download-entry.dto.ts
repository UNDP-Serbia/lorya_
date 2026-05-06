import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { IsPath, TransformPath } from '../../common/decorators'
import { ApiProperty } from '@nestjs/swagger'
import { DirectoryEntryType } from '../types'

export class DownloadEntryDto {
  @IsEnum(DirectoryEntryType, {
    message: `Type must be ${DirectoryEntryType.DIRECTORY} or ${DirectoryEntryType.FILE}`,
  })
  @ApiProperty({
    enum: () => DirectoryEntryType,
    description: 'The type of the entry to download',
    example: DirectoryEntryType.FILE,
  })
  type: DirectoryEntryType

  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'The parent path of the entry to download',
    example: '/path/to',
  })
  path: string

  @IsString({ message: 'Entry name must be a string' })
  @IsNotEmpty({ message: 'Entry name cannot be empty' })
  @ApiProperty({
    type: String,
    description: 'The name of the entry to download',
    example: 'image.png',
  })
  name: string
}
