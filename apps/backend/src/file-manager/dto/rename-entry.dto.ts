import { ApiProperty } from '@nestjs/swagger'
import { IsPath, TransformPath } from '../../common/decorators'
import { DirectoryEntryType } from '../types'
import { IsString, IsNotEmpty, IsEnum } from 'class-validator'

export class RenameEntryDto {
  @IsEnum(DirectoryEntryType, {
    message: `Type must be ${DirectoryEntryType.DIRECTORY} or ${DirectoryEntryType.FILE}`,
  })
  @ApiProperty({
    enum: () => DirectoryEntryType,
    description: 'The type of the entry to rename',
    example: DirectoryEntryType.FILE,
  })
  type: DirectoryEntryType

  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'The path to entry directory',
    example: '/path/to/directory',
  })
  path: string

  @IsString({ message: 'Entry name must be a string' })
  @IsNotEmpty({ message: 'Entry name cannot be empty' })
  @ApiProperty({
    type: String,
    description: 'The name of the entry to rename',
    example: 'entry_name.txt',
  })
  name: string

  @IsString({ message: 'New name must be a string' })
  @IsNotEmpty({ message: 'New name cannot be empty' })
  @ApiProperty({
    type: String,
    description: 'The new name of the entry',
    example: 'new_entry_name.txt',
  })
  newName: string
}
