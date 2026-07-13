import {
  extractScriptStatusMessage,
  formatLlmScriptError,
} from './llm-script-error.utils'

describe('extractScriptStatusMessage', () => {
  it('reads messageText from script stdout JSON', () => {
    const stdout = JSON.stringify({
      status: { success: false, messageText: 'litellm.RateLimitError: 429' },
    })
    expect(extractScriptStatusMessage(stdout)).toBe(
      'litellm.RateLimitError: 429'
    )
  })

  it('returns null for empty or invalid stdout', () => {
    expect(extractScriptStatusMessage('')).toBeNull()
    expect(extractScriptStatusMessage('not json')).toBeNull()
  })

  it('reads messageText when LiteLLM banners precede the JSON line', () => {
    const stdout = [
      'Give Feedback / Get Help: https://github.com/BerriAI/litellm/issues/new',
      'LiteLLM.Info: If you need to debug this error, use `litellm._turn_on_debug()`.',
      '',
      JSON.stringify({
        status: {
          success: false,
          messageText:
            'litellm.NotFoundError: models/gemini-1.5-flash is not found',
        },
      }),
    ].join('\n')
    expect(extractScriptStatusMessage(stdout)).toBe(
      'litellm.NotFoundError: models/gemini-1.5-flash is not found'
    )
  })
})

describe('formatLlmScriptError', () => {
  it('maps quota errors to a friendly message', () => {
    const stdout = JSON.stringify({
      status: { success: false, messageText: '429 RESOURCE_EXHAUSTED' },
    })
    expect(formatLlmScriptError(stdout, '')).toBe(
      'LLM API rate limit or quota exceeded. Check your provider plan and usage limits.'
    )
  })

  it('maps missing provider prefix errors', () => {
    const stdout = JSON.stringify({
      status: {
        success: false,
        messageText: 'LLM Provider NOT provided. Pass in the LLM provider',
      },
    })
    expect(formatLlmScriptError(stdout, '')).toBe(
      'Invalid model name: include the provider prefix (e.g. gemini/gemini-2.5-flash, openai/gpt-4o).'
    )
  })

  it('maps model not found errors', () => {
    const stdout = JSON.stringify({
      status: {
        success: false,
        messageText: '404 models/gemini-1.5-flash is not found',
      },
    })
    expect(formatLlmScriptError(stdout, '')).toBe(
      'LLM model not found or unavailable. Verify the model name in your config.'
    )
  })

  it('maps missing litellm package errors', () => {
    const stdout = JSON.stringify({
      status: {
        success: false,
        messageText: "No module named 'litellm'",
      },
    })
    expect(formatLlmScriptError(stdout, '')).toBe(
      'LiteLLM is not installed in the Python environment. Install litellm in the lorya conda env.'
    )
  })

  it('passes through unknown script messages', () => {
    const stdout = JSON.stringify({
      status: { success: false, messageText: 'No prompt configured' },
    })
    expect(formatLlmScriptError(stdout, '')).toBe('No prompt configured')
  })

  it('falls back to stderr then generic message', () => {
    expect(formatLlmScriptError('', 'traceback line')).toBe('traceback line')
    expect(formatLlmScriptError('', '', 'Command failed')).toBe(
      'Command failed'
    )
  })

  it('maps model not found errors from dirty stdout', () => {
    const stdout = [
      'LiteLLM.Info: debug hint',
      JSON.stringify({
        status: {
          success: false,
          messageText: '404 models/gemini-1.5-flash is not found',
        },
      }),
    ].join('\n')
    expect(formatLlmScriptError(stdout, '')).toBe(
      'LLM model not found or unavailable. Verify the model name in your config.'
    )
  })
})
