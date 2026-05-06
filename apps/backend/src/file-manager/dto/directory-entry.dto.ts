import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DirectoryEntryType } from '../types'

export class DirectoryEntryDto {
  @ApiProperty({
    enum: () => DirectoryEntryType,
    description: 'Type of the directory entry',
    example: DirectoryEntryType.DIRECTORY,
  })
  type: DirectoryEntryType

  @ApiProperty({
    type: String,
    description: 'Path of the directory entry',
    example: '/path/to',
  })
  path: string

  @ApiProperty({
    type: String,
    description: 'Name of the directory entry',
    example: 'entry_name',
  })
  name: string

  @ApiPropertyOptional({
    type: () => DirectoryEntryDto,
    isArray: true,
    description: 'Children of the directory entry',
    example: [
      {
        type: DirectoryEntryType.DIRECTORY,
        path: '/path/to/entry_name',
        name: 'directory_name',
      },
      {
        type: DirectoryEntryType.FILE,
        path: '/path/to/entry_name',
        name: 'file_name.txt',
      },
    ],
  })
  children?: DirectoryEntryDto[]

  @ApiPropertyOptional({
    type: String,
    description: 'File UUID (only for file entries)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  fileId?: string

  @ApiPropertyOptional({
    type: String,
    description: 'File status (only for file entries)',
    example: 'INITIALIZED',
    enum: ['INITIALIZED', 'SEGMENTED', 'COMPLETED'],
  })
  status?: string

  @ApiPropertyOptional({
    type: Object,
    description:
      'Metadata for each processing step including confidence and human modification status',
    example: {
      imageEnhancement: {
        confidence: null,
        humanModified: false,
        imageModified: false,
      },
      layoutIdentification: {
        confidence: 0.85,
        humanModified: true,
      },
      ocr: {
        confidence: 0.72,
        humanModified: false,
      },
      postOcr: {
        confidence: 0.68,
        humanModified: false,
      },
    },
  })
  metadata?: {
    imageEnhancement: {
      confidence: number | null
      humanModified: boolean
      imageModified: boolean
    }
    layoutIdentification: {
      confidence: number | null
      humanModified: boolean
    }
    ocr: {
      confidence: number | null
      humanModified: boolean
    }
    postOcr: {
      confidence: number | null
      humanModified: boolean
    }
  }
}
