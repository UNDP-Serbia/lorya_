import React from 'react'
import { type FileManagerEntry } from '../../api'
import { buildStaticUrl } from './FileManager'
import imageEnhancementIcon from '../../assets/image-enhancement.svg'
import layoutIdentificationIcon from '../../assets/layout-indetification.svg'
import ocrIcon from '../../assets/post-ocr-icon.svg'
import postOcrIcon from '../../assets/ocr-icon.svg'
import { Marker } from '../shared'
import clsx from 'clsx'

interface ImageCardProps {
  item: FileManagerEntry
  idx: number
  isSelected: (path: string) => boolean
  handleClick: (path: string) => void
  handleDoubleClick: (
    type: 'dir' | 'img',
    path: string,
    entry?: FileManagerEntry
  ) => void
}

const ImageCard: React.FC<ImageCardProps> = ({
  item,
  idx,
  isSelected,
  handleClick,
  handleDoubleClick,
}) => {
  const dirPath = item.path
  const fullFilePath = `${dirPath}/${item.name}`
  const fileUrl = buildStaticUrl(fullFilePath)
  const thumbUrl = `${fileUrl}?t=${item.modifiedAt || ''}`

  const indicators = [
    {
      icon: imageEnhancementIcon,
      value: item.metadata?.imageEnhancement.confidence ?? null,
      humanModified: item.metadata?.imageEnhancement.humanModified ?? false,
      label: 'Image Enhancement',
    },
    {
      icon: layoutIdentificationIcon,
      value: item.metadata?.layoutIdentification.confidence ?? null,
      humanModified: item.metadata?.layoutIdentification.humanModified ?? false,
      label: 'Layout Identification',
    },
    {
      icon: ocrIcon,
      value: item.metadata?.ocr.confidence ?? null,
      humanModified: item.metadata?.ocr.humanModified ?? false,
      label: 'Optical Character Recognition',
    },
    {
      icon: postOcrIcon,
      value: item.metadata?.postOcr.confidence ?? null,
      humanModified: item.metadata?.postOcr.humanModified ?? false,
      label: 'Post-OCR Correction',
    },
  ]

  return (
    <button
      key={`${item.path}-${item.name}`}
      onClick={() => handleClick(fullFilePath)}
      onDoubleClick={() => handleDoubleClick('img', fileUrl, item)}
      className={`flex flex-col items-center !px-[5px] !rounded-[10px] text-left ${
        isSelected(fullFilePath) ? '!bg-[#E7F3FF]' : '!bg-white'
      } overflow-visible`}
    >
      <div className='w-full mb-2 text-left text-xs text-[#292929]'>
        <div className='flex items-center relative'>
          <span className='truncate min-w-0 pr-5' title={item.name}>
            {item.name}
          </span>
          <span className='absolute right-[3px] top-[0px] text-xs  text-[#292929]'>
            {idx + 1}
          </span>
        </div>
      </div>

      <div className='w-full h-17 bg-gray-100 flex items-center justify-center overflow-hidden rounded'>
        <img
          src={thumbUrl}
          alt={item.name}
          loading='lazy'
          className='object-cover w-full h-full'
        />
      </div>

      <div className='w-full mt-2 grid grid-cols-4 gap-1 text-center text-xs'>
        {indicators.map((ind, index) => (
          <div
            key={index}
            className={clsx(
              'relative flex flex-col items-center group rounded-[10px] px-0 py-1',
              isSelected(fullFilePath) ? 'bg-white' : 'bg-[#F1F1F1]'
            )}
          >
            <img
              src={ind.icon}
              alt={ind.label}
              className='text-[#292929] mb-1 w-3 h-3'
            />
            <hr className='border-t-[0.5px] border-[#BCDDFF] w-full mb-1' />
            {ind.value !== null ? (
              <Marker
                value={ind.value}
                color={'#BCDDFF'}
                reverse={true}
                border={ind.humanModified}
              />
            ) : (
              <span className='text-[10px] font-bold'>/</span>
            )}
            <span className='absolute bottom-full mb-1 w-max px-2 py-1 font-medium bg-gray-800 text-white text-xs rounded-[30px] text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
              {ind.label}
            </span>
          </div>
        ))}
      </div>
    </button>
  )
}

export default ImageCard
