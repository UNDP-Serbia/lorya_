import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
} from '@automapper/core'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { ImageEnhancementModelEntity } from 'src/image-enhancement/image-enhancement-model.entity'
import { ImageEnhancementModelDto } from 'src/image-enhancement/dto/image-enhancement-model.dto'

export class ImageEnhancementModelProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(
        mapper,
        ImageEnhancementModelEntity,
        ImageEnhancementModelDto,
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
