import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsUUID, Max, Min } from 'class-validator'
import { AiActivityModelType } from '../../activity/enums'

export class StartModelRunDto {
  @IsEnum(AiActivityModelType)
  @ApiProperty({
    enum: AiActivityModelType,
    description: 'Type of AI model being run',
    example: AiActivityModelType.OCR,
  })
  modelType: AiActivityModelType

  @IsUUID()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'UUID of the specific model in its model table',
    example: '8b4d1f4a-2e3a-4f5b-9c6d-1a2b3c4d5e6f',
  })
  modelId: string

  @IsInt()
  @Min(1)
  @Max(10000)
  @ApiProperty({
    type: Number,
    description: 'Number of files in the user-selected batch',
    example: 8,
    minimum: 1,
    maximum: 10000,
  })
  selectionCount: number
}
