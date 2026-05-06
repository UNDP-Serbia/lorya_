import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { DirectoryEntryType } from '../types'
import { DeleteEntryDto } from './delete-entry.dto'

export class DeleteEntriesDto {
  @IsArray({ message: 'Entries must be an array' })
  @ArrayMinSize(1, { message: 'Entries cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => DeleteEntryDto)
  @ApiProperty({
    type: [DeleteEntryDto],
    description: 'Array of entries to delete',
    example: [
      {
        type: DirectoryEntryType.FILE,
        path: '/path/to/file',
        name: 'file_name.txt',
      },
      {
        type: DirectoryEntryType.DIRECTORY,
        path: '/path/to/directory',
        name: 'directory_name',
      },
    ],
  })
  entries: DeleteEntryDto[]
}
