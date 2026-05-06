import { type FileManagerEntry } from '../../api'
import { type FC } from 'react'
import folderIcon from '../../assets/folder-icon.svg'
import imageIcon from '../../assets/image-icon.svg'
import { isImage } from './FileManager'
import { IconButton } from '@shared/ui'
import HoverIcon from '../helpers/HoverIcon'

interface ImageCardProps {
  item: FileManagerEntry
  fullPath: string
  isSelected: (path: string) => boolean
  handleClick: (path: string) => void
  handleDoubleClick: (type: 'dir' | 'img', path: string) => void
  setFolderToRename: (f: FileManagerEntry) => void
}

const getDirLength = (children: FileManagerEntry[], notDir = false) => {
  if (children) {
    if (notDir) {
      return (
        children.filter(
          child => child.type !== 'directory' && isImage(child.name)
        ).length || false
      )
    } else {
      return (
        children.filter(child => child.type === 'directory').length || false
      )
    }
  } else {
    return false
  }
}

const FolderCard: FC<ImageCardProps> = ({
  item,
  fullPath,
  isSelected,
  handleClick,
  handleDoubleClick,
  setFolderToRename,
}) => {
  return (
    <button
      key={`${item.path}-${item.name}`}
      onClick={() => handleClick(fullPath)}
      onDoubleClick={() => handleDoubleClick('dir', fullPath)}
      className={`w-full relative group flex items-center justify-center border !rounded-[10px] h-[44px] !px-2 ${isSelected(fullPath) ? '!bg-[#E7F3FF]' : '!bg-white'}`}
    >
      <div className='w-full text-left text-xs text-[#292929] p-0 flex items-center justify-between'>
        <div className='flex items-center'>
          <IconButton
            onClick={e => {
              e.stopPropagation()
              setFolderToRename(item)
            }}
            className='h-5 w-5.5 pl-4'
          >
            <HoverIcon name='edit-icon' />
          </IconButton>
          <span className='truncate flex-1 min-w-0 pr-1.5 max-w-36'>
            {item.name}
          </span>
        </div>
        <div className='flex flex-col items-left space-x-2 text-[#292929] pr-2'>
          {item.children && (
            <>
              {getDirLength(item.children) && (
                <div className='flex items-center !m-0 !p-0'>
                  <img src={folderIcon} alt='image icon' className='mr-1' />
                  <span>{getDirLength(item.children)}</span>
                </div>
              )}

              {getDirLength(item.children, true) && (
                <div className='flex items-center !m-0 !p-0'>
                  <img src={imageIcon} alt='image icon' className='mr-1' />
                  <span>{getDirLength(item.children, true)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </button>
  )
}
export default FolderCard
