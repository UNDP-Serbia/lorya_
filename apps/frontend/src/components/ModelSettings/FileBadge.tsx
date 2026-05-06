import React from 'react'
import { FileUploadButton, IconButton } from '@shared/ui'
import checkRounded from '../../assets/check-rounded-icon.svg'
import checkRoundedDisabled from '../../assets/check-rounded-icon-disabled.svg'
import downloadIconDisabled from '../../assets/download-icon-disabled.svg'
import deleteIconDisabled from '../../assets/trash-can-icon-disabled.svg'
import HoverIcon from '../helpers/HoverIcon'

export const FileBadge: React.FC<{
  label: string
  error?: string
  accept?: string
  onRemove?: () => void
  onFileSelect?: (file: File | null) => void
  value?: File | null
}> = ({ label, error, accept, onRemove, onFileSelect, value }) => (
  <div
    className={`flex items-center justify-stretch gap-0 h-7 px-2 text-[11px] w-full`}
  >
    <FileUploadButton
      sx={{
        width: '100%',
        lineHeight: '9px',
        background: error ? '#FA5F55' : '',
        color: error ? 'white' : 'rgba(25, 118, 210, 1)',
        border: error ? 'transparent' : '',

        '& > span': {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '140px',
        },
      }}
      label={label}
      onFileSelect={onFileSelect}
      accept={accept}
    />
    <IconButton size='small' disabled={!value} sx={{ cursor: 'default' }}>
      <img
        src={value ? checkRounded : checkRoundedDisabled}
        alt='download icon'
      />
    </IconButton>
    <IconButton size='small' sx={{ padding: '0px' }} disabled={!value}>
      {value ? (
        <HoverIcon name='download-icon' width={'14px'} />
      ) : (
        <img src={downloadIconDisabled} alt='trash can icon' />
      )}
    </IconButton>
    <IconButton
      size='small'
      onClick={onRemove}
      sx={{ paddingLeft: '5px' }}
      disabled={!value}
    >
      {value ? (
        <HoverIcon name='trash-can-icon' width={'14px'} />
      ) : (
        <img src={deleteIconDisabled} alt='trash can icon' />
      )}
    </IconButton>
  </div>
)
