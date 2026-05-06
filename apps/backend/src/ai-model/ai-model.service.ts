import { Injectable } from '@nestjs/common'
import { AiModelDictionaryDto, AiModelDto } from './dto'
import { ImageEnhancementModelRepository } from 'src/image-enhancement/image-enhancement-model.repository'
import { LayoutIdentificationModelRepository } from 'src/layout-identification/layout-identification-model.repository'
import { OcrModelRepository } from 'src/ocr/ocr-model.repository'
import { PostOcrCorrectionModelRepository } from 'src/post-ocr-correction/post-ocr-correction-model.repository'
import { SegmentManagementService } from 'src/segment-management/segment-management.service'

interface ModelRow {
  id: string
  name: string
  reference: string | null
}

function toAiModelDto(row: ModelRow): AiModelDto {
  return { id: row.id, name: row.name, path: row.reference }
}

@Injectable()
export class AiModelService {
  constructor(
    private readonly imageEnhancementRepo: ImageEnhancementModelRepository,
    private readonly layoutIdentificationRepo: LayoutIdentificationModelRepository,
    private readonly ocrRepo: OcrModelRepository,
    private readonly postOcrCorrectionRepo: PostOcrCorrectionModelRepository,
    private readonly segmentManagementService: SegmentManagementService
  ) {}

  async getModelDictionary(): Promise<AiModelDictionaryDto> {
    const [ie, li, ocr, poc] = await Promise.all([
      this.imageEnhancementRepo.findAll(),
      this.layoutIdentificationRepo.findAll(),
      this.ocrRepo.findAll(),
      this.postOcrCorrectionRepo.findAll(),
    ])

    const dictionary = new AiModelDictionaryDto()
    dictionary.imageEnhancement = ie.map(toAiModelDto)
    dictionary.layoutIdentification = li.map(toAiModelDto)
    dictionary.segmentManagement =
      await this.segmentManagementService.getModels()
    dictionary.ocr = ocr.map(toAiModelDto)
    dictionary.postOcrCorrection = poc.map(toAiModelDto)
    return dictionary
  }
}
