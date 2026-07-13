import React from 'react'
import { ModalDialog } from '@shared/ui'

type CustomLlmPromptModalProps = {
  open: boolean
  modelName: string
  initialPrompt: string
  isRunning?: boolean
  onCancel: () => void
  onRun: (prompt: string) => void
}

export const CustomLlmPromptModal: React.FC<CustomLlmPromptModalProps> = ({
  open,
  modelName,
  initialPrompt,
  isRunning = false,
  onCancel,
  onRun,
}) => {
  const [prompt, setPrompt] = React.useState(initialPrompt)

  React.useEffect(() => {
    if (open) {
      setPrompt(initialPrompt)
    }
  }, [open, initialPrompt])

  return (
    <ModalDialog
      open={open}
      title={`Custom LLM — ${modelName}`}
      cancelLabel='Cancel'
      submitLabel={isRunning ? 'Running…' : 'Run'}
      onCancel={onCancel}
      onSubmit={isRunning || !prompt.trim() ? undefined : () => onRun(prompt)}
      hasCancelButton
      hasX={!isRunning}
    >
      <p className='text-[11px] text-gray-500 mb-2 text-left'>
        Review and edit the prompt before running this model.
      </p>
      <p className='text-[10px] text-gray-400 mb-2 text-left'>
        Output format instructions from model settings will be appended
        automatically when this model runs.
      </p>
      <textarea
        className='w-full bg-[#eaeaea] text-[13px] text-[#292929] rounded p-2 pl-3 outline-none min-h-[160px] border border-[rgba(123,123,123,0.3)]'
        value={prompt}
        disabled={isRunning}
        onChange={e => setPrompt(e.target.value)}
      />
    </ModalDialog>
  )
}
