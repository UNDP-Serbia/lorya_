import React, { useRef } from 'react'
import { ApplyButton } from '../ApplyButton'
import { type MethodStatus } from '../../status'
import { type SxProps } from '@mui/material'

type FileUploadButtonProps = {
  status?: MethodStatus
  onFileSelect?: (file: File | null) => void
  label?: string
  disabled?: boolean
  accept?: string
  multiple?: boolean
  sx: SxProps
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  status = 'idle',
  onFileSelect,
  label,
  disabled,
  accept,
  multiple = false,
  sx = {},
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('FILE EVENT', e)
    const file = multiple ? e.target.files : (e.target.files?.[0] ?? null)
    onFileSelect?.(file as File)
  }

  return (
    <>
      <ApplyButton
        status={status}
        onClick={handleClick}
        label={label}
        disabled={disabled}
        sx={sx}
      />

      <input
        ref={inputRef}
        type='file'
        hidden
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
      />
    </>
  )
}
