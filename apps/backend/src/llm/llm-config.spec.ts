import { BadRequestException } from '@nestjs/common'
import {
  buildFullLlmPrompt,
  mergeOutputFormatPromptIntoRaw,
  parseLlmConfig,
  prepareLlmConfigFile,
  sanitizeLlmConfig,
} from './llm-config'
import { DEFAULT_OCR_OUTPUT_FORMAT_PROMPT } from './llm-output-format'

const valid = JSON.stringify({
  model: 'gpt-4o',
  apiKey: 'sk-123',
  defaultPrompt: 'Read the text.',
  apiBase: 'https://api.example.com',
  parameters: { temperature: 0.2 },
})

describe('parseLlmConfig', () => {
  it('parses a valid config', () => {
    const cfg = parseLlmConfig(valid)
    expect(cfg.model).toBe('gpt-4o')
    expect(cfg.apiKey).toBe('sk-123')
    expect(cfg.parameters).toEqual({ temperature: 0.2 })
  })
  it('rejects invalid JSON', () => {
    expect(() => parseLlmConfig('{not json')).toThrow(BadRequestException)
  })
  it('rejects missing model', () => {
    expect(() =>
      parseLlmConfig(JSON.stringify({ apiKey: 'k', defaultPrompt: 'p' }))
    ).toThrow(BadRequestException)
  })
  it('rejects missing apiKey', () => {
    expect(() =>
      parseLlmConfig(JSON.stringify({ model: 'm', defaultPrompt: 'p' }))
    ).toThrow(BadRequestException)
  })
  it('rejects missing defaultPrompt', () => {
    expect(() =>
      parseLlmConfig(JSON.stringify({ model: 'm', apiKey: 'k' }))
    ).toThrow(BadRequestException)
  })
  it('rejects non-object parameters', () => {
    expect(() =>
      parseLlmConfig(
        JSON.stringify({
          model: 'm',
          apiKey: 'k',
          defaultPrompt: 'p',
          parameters: 5,
        })
      )
    ).toThrow(BadRequestException)
  })
  it('rejects null parameters', () => {
    expect(() =>
      parseLlmConfig(
        JSON.stringify({
          model: 'm',
          apiKey: 'k',
          defaultPrompt: 'p',
          parameters: null,
        })
      )
    ).toThrow(BadRequestException)
  })
  it('rejects empty outputFormatPrompt', () => {
    expect(() =>
      parseLlmConfig(
        JSON.stringify({
          model: 'm',
          apiKey: 'k',
          defaultPrompt: 'p',
          outputFormatPrompt: '   ',
        })
      )
    ).toThrow(BadRequestException)
  })
})

describe('sanitizeLlmConfig', () => {
  it('strips apiKey', () => {
    const sanitized = sanitizeLlmConfig(parseLlmConfig(valid))
    expect((sanitized as Record<string, unknown>).apiKey).toBeUndefined()
    expect(sanitized.model).toBe('gpt-4o')
    expect(sanitized.defaultPrompt).toBe('Read the text.')
  })
  it('preserves optional fields', () => {
    const sanitized = sanitizeLlmConfig(parseLlmConfig(valid))
    expect(sanitized.apiBase).toBe('https://api.example.com')
    expect(sanitized.parameters).toEqual({ temperature: 0.2 })
  })
})

describe('mergeOutputFormatPromptIntoRaw', () => {
  it('writes outputFormatPrompt into config JSON', () => {
    const merged = mergeOutputFormatPromptIntoRaw(valid, 'format text')
    expect(JSON.parse(merged).outputFormatPrompt).toBe('format text')
  })
})

describe('prepareLlmConfigFile', () => {
  it('uses default format prompt when none is provided', () => {
    const file = prepareLlmConfigFile(valid, undefined, 'ocr')
    const parsed = JSON.parse(file.buffer.toString('utf8'))
    expect(parsed.outputFormatPrompt).toBe(DEFAULT_OCR_OUTPUT_FORMAT_PROMPT)
  })
})

describe('buildFullLlmPrompt', () => {
  it('appends output format instructions to the task prompt', () => {
    const cfg = parseLlmConfig(
      mergeOutputFormatPromptIntoRaw(valid, 'format text')
    )
    expect(buildFullLlmPrompt(cfg, 'ocr', 'task')).toBe('task\n\nformat text')
  })

  it('falls back to default format prompt when missing from config', () => {
    const cfg = parseLlmConfig(valid)
    expect(buildFullLlmPrompt(cfg, 'ocr')).toBe(
      `${cfg.defaultPrompt}\n\n${DEFAULT_OCR_OUTPUT_FORMAT_PROMPT}`
    )
  })
})
