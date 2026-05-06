import { styled } from '@mui/material'
import TextField from '@mui/material/TextField'
import { type InputFieldProps } from './InputField'

interface StyledInputProps extends InputFieldProps {
  radius?: number
  borderColor?: string
}

export const StyledInput = styled(TextField, {
  shouldForwardProp: prop => prop !== 'radius' && prop !== 'borderColor',
})<StyledInputProps>(({ radius = 40, borderColor = 'transparent' }) => ({
  '& .MuiFormLabel-root': {
    marginTop: '-8px',
    fontFamily: 'inherit',
  },
  '& .MuiFormLabel-root.Mui-focused': {
    marginTop: '0px',
  },
  '& .MuiFormLabel-root.MuiFormLabel-filled': {
    marginTop: '0px',
  },
  '& .MuiOutlinedInput-root': {
    color: '#292929',
    borderRadius: radius,
    borderColor: 'transparent',
    height: '39px',
    '& .MuiOutlinedInput-input': {
      borderColor: borderColor,
      backgroundColor: '#FFFFFF',
      borderRadius: radius,
      padding: '8px 12px',
      //autofill credentials - default input color changed
      '&:-webkit-autofill': {
        boxShadow: 'none',
        WebkitTextFillColor: '#292929',
        caretColor: '#292929',
      },
    },

    '& fieldset': {
      borderColor: borderColor,
    },
    '&:hover fieldset': {
      borderColor: '#888888',
    },
    '&.Mui-focused fieldset': {
      borderColor: borderColor,
    },
  },
  '& .MuiInputBase-root.MuiInput-root::before': {
    borderColor: borderColor,
  },
  '& .MuiInputLabel-root': {
    color: '#292929',
  },

  // standard input
  '& .MuiInput-underline:hover:before': {
    borderBottom: '1px solid #BCDDFF !important',
  },
  '& .MuiInput-underline:after': {
    borderBottom: '1px solid #BCDDFF',
  },
}))
