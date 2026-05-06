import React, { type ReactNode } from 'react'
import { Box, Slider, TextField } from '@mui/material'

export type LabeledSliderProps = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  icon?: ReactNode
  labelStart?: boolean
  inputEnd?: boolean
}

type SliderFieldComponentProps = {
  value: number
  onChange: (value: number) => void
  clamp: (value: number) => number
  disabled?: boolean
}

const SliderFieldComponent: React.FC<SliderFieldComponentProps> = ({
  value,
  onChange,
  disabled,
  clamp,
}) => (
  <TextField
    type='number'
    size='small'
    value={Number.isFinite(value) ? value : 0}
    onChange={e => {
      const v = Number(e.target.value)
      const clamped = Number.isNaN(v) ? 0 : clamp(v)
      onChange(clamped)
    }}
    disabled={disabled}
    sx={{
      '& input[type=number]::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      width: 50,
      '& .MuiOutlinedInput-root': {
        height: 24,
        borderRadius: '4px',
        '& fieldset': {
          borderColor: '#BCDDFF',
        },
        '&:hover fieldset': {
          borderColor: '#BCDDFF',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#BCDDFF',
        },
      },
      '& input': {
        padding: '2px 8px',
        fontSize: '11px',
        textAlign: 'center',
        color: '#374151',
      },
      opacity: disabled ? 0.6 : 1,
    }}
  />
)

export const LabeledSlider: React.FC<LabeledSliderProps> = ({
  label,
  value,
  onChange,
  min = -100,
  max = 100,
  step = 1,
  disabled = false,
  className = '',
  icon,
  labelStart = false,
  inputEnd = false,
}) => {
  const clamp = (v: number) => Math.max(min, Math.min(max, v))
  const normalizeSliderValue = (v: number | number[]) =>
    Array.isArray(v) ? v[0] : v

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className='flex items-center justify-between'>
        <div className='text-[#292929] flex items-center gap-2'>
          {icon ? icon : ''}
          {!labelStart && label}
        </div>
        {!inputEnd && (
          <SliderFieldComponent
            value={value}
            onChange={onChange}
            clamp={clamp}
            disabled={disabled}
          />
        )}
      </div>
      <Box className='flex items-center gap-3 text-[#292929] text-[13px]'>
        {labelStart && label}
        <Slider
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          disabled={disabled}
          onChange={(_, v) => onChange(normalizeSliderValue(v))}
          sx={{
            mt: labelStart ? 0 : 1,
            height: 8,
            padding: 0,
            '& .MuiSlider-rail': {
              background: 'linear-gradient(90deg, #BCDDFF 0%, #F2F8FF 100%)',
              opacity: 1,
              borderRadius: 0,
            },
            '& .MuiSlider-track': {
              background: 'linear-gradient(90deg, #BCDDFF 0%, #F2F8FF 100%)',
              border: 'none',
            },
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
              backgroundColor: '#E7F3FF',
              boxShadow: '0 0 0 2px #ffffff',
              '&:before': { display: 'none' },
            },
            opacity: disabled ? 0.6 : 1,
          }}
        />
        {inputEnd && (
          <SliderFieldComponent
            value={value}
            onChange={onChange}
            clamp={clamp}
            disabled={disabled}
          />
        )}
      </Box>
    </div>
  )
}
