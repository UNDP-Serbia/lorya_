import { ApiProperty } from '@nestjs/swagger'
import { IsFile, IsPath, TransformPath } from 'src/common/decorators'
import { DirectoryEntryType } from 'src/file-manager/types/directory-entry-type.enum'

export class SplitPdfDto {
  @ApiProperty({
    type: String,
    format: 'binary',
    description: 'The PDF file to split',
    example: 'file_name.pdf',
  })
  @IsFile({})
  file: Express.Multer.File

  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'The path to the output directory',
    example: '/path/to/output/directory',
  })
  outputDir: string
}
