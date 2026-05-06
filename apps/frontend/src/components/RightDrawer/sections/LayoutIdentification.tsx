import React from 'react'
import {
  SimpleInput,
  MethodSelectItem,
  type MethodStatus,
  ApplyButton,
} from '@shared/ui'
import addSegmentIcon from '../../../assets/add-segment-icon.svg'
import AddIcon from '../../../assets/add-icon.svg'
import type { AiModel } from '../../../api'
import type { SimpleAnnotation, AnnotationBounds } from '@shared/ui'
import { SvgIconTransformer } from '../../helpers'
import { useLayoutIdentificationProcess } from '../../../query/layout-identification'
import { useBatchSelection } from '../../../context/BatchSelectionContext'
import { useBatchValidate } from '../../../query'
import {
  useStartModelRun,
  useCompleteModelRun,
} from '../../../query/run-history'
import {
  BatchProcessingModal,
  type BatchProcessingFile,
  type BatchFileStatus,
} from '../modals/BatchProcessingModal'
import {
  layoutIdentificationEndpoints,
  segmentManagementEndpoints,
  LabelType,
  AiActivityModelType,
} from '../../../api'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../../helpers'
import { useQueryClient } from '@tanstack/react-query'
import { FileManagerQueryKeys } from '../../../query/file-manager/file-manager.keys'

type LayoutIdentificationProps = {
  models: AiModel[]
  selectedImagePath?: string | null
  selectedImageFileName?: string | null
  onComplete?: (annotations: SimpleAnnotation[]) => void
  onAddSegment?: () => void
  selectedAnnotation?: SimpleAnnotation | null
  onEditAnnotation?: (id: string, bounds: AnnotationBounds) => void
  onFinalizeSegmentation?: () => void
  onUndo?: () => void
  layoutAnnotationsCount?: number
}

export const LayoutIdentification: React.FC<LayoutIdentificationProps> = ({
  models,
  selectedImagePath = null,
  selectedImageFileName = null,
  onComplete,
  onAddSegment,
  selectedAnnotation = null,
  onEditAnnotation,
  onFinalizeSegmentation,
  onUndo,
  layoutAnnotationsCount,
}) => {
  const [selectedModel, setSelectedModel] = React.useState<number>(0)
  const [methodStatuses, setMethodStatuses] = React.useState<MethodStatus[]>(
    () => models.map(() => 'idle')
  )

  const { mutate: processModel, isPending: isProcessing } =
    useLayoutIdentificationProcess()

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
          modelType: AiActivityModelType.LAYOUT_IDENTIFICATION,
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
          // Step 1: Run layout identification model
          const result = await layoutIdentificationEndpoints.process(
            modelSlug,
            {
              inputDir: file.path,
              fileName: file.fileName,
              modelRunId: modelRunId ?? undefined,
            }
          )

          // Step 2: Auto-finalize - crop segments using model predictions
          const segments = result.segments.map(seg => ({
            label:
              seg.label ||
              (seg.labelType === LabelType.NON_TEXT ? 'Picture' : 'Text'),
            labelType: seg.labelType ?? LabelType.TEXT,
            confidence: seg.confidence,
            type: 'GENERATED' as const,
            boundingBox: seg.boundingBox,
            modelRunId: modelRunId ?? null,
          }))

          await segmentManagementEndpoints.cropSegments({
            inputDir: file.path,
            fileName: file.fileName,
            segments,
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
        // Soft-fail: aggregates not computed but pipeline ran. Surface in toast.
        toast.error(`Couldn't finalize run history: ${getErrorMessage(err)}`)
      }

      void queryClient.invalidateQueries({
        queryKey: FileManagerQueryKeys.all,
      })
    },
    [selectedFiles, validateBatch, queryClient, startRun, completeRun]
  )

  const onCompleteRef = React.useRef(onComplete)
  onCompleteRef.current = onComplete

  // Local reshape bounds, synced from selectedAnnotation
  const [reshapeBounds, setReshapeBounds] = React.useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  })

  // Sync reshape inputs when selected annotation changes
  React.useEffect(() => {
    if (selectedAnnotation) {
      setReshapeBounds({
        x: Math.round(selectedAnnotation.bounds.x),
        y: Math.round(selectedAnnotation.bounds.y),
        w: Math.round(selectedAnnotation.bounds.width),
        h: Math.round(selectedAnnotation.bounds.height),
      })
    } else {
      setReshapeBounds({ x: 0, y: 0, w: 0, h: 0 })
    }
  }, [selectedAnnotation])

  const handleApplyReshape = () => {
    if (!selectedAnnotation?.id || !onEditAnnotation) return
    onEditAnnotation(selectedAnnotation.id, {
      x: reshapeBounds.x,
      y: reshapeBounds.y,
      width: reshapeBounds.w,
      height: reshapeBounds.h,
    })
  }

  return (
    <>
      <div className='flex flex-col gap-3 text-[12px] text-[#292929]'>
        <div>
          <div className='text-[12px] text-gray-500 mb-1 text-left'>
            Select layout model
          </div>
          <div className='flex flex-col gap-1'>
            {models.map((model, idx) => (
              <MethodSelectItem
                key={model.id}
                label={model.name}
                selected={selectedModel === idx}
                status={methodStatuses[idx]}
                onClick={() => setSelectedModel(idx)}
                runDisabled={
                  isBatchMode
                    ? !model.path || isProcessing
                    : !model.path ||
                      !selectedImagePath ||
                      !selectedImageFileName ||
                      isProcessing
                }
                onRun={() => {
                  if (isBatchMode) {
                    void handleBatchRun(model.id)
                    return
                  }
                  if (
                    !model.path ||
                    !selectedImagePath ||
                    !selectedImageFileName
                  ) {
                    return
                  }
                  const inputDir = selectedImagePath
                  const fileName = selectedImageFileName
                  setMethodStatuses(prev =>
                    prev.map((s, i) => (i === idx ? 'running' : s))
                  )
                  void (async () => {
                    let modelRunId: string | null = null
                    try {
                      const startResult = await startRun({
                        modelType: AiActivityModelType.LAYOUT_IDENTIFICATION,
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

                    processModel(
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
                          const annotations: SimpleAnnotation[] =
                            result.segments.map(seg => ({
                              id: seg.id,
                              label: seg.label,
                              labelType: seg.labelType,
                              confidence: seg.confidence,
                              bounds: {
                                x: seg.boundingBox.x1,
                                y: seg.boundingBox.y1,
                                width: seg.boundingBox.x2 - seg.boundingBox.x1,
                                height: seg.boundingBox.y2 - seg.boundingBox.y1,
                              },
                              type: 'GENERATED' as const,
                              modelRunId: modelRunId ?? null,
                            }))
                          onCompleteRef.current?.(annotations)
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

        {/*if browser view hide everything except models*/}
        {selectedImageFileName && (
          <>
            <div className='h-px bg-[#E9E9E9]' />

            <ApplyButton
              label={'Add new segment'}
              onClick={() => onAddSegment?.()}
              iconStart={
                <SvgIconTransformer
                  src={AddIcon}
                  size={12}
                  color='rgba(25, 118, 210, 1)'
                  className='mr-1'
                />
              }
            />

            <div className='flex items-center justify-between'>
              <div className='text-[#292929]'>Reshape segment</div>
              <img
                src={addSegmentIcon}
                alt='Add segment'
                height={14}
                width={14}
              />
            </div>
            {selectedAnnotation && (
              <div className='text-[11px] text-gray-500 mb-[-4px]'>
                {selectedAnnotation.label || 'Selected segment'}
              </div>
            )}
            <div className='grid grid-cols-2 gap-2'>
              <SimpleInput
                value={reshapeBounds.x}
                onChange={value =>
                  setReshapeBounds(prev => ({
                    ...prev,
                    x: Number(value) || 0,
                  }))
                }
                startAdornment='X'
                disabled={!selectedAnnotation}
              />
              <SimpleInput
                value={reshapeBounds.y}
                onChange={value =>
                  setReshapeBounds(prev => ({
                    ...prev,
                    y: Number(value) || 0,
                  }))
                }
                startAdornment='Y'
                disabled={!selectedAnnotation}
              />
              <SimpleInput
                value={reshapeBounds.w}
                onChange={value =>
                  setReshapeBounds(prev => ({
                    ...prev,
                    w: Number(value) || 0,
                  }))
                }
                startAdornment='W'
                disabled={!selectedAnnotation}
              />
              <SimpleInput
                value={reshapeBounds.h}
                onChange={value =>
                  setReshapeBounds(prev => ({
                    ...prev,
                    h: Number(value) || 0,
                  }))
                }
                startAdornment='H'
                disabled={!selectedAnnotation}
              />
            </div>
            <div className='flex items-center justify-end -mt-2'>
              <ApplyButton
                label={'Apply'}
                onClick={handleApplyReshape}
                disabled={!selectedAnnotation}
              />
            </div>
            <ApplyButton
              label={'Finalize segmentation'}
              onClick={() => onFinalizeSegmentation?.()}
            />
          </>
        )}

        <div className='flex items-center justify-end mt-2'>
          <ApplyButton
            label='Undo'
            disabled={!layoutAnnotationsCount}
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
      </div>
      <BatchProcessingModal
        open={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        files={batchFiles}
        onViewFile={() => {}}
        onRemoveFile={removeFile}
      />
    </>
  )
}
