import type { AiModel as SettingsAiModel } from '../api/interface/ai-models/types'
import type { AiModel as EditorAiModel } from '../api/types/ai-model.types'

export function isLitellmModel(type?: string | null): boolean {
  return type === 'LITELLM'
}

export function getLitellmDefaultPrompt(
  llmConfig?: EditorAiModel['llmConfig'] | null
): string {
  return llmConfig?.defaultPrompt ?? ''
}

export function settingsModelToEditorModel(m: SettingsAiModel): EditorAiModel {
  return {
    id: m.id,
    name: m.name,
    path: m.reference,
    type: m.type,
    llmConfig: m.llmConfig,
  }
}
