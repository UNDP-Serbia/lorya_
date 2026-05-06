import { CustomSwitcher, IconButton } from '@shared/ui'
import React, { useState } from 'react'
import type { SegmentResponse } from '../../api'
import undoIcon from '../../assets/undo.svg'
import clsx from 'clsx'
import HoverIcon from '../helpers/HoverIcon'

const baseUrl = String(import.meta.env.VITE_IMAGE_FETCH_URL || '')

type SegmentedViewProps = {
  segments?: SegmentResponse[]
  selectedSegmentId?: string | null
  onSelectSegment?: (segmentId: string | null) => void
  cacheBustKey?: number
  onRevertSegment?: (segmentId: string) => void
  revertingSegmentId?: string | null
}

const SegmentedView: React.FC<SegmentedViewProps> = ({
  segments = [],
  selectedSegmentId = null,
  onSelectSegment,
  cacheBustKey = 0,
  onRevertSegment,
  revertingSegmentId = null,
}) => {
  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({})
  const isShowingOriginal = (key: string) => !!showOriginal[key]
  const [zoomMap, setZoomMap] = useState<Record<string, number>>({})
  const getZoom = (id: string) => zoomMap[id] ?? 1

  const handleZoom = (id: string, delta: number) => {
    setZoomMap(prev => {
      const newZoom = Math.min(Math.max((prev[id] ?? 1) + delta, 0.5), 3) // min 0.5, max 3
      return { [id]: newZoom }
    })
  }

  const handleToggle = (key: string, value: boolean) => {
    setShowOriginal(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const getImageUrl = (segment: SegmentResponse) => {
    const segmentPath = isShowingOriginal(segment.id)
      ? segment.originalPath
      : segment.modifiedPath
    const url = `${baseUrl}/segments/${segmentPath}`
    return isShowingOriginal(segment.id) ? url : `${url}?t=${cacheBustKey}`
  }

  if (segments.length === 0) {
    return (
      <div className='flex items-center justify-center pt-20 text-sm text-gray-500'>
        No cropped segments available.
      </div>
    )
  }

  return (
    <div
      className='flex flex-wrap gap-14 flex-col w-full align-center justify-center pt-10 pb-20'
      onClick={() => onSelectSegment?.(null)}
    >
      {segments.map((segment, idx) => {
        const isSelected = selectedSegmentId === segment.id
        const borderColor =
          (segment.labelType as string) === 'non-text' ? '#FFA963' : '#98E3FF'

        return (
          <div
            className={clsx('grid grid-cols-3 gap-2 w-full items-start')}
            key={segment.id}
          >
            <div className='flex flex-row gap-2 items-center'>
              <div
                style={{
                  visibility: segment.changed ? 'visible' : 'hidden',
                }}
              >
                <CustomSwitcher
                  checked={isShowingOriginal(segment.id)}
                  onChange={(val: boolean) => handleToggle(segment.id, val)}
                  checkedLabel={'Show Enhanced'}
                  uncheckedLabel={'Show Original'}
                  width={130}
                />
              </div>
              <IconButton
                onClick={() => onRevertSegment?.(segment.id)}
                sx={{
                  width: 28,
                  height: 28,
                  visibility: segment.changed ? 'visible' : 'hidden',
                }}
              >
                <img
                  src={undoIcon}
                  alt='Undo'
                  style={{
                    opacity:
                      !segment.changed || revertingSegmentId === segment.id
                        ? 0.35
                        : 1,
                  }}
                />
              </IconButton>
            </div>
            <div
              className='relative cursor-pointer'
              onClick={e => {
                e.stopPropagation()
                onSelectSegment?.(segment.id)
              }}
            >
              <div
                className='absolute top-[-18px] left-0 text-[11px] px-1 py-[1px]'
                style={{ backgroundColor: borderColor }}
              >
                {segment.label} - {idx + 1}
              </div>
              <img
                src={getImageUrl(segment)}
                alt={segment.label ?? 'segmented-image'}
                className='max-w-[200px] object-contain border-[2.6px]'
                style={{
                  borderColor,
                  outline: isSelected ? '3px solid #3B82F6' : 'none',
                  outlineOffset: '2px',
                  transform: `scale(${getZoom(segment.id)})`,
                  zIndex: getZoom(segment.id) > 1.2 ? 2 : 0,
                  position: getZoom(segment.id) > 1.2 ? 'sticky' : 'relative',
                }}
              />
            </div>
            {/* Zoom controls */}
            <div className='flex gap-1 w-full justify-end align-start'>
              <div className='bg-white rounded-md align-center justify-center shadow'>
                <IconButton
                  className='w-8 h-8'
                  onClick={e => {
                    e.stopPropagation()
                    handleZoom(segment.id, -0.2)
                  }}
                >
                  <HoverIcon name='zoom-out-icon' />
                </IconButton>
              </div>
              <div className='bg-white rounded-md align-center justify-center shadow'>
                <IconButton
                  className='w-8 h-8'
                  onClick={e => {
                    e.stopPropagation()
                    handleZoom(segment.id, 0.2)
                  }}
                >
                  <HoverIcon name='zoom-in-icon' />
                </IconButton>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default SegmentedView
