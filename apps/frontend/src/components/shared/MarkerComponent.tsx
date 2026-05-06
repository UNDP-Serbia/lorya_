import clsx from 'clsx'

interface MarkerProps {
  value: string | number
  color: string
  border?: boolean
  reverse?: boolean
}

export const Marker = (props: MarkerProps) => (
  <div
    className={clsx(
      'flex items-center gap-1 text-[10px] font-bold',
      props.reverse && 'flex-row-reverse'
    )}
  >
    {props.value}
    <span
      className={clsx(
        props.border ? 'border border-[#292929]' : 'border-transparent',
        'inline-flex items-center justify-center w-[10px] h-[10px] rounded-full text-[10px]'
      )}
      style={{
        backgroundColor: props.color,
        color: '#fff',
      }}
    ></span>
  </div>
)
