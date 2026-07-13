import { BadRequestException } from '@nestjs/common'
import { readFile } from 'fs/promises'
import { LlmRunnerService } from './llm-runner.service'

import { AiService } from '../ai/ai.service'
import { ScriptExecutionError } from '../ai/script-execution.error'
import { DEFAULT_OCR_OUTPUT_FORMAT_PROMPT } from './llm-output-format'

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}))

const readFileMock = readFile as jest.MockedFunction<typeof readFile>

const baseConfig = {
  model: 'gpt-4o',
  apiKey: 'sk-123',
  defaultPrompt: 'Read the text.',
  outputFormatPrompt: 'Return JSON with lang, script, lines.',
}

function makeService(runScriptImpl: jest.Mock) {
  const aiService = { runScript: runScriptImpl } as unknown as AiService
  return new LlmRunnerService('/scripts', '/conda', aiService)
}

describe('LlmRunnerService', () => {
  beforeEach(() => {
    readFileMock.mockResolvedValue(JSON.stringify(baseConfig))
  })

  it('passes script path, config path, env and stdin payload, and returns parsed output', async () => {
    const runScript = jest.fn().mockResolvedValue(
      JSON.stringify({
        status: { success: true },
        lang: 'srp',
        script: 'cyrillic',
        lines: [],
        statistics: { avg_word_confidence: null },
      })
    )
    const svc = makeService(runScript)

    const result = await svc.run({
      task: 'ocr',
      configPath: '/abs/config.json',
      prompt: 'override',
      image: 'BASE64',
    })

    expect(result.lang).toBe('srp')
    expect(result.script).toBe('cyrillic')
    expect(result.lines).toEqual([])
    expect(result.statistics).toEqual({ avg_word_confidence: null })
    const [command, args, options, input] = runScript.mock.calls[0]
    expect(command).toBe('python')
    expect(args[0]).toContain('app/llm/run_litellm.py')
    expect(args[1]).toBe('/abs/config.json')
    expect(options.env.PATH).toContain('/conda/bin')
    const payload = JSON.parse(input)
    expect(payload).toMatchObject({
      task: 'ocr',
      prompt: `override\n\n${baseConfig.outputFormatPrompt}`,
      image: 'BASE64',
    })
  })

  it('defaults omitted optional fields to null in the payload', async () => {
    const runScript = jest
      .fn()
      .mockResolvedValue(
        JSON.stringify({ status: { success: true }, lines: [] })
      )
    const svc = makeService(runScript)
    await svc.run({ task: 'post_ocr', configPath: '/c.json' })
    const payload = JSON.parse(runScript.mock.calls[0][3])
    expect(payload.prompt).toBe(
      `${baseConfig.defaultPrompt}\n\n${baseConfig.outputFormatPrompt}`
    )
    expect(payload.parameters).toBeNull()
    expect(payload.image).toBeNull()
    expect(payload.ocr).toBeNull()
  })

  it('uses default output format prompt when config omits it', async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        model: 'gpt-4o',
        apiKey: 'sk-123',
        defaultPrompt: 'Read the text.',
      })
    )
    const runScript = jest
      .fn()
      .mockResolvedValue(
        JSON.stringify({ status: { success: true }, lines: [] })
      )
    const svc = makeService(runScript)
    await svc.run({ task: 'ocr', configPath: '/c.json', image: 'x' })
    const payload = JSON.parse(runScript.mock.calls[0][3])
    expect(payload.prompt).toBe(
      `Read the text.\n\n${DEFAULT_OCR_OUTPUT_FORMAT_PROMPT}`
    )
  })

  it('throws BadRequestException when script reports failure', async () => {
    const runScript = jest.fn().mockResolvedValue(
      JSON.stringify({
        status: { success: false, messageText: 'rate limited' },
      })
    )
    const svc = makeService(runScript)
    await expect(
      svc.run({ task: 'ocr', configPath: '/c.json', image: 'x' })
    ).rejects.toThrow(BadRequestException)
    await expect(
      svc.run({ task: 'ocr', configPath: '/c.json', image: 'x' })
    ).rejects.toThrow(
      'LLM API rate limit or quota exceeded. Check your provider plan and usage limits.'
    )
  })

  it('throws BadRequestException on invalid JSON', async () => {
    const runScript = jest.fn().mockResolvedValue('not json')
    const svc = makeService(runScript)
    await expect(
      svc.run({ task: 'ocr', configPath: '/c.json', image: 'x' })
    ).rejects.toThrow(BadRequestException)
  })

  it('maps ScriptExecutionError stdout to a friendly BadRequestException', async () => {
    const stdout = JSON.stringify({
      status: { success: false, messageText: '429 quota exceeded' },
    })
    const runScript = jest
      .fn()
      .mockRejectedValue(
        new ScriptExecutionError('Command failed', stdout, '', 1)
      )
    const svc = makeService(runScript)
    await expect(
      svc.run({ task: 'ocr', configPath: '/c.json', image: 'x' })
    ).rejects.toThrow(BadRequestException)
    await expect(
      svc.run({ task: 'ocr', configPath: '/c.json', image: 'x' })
    ).rejects.toThrow(
      'LLM API rate limit or quota exceeded. Check your provider plan and usage limits.'
    )
  })
})
