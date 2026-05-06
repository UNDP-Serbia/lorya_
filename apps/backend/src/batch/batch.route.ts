import { RouteTree } from '@nestjs/core'
import { BatchModule } from './batch.module'

export const batchRoutes: RouteTree = {
  path: 'batch',
  module: BatchModule,
}
