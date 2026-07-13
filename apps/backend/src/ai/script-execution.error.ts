export class ScriptExecutionError extends Error {
  constructor(
    message: string,
    readonly stdout: string,
    readonly stderr: string,
    readonly exitCode: number | null
  ) {
    super(message)
    this.name = 'ScriptExecutionError'
  }
}
