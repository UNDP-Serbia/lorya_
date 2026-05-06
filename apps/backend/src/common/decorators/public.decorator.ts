import { SetMetadata } from '@nestjs/common'
import { MetadataType } from '../types'

export const Public = () => SetMetadata(MetadataType.IS_PUBLIC, true)
