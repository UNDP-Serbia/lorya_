import React from 'react'
import { Typography, Box } from '@mui/material'
import { ApplyButton } from '../Button'
import { METHOD_STATUS_CONFIG, type MethodStatus } from '../status'

export interface MethodSelectItemProps {
  label: React.ReactNode
  selected: boolean
  status: MethodStatus
  onClick: () => void
  onRun?: () => void
  runDisabled?: boolean
}

export const MethodSelectItem = ({
  label,
  selected,
  status,
  onClick,
  onRun,
  runDisabled = false,
}: MethodSelectItemProps) => {
  const cfg = METHOD_STATUS_CONFIG[status]

  return (
    <Box
      onClick={onClick}
      component='div'
      sx={{
        justifyContent: 'space-between',
        cursor: 'pointer',
        display: 'flex',
        pl: 1,
        py: 0.2,
        borderRadius: '0px 10px 10px 0px',
        background: selected
          ? `linear-gradient(90deg, ${cfg.soft.bg} 0%, #FFFFFF 74.52%)`
          : 'transparent',
        borderLeft: selected
          ? `3px solid ${cfg.soft.accent}`
          : '3px solid transparent',
      }}
    >
      <Typography
        variant='caption'
        fontWeight={selected ? 600 : 400}
        sx={{
          textTransform: 'none',
          color: 'rgba(41, 41, 41, 1)',
          pt: 0.2,
          fontSize: 11,
        }}
      >
        {label}
      </Typography>

      {selected && (
        <span onClick={e => e.stopPropagation()}>
          <ApplyButton
            status={status}
            onClick={onRun}
            disabled={runDisabled}
            sx={{ minWidth: '50px' }}
          />
        </span>
      )}
    </Box>
  )
}
