import { Routes } from '@nestjs/core'
import { accountRoute } from '../account/account.route'
import { authRoutes } from '../auth/auth.route'
import { fileManagerRoutes } from 'src/file-manager/file-manager.route'
import { aiRoutes } from 'src/ai/ai.route'
import { activityRoutes } from 'src/activity/activity.route'
import { modelRunRoutes } from 'src/model-run/model-run.route'

export const routes: Routes = [
  authRoutes,
  accountRoute,
  aiRoutes,
  fileManagerRoutes,
  activityRoutes,
  modelRunRoutes,
]
