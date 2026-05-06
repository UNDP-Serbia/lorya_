import { ApiProperty } from '@nestjs/swagger'
import { IsPath, TransformPath } from 'src/common/decorators'
import { DirectoryEntryType } from '../types'
import { IsNotEmpty, IsString, IsEnum } from 'class-validator'

export class MoveEntryDto {
  @IsEnum(DirectoryEntryType, {
    message: `Type must be ${DirectoryEntryType.DIRECTORY} or ${DirectoryEntryType.FILE}`,
  })
  @ApiProperty({
    enum: () => DirectoryEntryType,
    description: 'The type of the entry to move',
    example: DirectoryEntryType.FILE,
  })
  type: DirectoryEntryType

  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'The path to the entry',
    example: '/path/to/directory',
  })
  path: string

  @IsString({ message: 'Entry name must be a string' })
  @IsNotEmpty({ message: 'Entry name cannot be empty' })
  @ApiProperty({
    type: String,
    description: 'The name of the entry to move',
    example: 'entry_name.txt',
  })
  name: string

  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'The new path to the entry',
    example: '/new-path/to/directory',
  })
  newPath: string
}
