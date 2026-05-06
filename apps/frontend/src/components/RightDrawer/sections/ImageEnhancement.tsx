import React from 'react'
import {
  LabeledSlider,
  SimpleInput,
  MethodSelectItem,
  ApplyButton,
  type MethodStatus,
} from '@shared/ui'
import cropIcon from '../../../assets/crop-icon.svg'
import rotateIcon from '../../../assets/rotate-icon.svg'
import angleIcon from '../../../assets/angle-icon.svg'
import brightnessIcon from '../../../assets/brightness-icon.svg'
import sharpnessIcon from '../../../assets/sharpness-icon.svg'
import contrastIcon from '../../../assets/contrast-icon.svg'
import type { AiModel } from '../../../api'
import { imageEnhancementEndpoints, AiActivityModelType } from '../../../api'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  useCropImage,
  useRotateImage,
  useAdjustImage,
} from '../../../query/ai/ai.mutation'
import { useImageEnhancementProcess } from '../../../query/image-enhancement'
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
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../../helpers'
import { useQueryClient } from '@tanstack/react-query'
import { FileManagerQueryKeys } from '../../../query/file-manager/file-manager.keys'

const adjustFormToFactor = (value: number) =>
  Math.max(0.01, Math.min(2, 1 + value / 100))

type ImageEnhancementProps = {
  models: AiModel[]
  imageWidth?: number
  imageHeight?: number
  selectedImagePath?: string | null
  selectedImageFileName?: string | null
  onImageEnhancementSuccess?: () => void
  onUndo?: () => void
  isUndoing?: boolean
  imageModified?: boolean
}

export const ImageEnhancement: React.FC<ImageEnhancementProps> = ({
  models,
  imageWidth = 0,
  imageHeight = 0,
  selectedImagePath = null,
  selectedImageFileName = null,
  onImageEnhancementSuccess,
  onUndo,
  isUndoing,
  imageModified,
}) => {
  const [selectedMethod, setSelectedMethod] = React.useState<number>(0)

  const { selectedFiles, removeFile } = useBatchSelection()
  const isBatchMode = selectedFiles.length > 0
  const { mutateAsync: validateBatch } = useBatchValidate()
  const { mutateAsync: startRun } = useStartModelRun()
  const { mutateAsync: completeRun } = useCompleteModelRun()
  const queryClient = useQueryClient()

  const [batchModalOpen, setBatchModalOpen] = React.useState(false)
  const [batchFiles, setBatchFiles] = React.useState<BatchProcessingFile[]>([])

  const { mutate: cropImage, isPending: isCropping } = useCropImage()
  const { mutate: rotateImage, isPending: isRotating } = useRotateImage()
  const { mutate: adjustImage, isPending: isAdjusting } = useAdjustImage()
  const { mutate: processImage, isPending: isProcessing } =
    useImageEnhancementProcess()

  const cropForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      x: 0,
      y: 0,
      w: imageWidth,
      h: imageHeight,
    },
    validationSchema: Yup.object({
      x: Yup.number().min(0).required('X is required'),
      y: Yup.number().min(0).required('Y is required'),
      w: Yup.number()
        .moreThan(0, 'W must be greater than 0')
        .required('W is required')
        .test('max-w', 'W cannot exceed image width minus X', function (value) {
          if (value == null) return true
          const parent = this.parent as { x?: number } | undefined
          const x = parent?.x ?? 0
          const maxW = imageWidth - x
          return maxW <= 0 || value <= maxW
        }),
      h: Yup.number()
        .moreThan(0, 'H must be greater than 0')
        .required('H is required')
        .test(
          'max-h',
          'H cannot exceed image height minus Y',
          function (value) {
            if (value == null) return true
            const parent = this.parent as { y?: number } | undefined
            const y = parent?.y ?? 0
            const maxH = imageHeight - y
            return maxH <= 0 || value <= maxH
          }
        ),
    }),
    onSubmit: values => {
      if (!selectedImagePath || !selectedImageFileName) return
      const inputDir = selectedImagePath
      const fileName = selectedImageFileName
      const outputDir = inputDir || '/'

      const needsCrop =
        values.x !== 0 ||
        values.y !== 0 ||
        values.w !== imageWidth ||
        values.h !== imageHeight
      if (!needsCrop) {
        return
      }
      cropImage(
        {
          inputDir,
          fileName,
          topLeft: { x: values.x, y: values.y },
          bottomRight: { x: values.x + values.w, y: values.y + values.h },
          outputDir,
        },
        {
          onSuccess: () => {
            onImageEnhancementSuccess?.()
            cropForm.resetForm()
          },
        }
      )
    },
  })

  const rotateForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      angle: 0,
    },
    validationSchema: Yup.object({
      angle: Yup.number().min(-360).max(360).required('Angle is required'),
    }),
    onSubmit: values => {
      if (!selectedImagePath || !selectedImageFileName) return
      const inputDir = selectedImagePath
      const fileName = selectedImageFileName
      const outputDir = inputDir || '/'

      const needsRotate = values.angle !== 0
      if (!needsRotate) {
        return
      }
      rotateImage(
        {
          inputDir,
          fileName,
          angle: values.angle,
          outputDir,
        },
        {
          onSuccess: () => {
            onImageEnhancementSuccess?.()
            rotateForm.resetForm()
          },
        }
      )
    },
  })

  const adjustForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      brightness: 0,
      sharpness: 0,
      contrast: 0,
    },
    validationSchema: Yup.object({
      brightness: Yup.number()
        .min(-100)
        .max(100)
        .required('Brightness is required'),
      sharpness: Yup.number()
        .min(-100)
        .max(100)
        .required('Sharpness is required'),
      contrast: Yup.number()
        .min(-100)
        .max(100)
        .required('Contrast is required'),
    }),
    onSubmit: values => {
      if (!selectedImagePath || !selectedImageFileName) return
      const inputDir = selectedImagePath
      const fileName = selectedImageFileName
      const outputDir = inputDir || '/'

      const needsAdjust =
        values.brightness !== 0 ||
        values.sharpness !== 0 ||
        values.contrast !== 0
      if (!needsAdjust) {
        return
      }
      adjustImage(
        {
          inputDir,
          fileName,
          outputDir,
          brightness: adjustFormToFactor(values.brightness),
          contrast: adjustFormToFactor(values.contrast),
          sharpness: adjustFormToFactor(values.sharpness),
        },
        {
          onSuccess: () => {
            onImageEnhancementSuccess?.()
            adjustForm.resetForm()
          },
        }
      )
    },
  })

  const [methodStatuses, setMethodStatuses] = React.useState<MethodStatus[]>(
    () => models.map(() => 'idle')
  )

  //TODO hide for now and remove if unnecessary

  // const handleDelete = () => {
  //   // Placeholder behavior: reset to defaults
  //   formik.setFieldValue('adjust', {
  //     brightness: 0,
  //     sharpness: 0,
  //     contrast: 0,
  //   })
  // }

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
          modelType: AiActivityModelType.IMAGE_ENHANCEMENT,
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
          await imageEnhancementEndpoints.process(modelSlug, {
            inputDir: file.path,
            fileName: file.fileName,
            outputDir: file.path,
            modelRunId: modelRunId ?? undefined,
          })
          setBatchFiles(prev =>
            prev.map(f =>
              f.fileId === file.fileId
                ? {
                    ...f,
                    processingStatus: 'done' as BatchFileStatus,
                  }
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
          Select Image method
        </div>
        <div className='flex flex-col gap-1'>
          {models.map((model, idx) => (
            <MethodSelectItem
              key={model.id}
              label={model.name}
              selected={selectedMethod === idx}
              status={methodStatuses[idx]}
              onClick={() => setSelectedMethod(idx)}
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
                const outputDir = selectedImagePath || '/'
                setMethodStatuses(prev =>
                  prev.map((s, i) => (i === idx ? 'running' : s))
                )

                void (async () => {
                  let modelRunId: string | null = null
                  try {
                    const startResult = await startRun({
                      modelType: AiActivityModelType.IMAGE_ENHANCEMENT,
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

                  processImage(
                    {
                      slug: model.id,
                      inputDir,
                      fileName,
                      outputDir,
                      modelRunId: modelRunId ?? undefined,
                    },
                    {
                      onSuccess: () => {
                        setMethodStatuses(prev =>
                          prev.map((s, i) => (i === idx ? 'done' : s))
                        )
                        onImageEnhancementSuccess?.()
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
          <div>
            <div className='flex items-center justify-between mb-2'>
              <div className='text-[#292929]'>Crop image</div>
              <img src={cropIcon} alt='Crop' />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <SimpleInput
                value={cropForm.values.x ?? ''}
                onChange={value => {
                  cropForm.setFieldValue(
                    'x',
                    value !== null ? Number(value) : null
                  )
                }}
                startAdornment='X'
                error={!!cropForm.errors.x}
              />
              <SimpleInput
                value={cropForm.values.y ?? ''}
                onChange={value => {
                  cropForm.setFieldValue(
                    'y',
                    value !== null ? Number(value) : null
                  )
                }}
                startAdornment='Y'
                error={!!cropForm.errors.y}
              />
              <SimpleInput
                value={cropForm.values.w ?? ''}
                onChange={value => {
                  cropForm.setFieldValue(
                    'w',
                    value !== null ? Number(value) : null
                  )
                }}
                startAdornment='W'
                error={!!cropForm.errors.w}
              />
              <SimpleInput
                value={cropForm.values.h ?? ''}
                onChange={value => {
                  cropForm.setFieldValue(
                    'h',
                    value !== null ? Number(value) : null
                  )
                }}
                startAdornment='H'
                error={!!cropForm.errors.h}
              />
            </div>
            <div className='flex items-center justify-end mt-1'>
              <ApplyButton
                label={isCropping ? 'Applying…' : 'Apply'}
                disabled={
                  !selectedImagePath || !selectedImageFileName || isCropping
                }
                onClick={cropForm.handleSubmit}
              />
            </div>
          </div>

          <div>
            <div className='flex items-center justify-between mb-2'>
              <div className='text-[#292929]'>Rotate image</div>
              <img src={rotateIcon} alt='Rotate' />
            </div>
            <div className='grid grid-cols-1 gap-2 pb-1'>
              <SimpleInput
                value={rotateForm.values.angle ?? ''}
                onChange={value => {
                  rotateForm.setFieldValue(
                    'angle',
                    value !== null ? Number(value) : null
                  )
                }}
                startAdornment={
                  <img
                    src={angleIcon}
                    alt='Angle'
                    width={13}
                    style={{ marginTop: -2, marginLeft: 2 }}
                  />
                }
                error={!!rotateForm.errors.angle}
              />
            </div>
            <div className='flex items-center justify-end'>
              <ApplyButton
                label={isRotating ? 'Applying…' : 'Apply'}
                disabled={
                  !selectedImagePath || !selectedImageFileName || isRotating
                }
                onClick={rotateForm.handleSubmit}
              />
            </div>
          </div>

          <LabeledSlider
            icon={<img src={brightnessIcon} alt='Brightness icon' />}
            label='Brightness'
            value={adjustForm.values.brightness}
            onChange={(v: number) => {
              adjustForm.setFieldValue('brightness', v)
            }}
            min={-100}
            max={100}
            step={1}
          />
          <LabeledSlider
            icon={<img src={sharpnessIcon} alt='Sharpness icon' />}
            label='Sharpness'
            value={adjustForm.values.sharpness}
            onChange={(v: number) => {
              adjustForm.setFieldValue('sharpness', v)
            }}
            min={-100}
            max={100}
            step={1}
          />
          <LabeledSlider
            icon={<img src={contrastIcon} alt='Contrast icon' />}
            label='Contrast'
            value={adjustForm.values.contrast}
            onChange={(v: number) => {
              adjustForm.setFieldValue('contrast', v)
            }}
            min={-100}
            max={100}
            step={1}
          />
          <div className='flex items-center justify-end mt-1'>
            {/*TODO hide for now and remove if unnecessary*/}
            {/*<button*/}
            {/*  type='button'*/}
            {/*  className='inline-flex items-center gap-2 text-gray-800 hover:text-gray-900 !pl-0'*/}
            {/*  onClick={handleDelete}*/}
            {/*>*/}
            {/*  <img src={trashIcon} alt='Delete' />*/}
            {/*  <span>Delete</span>*/}
            {/*</button>*/}

            <ApplyButton
              label={isAdjusting ? 'Applying…' : 'Apply'}
              disabled={
                !selectedImagePath || !selectedImageFileName || isAdjusting
              }
              onClick={adjustForm.handleSubmit}
            />
          </div>
        </>
      )}

      <div className='flex items-center justify-end mt-2'>
        <ApplyButton
          label={isUndoing ? 'Undoing\u2026' : 'Undo'}
          disabled={!imageModified || isUndoing}
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
