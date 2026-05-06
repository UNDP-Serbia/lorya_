import React from 'react'
import logo from '../../assets/logo.svg'
import { Box } from '@mui/material'
type Props = {
  className?: string
  size?: number
  color?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
    | 'inherit'
}

export const Loading: React.FC<Props> = ({
  className,
  size = 50,
  color = 'primary',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',

        '@keyframes spin': {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },

        '& > img': {
          animation: 'spin 4s linear infinite',
        },
      }}
    >
      <img
        className={className}
        src={logo}
        alt='logo'
        height={size}
        width={size}
        color={color}
      />
    </Box>
  )
}
