import React from 'react'
import { MethodSelectItem, ApplyButton, type MethodStatus } from '@shared/ui'
import type { AiModel, OcrProcessingResultDto } from '../../../api'
import { ocrEndpoints, AiActivityModelType } from '../../../api'
import { useOcrProcess, useBatchValidate } from '../../../query'
import {
  useStartModelRun,
  useCompleteModelRun,
} from '../../../query/run-history'
import { useBatchSelection } from '../../../context/BatchSelectionContext'
import {
  BatchProcessingModal,
  type BatchProcessingFile,
  type BatchFileStatus,
} from '../modals/BatchProcessingModal'
import { CustomLlmPromptModal } from '../modals/CustomLlmPromptModal'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../../helpers'
import { useQueryClient } from '@tanstack/react-query'
import { FileManagerQueryKeys } from '../../../query/file-manager/file-manager.keys'
import { useModels } from '../../../query/ai-models'
import {
  getLitellmDefaultPrompt,
  isLitellmModel,
  settingsModelToEditorModel,
} from '../../../utils/llm-model'

type OpticalCharacterRecognitionProps = {
  models: AiModel[]
  selectedImagePath?: string | null
  selectedImageFileName?: string | null
  onOcrComplete?: (result: OcrProcessingResultDto) => void
  onUndo?: () => void
  isUndoing?: boolean
  fileStatus?: string | null
}

type PendingCustomLlmRun = {
  model: AiModel
  idx: number
  mode: 'single' | 'batch'
}

export const OpticalCharacterRecognition: React.FC<
  OpticalCharacterRecognitionProps
> = ({
  models,
  selectedImagePath,
  selectedImageFileName,
  onOcrComplete,
  onUndo,
  isUndoing,
  fileStatus,
}) => {
  const { data: listModels } = useModels('ocr')
  const displayModels = React.useMemo(() => {
    if (listModels?.length) {
      return listModels.map(settingsModelToEditorModel)
    }
    return models
  }, [listModels, models])

  const [selectedModel, setSelectedModel] = React.useState<number>(0)
  const [methodStatuses, setMethodStatuses] = React.useState<MethodStatus[]>(
    () => displayModels.map(() => 'idle')
  )

  React.useEffect(() => {
    setMethodStatuses(prev =>
      displayModels.map((_, i) => prev[i] ?? ('idle' as MethodStatus))
    )
  }, [displayModels])
  const [customLlmRun, setCustomLlmRun] =
    React.useState<PendingCustomLlmRun | null>(null)
  const [isCustomLlmBatchRunning, setIsCustomLlmBatchRunning] =
    React.useState(false)

  const { mutate: processOcr } = useOcrProcess()

  const { selectedFiles, removeFile } = useBatchSelection()
  const isBatchMode = selectedFiles.length > 0
  const { mutateAsync: validateBatch } = useBatchValidate()
  const { mutateAsync: startRun } = useStartModelRun()
  const { mutateAsync: completeRun } = useCompleteModelRun()
  const queryClient = useQueryClient()

  const [batchModalOpen, setBatchModalOpen] = React.useState(false)
  const [batchFiles, setBatchFiles] = React.useState<BatchProcessingFile[]>([])

  const handleBatchRun = React.useCallback(
    async (modelSlug: string, prompt?: string) => {
      const fileIds = selectedFiles.map(f => f.fileId)
      try {
        const result = await validateBatch({ fileIds })
        if (!result.valid) {
          toast.error('Batch processing failed: files have different statuses')
          return
        }
      } catch (err) {
        toast.error(getErrorMessage(err))
        return
      }

      let modelRunId: string | null = null
      try {
        const startResult = await startRun({
          modelType: AiActivityModelType.OCR,
          modelId: modelSlug,
          selectionCount: selectedFiles.length,
        })
        modelRunId = startResult.id
      } catch (err) {
        toast.error(getErrorMessage(err))
        return
      }

      const initialFiles: BatchProcessingFile[] = selectedFiles.map(f => ({
        ...f,
        processingStatus: 'running' as BatchFileStatus,
      }))
      setBatchFiles(initialFiles)
      setBatchModalOpen(true)

      const promises = selectedFiles.map(async file => {
        try {
          await ocrEndpoints.process(modelSlug, {
            inputDir: file.path,
            fileName: file.fileName,
            modelRunId: modelRunId ?? undefined,
            ...(prompt ? { prompt } : {}),
          })
          setBatchFiles(prev =>
            prev.map(f =>
              f.fileId === file.fileId
                ? { ...f, processingStatus: 'done' as BatchFileStatus }
                : f
            )
          )
        } catch (err) {
          setBatchFiles(prev =>
            prev.map(f =>
              f.fileId === file.fileId
                ? {
                    ...f,
                    processingStatus: 'failed' as BatchFileStatus,
                    error: getErrorMessage(err),
                  }
                : f
            )
          )
        }
      })

      await Promise.allSettled(promises)

      try {
        await completeRun(modelRunId)
      } catch (err) {
        toast.error(`Couldn't finalize run history: ${getErrorMessage(err)}`)
      }

      void queryClient.invalidateQueries({
        queryKey: FileManagerQueryKeys.all,
      })
    },
    [selectedFiles, validateBatch, queryClient, startRun, completeRun]
  )

  const runSingle = React.useCallback(
    (model: AiModel, idx: number, prompt?: string) => {
      if (!selectedImagePath || !selectedImageFileName) return

      const inputDir = selectedImagePath
      const fileName = selectedImageFileName

      setMethodStatuses(prev => prev.map((s, i) => (i === idx ? 'running' : s)))

      void (async () => {
        let modelRunId: string | null = null
        try {
          const startResult = await startRun({
            modelType: AiActivityModelType.OCR,
            modelId: model.id,
            selectionCount: 1,
          })
          modelRunId = startResult.id
        } catch (err) {
          toast.error(getErrorMessage(err))
          setMethodStatuses(prev =>
            prev.map((s, i) => (i === idx ? 'failed' : s))
          )
          return
        }

        const finalize = () => {
          if (!modelRunId) return
          completeRun(modelRunId).catch(err => {
            toast.error(
              `Couldn't finalize run history: ${getErrorMessage(err)}`
            )
          })
        }

        processOcr(
          {
            slug: model.id,
            inputDir,
            fileName,
            modelRunId: modelRunId ?? undefined,
            ...(prompt ? { prompt } : {}),
          },
          {
            onSuccess: result => {
              setMethodStatuses(prev =>
                prev.map((s, i) => (i === idx ? 'done' : s))
              )
              onOcrComplete?.(result)
              finalize()
            },
            onError: err => {
              toast.error(getErrorMessage(err))
              setMethodStatuses(prev =>
                prev.map((s, i) => (i === idx ? 'failed' : s))
              )
              finalize()
            },
          }
        )
      })()
    },
    [
      selectedImagePath,
      selectedImageFileName,
      startRun,
      completeRun,
      processOcr,
      onOcrComplete,
    ]
  )

  const handleRun = React.useCallback(
    (model: AiModel, idx: number) => {
      if (isLitellmModel(model.type)) {
        setCustomLlmRun({
          model,
          idx,
          mode: isBatchMode ? 'batch' : 'single',
        })
        return
      }

      if (isBatchMode) {
        void handleBatchRun(model.id)
        return
      }

      runSingle(model, idx)
    },
    [isBatchMode, handleBatchRun, runSingle]
  )

  const handleCustomLlmConfirm = React.useCallback(
    (prompt: string) => {
      if (!customLlmRun) return

      const { model, idx, mode } = customLlmRun

      if (mode === 'batch') {
        setIsCustomLlmBatchRunning(true)
        void handleBatchRun(model.id, prompt).finally(() => {
          setIsCustomLlmBatchRunning(false)
          setCustomLlmRun(null)
        })
        return
      }

      setCustomLlmRun(null)
      runSingle(model, idx, prompt)
    },
    [customLlmRun, handleBatchRun, runSingle]
  )

  return (
    <div className='flex flex-col gap-3 text-[12px] text-[#292929]'>
      <div>
        <div className='text-[12px] text-gray-500 mb-1 text-left pb-1'>
          Select OCR Model
        </div>
        <div className='flex flex-col gap-1'>
          {displayModels.map((model, idx) => (
            <MethodSelectItem
              key={model.id}
              label={model.name}
              selected={selectedModel === idx}
              status={methodStatuses[idx]}
              runDisabled={
                isBatchMode ? !model.path : !model.path || !selectedImagePath
              }
              onClick={() => setSelectedModel(idx)}
              onRun={() => handleRun(model, idx)}
            />
          ))}
        </div>
      </div>

      <div className='flex items-center justify-end mt-2'>
        <ApplyButton
          label={isUndoing ? 'Undoing\u2026' : 'Undo'}
          disabled={fileStatus !== 'OCR_COMPLETED' || isUndoing}
          onClick={() => {
            setMethodStatuses(prev => prev.map(() => 'idle'))
            onUndo?.()
          }}
          sx={{
            borderColor: '#F59E0B',
            color: '#92400E',
            backgroundColor: '#FEF3C7',
            '&:hover': { backgroundColor: '#FDE68A' },
          }}
        />
      </div>

      <CustomLlmPromptModal
        open={customLlmRun !== null}
        modelName={customLlmRun?.model.name ?? ''}
        initialPrompt={
          customLlmRun
            ? getLitellmDefaultPrompt(customLlmRun.model.llmConfig)
            : ''
        }
        isRunning={isCustomLlmBatchRunning}
        onCancel={() => {
          if (!isCustomLlmBatchRunning) {
            setCustomLlmRun(null)
          }
        }}
        onRun={handleCustomLlmConfirm}
      />

      <BatchProcessingModal
        open={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        files={batchFiles}
        onViewFile={() => {}}
        onRemoveFile={removeFile}
      />
    </div>
  )
}
