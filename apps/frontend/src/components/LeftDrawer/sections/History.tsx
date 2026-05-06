import React from 'react'
import change from '../../../assets/change-history-icon.svg'
import modelChange from '../../../assets/change-history-operations-icon.svg'
import HoverIcon from '../../helpers/HoverIcon'
import {
  ActivityCategory,
  ActivityStatus,
  type ActivityDto,
} from '../../../api'
import { useFileActivity } from '../../../query'
import { OPERATION_LABEL } from './History.constants'

interface HistoryProps {
  fileId: string | null
}

interface HistoryRow {
  id: string
  timestamp: string
  user: string
  label: string
  modelOperation: boolean
  failed: boolean
}

const formatHistoryTimestamp = (iso: string): string => {
  const d = new Date(iso)
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d)
  const date = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(d)
  return `${time} ${date}`
}

const toRow = (activity: ActivityDto): HistoryRow => {
  const isModelRun = activity.category === ActivityCategory.MODEL_RUN
  const fallbackLabel =
    OPERATION_LABEL[activity.operation] ?? activity.operation
  return {
    id: activity.id,
    timestamp: formatHistoryTimestamp(activity.startedAt),
    user: activity.userFullName,
    label: isModelRun ? (activity.modelName ?? fallbackLabel) : fallbackLabel,
    modelOperation: isModelRun,
    failed: activity.status === ActivityStatus.FAILURE,
  }
}

export const History: React.FC<HistoryProps> = ({ fileId }) => {
  const { data, isLoading, isError } = useFileActivity(fileId)
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  const rows = React.useMemo<HistoryRow[]>(
    () =>
      (data ?? [])
        .filter(a => a.status !== ActivityStatus.IN_PROGRESS)
        .map(toRow),
    [data]
  )

  if (!fileId) {
    return null
  }

  if (isLoading && !data) {
    return <div className='px-2 py-1 text-[10px] text-[#5F6A74]'>Loading…</div>
  }

  if (isError && !data) {
    return (
      <div className='px-2 py-1 text-[10px] text-[#5F6A74]'>
        Couldn't load history
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className='px-2 py-1 text-[10px] text-[#5F6A74]'>No history yet</div>
    )
  }

  const isSelected = (index: number) =>
    selectedIndex !== null && index <= selectedIndex

  return (
    <div className='flex flex-col'>
      {rows.map((row, index) => {
        const selected = isSelected(index)
        const isCutoff = selectedIndex === index

        return (
          <div
            key={row.id}
            onClick={() => setSelectedIndex(index)}
            className={`group cursor-pointer transition-colors border-l-3 p-1 relative ${
              selected
                ? 'bg-[#E7F3FF] border-[#BCDDFF] pb-0'
                : 'border-transparent hover:bg-[#BCDDFF] hover:border-[#BCDDFF]'
            }`}
          >
            <div className='text-[10px] font-semibold text-[#292929]'>
              {row.timestamp} | {row.user}
            </div>

            <div className='flex items-center justify-between -ml-2 pl-2 pr-1'>
              <div className='flex items-center'>
                <div className='flex h-4 w-5 items-center text-[#4F8BD6]'>
                  <img
                    src={row.modelOperation ? modelChange : change}
                    alt='operation'
                  />
                </div>
                <div
                  className={`text-[10px] ${row.failed ? 'text-[#C0392B]' : 'text-[#0B1524]'}`}
                >
                  {row.label}
                </div>
              </div>
            </div>

            {isCutoff && (
              <button
                type='button'
                onClick={() => undefined}
                className='text-[#4F8BD6] hover:text-[#1E6BCE] !p-0 mr-1 mb-1 absolute right-1 bottom-0'
              >
                <HoverIcon name='rollback-icon' className='w-3' />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
