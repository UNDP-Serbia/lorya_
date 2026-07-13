// Relative path (under SCRIPT_DIR) of the generic LiteLLM runner script.
// Stored in each LITELLM model's `reference` column so processModel resolves it uniformly.
export const LLM_RUNNER_SCRIPT = 'app/llm/run_litellm.py'

// Per-call timeout (ms) for an LLM completion. Scoped to LLM spawns only — the
// child is killed if a provider hangs, so a stuck request can't block the
// per-segment loop indefinitely.
export const LLM_RUNNER_TIMEOUT_MS = 120000
