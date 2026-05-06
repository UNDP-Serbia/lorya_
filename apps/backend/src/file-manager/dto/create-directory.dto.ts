import { IsNotEmpty, IsString } from 'class-validator'
import { IsPath, TransformPath } from '../../common/decorators'
import { ApiProperty } from '@nestjs/swagger'
import { DirectoryEntryType } from '../types'

export class CreateDirectoryDto {
  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'The path to the directory to create',
    example: '/path/to/directory',
  })
  path: string

  @IsString({ message: 'Directory name must be a string' })
  @IsNotEmpty({ message: 'Directory name cannot be empty' })
  @ApiProperty({
    type: String,
    description: 'The name of the directory to create',
    example: 'directory',
  })
  name: string
}
