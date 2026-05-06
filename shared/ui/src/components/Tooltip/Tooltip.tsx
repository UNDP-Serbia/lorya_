import React from 'react'
import { Tooltip as MuiTooltip, type TooltipProps } from '@mui/material'

export type { TooltipProps }

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  placement = 'right',
  arrow = false,
  ...rest
}) => {
  return (
    <MuiTooltip placement={placement} arrow={arrow} {...rest}>
      <span style={{ display: 'inline-flex' }}>{children}</span>
    </MuiTooltip>
  )
}
