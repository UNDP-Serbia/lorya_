import React from 'react'
import { InputAdornment, TextField, type TextFieldProps } from '@mui/material'
import { styled } from '@mui/material/styles'

const CssTextField = styled(TextField)({
  backgroundColor: '#f3f4f6',
  border: 'none',
  height: 20,
  borderRadius: 4,

  '& fieldset': {
    border: 'none',
  },
  '& input': {
    fontSize: '11px',
    color: '#292929',
    marginTop: -6.5,
  },
  '& .MuiInputBase-root': {
    border: 'none',
    paddingLeft: '5px',
  },
  '& input[type=number]': {
    MozAppearance: 'textfield',
  },
  '& input[type=number]::-webkit-outer-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  '& input[type=number]::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },

  '& .MuiInputAdornment-root': {
    marginTop: -5.5,
    width: '10px',

    '& .MuiTypography-root': {
      fontSize: '11px',
      color: '#292929',
    },
  },

  '&:has(.Mui-error)': {
    outline: '1px solid #b91c1c',
    outlineOffset: -1,
    borderRadius: 4,
  },
  '& .Mui-error': {
    '& fieldset': {
      border: 'none',
    },
    '& input': {
      color: '#b91c1c',
    },
    '& .MuiInputAdornment-root .MuiTypography-root': {
      color: '#b91c1c',
    },
  },
})

export interface UniversalInputProps
  extends Omit<TextFieldProps, 'value' | 'onChange' | 'type'> {
  value: string | number
  onChange: (value: number | string | null) => void
  type?: React.InputHTMLAttributes<unknown>['type']
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
}

export const SimpleInput: React.FC<UniversalInputProps> = ({
  value,
  onChange,
  type = 'number',
  startAdornment,
  endAdornment,
  ...rest
}) => {
  return (
    <CssTextField
      type={type}
      value={value}
      variant='outlined'
      size='small'
      fullWidth
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const val =
          type === 'number'
            ? e.target.value !== ''
              ? Number(e.target.value)
              : null
            : e.target.value
        onChange(val)
      }}
      slotProps={{
        input: {
          startAdornment: startAdornment ? (
            <InputAdornment position='start'>{startAdornment}</InputAdornment>
          ) : undefined,
          endAdornment: endAdornment ? (
            <InputAdornment position='end'>{endAdornment}</InputAdornment>
          ) : undefined,
        },
      }}
      {...rest}
    />
  )
}
