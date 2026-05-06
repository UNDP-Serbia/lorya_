import React from 'react'
import { useNavigate, useParams } from 'react-router'
import imageEnhancementIcon from '../../../assets/image-enhancement.svg'
import imageEnhancementIconHover from '../../../assets/image-enhancement-hover.svg'
import layoutIdentificationIcon from '../../../assets/layout-indetification.svg'
import layoutIdentificationIconHover from '../../../assets/layout-indetification-hover.svg'
import ocrIcon from '../../../assets/ocr-icon.svg'
import ocrIconHover from '../../../assets/ocr-icon-hover.svg'
import postOcrIcon from '../../../assets/post-ocr-icon.svg'
import postOcrIconHover from '../../../assets/post-ocr-icon-hover.svg'
import runHistory from '../../../assets/run-history-icon.svg'
import runHistoryHover from '../../../assets/run-history-icon-hover.svg'
import clsx from 'clsx'

export type ModelSettingsLabel =
  | 'Image Enhancement'
  | 'Layout Identification'
  | 'Optical Character Recognition'
  | 'Post-OCR Correction'
  | 'Run History'

const RunHistoryString = 'Run History' as ModelSettingsLabel

type Item = {
  label: ModelSettingsLabel
  model: string
  icon: string
  iconHover: string
}

const ITEMS: Item[] = [
  {
    label: 'Image Enhancement',
    model: 'Image Enhancement',
    icon: imageEnhancementIcon,
    iconHover: imageEnhancementIconHover,
  },
  {
    label: 'Layout Identification',
    model: 'Layout Identification',
    icon: layoutIdentificationIcon,
    iconHover: layoutIdentificationIconHover,
  },
  {
    label: 'Optical Character Recognition',
    model: 'Optical Character Recognition',
    icon: ocrIcon,
    iconHover: ocrIconHover,
  },
  {
    label: 'Post-OCR Correction',
    model: 'Post-OCR Correction',
    icon: postOcrIcon,
    iconHover: postOcrIconHover,
  },
  {
    label: RunHistoryString,
    model: RunHistoryString,
    icon: runHistory,
    iconHover: runHistoryHover,
  },
]

export const Models: React.FC = () => {
  const navigate = useNavigate()
  const { model } = useParams()

  const decodedModel = model ? decodeURIComponent(model) : null

  return (
    <div className='flex flex-col pl-0'>
      {ITEMS.map(item => {
        const isSelected = decodedModel === item.model

        return (
          <div
            key={item.model}
            onClick={() =>
              void navigate(`/settings/${encodeURIComponent(item.model)}`)
            }
            className={clsx(
              'cursor-pointer group flex items-center gap-2 h-7 p-1 w-full text-[11px] font-normal text-[#292929] text-left',
              'border-l-[3px] border-solid border-l-transparent rounded-l-none transition-colors',
              isSelected
                ? 'bg-[linear-gradient(90deg,_#E7F3FF_0%,_#FFFFFF_74.52%)] !border-l-[#BCDDFF] !border-l-[3px]'
                : 'hover:bg-[linear-gradient(90deg,_#E7F3FF_0%,_#FFFFFF_74.52%)] hover:border-l-[#BCDDFF]'
            )}
          >
            <div className='relative w-3.5 h-3.5 ml-1'>
              {/* default */}
              <img
                src={item.icon}
                alt={item.label}
                className={clsx(
                  'absolute inset-0 w-full h-full',
                  isSelected ? 'hidden' : 'block group-hover:hidden'
                )}
              />
              {/* hover */}
              <img
                src={item.iconHover}
                alt={item.label}
                className={clsx(
                  'absolute inset-0 w-full h-full',
                  isSelected ? 'block' : 'hidden group-hover:block'
                )}
              />
            </div>
            <span className='truncate'>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}
