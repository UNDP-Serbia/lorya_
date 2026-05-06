import React from 'react'
import {
  IconButton as MuiIconButton,
  type IconButtonProps,
} from '@mui/material'

export type { IconButtonProps }

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  size = 'small',
  ...rest
}) => {
  return (
    <MuiIconButton
      size={size}
      disableRipple
      {...rest}
      sx={{ '&:focus': { outline: 'none' }, ...(rest.sx || {}) }}
    >
      {children}
    </MuiIconButton>
  )
}
