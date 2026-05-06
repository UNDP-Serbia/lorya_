import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { DirectoryEntryType } from '../types'
import { MoveEntryDto } from './move-entry.dto'

export class MoveEntriesDto {
  @IsArray({ message: 'Entries must be an array' })
  @ArrayMinSize(1, { message: 'Entries cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => MoveEntryDto)
  @ApiProperty({
    type: [MoveEntryDto],
    description: 'Array of entries to move',
    example: [
      {
        type: DirectoryEntryType.FILE,
        path: '/path/to/file',
        name: 'file_name.txt',
        newPath: '/new-path/to/file',
      },
      {
        type: DirectoryEntryType.DIRECTORY,
        path: '/path/to/directory',
        name: 'directory_name',
        newPath: '/new-path/to/directory',
      },
    ],
  })
  entries: MoveEntryDto[]
}
