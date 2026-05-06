import React, { useMemo } from 'react'
import { CustomAccordion, CustomDrawer } from '@shared/ui'
import imageEnhancementIcon from '../../assets/image-enhancement.svg'
import layoutIdentificationIcon from '../../assets/layout-indetification.svg'
import ocrIcon from '../../assets/ocr-icon.svg'
import postOcrIcon from '../../assets/post-ocr-icon.svg'
import segmentManagementIcon from '../../assets/segment-management-icon.svg'
import exportIcon from '../../assets/export.svg'
import batchIcon from '../../assets/batch-icon.svg'
import {
  ImageEnhancement,
  LayoutIdentification,
  SegmentManagement,
  OpticalCharacterRecognition,
  PostOCRCorrection,
  Export,
} from './sections'
import {
  FileStatus,
  type AiModelDictionary,
  type OcrProcessingResultDto,
  type PostOcrCorrectionProcessingResultDto,
} from '../../api'
import type { SimpleAnnotation, AnnotationBounds } from '@shared/ui'
import { UserBadge } from '../shared'
import HoverIcon from '../helpers/HoverIcon'
import { useBatchSelection } from '../../context/BatchSelectionContext'
import { ActiveSelectionModal } from './modals/ActiveSelectionModal'
import { useNavigate, useSearchParams } from 'react-router'

export type RightDrawerProps = {
  width?: number
  collapsed?: boolean
  setCollapsed: (collapsed: boolean) => void
  aiModels: AiModelDictionary
  imageWidth?: number
  imageHeight?: number
  selectedImagePath?: string | null
  selectedImageFileName?: string | null
  onImageEnhancementSuccess?: () => void
  onLayoutIdentificationComplete?: (annotations: SimpleAnnotation[]) => void
  onAddSegment?: () => void
  selectedAnnotation?: SimpleAnnotation | null
  onEditAnnotation?: (id: string, bounds: AnnotationBounds) => void
  onFinalizeSegmentation?: () => void
  fileStatus?: string | null
  onOcrComplete?: (result: OcrProcessingResultDto) => void
  selectedSegmentId?: string | null
  onSegmentProcessingSuccess?: () => void
  imageModified?: boolean
  onRevertImageEnhancement?: () => void
  isRevertingImageEnhancement?: boolean
  onRevertLayoutIdentification?: () => void
  onRevertSegmentation?: () => void
  isRevertingSegmentation?: boolean
  onRevertOcr?: () => void
  isRevertingOcr?: boolean
  onPostOcrComplete?: (result: PostOcrCorrectionProcessingResultDto) => void
  onRevertPostOcr?: () => void
  isRevertingPostOcr?: boolean
  layoutAnnotationsCount?: number
  selectedFileId?: string | null
}

export const RightDrawer: React.FC<RightDrawerProps> = ({
  width,
  collapsed = false,
  setCollapsed,
  aiModels,
  imageWidth = 0,
  imageHeight = 0,
  selectedImagePath = null,
  selectedImageFileName = null,
  onImageEnhancementSuccess,
  onLayoutIdentificationComplete,
  onAddSegment,
  selectedAnnotation = null,
  onEditAnnotation,
  onFinalizeSegmentation,
  fileStatus = null,
  onOcrComplete,
  selectedSegmentId = null,
  onSegmentProcessingSuccess,
  imageModified,
  onRevertImageEnhancement,
  isRevertingImageEnhancement,
  onRevertLayoutIdentification,
  onRevertSegmentation,
  isRevertingSegmentation,
  onRevertOcr,
  isRevertingOcr,
  onPostOcrComplete,
  onRevertPostOcr,
  isRevertingPostOcr,
  layoutAnnotationsCount,
  selectedFileId = null,
}) => {
  const { selectedFiles, removeFile, clearAll, batchStatus } =
    useBatchSelection()
  const [activeSelectionModalOpen, setActiveSelectionModalOpen] =
    React.useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const isBatchMode = selectedFiles.length > 0

  const isImageOpen = Boolean(selectedImageFileName)
  const segmentationFinalized = fileStatus === 'SEGMENTED'
  const ocrCompleted = fileStatus === 'OCR_COMPLETED'
  const postOcrCompleted = fileStatus === 'POST_OCR_COMPLETED'
  const [imageEnhancementDone, setImageEnhancementDone] = React.useState(false)
  const [layoutIdentificationDone, setLayoutIdentificationDone] =
    React.useState(false)
  const wasCompletedRef = React.useRef(false)

  // Reset steps when image changes or image mode exits
  React.useEffect(() => {
    wasCompletedRef.current = false
    setImageEnhancementDone(false)
    setLayoutIdentificationDone(false)
    setCollapsed(!selectedImageFileName)
  }, [selectedImageFileName]) //eslint-disable-line

  React.useEffect(() => {
    const isCompleted = ocrCompleted || postOcrCompleted
    if (isCompleted && !wasCompletedRef.current) {
      setCollapsed(true)
    }
    wasCompletedRef.current = isCompleted
  }, [ocrCompleted, postOcrCompleted]) //eslint-disable-line

  const handleEnhancementSuccess = React.useCallback(() => {
    setImageEnhancementDone(true)
    onImageEnhancementSuccess?.()
  }, [onImageEnhancementSuccess])

  const handleRevertImageEnhancementLocal = React.useCallback(() => {
    setImageEnhancementDone(false)
    onRevertImageEnhancement?.()
  }, [onRevertImageEnhancement])

  const handleRevertLayoutIdentificationLocal = React.useCallback(() => {
    setLayoutIdentificationDone(false)
    onRevertLayoutIdentification?.()
  }, [onRevertLayoutIdentification])

  const bothFirstStepsDone = imageEnhancementDone && layoutIdentificationDone

  const content = useMemo(() => {
    return [
      {
        label: 'Active Selection',
        icon: batchIcon,
        component: () => (
          <div className='flex items-center justify-between'>
            <p className='text-[10px]'>{selectedFiles.length} Images</p>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setActiveSelectionModalOpen(true)}
                className='flex items-center !p-0 hover:opacity-70'
              >
                <HoverIcon name='eye-icon' width={14} alt='View' />
              </button>
              <button
                type='button'
                onClick={clearAll}
                className='flex items-center !p-0 hover:opacity-70'
              >
                <HoverIcon name='trash-can-icon' width={14} alt='Clear' />
              </button>
            </div>
          </div>
        ),
        hide: isImageOpen,
      },
      {
        label: 'Image Enhancement',
        icon: imageEnhancementIcon,
        defaultExpanded: isImageOpen && !imageEnhancementDone,
        disabled: isBatchMode
          ? batchStatus !== FileStatus.INITIALIZED
          : !selectedImageFileName ||
            segmentationFinalized ||
            ocrCompleted ||
            postOcrCompleted,
        expanded: (
          isBatchMode
            ? batchStatus !== FileStatus.INITIALIZED
            : segmentationFinalized || ocrCompleted || postOcrCompleted
        )
          ? false
          : undefined,
        component: () => (
          <ImageEnhancement
            models={aiModels.imageEnhancement}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            selectedImagePath={selectedImagePath}
            selectedImageFileName={selectedImageFileName}
            onImageEnhancementSuccess={handleEnhancementSuccess}
            onUndo={handleRevertImageEnhancementLocal}
            isUndoing={isRevertingImageEnhancement}
            imageModified={imageModified}
          />
        ),
      },
      {
        label: 'Layout Identification',
        icon: layoutIdentificationIcon,
        disabled: isBatchMode
          ? batchStatus !== FileStatus.INITIALIZED
          : !selectedImageFileName ||
            segmentationFinalized ||
            ocrCompleted ||
            postOcrCompleted,
        expanded: (
          isBatchMode
            ? batchStatus !== FileStatus.INITIALIZED
            : segmentationFinalized || ocrCompleted || postOcrCompleted
        )
          ? false
          : undefined,
        component: () => (
          <LayoutIdentification
            models={aiModels.layoutIdentification}
            selectedImagePath={selectedImagePath}
            selectedImageFileName={selectedImageFileName}
            onComplete={segments => {
              setLayoutIdentificationDone(true)
              onLayoutIdentificationComplete?.(segments)
            }}
            onAddSegment={onAddSegment}
            selectedAnnotation={selectedAnnotation}
            onEditAnnotation={onEditAnnotation}
            onFinalizeSegmentation={onFinalizeSegmentation}
            onUndo={handleRevertLayoutIdentificationLocal}
            layoutAnnotationsCount={layoutAnnotationsCount}
          />
        ),
      },
      {
        label: 'Segment Management',
        icon: segmentManagementIcon,
        disabled: !segmentationFinalized || ocrCompleted || postOcrCompleted,
        expanded: segmentationFinalized && !ocrCompleted && !postOcrCompleted,
        defaultExpanded:
          segmentationFinalized && !ocrCompleted && !postOcrCompleted,
        component: () => (
          <SegmentManagement
            models={aiModels.segmentManagement ?? []}
            selectedSegmentId={selectedSegmentId}
            onAdjustSuccess={onSegmentProcessingSuccess}
            onProcessSuccess={onSegmentProcessingSuccess}
            onUndoSegmentation={onRevertSegmentation}
            isUndoingSegmentation={isRevertingSegmentation}
            fileStatus={fileStatus}
          />
        ),
        hide: isBatchMode || !selectedImageFileName,
      },
      {
        label: 'Optical Character Recognition',
        icon: ocrIcon,
        disabled: isBatchMode
          ? batchStatus !== FileStatus.SEGMENTED
          : !selectedImageFileName ||
            !segmentationFinalized ||
            ocrCompleted ||
            postOcrCompleted,
        expanded: isBatchMode
          ? batchStatus === FileStatus.SEGMENTED
          : segmentationFinalized && !ocrCompleted && !postOcrCompleted,
        defaultExpanded:
          segmentationFinalized && !ocrCompleted && !postOcrCompleted,
        component: () => (
          <OpticalCharacterRecognition
            models={aiModels.ocr}
            selectedImagePath={selectedImagePath}
            selectedImageFileName={selectedImageFileName}
            onOcrComplete={onOcrComplete}
            onUndo={onRevertOcr}
            isUndoing={isRevertingOcr}
            fileStatus={fileStatus}
          />
        ),
      },
      {
        label: 'Post-OCR Correction',
        icon: postOcrIcon,
        disabled: isBatchMode
          ? batchStatus !== FileStatus.OCR_COMPLETED
          : !selectedImageFileName || (!ocrCompleted && !postOcrCompleted),
        expanded: isBatchMode
          ? batchStatus === FileStatus.OCR_COMPLETED ||
            batchStatus === FileStatus.POST_OCR_COMPLETED
          : ocrCompleted || postOcrCompleted,
        defaultExpanded: ocrCompleted || postOcrCompleted,
        component: () => (
          <PostOCRCorrection
            models={aiModels.postOcrCorrection}
            selectedImagePath={selectedImagePath}
            selectedImageFileName={selectedImageFileName}
            onPostOcrComplete={onPostOcrComplete}
            onUndo={onRevertPostOcr}
            isUndoing={isRevertingPostOcr}
            fileStatus={fileStatus}
          />
        ),
      },
      {
        label: 'Export',
        icon: exportIcon,
        disabled: isBatchMode
          ? batchStatus !== FileStatus.POST_OCR_COMPLETED
          : !selectedImageFileName || !postOcrCompleted,
        component: () => <Export fileId={selectedFileId} />,
      },
    ]
  }, [
    aiModels,
    imageWidth,
    imageHeight,
    selectedImagePath,
    selectedImageFileName,
    isImageOpen,
    imageEnhancementDone,
    bothFirstStepsDone,
    handleEnhancementSuccess,
    onLayoutIdentificationComplete,
    onAddSegment,
    selectedAnnotation,
    onEditAnnotation,
    onFinalizeSegmentation,
    segmentationFinalized,
    ocrCompleted,
    onOcrComplete,
    selectedSegmentId,
    onSegmentProcessingSuccess,
    handleRevertImageEnhancementLocal,
    isRevertingImageEnhancement,
    imageModified,
    handleRevertLayoutIdentificationLocal,
    layoutAnnotationsCount,
    onRevertSegmentation,
    isRevertingSegmentation,
    fileStatus,
    onRevertOcr,
    isRevertingOcr,
    onPostOcrComplete,
    onRevertPostOcr,
    isRevertingPostOcr,
    postOcrCompleted,
    selectedFileId,
    selectedFiles,
    clearAll,
    isBatchMode,
    batchStatus,
  ])

  return (
    <CustomDrawer collapsed={collapsed} width={width} anchor='right'>
      <UserBadge
        collapsed={collapsed}
        name='Test User'
        onToggle={() => setCollapsed(!collapsed)}
      />
      <hr className='border-t-[0.5px] border-[#BCDDFF]' />

      <div>
        {/*TODO batch should not be visible always so check should we leave it here outside of RIGHT_DRAWER_MAP or make some additional config */}
        {/*<CustomAccordion text={'Batch'}>*/}
        {/*  <div className='px-1'>Batch</div>*/}
        {/*</CustomAccordion>*/}

        {content.map(
          ({
            label,
            icon,
            component: Component,
            disabled,
            defaultExpanded,
            expanded,
            hide,
          }) => {
            if (hide) return null

            if (collapsed) {
              return (
                <div
                  key={label}
                  className='w-full flex items-center justify-center h-10 cursor-pointer border-b-[0.5px] border-[#BCDDFF] py-6'
                  onClick={() => setCollapsed(false)}
                >
                  <img src={icon} alt={label} />
                </div>
              )
            }

            return (
              <CustomAccordion
                key={label}
                text={label}
                disabled={!!disabled}
                defaultExpanded={!!defaultExpanded}
                expanded={expanded}
              >
                {Component()}
              </CustomAccordion>
            )
          }
        )}
      </div>
      <ActiveSelectionModal
        open={activeSelectionModalOpen}
        onClose={() => setActiveSelectionModalOpen(false)}
        files={selectedFiles}
        onRemoveFile={removeFile}
        onViewFile={file => {
          setActiveSelectionModalOpen(false)
          const params = new URLSearchParams(searchParams)
          params.set('path', file.path)
          params.set('image', `${file.path}/${file.fileName}`)
          navigate({ pathname: '/', search: params.toString() })
        }}
      />
    </CustomDrawer>
  )
}
