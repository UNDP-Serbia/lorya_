function parseScriptStdoutJson(stdout: string): {
  status?: { messageText?: string }
} | null {
  const trimmed = stdout.trim()
  if (!trimmed) return null

  try {
    return JSON.parse(trimmed) as { status?: { messageText?: string } }
  } catch {
    // LiteLLM may print banner lines to stdout before the script's JSON payload.
  }

  const lines = trimmed.split('\n').map(line => line.trim())
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    if (!line.startsWith('{')) continue
    try {
      return JSON.parse(line) as { status?: { messageText?: string } }
    } catch {
      continue
    }
  }

  const jsonStart = trimmed.lastIndexOf('{')
  if (jsonStart < 0) return null
  try {
    return JSON.parse(trimmed.slice(jsonStart)) as {
      status?: { messageText?: string }
    }
  } catch {
    return null
  }
}

export function extractScriptStatusMessage(stdout: string): string | null {
  const parsed = parseScriptStdoutJson(stdout)
  const message = parsed?.status?.messageText?.trim()
  return message || null
}

export function formatLlmScriptError(
  stdout: string,
  stderr: string,
  fallbackMessage?: string
): string {
  const message =
    extractScriptStatusMessage(stdout) ||
    stderr.trim() ||
    fallbackMessage ||
    'LLM processing failed'

  const lower = message.toLowerCase()

  if (
    lower.includes('429') ||
    lower.includes('rate limit') ||
    lower.includes('quota') ||
    lower.includes('resource_exhausted')
  ) {
    return 'LLM API rate limit or quota exceeded. Check your provider plan and usage limits.'
  }

  if (
    lower.includes('provider') &&
    (lower.includes('not provided') || lower.includes('required'))
  ) {
    return 'Invalid model name: include the provider prefix (e.g. gemini/gemini-2.5-flash, openai/gpt-4o).'
  }

  if (
    lower.includes('404') ||
    lower.includes('model_not_found') ||
    (lower.includes('not found') && lower.includes('model'))
  ) {
    return 'LLM model not found or unavailable. Verify the model name in your config.'
  }

  if (lower.includes('no module named') && lower.includes('litellm')) {
    return 'LiteLLM is not installed in the Python environment. Install litellm in the lorya conda env.'
  }

  if (
    lower.includes('api key') ||
    lower.includes('apikey') ||
    lower.includes('authentication') ||
    lower.includes('unauthorized') ||
    lower.includes('401') ||
    lower.includes('invalid api')
  ) {
    return 'LLM API authentication failed. Check the apiKey in your model config.'
  }

  return message
}
