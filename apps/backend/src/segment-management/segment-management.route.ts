import { RouteTree } from '@nestjs/core'
import { SegmentManagementModule } from './segment-management.module'

export const segmentManagementRoutes: RouteTree = {
  path: 'segment-management',
  module: SegmentManagementModule,
}
