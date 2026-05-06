import React from 'react'
import type {
  RunHistoryFileDto,
  RunHistoryItemDto,
  RunHistorySegmentDto,
  RunHistoryStatus,
} from '../../api'
import { useRunHistory, useRunFileSegments } from '../../query'
import { formatDurationMs, formatRunTimestamp } from './RunHistory.utils'
import arrowRightIcon from '../../assets/arrow-right-icon.svg'
import downloadIcon from '../../assets/download-icon.svg'
import imageIcon from '../../assets/image-icon.svg'
import changeHistoryIcon from '../../assets/change-history-icon.svg'
import checkRoundedIcon from '../../assets/check-rounded-icon.svg'
import xIcon from '../../assets/x-icon.svg'
import minusIcon from '../../assets/minus-icon.svg'
import changeHistoryOperationsIcon from '../../assets/change-history-operations-icon.svg'
import clsx from 'clsx'
import { IconButton } from '@shared/ui'

const HEAD_CELLS = [
  { id: 'selection', label: 'Selection', widthClass: '!w-[93px]' },
  {
    id: 'model-id',
    label: 'Model / Model ID / Run ID',
    widthClass: 'w-[500px]',
  },
  { id: 'status', label: 'Status', widthClass: '!w-[93px]' },
  { id: 'confidence', label: 'Confidence', widthClass: '!w-[93px]' },
  { id: 'run-by', label: 'Run by', widthClass: 'w-auto' },
  { id: 'timestamp', label: 'Timestamp', widthClass: 'w-auto' },
]

const SEGMENT_COLUMNS = [
  { id: 'segment-id', label: 'Segment ID', widthClass: '!w-[93px]' },
  { id: 'segment-label', label: 'Segment Label', widthClass: 'w-[407px]' },
  { id: 'segment-status', label: 'Status', widthClass: '!w-[93px]' },
  { id: 'segment-confidence', label: 'Confidence', widthClass: '!w-[93px]' },
  {
    id: 'emp1',
    label: '',
    widthClass:
      'w-auto bg-[#F1F1F1] border-b-0 border-[#F1F1F1] border-r-[#D3D3D3]',
  },
  {
    id: 'emp2',
    label: '',
    widthClass:
      'w-auto bg-[#F1F1F1] border-b-0 border-[#F1F1F1] border-r-[#D3D3D3]',
  },
]

const statusVisual: Record<RunHistoryStatus, { icon: string; label: string }> =
  {
    success: {
      icon: checkRoundedIcon,
      label: 'Completed',
    },
    failed: {
      icon: xIcon,
      label: 'Failed',
    },
    pending: {
      icon: changeHistoryOperationsIcon,
      label: 'Pending',
    },
    warning: {
      icon: minusIcon,
      label: 'Warning',
    },
  }

const STATUS_CELL_CLASS =
  'whitespace-nowrap border-b border-1 border-[#D3D3D3] px-2 py-1 text-[12px] text-[#333333]'

const MAIN_CELL_CLASS =
  'border-b border-[#D3D3D3] border-1 text-[12px] text-[#292929] align-center'

const RUN_HISTORY_HEADER_CELL_CLASS =
  'border-b border-[#CCD6E2] border-t border-white px-2 py-2 text-left text-[12px] font-semibold text-[#344D6B]'

const SEGMENT_HEADER_CELL_CLASS =
  'border-b border-[#D3D3D3] border-1 px-2 py-1 text-left text-[11px] font-medium text-[#4E4E4E]'

const SEGMENT_BODY_CELL_CLASS =
  'border-b border-[#E1E1E1] border-1 px-2 py-1 text-[11px] text-[#333333]'

const renderExpandIcon = (expanded: boolean, alt: string) => (
  <img
    src={arrowRightIcon}
    alt={alt}
    className={`h-[8px] w-[8px] shrink-0 transition-transform ${expanded ? 'rotate-90' : ''} ${alt === 'expand model' ? 'ml-[-3px]' : ''}`}
  />
)

const renderStatusCell = (
  status: RunHistoryStatus,
  reportUrl: string | null,
  hideLabel = false
) => {
  const visual = statusVisual[status]

  return (
    <div className='inline-flex items-center gap-1.5'>
      <img src={visual.icon} alt={visual.label} className='h-[12px] w-[12px]' />
      {!hideLabel && (
        <span className='text-[11px] text-[#4B4B4B]'>{visual.label}</span>
      )}
      {reportUrl && (
        <a
          className='text-[11px] text-[#2A5DB0] underline hover:text-[#163A7A]'
          href={reportUrl}
          target='_blank'
          rel='noreferrer'
        >
          [report]
        </a>
      )}
    </div>
  )
}

const renderFileName = (file: RunHistoryFileDto) => (
  <span className='inline-flex gap-1'>
    <span>{file.fileName}</span>
    {file.fileUrl && (
      <a
        href={file.fileUrl}
        target='_blank'
        rel='noreferrer'
        className='text-[#2A5DB0] underline hover:text-[#163A7A]'
      >
        [link]
      </a>
    )}
  </span>
)

const SegmentTable: React.FC<{ segments: RunHistorySegmentDto[] }> = ({
  segments,
}) => {
  return (
    <div className='ml-[-0.5px] mt-[-1px] mb-[-1px] bg-[#FFFFFF]'>
      <table className='w-full border-collapse table-fixed border-0'>
        <thead>
          <tr>
            {SEGMENT_COLUMNS.map(column => (
              <th
                key={column.id}
                className={clsx(SEGMENT_HEADER_CELL_CLASS, column.widthClass)}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {segments.map(segment => (
            <tr key={segment.id}>
              <td className={clsx(SEGMENT_BODY_CELL_CLASS, 'text-left')}>
                {segment.segmentId}
              </td>
              <td className={clsx(SEGMENT_BODY_CELL_CLASS, 'text-left')}>
                {segment.segmentLabel}
              </td>
              <td className={SEGMENT_BODY_CELL_CLASS}>
                {renderStatusCell(segment.status, segment.reportUrl, true)}
              </td>
              <td className={SEGMENT_BODY_CELL_CLASS}>
                {segment.confidence ?? '/'}
              </td>
              <td className={'border-r border-[#D3D3D3] bg-[#F1F1F1]'} />
              <td className={'border-r border-[#D3D3D3] bg-[#F1F1F1]'} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const FileSegmentsRow: React.FC<{
  runId: string
  file: RunHistoryFileDto
  expanded: boolean
}> = ({ runId, file, expanded }) => {
  const { data: segments, isLoading } = useRunFileSegments(
    expanded ? runId : null,
    expanded ? file.fileId : null
  )

  if (!expanded) return null

  if (isLoading && !segments) {
    return (
      <tr className='bg-[#F1F1F1] !border-l border-[#D3D3D3]'>
        <td className='px-2 py-2 !border-l border-[#D3D3D3]' />
        <td
          className='border-b-0 border-[#D3D3D3] py-2 text-[11px] text-[#5F6A74]'
          colSpan={5}
        >
          Loading segments…
        </td>
      </tr>
    )
  }

  if (!segments || segments.length === 0) {
    return null
  }

  return (
    <tr className='bg-[#F1F1F1] !border-l border-[#D3D3D3]'>
      <td className='px-2 py-2 !border-l border-[#D3D3D3]' />
      <td className='border-b-0 border-[#D3D3D3] py-0' colSpan={5}>
        <div className='pl-0 w-[100%] min-w-[auto]'>
          <SegmentTable segments={segments} />
        </div>
      </td>
    </tr>
  )
}

export const RunHistoryTable: React.FC = () => {
  const { data: payload, isLoading, isError } = useRunHistory({})
  const data = payload ?? {
    generatedAt: '',
    total: 0,
    page: 1,
    limit: 50,
    items: [],
  }

  const [expandedModels, setExpandedModels] = React.useState<
    Record<string, boolean>
  >({})
  const [expandedFiles, setExpandedFiles] = React.useState<
    Record<string, boolean>
  >({})

  React.useEffect(() => {
    if (payload?.items && payload.items.length > 0) {
      setExpandedModels(prev => {
        if (Object.keys(prev).length > 0) return prev
        return { [payload.items[0].id]: true }
      })
    }
  }, [payload])

  const toggleModel = React.useCallback((modelId: string) => {
    setExpandedModels(previous => ({
      ...previous,
      [modelId]: !previous[modelId],
    }))
  }, [])

  const toggleFile = React.useCallback((fileId: string) => {
    setExpandedFiles(previous => ({
      ...previous,
      [fileId]: !previous[fileId],
    }))
  }, [])

  const renderModelRow = (item: RunHistoryItemDto) => {
    const modelExpanded = !!expandedModels[item.id]

    return (
      <React.Fragment key={item.id}>
        {/* bg-[#DFDFDF]  */}
        <tr className='bg-[#F1F1F1] hover:bg-[#ECEFF3]'>
          <td className={clsx(MAIN_CELL_CLASS, 'border-b-0')}>
            <div className='inline-flex items-center gap-1'>
              <IconButton
                size='small'
                sx={{ background: '#BCDDFF', p: '5px' }}
                onClick={() => {}}
              >
                <img
                  src={downloadIcon}
                  alt='selection count'
                  className='h-[8px] w-[8px] mt-[-1px]'
                />
              </IconButton>
              <span className='text-[11px] text-[#2F3F54]'>
                {item.selectionCount}
              </span>
              <img src={imageIcon} alt='edit' className='h-[12px] w-[12px]' />
              <img
                src={changeHistoryIcon}
                alt='history operations'
                className='h-[12px] w-[12px]'
              />
            </div>
          </td>
          <td className={clsx(MAIN_CELL_CLASS, '!bg-[#DFDFDF]')}>
            <div className='flex items-center gap-0'>
              <button
                type='button'
                onClick={() => toggleModel(item.id)}
                className='inline-flex items-center gap-1 text-left !pr-0.5'
                aria-label={`Toggle ${item.modelName} details`}
              >
                {renderExpandIcon(modelExpanded, 'expand model')}
                <span className='text-[12px] font-medium text-[#2E2E2E] text-nowrap'>
                  {item.modelName}
                </span>
              </button>
              {item.modelUrl && (
                <a
                  href={item.modelUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='text-[11px] text-[#2A5DB0] underline'
                >
                  [link]
                </a>
              )}
              <div className='ml-auto flex items-center gap-4 pr-2 text-[11px] text-[#292929] font-medium'>
                <span className='text-left w-[100px]'>
                  {item.modelExecutionId}
                </span>
                <span className='text-left w-[60px]'>Run: {item.runId}</span>
              </div>
            </div>
          </td>
          <td className={STATUS_CELL_CLASS}>
            {renderStatusCell(
              item.status,
              item.modelUrl ? `${item.modelUrl}#report` : null,
              true
            )}
          </td>
          <td className={STATUS_CELL_CLASS}>
            {item.confidence != null ? `${item.confidence} [agg]` : '/'}
          </td>
          <td className={clsx(STATUS_CELL_CLASS, 'border-b-0')}>
            {item.runBy}
          </td>
          <td className={clsx(STATUS_CELL_CLASS, 'border-b-0')}>
            <div className='text-[11px] text-nowrap text-[#292929]'>
              {formatRunTimestamp(item.startedAt)}
              {', '}
              {formatDurationMs(item.durationMs)}
            </div>
          </td>
        </tr>

        {modelExpanded &&
          item.files.map(file => {
            const fileExpanded = !!expandedFiles[file.id]

            return (
              <React.Fragment key={file.id}>
                <tr className={clsx('bg-[#F1F1F1]')}>
                  <td
                    className={clsx(
                      MAIN_CELL_CLASS,
                      'bg-[#F1F1F1] border-none'
                    )}
                  />
                  <td className={clsx(MAIN_CELL_CLASS, 'bg-[#F1F1F1]')}>
                    <div className='flex items-center gap-1 pl-3'>
                      {file.hasSegments && (
                        <button
                          type='button'
                          onClick={() => toggleFile(file.id)}
                          className='inline-flex items-center gap-1 text-left text-[11px] text-[#2F2F2F] !pl-0 !pr-0'
                        >
                          {renderExpandIcon(fileExpanded, 'expand file')}
                        </button>
                      )}
                      {/* {!hasSegments && (
                        <span className='inline-flex items-center opacity-50'>
                          {renderExpandIcon(false, 'no children')}
                        </span>
                      )} */}
                      <div className='text-[11px] text-[#2F2F2F] flex items-center gap-1'>
                        <span
                          className={clsx(
                            'mr-1 text-[#5F6A74] border-r border-[#D3D3D3] px-0 py-1.5 w-20 text-left',
                            file.hasSegments ? 'border-r-0' : ''
                          )}
                        >
                          {file.imageLabel}
                        </span>
                        {renderFileName(file)}
                      </div>
                    </div>
                  </td>
                  <td className={clsx(MAIN_CELL_CLASS, 'bg-[#F1F1F1]')}>
                    {renderStatusCell(file.status, file.reportUrl, true)}
                  </td>
                  <td className={clsx(MAIN_CELL_CLASS, 'bg-[#F1F1F1]')}>
                    {file.confidence != null ? `${file.confidence} [agg]` : '/'}
                  </td>
                  <td
                    className={
                      STATUS_CELL_CLASS +
                      ' bg-[#F1F1F1] border-t-0 border-b-0 border-l-0 border-r border-[#D3D3D3]'
                    }
                  ></td>
                  <td
                    className={
                      STATUS_CELL_CLASS +
                      ' bg-[#F1F1F1] border-t-0 border-b-0 border-l-0 border-r border-[#D3D3D3]'
                    }
                  ></td>
                </tr>
                {file.hasSegments && (
                  <FileSegmentsRow
                    runId={item.id}
                    file={file}
                    expanded={fileExpanded}
                  />
                )}
              </React.Fragment>
            )
          })}
      </React.Fragment>
    )
  }

  if (isLoading && !payload) {
    return (
      <div className='overflow-hidden rounded-lg !bg-[#EAEAEA] mt-20 px-4 py-3 text-[12px] text-[#5F6A74]'>
        Loading run history…
      </div>
    )
  }

  if (isError && !payload) {
    return (
      <div className='overflow-hidden rounded-lg !bg-[#EAEAEA] mt-20 px-4 py-3 text-[12px] text-[#C0392B]'>
        Couldn't load run history
      </div>
    )
  }

  if (data.items.length === 0) {
    return (
      <div className='overflow-hidden rounded-lg !bg-[#EAEAEA] mt-20 px-4 py-3 text-[12px] text-[#5F6A74]'>
        No model runs yet
      </div>
    )
  }

  return (
    <div className='overflow-hidden rounded-lg !bg-[#EAEAEA] mt-20'>
      <div className='max-h-[75vh] overflow-auto mt-[-1px]'>
        <table className='w-full min-w-[980px] border-collapse table-fixed'>
          <thead>
            <tr className='bg-[#DEE8F3] rounded'>
              {HEAD_CELLS.map((headCell, index) => {
                return (
                  <th
                    key={`${headCell.id}-${index}`}
                    className={clsx(
                      RUN_HISTORY_HEADER_CELL_CLASS,
                      headCell.widthClass,
                      'first:rounded-l-lg last:rounded-r-lg'
                    )}
                  >
                    {headCell.label}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>{data.items.map(item => renderModelRow(item))}</tbody>
        </table>
      </div>
    </div>
  )
}
