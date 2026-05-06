import React from 'react'
import {
  LabeledSlider,
  ApplyButton,
  MethodSelectItem,
  type MethodStatus,
} from '@shared/ui'
import brightnessIcon from '../../../assets/brightness-icon.svg'
import sharpnessIcon from '../../../assets/sharpness-icon.svg'
import contrastIcon from '../../../assets/contrast-icon.svg'
import type { AiModel } from '../../../api'
import {
  useAdjustSegment,
  useSegmentModelProcess,
} from '../../../query/segment-management'

const adjustFormToFactor = (value: number) =>
  Math.max(0.01, Math.min(2, 1 + value / 100))

type SegmentManagementProps = {
  models: AiModel[]
  selectedSegmentId?: string | null
  onAdjustSuccess?: () => void
  onProcessSuccess?: () => void
  onUndoSegmentation?: () => void
  isUndoingSegmentation?: boolean
  fileStatus?: string | null
}

export const SegmentManagement: React.FC<SegmentManagementProps> = ({
  models,
  selectedSegmentId = null,
  onAdjustSuccess,
  onProcessSuccess,
  onUndoSegmentation,
  isUndoingSegmentation,
  fileStatus,
}) => {
  const [contrast, setContrast] = React.useState<number>(0)
  const [sharpness, setSharpness] = React.useState<number>(0)
  const [brightness, setBrightness] = React.useState<number>(0)
  const [selectedMethod, setSelectedMethod] = React.useState<number>(0)
  const [methodStatuses, setMethodStatuses] = React.useState<MethodStatus[]>(
    () => models.map(() => 'idle')
  )

  const { mutate: adjustSegment, isPending: isAdjusting } = useAdjustSegment()
  const { mutate: processModel, isPending: isProcessing } =
    useSegmentModelProcess()

  const handleApplyAdjust = () => {
    if (!selectedSegmentId) return

    const needsAdjust = brightness !== 0 || sharpness !== 0 || contrast !== 0
    if (!needsAdjust) return

    adjustSegment(
      {
        segmentId: selectedSegmentId,
        brightness: adjustFormToFactor(brightness),
        contrast: adjustFormToFactor(contrast),
        sharpness: adjustFormToFactor(sharpness),
      },
      {
        onSuccess: () => {
          setBrightness(0)
          setSharpness(0)
          setContrast(0)
          onAdjustSuccess?.()
        },
      }
    )
  }

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
              runDisabled={!model.path || !selectedSegmentId || isProcessing}
              onRun={() => {
                if (!model.path || !selectedSegmentId) return
                setMethodStatuses(prev =>
                  prev.map((s, i) => (i === idx ? 'running' : s))
                )
                processModel(
                  {
                    slug: model.id,
                    segmentId: selectedSegmentId,
                  },
                  {
                    onSuccess: () => {
                      setMethodStatuses(prev =>
                        prev.map((s, i) => (i === idx ? 'done' : s))
                      )
                      onProcessSuccess?.()
                    },
                    onError: () => {
                      setMethodStatuses(prev =>
                        prev.map((s, i) => (i === idx ? 'failed' : s))
                      )
                    },
                  }
                )
              }}
            />
          ))}
        </div>
      </div>
      <div className='h-px bg-[#E9E9E9]' />

      <LabeledSlider
        icon={<img src={brightnessIcon} alt='Brightness icon' />}
        label='Brightness'
        value={brightness}
        onChange={(v: number) => setBrightness(v)}
        min={-100}
        max={100}
        step={1}
      />

      <LabeledSlider
        icon={<img src={sharpnessIcon} alt='Sharpness icon' />}
        label='Sharpness'
        value={sharpness}
        onChange={(v: number) => setSharpness(v)}
        min={-100}
        max={100}
        step={1}
      />

      <LabeledSlider
        icon={<img src={contrastIcon} alt='Contrast icon' />}
        label='Contrast'
        value={contrast}
        onChange={(v: number) => setContrast(v)}
        min={-100}
        max={100}
        step={1}
      />

      <div className='flex items-center justify-end mt-1'>
        <ApplyButton
          label={isAdjusting ? 'Applying…' : 'Apply'}
          disabled={!selectedSegmentId || isAdjusting}
          onClick={handleApplyAdjust}
        />
      </div>

      {!selectedSegmentId && (
        <div className='text-[11px] text-gray-400 text-center'>
          Select a segment to apply adjustments
        </div>
      )}

      <div className='flex items-center justify-end mt-2'>
        <ApplyButton
          label={isUndoingSegmentation ? 'Undoing\u2026' : 'Undo'}
          disabled={fileStatus !== 'SEGMENTED' || isUndoingSegmentation}
          onClick={() => {
            setMethodStatuses(prev => prev.map(() => 'idle'))
            onUndoSegmentation?.()
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
  )
}
