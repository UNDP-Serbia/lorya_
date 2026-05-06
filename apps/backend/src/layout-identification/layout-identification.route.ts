import { RouteTree } from '@nestjs/core'
import { LayoutIdentificationModule } from './layout-identification.module'

export const layoutIdentificationRoutes: RouteTree = {
  path: 'layout-identifications',
  module: LayoutIdentificationModule,
}
