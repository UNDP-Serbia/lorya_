import { forwardRef, Module } from '@nestjs/common'
import { CommonModule } from 'src/common/common.module'
import { AiModule } from 'src/ai/ai.module'
import { LlmRunnerService } from './llm-runner.service'

@Module({
  // AiModule participates in a circular dependency chain
  // (AiModule -> AiModelModule -> OcrModule -> LlmModule -> AiModule),
  // so it must be imported lazily, matching OcrModule/PostOcrCorrectionModule.
  imports: [CommonModule, forwardRef(() => AiModule)],
  providers: [LlmRunnerService],
  exports: [LlmRunnerService],
})
export class LlmModule {}
