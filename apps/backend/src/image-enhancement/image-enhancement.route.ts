import { RouteTree } from '@nestjs/core'
import { ImageEnhancementModule } from './image-enhancement.module'

export const imageEnhancementRoutes: RouteTree = {
  path: 'image-enhancements',
  module: ImageEnhancementModule,
}
