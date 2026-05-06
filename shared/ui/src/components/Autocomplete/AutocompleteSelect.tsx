import React from 'react'
import { Autocomplete, TextField } from '@mui/material'

export type FolderOption = {
  label: string
  value: string
}

interface FolderSelectProps {
  options: FolderOption[]
  value: FolderOption | null
  onChange: (value: FolderOption | null) => void
  errorText?: string | null
}

export const AutocompleteSelect: React.FC<FolderSelectProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      getOptionLabel={option => option.label}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      renderInput={params => {
        const { inputProps, InputProps, ...rest } = params
        return (
          <TextField
            {...rest}
            placeholder='Select folder'
            size='small'
            variant='outlined'
            slotProps={{
              input: {
                ...InputProps,
              },
              htmlInput: {
                ...inputProps,
              },
            }}
            sx={{
              padding: '0px',
              '& .MuiInputBase-root': {
                padding: '0px !important',
                borderRadius: '8px',
              },
            }}
          />
        )
      }}
      fullWidth
    />
  )
}
