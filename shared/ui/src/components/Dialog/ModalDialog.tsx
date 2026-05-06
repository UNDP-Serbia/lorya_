import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { IconButton } from '../IconButton'
import { ApplyButton } from '../Button'

export type ModalDialogProps = {
  open: boolean
  title?: React.ReactNode
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  error?: React.ReactNode
  onSubmit?: () => void
  onCancel: () => void
  children?: React.ReactNode
  hasCancelButton?: boolean
  hasX?: boolean
  titleIcon?: React.ReactNode
}

/**
 * Generic MUI Dialog wrapper that accepts children for the content area.
 * Intended to be reused across the app (e.g., create/rename dialogs).
 */
export const ModalDialog: React.FC<ModalDialogProps> = ({
  open,
  title,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading,
  error,
  onSubmit,
  onCancel,
  children,
  hasCancelButton = true,
  hasX = true,
  titleIcon,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!loading) onCancel()
      }}
      fullWidth
      maxWidth='xs'
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '10px',
        },
      }}
    >
      {title && (
        <DialogTitle
          sx={{
            pb: 1,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 2,
            fontWeight: 400,
            fontSize: '18px',
          }}
        >
          <div className='flex items-start gap-3'>
            {titleIcon && <span className='mt-1'>{titleIcon}</span>}
            {title}{' '}
          </div>
          {hasX && (
            <IconButton onClick={onCancel} size='small'>
              <CloseIcon fontSize='small' />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent sx={{ pt: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {children}
          {error ? (
            <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>
              {error}
            </div>
          ) : null}
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {hasCancelButton && (
          <ApplyButton
            onClick={onCancel}
            disabled={!!loading}
            label={cancelLabel}
          />
        )}
        {onSubmit && (
          <ApplyButton
            onClick={onSubmit}
            label={loading ? `${submitLabel}…` : submitLabel}
            disabled={!!loading}
          />
        )}
      </DialogActions>
    </Dialog>
  )
}
