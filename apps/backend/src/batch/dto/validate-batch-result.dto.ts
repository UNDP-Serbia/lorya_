import { ApiProperty } from '@nestjs/swagger'

export class InvalidFileDto {
  @ApiProperty({ description: 'File ID' })
  fileId: string

  @ApiProperty({ description: 'Current file status' })
  status: string
}

export class ValidateBatchResultDto {
  @ApiProperty({ description: 'Whether all files have the same status' })
  valid: boolean

  @ApiProperty({ description: 'Common status if valid' })
  status: string

  @ApiProperty({
    type: [InvalidFileDto],
    required: false,
    description: 'Files with mismatched statuses',
  })
  invalidFiles?: InvalidFileDto[]
}
