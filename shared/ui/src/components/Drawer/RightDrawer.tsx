import React from 'react'
import { Avatar, Box, Divider, IconButton, Typography } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { CustomDrawer } from './CustomDrawer'

export type RightDrawerProps = {
  width?: number
}

const drawerWidthDefault = 320

export const RightDrawer: React.FC<RightDrawerProps> = ({
  width = drawerWidthDefault,
}) => {
  return (
    <CustomDrawer width={width} anchor='right'>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 28, height: 28 }}>U</Avatar>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            User
          </Typography>
        </Box>
        <IconButton size='small'>
          <MoreVertIcon fontSize='small' />
        </IconButton>
      </Box>
      <Divider />
      {/* CONTENT GOES HERE */}
    </CustomDrawer>
  )
}
