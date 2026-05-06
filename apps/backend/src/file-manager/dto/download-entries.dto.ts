import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { DirectoryEntryType } from '../types'
import { DownloadEntryDto } from './download-entry.dto'

export class DownloadEntriesDto {
  @IsArray({ message: 'Entries must be an array' })
  @ArrayMinSize(1, { message: 'Entries cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => DownloadEntryDto)
  @ApiProperty({
    type: [DownloadEntryDto],
    description: 'Array of entries to download',
    example: [
      {
        type: DirectoryEntryType.FILE,
        path: '/path/to/file',
        name: 'image.png',
      },
      {
        type: DirectoryEntryType.DIRECTORY,
        path: '/path/to/directory',
        name: 'my_folder',
      },
    ],
  })
  entries: DownloadEntryDto[]
}
