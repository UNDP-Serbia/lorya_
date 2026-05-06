import { RouteTree } from '@nestjs/core'
import { AccountModule } from './account.module'

export const accountRoute: RouteTree = {
  path: 'accounts',
  module: AccountModule,
}
