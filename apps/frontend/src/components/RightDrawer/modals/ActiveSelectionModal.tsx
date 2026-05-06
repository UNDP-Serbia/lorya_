import React from 'react'
import { ModalDialog } from '@shared/ui'
import eyeIcon from '../../../assets/eye-icon.svg'
import trashcanIcon from '../../../assets/trash-can-icon.svg'
import batchIcon from '../../../assets/batch-icon.svg'
import type { BatchFile } from '../../../context/BatchSelectionContext'

type ActiveSelectionModalProps = {
  open: boolean
  onClose: () => void
  files: BatchFile[]
  onRemoveFile: (fileId: string) => void
  onViewFile: (file: BatchFile) => void
}

export const ActiveSelectionModal: React.FC<ActiveSelectionModalProps> = ({
  open,
  onClose,
  files,
  onRemoveFile,
  onViewFile,
}) => {
  return (
    <ModalDialog
      open={open}
      onCancel={onClose}
      title='Active Selection'
      titleIcon={<img src={batchIcon} alt='batch' />}
      hasCancelButton={false}
      onSubmit={onClose}
      submitLabel='Close'
    >
      <p className='text-[12px] text-[#292929] font-medium mb-3'>
        {files.length} images
      </p>
      <div className='flex flex-col gap-1 max-h-[400px] overflow-y-auto'>
        {files.map(file => (
          <div
            key={file.fileId}
            className='flex items-center justify-between py-2 border-b border-[#E9E9E9]'
          >
            <span className='text-[13px] text-[#292929] truncate mr-2'>
              {file.path}/{file.fileName}
            </span>
            <div className='flex items-center gap-2 shrink-0'>
              <button
                type='button'
                onClick={() => onViewFile(file)}
                className='flex items-center !p-0 hover:opacity-70'
              >
                <img src={eyeIcon} alt='View' width={14} />
              </button>
              <button
                type='button'
                onClick={() => onRemoveFile(file.fileId)}
                className='flex items-center !p-0 hover:opacity-70'
              >
                <img src={trashcanIcon} alt='Remove' width={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ModalDialog>
  )
}
