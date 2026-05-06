import { createTheme, type Theme } from '@mui/material/styles'
import { red } from '@mui/material/colors'

export const theme: Theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: 'Space Grotesk, sans-serif',
  },
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
})
