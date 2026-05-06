import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator'

export class SaveWordEditDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Segment ID' })
  segmentId: string

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Line ID (line_id from OCR data)' })
  lineId: number

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Word index within the line' })
  wordIndex: number

  @IsString()
  @ApiProperty({ description: 'New word text' })
  newText: string
}
