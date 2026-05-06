import React from 'react'
import { Button } from '@shared/ui'
import { type SxProps } from '@mui/material'
import { METHOD_STATUS_CONFIG, type MethodStatus } from '../status'

type ApplyButtonProps = {
  status?: MethodStatus
  onClick?: () => void
  sx?: SxProps
  label?: string
  disabled?: boolean
  iconStart?: React.ReactNode
  type?: 'button' | 'submit'
}

export const ApplyButton: React.FC<ApplyButtonProps> = ({
  status = 'idle',
  onClick,
  sx,
  label,
  disabled = false,
  iconStart = null,
  type = 'button',
}) => {
  const cfg = METHOD_STATUS_CONFIG[status]

  return (
    <Button
      variant='outlined'
      onClick={onClick}
      disabled={disabled}
      type={type}
      sx={{
        borderRadius: '2px',
        boxShadow: 'none',
        textTransform: 'uppercase',
        fontFamily: 'inherit',
        height: 24,
        fontSize: 8,
        fontWeight: 600,
        px: 1.5,
        minWidth: 'auto',
        borderColor: cfg.strong.borderColor,
        color: cfg.strong.color,
        backgroundColor: cfg.strong.backgroundColor,
        '&:hover': {
          backgroundColor: cfg.strong.backgroundColor,
        },
        ...sx,
      }}
    >
      {iconStart && iconStart}
      <span>{label || cfg.label}</span>
    </Button>
  )
}
