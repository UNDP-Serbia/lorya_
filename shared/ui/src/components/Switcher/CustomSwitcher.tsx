import { styled } from '@mui/material/styles'

const SwitchWrapper = styled('button')({
  height: 18,
  borderRadius: 9999,
  backgroundColor: '#BCDDFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 18px',
  position: 'relative',
  border: 'none',
  cursor: 'pointer',
})

const Label = styled('span')({
  fontSize: 11,
  fontWeight: 500,
  color: '#292929',
  zIndex: 2,
  userSelect: 'none',
  whiteSpace: 'nowrap',
})

const Thumb = styled('span')<{ checked: boolean }>(({ checked }) => ({
  position: 'absolute',
  top: 4,
  left: checked ? 'calc(100% - 16px)' : '5px',
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: '#FFFFFF',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  transition: 'left 200ms ease',
}))

interface CustomSwitcherProps {
  checked: boolean
  onChange: (checked: boolean) => void
  checkedLabel?: string
  uncheckedLabel?: string
  width?: number
}

export const CustomSwitcher: React.FC<CustomSwitcherProps> = ({
  checked,
  onChange,
  checkedLabel,
  uncheckedLabel,
  width,
}) => {
  return (
    <SwitchWrapper
      sx={{ width: width || 64 }}
      onClick={() => onChange(!checked)}
    >
      {checked && (
        <Label sx={{ width: !width ? '28px' : '' }}>
          {checkedLabel || 'Edit'}
        </Label>
      )}

      {!checked && <Label>{uncheckedLabel || 'Original'}</Label>}

      <Thumb checked={checked} />
    </SwitchWrapper>
  )
}
