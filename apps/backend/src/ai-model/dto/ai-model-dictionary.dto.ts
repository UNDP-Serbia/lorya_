import { ApiProperty } from '@nestjs/swagger'
import { AiModelDto } from './ai-model.dto'

export class AiModelDictionaryDto {
  @ApiProperty({
    type: () => AiModelDto,
    description: 'Image enhancement models',
    isArray: true,
  })
  imageEnhancement: AiModelDto[]

  @ApiProperty({
    type: () => AiModelDto,
    description: 'Layout identification models',
    isArray: true,
  })
  layoutIdentification: AiModelDto[]

  @ApiProperty({
    type: () => AiModelDto,
    description: 'Segment management models',
    isArray: true,
  })
  segmentManagement: AiModelDto[]

  @ApiProperty({
    type: () => AiModelDto,
    description: 'OCR models',
    isArray: true,
  })
  ocr: AiModelDto[]

  @ApiProperty({
    type: () => AiModelDto,
    description: 'Post-OCR correction models',
    isArray: true,
  })
  postOcrCorrection: AiModelDto[]
}
