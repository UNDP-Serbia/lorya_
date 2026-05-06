import React from 'react'
import { ApplyButton } from '@shared/ui'
import { useExportAlto } from '../../../query'

type ExportProps = {
  fileId?: string | null
}

const CURRENTLY_SUPPORTED_FORMATS = ['ALTO']

export const Export: React.FC<ExportProps> = ({ fileId }) => {
  const formats = ['PDF', 'ALTO', 'TXT']
  const [selected, setSelected] = React.useState<number>(0)

  const { mutate: exportAlto, isPending: isExporting } = useExportAlto()

  const handleExport = () => {
    if (!fileId) return

    const format = formats[selected]
    if (format !== 'ALTO') return

    exportAlto(fileId)
  }

  return (
    <div className='flex flex-col gap-3 text-[12px] text-[#292929]'>
      <div className='flex flex-col gap-1'>
        {formats.map((label, idx) => (
          <button
            key={label}
            type='button'
            onClick={() => setSelected(idx)}
            style={{
              borderRadius: '0px 10px 10px 0px',
              background:
                selected === idx
                  ? `linear-gradient(90deg, rgba(231, 243, 255, 1) 0%, #FFFFFF 74.52%)`
                  : 'transparent',
              borderLeft:
                selected === idx
                  ? `3px solid rgba(188, 221, 255, 1)`
                  : '3px solid transparent',
            }}
            className={`w-full text-left h-[22px] flex items-center px-3 py-1.5 rounded-md text-[#292929] !text-[11px]`}
          >
            {label}
          </button>
        ))}
      </div>

      <ApplyButton
        sx={{
          '&.Mui-disabled': {
            background: '#E5E7EB',
            color: '#374151',
          },
        }}
        label={isExporting ? 'Exporting...' : 'Export'}
        disabled={
          !fileId ||
          isExporting ||
          !CURRENTLY_SUPPORTED_FORMATS.includes(formats[selected])
        }
        onClick={handleExport}
      />
    </div>
  )
}
