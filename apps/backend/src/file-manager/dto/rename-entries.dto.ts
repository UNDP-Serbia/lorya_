import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { DirectoryEntryType } from '../types'
import { RenameEntryDto } from './rename-entry.dto'

export class RenameEntriesDto {
  @IsArray({ message: 'Entries must be an array' })
  @ArrayMinSize(1, { message: 'Entries cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => RenameEntryDto)
  @ApiProperty({
    type: [RenameEntryDto],
    description: 'Array of entries to rename',
    example: [
      {
        type: DirectoryEntryType.FILE,
        path: '/path/to/file',
        name: 'file_name.txt',
        newName: 'new_file_name.txt',
      },
      {
        type: DirectoryEntryType.DIRECTORY,
        path: '/path/to/directory',
        name: 'directory_name',
        newName: 'new_directory_name',
      },
    ],
  })
  entries: RenameEntryDto[]
}
