import { RouteTree } from '@nestjs/core'
import { FileManagerModule } from './file-manager.module'

export const fileManagerRoutes: RouteTree = {
  path: 'file-manager',
  module: FileManagerModule,
}
