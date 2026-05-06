import React from 'react'
import { Button as MuiButton, type SxProps } from '@mui/material'

type Props = {
  children?: React.ReactNode
  onClick?: () => void
  type?: 'submit' | 'button' | 'reset'
  variant?: 'text' | 'outlined' | 'contained'
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
  sx?: SxProps
  component?: React.ElementType
  className?: string
  disabled?: boolean
  noHover?: boolean
}

export const Button: React.FC<Props> = ({
  children,
  onClick,
  type,
  variant,
  color,
  sx = {},
  component,
  className,
  disabled = false,
  noHover = false,
}) => {
  return (
    <MuiButton
      component={component || 'button'}
      onClick={onClick}
      type={type}
      variant={variant}
      color={color}
      className={className}
      disabled={disabled}
      sx={{
        borderRadius: '10px',
        boxShadow: 'none',
        color: '#292929',
        textTransform: 'none',
        height: '39px',
        fontFamily: 'inherit',

        '&:hover': {
          backgroundColor: noHover ? 'transparent' : '',
        },
        ...sx,
      }}
    >
      {children}
    </MuiButton>
  )
}
