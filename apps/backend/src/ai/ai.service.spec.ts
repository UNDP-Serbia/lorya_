import { AiService } from './ai.service'
import { ScriptExecutionError } from './script-execution.error'

describe('AiService.runScript stdin', () => {
  // runScript does not touch the injected deps; pass stubs.
  const svc = new AiService(
    '' as never,
    {} as never,
    '' as never,
    {} as never,
    {} as never,
    {} as never
  )

  it('writes input to child stdin and resolves stdout', async () => {
    const out = (await svc.runScript(
      'cat',
      [],
      undefined,
      'hello stdin'
    )) as string
    expect(out).toBe('hello stdin')
  })

  it('still works with no input (stdin closed empty)', async () => {
    const out = (await svc.runScript('printf', ['ok'], undefined)) as string
    expect(out).toBe('ok')
  })

  it('rejects with ScriptExecutionError including stdout on non-zero exit', async () => {
    await expect(
      svc.runScript('sh', [
        '-c',
        'printf \'{"status":{"messageText":"boom"}}\' && exit 1',
      ])
    ).rejects.toMatchObject({
      name: 'ScriptExecutionError',
      stdout: '{"status":{"messageText":"boom"}}',
      exitCode: 1,
    })
    try {
      await svc.runScript('sh', ['-c', 'exit 1'])
    } catch (err) {
      expect(err).toBeInstanceOf(ScriptExecutionError)
      expect((err as ScriptExecutionError).message).toContain('Command failed')
    }
  })
})
