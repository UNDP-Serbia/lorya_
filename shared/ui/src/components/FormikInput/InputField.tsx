import React, { type ReactNode } from 'react'
import { type TextFieldProps as MUITextFieldProps } from '@mui/material/TextField'
import { type SxProps, type Theme } from '@mui/material/styles'
import { Box, InputAdornment } from '@mui/material'
import { StyledInput } from './StyledInput'

export interface InputFieldProps extends Omit<MUITextFieldProps, 'variant'> {
  name: string
  label?: string
  placeholder?: string
  sx?: SxProps<Theme>
  className?: string
  variant?: 'outlined' | 'filled' | 'standard'
  radius?: number
  errorText?: string | null
  borderColor?: string
  endIcon?: ReactNode
}

export const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  placeholder,
  sx,
  className,
  variant = 'outlined',
  radius = 40,
  errorText,
  value,
  onChange,
  onBlur,
  borderColor,
  endIcon,
  ...rest
}) => {
  const showError = Boolean(errorText)

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <StyledInput
        {...rest}
        radius={radius}
        borderColor={borderColor}
        name={name}
        label={label}
        placeholder={placeholder || label}
        variant={variant}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={showError}
        helperText={showError ? undefined : rest.helperText}
        sx={sx}
        className={className}
        slotProps={{
          ...rest.slotProps,
          input: {
            ...rest.slotProps?.input,
            endAdornment: endIcon && (
              <InputAdornment position='end'>{endIcon}</InputAdornment>
            ),
          },
        }}
      />
      {showError && (
        <span
          style={{
            color: 'red',
            fontSize: '12px',
            textAlign: 'left',
            paddingLeft: '12px',
            marginBottom: -10,
          }}
        >
          {errorText}
        </span>
      )}
    </Box>
  )
}
