import { RouteTree } from '@nestjs/core'
import { ActivityModule } from './activity.module'

export const activityRoutes: RouteTree = {
  path: 'activity',
  module: ActivityModule,
}
