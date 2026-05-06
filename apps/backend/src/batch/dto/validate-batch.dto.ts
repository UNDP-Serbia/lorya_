import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsString, ArrayMinSize } from 'class-validator'

export class ValidateBatchDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ApiProperty({
    type: [String],
    description: 'Array of file IDs to validate',
    example: ['uuid-1', 'uuid-2'],
  })
  fileIds: string[]
}
