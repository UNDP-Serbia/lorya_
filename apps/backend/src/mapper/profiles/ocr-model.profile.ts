import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
} from '@automapper/core'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { OcrModelEntity } from 'src/ocr/ocr-model.entity'
import { OcrModelDto } from 'src/ocr/dto/ocr-model.dto'

export class OcrModelProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(
        mapper,
        OcrModelEntity,
        OcrModelDto,
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
