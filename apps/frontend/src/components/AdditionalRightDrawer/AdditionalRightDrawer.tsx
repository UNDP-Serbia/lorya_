import React from 'react'
import {
  CustomAccordion,
  CustomDrawer,
  CustomSwitcher,
  LabeledSlider,
} from '@shared/ui'
import fastForwardIcon from '../../assets/fast-forward-icon.svg'
import textIcon from '../../assets/text-icon.svg'
import clsx from 'clsx'
import type { OcrEditorSegment } from '../../api'

export type AdditionalRightDrawerProps = {
  width?: number
  setWidth: (w: number) => void
  collapsed?: boolean
  offset?: number
  setCollapsed: (collapsed: boolean) => void
  ocrSegments?: OcrEditorSegment[]
  postOcrSegments?: OcrEditorSegment[]
  selectedSegmentId: string | null
  activeTabOverride?: 'ocr' | 'ocr_corrector' | null
  onTabOverrideApplied?: () => void
  onSaveOcrWordEdit?: (
    segmentId: string,
    lineId: number,
    wordIndex: number,
    newText: string
  ) => void
  onSavePostOcrWordEdit?: (
    segmentId: string,
    lineId: number,
    wordIndex: number,
    newText: string
  ) => void
}

const DEFAULT_WIDTH = 560

type Marker = {
  color: string
  value: number
  border: boolean
}

const MIN_WIDTH = 400
const MAX_WIDTH = 600

type EditingWord = {
  segmentId: string
  lineId: number
  wordIndex: number
}

export const AdditionalRightDrawer: React.FC<AdditionalRightDrawerProps> = ({
  width = DEFAULT_WIDTH,
  setWidth,
  collapsed = false,
  setCollapsed,
  ocrSegments,
  postOcrSegments,
  selectedSegmentId,
  activeTabOverride,
  onTabOverrideApplied,
  onSaveOcrWordEdit,
  onSavePostOcrWordEdit,
}) => {
  const [activeTab, setActiveTab] = React.useState<'ocr' | 'ocr_corrector'>(
    'ocr'
  )
  const [threshold, setThreshold] = React.useState(0)
  const [isEditMode, setIsEditMode] = React.useState(true)

  const [editableOcrSegments, setEditableOcrSegments] = React.useState<
    OcrEditorSegment[]
  >([])
  const [editablePostOcrSegments, setEditablePostOcrSegments] = React.useState<
    OcrEditorSegment[]
  >([])
  const [editingWord, setEditingWord] = React.useState<EditingWord | null>(null)

  React.useEffect(() => {
    setEditableOcrSegments(ocrSegments ?? [])
  }, [ocrSegments])

  React.useEffect(() => {
    setEditablePostOcrSegments(postOcrSegments ?? [])
  }, [postOcrSegments])

  React.useEffect(() => {
    if (activeTabOverride) {
      setActiveTab(activeTabOverride)
      onTabOverrideApplied?.()
    }
  }, [activeTabOverride]) // eslint-disable-line

  const activeSegments =
    activeTab === 'ocr' ? editableOcrSegments : editablePostOcrSegments

  const activeTabRef = React.useRef(activeTab)
  activeTabRef.current = activeTab

  const handleWordEdit = React.useCallback(
    (segmentId: string, lineId: number, wordIndex: number, newText: string) => {
      const updateSegments = (prev: OcrEditorSegment[]) =>
        prev.map(seg =>
          seg.segmentId !== segmentId
            ? seg
            : {
                ...seg,
                lines: seg.lines.map(line =>
                  line.lineId !== lineId
                    ? line
                    : {
                        ...line,
                        words: line.words.map((w, idx) =>
                          idx !== wordIndex
                            ? w
                            : {
                                ...w,
                                editedText: newText,
                                isEdited: newText !== w.originalText,
                              }
                        ),
                      }
                ),
              }
        )

      if (activeTabRef.current === 'ocr') {
        setEditableOcrSegments(updateSegments)
        onSaveOcrWordEdit?.(segmentId, lineId, wordIndex, newText)
      } else {
        setEditablePostOcrSegments(updateSegments)
        onSavePostOcrWordEdit?.(segmentId, lineId, wordIndex, newText)
      }

      setEditingWord(null)
    },
    [onSaveOcrWordEdit, onSavePostOcrWordEdit]
  )

  // resize drawer logic start
  const startXRef = React.useRef<number | null>(null)
  const startWidthRef = React.useRef<number>(width)

  const onMouseMove = (e: MouseEvent) => {
    if (startXRef.current === null) return

    const delta = startXRef.current - e.clientX
    const newWidth = startWidthRef.current + delta
    document.body.style.userSelect = 'none'

    setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth)))
  }

  const onMouseUp = () => {
    startXRef.current = null
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.userSelect = ''
  }

  const onMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX
    startWidthRef.current = width

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
  // end

  const Tab = ({
    id,
    label,
  }: {
    id: 'ocr' | 'ocr_corrector'
    label: string
  }) => {
    const active = activeTab === id
    return (
      <button
        type='button'
        onClick={() => setActiveTab(id)}
        className={`flex items-center justify-center h-full !p-0 w-full text-[12px] text-center text-nowrap ${
          active ? 'underline font-bold' : 'font-normal!'
        }`}
      >
        <span>{label}</span>
      </button>
    )
  }

  const MarkerDisplay = (props: Marker) => (
    <div className='flex items-center gap-1 text-[10px] bolder'>
      {props.value?.toFixed(1) || '/'}
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

  return (
    <CustomDrawer
      collapsed={collapsed}
      collapsedWidth={120}
      width={width}
      anchor='right'
      level={1}
      sx={{ position: 'relative' }}
    >
      <div className='flex items-center justify-between h-23'>
        <button
          type='button'
          aria-label='Collapse additional drawer'
          onClick={() => setCollapsed(!collapsed)}
          className='!p-0 flex items-center justify-center w-[65px]'
        >
          <img
            src={fastForwardIcon}
            alt='Collapse'
            width={18}
            style={{ transform: collapsed ? 'rotate(180deg)' : '' }}
          />
        </button>

        {!collapsed && (
          <div
            onMouseDown={onMouseDown}
            className='
              absolute left-0 top-0 h-full w-2
              cursor-ew-resize
              hover:bg-[#BCDDFF]/40
              z-50
            '
          />
        )}

        {!collapsed && (
          <>
            <div className='h-full w-[0.5px] bg-[#BCDDFF]' />
            <div className='flex items-center gap-3 h-full w-full'>
              <Tab id='ocr' label='OCR' />
              <div className='h-full w-px bg-[#BCDDFF]' />
              <Tab id='ocr_corrector' label='OCR corrector' />
            </div>
            {/* right spacer to keep symmetry */}
            <div style={{ width: 32 }} />
          </>
        )}
      </div>

      <div className='border-t-[0.5px] border-[#BCDDFF]' />
      {!collapsed && (
        <>
          <div className='flex w-full items-center gap-0 pr-[18px]'>
            <div className='px-4 py-2.5 w-full'>
              <LabeledSlider
                label='Threshold'
                value={threshold}
                onChange={(v: number) => setThreshold(v)}
                min={0}
                max={100}
                step={1}
                labelStart={true}
                inputEnd={true}
              />
            </div>
            <CustomSwitcher checked={isEditMode} onChange={setIsEditMode} />
          </div>
        </>
      )}

      {collapsed && (
        <>
          <div className='border rounded border-[#BCDDFF] text-[11px] text-[#292929] my-[15px] mx-1'>
            {threshold}
          </div>
        </>
      )}

      <div className='border-t-[0.5px] border-[#BCDDFF]' />

      <div
        className={clsx(collapsed ? 'overflow-hidden' : 'overflow-auto')}
        style={{ maxHeight: 'calc(100vh - 160px)' }}
      >
        {activeSegments.map((segment, idx) => (
          <div key={segment.segmentId} className='relative'>
            <CustomAccordion
              text={`Text ${idx + 1}`}
              sx={{ pointerEvents: collapsed ? 'none' : 'auto' }}
              defaultExpanded={selectedSegmentId === segment.segmentId}
              leadingIcon={
                <img
                  src={textIcon}
                  alt='Text icon'
                  className={clsx(collapsed && 'pt-4')}
                />
              }
              iconPosition='start'
              absoluteMarker={
                !collapsed && (
                  <div className='flex items-center gap-2 mb-2 justify-end pr-2 absolute top-4 right-3 z-99999'>
                    <MarkerDisplay
                      color='#BCDDFF'
                      value={segment.statistics.avg_word_confidence}
                      border={true}
                    />
                    <MarkerDisplay
                      color='#BCDDFF'
                      value={segment.statistics.min_word_confidence}
                      border={true}
                    />
                    <MarkerDisplay
                      color='#BCDDFF'
                      value={segment.statistics.max_word_confidence}
                      border={true}
                    />
                  </div>
                )
              }
            >
              {!collapsed && (
                <div
                  className='px-2 font-roboto text-[13px] text-[#292929] leading-6'
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {segment.lines.map(line => (
                    <div
                      key={`${segment.segmentId}-${line.lineId}`}
                      className='text-[13px] text-[#292929] leading-6'
                    >
                      <span className='text-gray-400 mr-1 select-none'>
                        {line.lineId}.
                      </span>
                      {line.words.map((word, wIdx) => {
                        const isCurrentlyEditing =
                          editingWord?.segmentId === segment.segmentId &&
                          editingWord?.lineId === line.lineId &&
                          editingWord?.wordIndex === wIdx

                        const diff = threshold - word.confidence
                        const isHighlighted = word.confidence < threshold

                        const opacity = isHighlighted
                          ? 0.2 + (diff / threshold) * 0.8
                          : 0

                        if (isEditMode && isCurrentlyEditing) {
                          return (
                            <InlineWordInput
                              key={`${segment.segmentId}-${line.lineId}-${wIdx}-editing`}
                              defaultValue={word.editedText}
                              onCommit={newText =>
                                handleWordEdit(
                                  segment.segmentId,
                                  line.lineId,
                                  wIdx,
                                  newText
                                )
                              }
                            />
                          )
                        }

                        return (
                          <span
                            key={`${segment.segmentId}-${line.lineId}-${wIdx}`}
                            className={clsx(
                              'rounded-[3px] px-[1px] mr-[1px]',
                              isEditMode && 'cursor-text'
                            )}
                            style={{
                              backgroundColor: isHighlighted
                                ? `rgba(188,221,255,${opacity})`
                                : 'transparent',
                            }}
                            onDoubleClick={
                              isEditMode
                                ? e => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setEditingWord({
                                      segmentId: segment.segmentId,
                                      lineId: line.lineId,
                                      wordIndex: wIdx,
                                    })
                                  }
                                : undefined
                            }
                          >
                            {!isEditMode ? (
                              <span>{word.originalText}</span>
                            ) : word.isEdited ? (
                              <>
                                <span className='line-through text-[#FF8C00]'>
                                  {word.originalText}
                                </span>{' '}
                                <span className='text-[#FF8C00]'>
                                  {word.editedText}
                                </span>
                              </>
                            ) : (
                              <span>{word.editedText}</span>
                            )}
                            {wIdx < line.words.length - 1 ? ' ' : ''}
                          </span>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </CustomAccordion>
          </div>
        ))}
      </div>
    </CustomDrawer>
  )
}

const InlineWordInput: React.FC<{
  defaultValue: string
  onCommit: (value: string) => void
}> = ({ defaultValue, onCommit }) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const committedRef = React.useRef(false)
  const blurTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  React.useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    }
  }, [])

  const commit = () => {
    if (committedRef.current) return
    committedRef.current = true
    const val = inputRef.current?.value ?? defaultValue
    onCommit(val)
  }

  return (
    <input
      ref={inputRef}
      type='text'
      defaultValue={defaultValue}
      className='border border-[#FF8C00] rounded px-1 text-[13px] text-[#292929] outline-none bg-white'
      style={{ width: `${Math.max(defaultValue.length + 2, 4)}ch` }}
      onBlur={() => {
        blurTimeoutRef.current = setTimeout(commit, 0)
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') {
          committedRef.current = true
          onCommit(defaultValue)
        }
      }}
    />
  )
}
