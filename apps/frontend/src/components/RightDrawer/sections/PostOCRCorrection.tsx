import React from 'react'
import { MethodSelectItem, ApplyButton, type MethodStatus } from '@shared/ui'
import type {
  AiModel,
  PostOcrCorrectionProcessingResultDto,
} from '../../../api'
import { postOcrCorrectionEndpoints, AiActivityModelType } from '../../../api'
import { usePostOcrCorrectionProcess, useBatchValidate } from '../../../query'
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
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../../helpers'
import { useQueryClient } from '@tanstack/react-query'
import { FileManagerQueryKeys } from '../../../query/file-manager/file-manager.keys'

type PostOCRCorrectionProps = {
  models: AiModel[]
  selectedImagePath?: string | null
  selectedImageFileName?: string | null
  onPostOcrComplete?: (result: PostOcrCorrectionProcessingResultDto) => void
  onUndo?: () => void
  isUndoing?: boolean
  fileStatus?: string | null
}

export const PostOCRCorrection: React.FC<PostOCRCorrectionProps> = ({
  models,
  selectedImagePath,
  selectedImageFileName,
  onPostOcrComplete,
  onUndo,
  isUndoing,
}) => {
  const [selectedModel, setSelectedModel] = React.useState<number>(0)
  const [methodStatuses, setMethodStatuses] = React.useState<MethodStatus[]>(
    () => models.map(() => 'idle')
  )

  const { mutate: processPostOcr } = usePostOcrCorrectionProcess()

  const { selectedFiles, removeFile } = useBatchSelection()
  const isBatchMode = selectedFiles.length > 0
  const { mutateAsync: validateBatch } = useBatchValidate()
  const { mutateAsync: startRun } = useStartModelRun()
  const { mutateAsync: completeRun } = useCompleteModelRun()
  const queryClient = useQueryClient()

  const [batchModalOpen, setBatchModalOpen] = React.useState(false)
  const [batchFiles, setBatchFiles] = React.useState<BatchProcessingFile[]>([])

  const handleBatchRun = React.useCallback(
    async (modelSlug: string) => {
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
          modelType: AiActivityModelType.POST_OCR_CORRECTION,
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
          await postOcrCorrectionEndpoints.process(modelSlug, {
            inputDir: file.path,
            fileName: file.fileName,
            modelRunId: modelRunId ?? undefined,
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

  return (
    <div className='flex flex-col gap-3 text-[12px] text-[#292929]'>
      <div>
        <div className='text-[12px] text-gray-500 mb-1 text-left pb-1'>
          Select Post-OCR Correction Model
        </div>
        <div className='flex flex-col gap-1'>
          {models.map((model, idx) => (
            <MethodSelectItem
              key={model.id}
              label={model.name}
              selected={selectedModel === idx}
              status={methodStatuses[idx]}
              runDisabled={
                isBatchMode ? !model.path : !model.path || !selectedImagePath
              }
              onClick={() => setSelectedModel(idx)}
              onRun={() => {
                if (isBatchMode) {
                  void handleBatchRun(model.id)
                  return
                }

                if (!selectedImagePath || !selectedImageFileName) return

                const inputDir = selectedImagePath
                const fileName = selectedImageFileName

                setMethodStatuses(prev =>
                  prev.map((s, i) => (i === idx ? 'running' : s))
                )

                void (async () => {
                  let modelRunId: string | null = null
                  try {
                    const startResult = await startRun({
                      modelType: AiActivityModelType.POST_OCR_CORRECTION,
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

                  processPostOcr(
                    {
                      slug: model.id,
                      inputDir,
                      fileName,
                      modelRunId: modelRunId ?? undefined,
                    },
                    {
                      onSuccess: result => {
                        setMethodStatuses(prev =>
                          prev.map((s, i) => (i === idx ? 'done' : s))
                        )
                        onPostOcrComplete?.(result)
                        finalize()
                      },
                      onError: () => {
                        setMethodStatuses(prev =>
                          prev.map((s, i) => (i === idx ? 'failed' : s))
                        )
                        finalize()
                      },
                    }
                  )
                })()
              }}
            />
          ))}
        </div>
      </div>

      <div className='flex items-center justify-end mt-2'>
        <ApplyButton
          label={isUndoing ? 'Undoing\u2026' : 'Undo'}
          disabled={isUndoing}
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
