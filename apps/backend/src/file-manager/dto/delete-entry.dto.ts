import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { IsPath, TransformPath } from '../../common/decorators'
import { ApiProperty } from '@nestjs/swagger'
import { DirectoryEntryType } from '../types'

export class DeleteEntryDto {
  @IsEnum(DirectoryEntryType, {
    message: `Type must be ${DirectoryEntryType.DIRECTORY} or ${DirectoryEntryType.FILE}`,
  })
  @ApiProperty({
    enum: () => DirectoryEntryType,
    description: 'The type of the entry to delete',
    example: DirectoryEntryType.FILE,
  })
  type: DirectoryEntryType

  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'The path to the entry to delete',
    example: '/path/to',
  })
  path: string

  @IsString({ message: 'Entry name must be a string' })
  @IsNotEmpty({ message: 'Entry name cannot be empty' })
  @ApiProperty({
    type: String,
    description: 'The name of the entry to delete',
    example: 'entry_name.txt',
  })
  name: string
}
