import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { readFile } from 'fs/promises'
import * as path from 'path'
import { AiService } from '../ai/ai.service'
import { ScriptExecutionError } from '../ai/script-execution.error'
import { LLM_RUNNER_SCRIPT, LLM_RUNNER_TIMEOUT_MS } from './llm.constants'
import { formatLlmScriptError } from './llm-script-error.utils'
import { buildFullLlmPrompt, parseLlmConfig } from './llm-config'
import { LlmRunInput, ParsedLlmResult } from './llm-runner.types'

@Injectable()
export class LlmRunnerService {
  constructor(
    @Inject('SCRIPT_DIR') private readonly scriptDir: string,
    @Inject('CONDA_ENV') private readonly condaEnv: string,
    private readonly aiService: AiService
  ) {}

  async run(input: LlmRunInput): Promise<ParsedLlmResult> {
    const scriptPath = path.join(this.scriptDir, LLM_RUNNER_SCRIPT)
    const config = parseLlmConfig(await readFile(input.configPath, 'utf8'))
    const prompt = buildFullLlmPrompt(config, input.task, input.prompt)
    const payload = JSON.stringify({
      task: input.task,
      prompt,
      parameters: input.parameters ?? null,
      image: input.image ?? null,
      ocr: input.ocr ?? null,
    })

    let raw: string
    try {
      raw = (await this.aiService.runScript(
        'python',
        [scriptPath, input.configPath],
        {
          env: {
            ...process.env,
            PATH: `${this.condaEnv}/bin:${process.env.PATH ?? ''}`,
          },
          timeout: LLM_RUNNER_TIMEOUT_MS,
        },
        payload
      )) as string
    } catch (err) {
      if (err instanceof ScriptExecutionError) {
        throw new BadRequestException(
          formatLlmScriptError(err.stdout, err.stderr, err.message)
        )
      }
      throw new BadRequestException(
        err instanceof Error ? err.message : 'LLM processing failed'
      )
    }

    let parsed: ParsedLlmResult
    try {
      parsed = JSON.parse(raw.trim()) as ParsedLlmResult
    } catch {
      throw new BadRequestException('LLM script returned invalid JSON')
    }
    if (!parsed?.status?.success) {
      throw new BadRequestException(
        formatLlmScriptError(
          raw,
          '',
          parsed?.status?.messageText || 'LLM processing failed'
        )
      )
    }
    return parsed
  }
}
