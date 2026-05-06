import { ThemeProvider } from '@mui/material'
import React from 'react'
import { theme } from './UIProvider.constants'

export const UIProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
