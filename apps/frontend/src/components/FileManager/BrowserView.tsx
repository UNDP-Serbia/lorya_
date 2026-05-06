import React from 'react'
import type { FileManagerEntry } from '../../api'
import clsx from 'clsx'
import addIcon from '../../assets/add-icon.svg'
import addIconHover from '../../assets/add-icon-hover.svg'
import FolderCard from './FolderCard'
import ImageCard from './ImageCard'
import UploadImageComponent from './UploadImageComponent'

interface BrowserViewProps {
  entries?: FileManagerEntry[]
  filteredEntries: FileManagerEntry[]
  setFolderToRename: (f: FileManagerEntry) => void
  gridStyle: string
  isSelected: (key: string) => boolean
  handleClick: (path: string) => void
  handleDoubleClick: (
    type: 'dir' | 'img',
    path: string,
    entry?: FileManagerEntry
  ) => void
  selectedPath?: string
  normalizedSearch: string
  onClickCreateFolder: () => void
  isImage: (name: string) => boolean
}

const BrowserView: React.FC<BrowserViewProps> = ({
  entries,
  filteredEntries,
  setFolderToRename,
  gridStyle,
  isSelected,
  handleClick,
  handleDoubleClick,
  selectedPath,
  normalizedSearch,
  onClickCreateFolder,
  isImage,
}) => {
  return (
    <>
      {/* FOLDER SECTION – ALWAYS VISIBLE */}
      <div className='text-[11px] w-full text-left mb-2 mt-[-5px] font-medium text-[#292929]'>
        Folder
      </div>

      <div className={gridStyle}>
        {/* Create Folder always visible */}
        <button
          onClick={onClickCreateFolder}
          className='w-full !bg-transparent group flex items-center justify-center !border-1 !border-[#292929] rounded-[16px] h-[44px] !px-2'
        >
          <div className='w-full text-left text-xs text-[#292929] p-0 flex items-center justify-between group'>
            <div className='flex items-center'>
              <span className='truncate flex-1 min-w-0'>Create Folder</span>
            </div>
            <img
              src={addIcon}
              alt='add folder'
              className='block group-hover:hidden'
              style={{ height: '26px' }}
            />
            <img
              src={addIconHover}
              alt='add folder'
              className='hidden group-hover:block'
              style={{ height: '26px' }}
            />
          </div>
        </button>

        {/* Render folders if any */}
        {filteredEntries
          .filter(item => item.type === 'directory')
          .map(item => {
            const fullPath =
              item.path === '/' ? `/${item.name}` : `${item.path}/${item.name}`

            return (
              <FolderCard
                key={`${item.path}-${item.name}`}
                item={item}
                fullPath={fullPath}
                isSelected={isSelected}
                handleClick={handleClick}
                handleDoubleClick={handleDoubleClick}
                setFolderToRename={setFolderToRename}
              />
            )
          })}
      </div>

      {/* REST OF CONTENT DEPENDS ON ENTRIES */}
      {entries && entries.length > 0 && (
        <>
          {/* Files */}
          {filteredEntries.filter(
            e => e.type !== 'directory' && isImage(e.name)
          ).length > 0 && (
            <>
              <div className='text-[11px] w-full text-left mt-4 mb-[-5px] font-medium text-[#292929]'>
                Files
              </div>
              <div className={clsx('mt-4', gridStyle)}>
                {filteredEntries
                  .filter(
                    item => item.type !== 'directory' && isImage(item.name)
                  )
                  .map((item, idx) => (
                    <ImageCard
                      key={`${item.path}-${item.name}`}
                      item={item}
                      idx={idx}
                      isSelected={isSelected}
                      handleClick={handleClick}
                      handleDoubleClick={handleDoubleClick}
                    />
                  ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {filteredEntries.length === 0 && (
            <div className='text-sm text-[#292929] mt-4'>
              {normalizedSearch ? 'Nothing found.' : 'This folder is empty.'}
            </div>
          )}
        </>
      )}

      {selectedPath !== '/' && entries && entries.length === 0 && (
        <UploadImageComponent
          selectedPath={selectedPath}
          additionalClass={'h-200'}
        />
      )}
    </>
  )
}

export default BrowserView
