import { Drawer as MuiDrawer, type SxProps } from '@mui/material'
import React from 'react'

type Props = {
  width?: number
  collapsedWidth?: number
  collapsed?: boolean
  anchor?: 'right' | 'left'
  offset?: number // distance from the corresponding screen edge to allow stacking multiple drawers
  children: React.ReactNode
  level?: number
  sx?: SxProps
}

export const CustomDrawer: React.FC<Props> = ({
  anchor = 'right',
  width = 263,
  collapsedWidth = 64,
  collapsed = false,
  offset = 0,
  children,
  level = 0,
  sx,
}) => {
  return (
    <MuiDrawer
      variant='permanent'
      anchor={anchor}
      slotProps={{
        paper: {
          sx: theme => ({
            width: collapsed ? collapsedWidth : width,
            maxWidth: width,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: 0, //theme.transitions.duration.enteringScreen
            }),
            overflowX: 'hidden',
            boxSizing: 'border-box',
            paddingRight: `${level * 64}px`,
            ...(anchor === 'right'
              ? { borderLeft: `1px solid ${theme.palette.divider}` }
              : { borderRight: `1px solid ${theme.palette.divider}` }),
            ...(anchor === 'right' ? { right: offset } : { left: offset }),
            boxShadow:
              anchor === 'left'
                ? '4px 0 12px rgba(0,0,0,0.08)'
                : '-4px 0 12px rgba(0,0,0,0.08)',
          }),
        },
      }}
      sx={sx}
    >
      {children}
    </MuiDrawer>
  )
}
