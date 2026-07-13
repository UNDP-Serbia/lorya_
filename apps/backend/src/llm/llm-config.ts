import { BadRequestException } from '@nestjs/common'
import { getDefaultOutputFormatPrompt, type LlmTask } from './llm-output-format'

export interface LlmConfig {
  model: string
  apiKey: string
  defaultPrompt: string
  outputFormatPrompt?: string
  apiBase?: string
  parameters?: Record<string, unknown>
}

export type SanitizedLlmConfig = Omit<LlmConfig, 'apiKey'>

export function parseLlmConfig(raw: string): LlmConfig {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new BadRequestException('Config file must be valid JSON')
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new BadRequestException('Config must be a JSON object')
  }
  const c = parsed as Record<string, unknown>
  if (typeof c.model !== 'string' || c.model.length === 0) {
    throw new BadRequestException('Config field "model" is required')
  }
  if (typeof c.apiKey !== 'string' || c.apiKey.length === 0) {
    throw new BadRequestException('Config field "apiKey" is required')
  }
  if (typeof c.defaultPrompt !== 'string' || c.defaultPrompt.length === 0) {
    throw new BadRequestException('Config field "defaultPrompt" is required')
  }
  if (
    c.apiBase !== undefined &&
    (typeof c.apiBase !== 'string' || c.apiBase.length === 0)
  ) {
    throw new BadRequestException(
      'Config field "apiBase" must be a non-empty string'
    )
  }
  if (
    c.parameters !== undefined &&
    (typeof c.parameters !== 'object' ||
      c.parameters === null ||
      Array.isArray(c.parameters))
  ) {
    throw new BadRequestException('Config field "parameters" must be an object')
  }
  if (
    c.outputFormatPrompt !== undefined &&
    (typeof c.outputFormatPrompt !== 'string' ||
      c.outputFormatPrompt.trim().length === 0)
  ) {
    throw new BadRequestException(
      'Config field "outputFormatPrompt" must be a non-empty string'
    )
  }
  return {
    model: c.model,
    apiKey: c.apiKey,
    defaultPrompt: c.defaultPrompt,
    outputFormatPrompt: c.outputFormatPrompt as string | undefined,
    apiBase: c.apiBase as string | undefined,
    parameters: c.parameters as Record<string, unknown> | undefined,
  }
}

export function resolveOutputFormatPrompt(
  value: string | undefined,
  task: LlmTask
): string {
  const trimmed = value?.trim()
  return trimmed || getDefaultOutputFormatPrompt(task)
}

export function mergeOutputFormatPromptIntoRaw(
  raw: string,
  outputFormatPrompt: string
): string {
  parseLlmConfig(raw)
  const parsed = JSON.parse(raw) as Record<string, unknown>
  parsed.outputFormatPrompt = outputFormatPrompt.trim()
  return JSON.stringify(parsed, null, 2)
}

export function prepareLlmConfigFile(
  raw: string,
  outputFormatPrompt: string | undefined,
  task: LlmTask
): Express.Multer.File {
  const content = mergeOutputFormatPromptIntoRaw(
    raw,
    resolveOutputFormatPrompt(outputFormatPrompt, task)
  )
  return {
    buffer: Buffer.from(content, 'utf8'),
    originalname: 'config.json',
  } as Express.Multer.File
}

export function buildFullLlmPrompt(
  config: LlmConfig,
  task: LlmTask,
  promptOverride?: string | null
): string {
  const taskPrompt = promptOverride ?? config.defaultPrompt
  const formatPrompt = resolveOutputFormatPrompt(
    config.outputFormatPrompt,
    task
  )
  return `${taskPrompt}\n\n${formatPrompt}`
}

export function sanitizeLlmConfig(config: LlmConfig): SanitizedLlmConfig {
  const { apiKey: _apiKey, ...rest } = config
  return rest
}
