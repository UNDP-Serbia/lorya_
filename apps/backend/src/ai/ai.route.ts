import { RouteTree } from '@nestjs/core'
import { AiModule } from './ai.module'
import { aiModelRoutes } from 'src/ai-model/ai-model.route'

export const aiRoutes: RouteTree = {
  path: 'ai',
  module: AiModule,
  children: [aiModelRoutes],
}
