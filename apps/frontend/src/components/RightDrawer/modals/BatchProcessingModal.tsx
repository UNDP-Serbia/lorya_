import React from 'react'
import { ModalDialog } from '@shared/ui'
import eyeIcon from '../../../assets/eye-icon.svg'
import trashcanIcon from '../../../assets/trash-can-icon.svg'
import batchIcon from '../../../assets/batch-icon.svg'
import type { BatchFile } from '../../../context/BatchSelectionContext'

export type BatchFileStatus = 'idle' | 'running' | 'done' | 'failed'

export type BatchProcessingFile = BatchFile & {
  processingStatus: BatchFileStatus
  error?: string
}

type BatchProcessingModalProps = {
  open: boolean
  onClose: () => void
  files: BatchProcessingFile[]
  onViewFile: (file: BatchFile) => void
  onRemoveFile: (fileId: string) => void
}

const statusToColor = (status: BatchFileStatus): string => {
  switch (status) {
    case 'idle':
      return 'bg-gray-300'
    case 'running':
      return 'bg-blue-500'
    case 'done':
      return 'bg-green-500'
    case 'failed':
      return 'bg-red-500'
  }
}

const statusToWidth = (status: BatchFileStatus): string => {
  switch (status) {
    case 'idle':
      return 'w-0'
    case 'running':
      return 'w-1/2'
    case 'done':
      return 'w-full'
    case 'failed':
      return 'w-full'
  }
}

export const BatchProcessingModal: React.FC<BatchProcessingModalProps> = ({
  open,
  onClose,
  files,
  onViewFile,
  onRemoveFile,
}) => {
  const isProcessing = files.some(
    f => f.processingStatus === 'running' || f.processingStatus === 'idle'
  )

  return (
    <ModalDialog
      open={open}
      onCancel={() => {
        if (!isProcessing) onClose()
      }}
      title='Active Selection'
      titleIcon={<img src={batchIcon} alt='batch' />}
      hasX={!isProcessing}
      hasCancelButton={false}
      onSubmit={isProcessing ? undefined : onClose}
      submitLabel='Close'
    >
      <div className='flex flex-col gap-2 max-h-[400px] overflow-y-auto'>
        {files.map(file => (
          <div key={file.fileId}>
            <div className='flex items-center justify-between py-1'>
              <span className='text-[13px] text-[#292929] truncate mr-2'>
                {file.path}/{file.fileName}
              </span>
              <div className='flex items-center gap-2 shrink-0'>
                <button
                  type='button'
                  onClick={() => onViewFile(file)}
                  className='flex items-center !p-0 hover:opacity-70'
                  disabled={isProcessing}
                >
                  <img src={eyeIcon} alt='View' width={14} />
                </button>
                <button
                  type='button'
                  onClick={() => onRemoveFile(file.fileId)}
                  className='flex items-center !p-0 hover:opacity-70'
                  disabled={isProcessing}
                >
                  <img src={trashcanIcon} alt='Remove' width={14} />
                </button>
              </div>
            </div>
            <div className='h-1 w-full rounded bg-gray-200 overflow-hidden'>
              <div
                className={`h-full rounded transition-all duration-300 ${statusToColor(file.processingStatus)} ${statusToWidth(file.processingStatus)} ${file.processingStatus === 'running' ? 'animate-pulse' : ''}`}
              />
            </div>
            {file.processingStatus === 'failed' && file.error && (
              <p className='text-[11px] text-red-500 mt-1'>{file.error}</p>
            )}
          </div>
        ))}
      </div>
    </ModalDialog>
  )
}
