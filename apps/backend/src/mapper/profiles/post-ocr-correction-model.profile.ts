import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
} from '@automapper/core'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { PostOcrCorrectionModelEntity } from 'src/post-ocr-correction/post-ocr-correction-model.entity'
import { PostOcrCorrectionModelDto } from 'src/post-ocr-correction/dto/post-ocr-correction-model.dto'

export class PostOcrCorrectionModelProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(
        mapper,
        PostOcrCorrectionModelEntity,
        PostOcrCorrectionModelDto,
        forMember(
          dest => dest.description,
          mapFrom(src => src.description ?? null)
        ),
        forMember(
          dest => dest.reference,
          mapFrom(src => src.reference ?? null)
        ),
        forMember(
          dest => dest.configFilePath,
          mapFrom(src => src.configFilePath ?? null)
        ),
        forMember(
          dest => dest.inputMapperFilePath,
          mapFrom(src => src.inputMapperFilePath ?? null)
        ),
        forMember(
          dest => dest.outputMapperFilePath,
          mapFrom(src => src.outputMapperFilePath ?? null)
        )
      )
    }
  }
}
