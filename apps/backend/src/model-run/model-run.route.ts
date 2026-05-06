import { RouteTree } from '@nestjs/core'
import { ModelRunModule } from './model-run.module'

export const modelRunRoutes: RouteTree = {
  path: 'run-history',
  module: ModelRunModule,
}
