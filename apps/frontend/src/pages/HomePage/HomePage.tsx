import React from 'react'
import {
  FileManager,
  LeftDrawer,
  RightDrawer,
  AdditionalRightDrawer,
} from '../../components'
import {
  BatchSelectionProvider,
  useBatchSelection,
} from '../../context/BatchSelectionContext'
import './HomePage.scss'
import {
  useAiModels,
  useFileManagerEntries,
  useCropSegments,
  useFileSegments,
  usePrefetchFileSegments,
  useFileOcrResults,
  useFilePostOcrCorrectionResults,
  useRevertImageEnhancement,
  useRevertSegmentation,
  useRevertOcr,
  useRevertPostOcrCorrection,
  useRevertSegment,
  useResetFile,
  useOcrSaveWordEdit,
  usePostOcrSaveWordEdit,
} from '../../query'
import { FileManagerQueryKeys } from '../../query'
import { SegmentManagementQueryKeys } from '../../query'
import { OcrQueryKeys } from '../../query'
import { PostOcrCorrectionQueryKeys } from '../../query'
import {
  type OcrProcessingResultDto,
  type PostOcrCorrectionProcessingResultDto,
  LabelType,
  toEditorSegments,
  FileStatus,
  type FileManagerEntry,
} from '../../api'
import { useSearchParams, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { type SimpleAnnotation, type AnnotationBounds } from '@shared/ui'
import { v4 as uuidv4 } from 'uuid'

export const LEFT_WIDTH = 263
const COLLAPSED = 64
const RIGHT_WIDTH = 263
const ADDITIONAL_RIGHT_WIDTH = 560

const HomePageInner: React.FC = () => {
  const [leftCollapsed, setLeftCollapsed] = React.useState(false)
  const [rightCollapsed, setRightCollapsed] = React.useState(true)
  const [additionalRightCollapsed, setAdditionalRightCollapsed] =
    React.useState(true)

  const currentLeft = leftCollapsed ? COLLAPSED : LEFT_WIDTH
  const currentRight = rightCollapsed ? COLLAPSED : RIGHT_WIDTH
  const currentAdditionalRight = !additionalRightCollapsed
    ? 0
    : ADDITIONAL_RIGHT_WIDTH
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedPath = searchParams.get('path') || '/'
  const imageParam = searchParams.get('image') || null
  const selectedImageFileName = imageParam
    ? imageParam.slice(imageParam.lastIndexOf('/') + 1)
    : null

  const queryClient = useQueryClient()

  const { data: treeRoot } = useFileManagerEntries()
  const {
    data: entries,
    isLoading,
    isError,
  } = useFileManagerEntries({ path: selectedPath })

  const { data: entriesRoot } = useFileManagerEntries()

  const { updateFileStatuses } = useBatchSelection()

  React.useEffect(() => {
    if (entries) {
      updateFileStatuses(entries)
    }
  }, [entries, updateFileStatuses])

  const selectedFileEntry = React.useMemo(() => {
    if (!selectedImageFileName || !entries) return null
    const findFile = (items: FileManagerEntry[]): FileManagerEntry | null => {
      for (const item of items) {
        if (item.type === 'file' && item.name === selectedImageFileName)
          return item
        if (item.children) {
          const found = findFile(item.children)
          if (found) return found
        }
      }
      return null
    }
    return findFile(entries)
  }, [entries, selectedImageFileName])

  const fileStatus = selectedFileEntry?.status ?? null
  const selectedFileId = selectedFileEntry?.fileId ?? null

  const hasSegments =
    fileStatus === FileStatus.SEGMENTED ||
    fileStatus === FileStatus.OCR_COMPLETED ||
    fileStatus === FileStatus.POST_OCR_COMPLETED ||
    fileStatus === FileStatus.COMPLETED

  const { data: fetchedSegments, isLoading: isSegmentsLoading } =
    useFileSegments(hasSegments ? selectedFileId : null)

  const croppedSegments = fetchedSegments ?? []
  const segmentsLoading = hasSegments && isSegmentsLoading

  const prefetchSegments = usePrefetchFileSegments()

  const handleImageDoubleClick = React.useCallback(
    (entry: FileManagerEntry) => {
      const entryHasSegments =
        entry.status === FileStatus.SEGMENTED ||
        entry.status === FileStatus.OCR_COMPLETED ||
        entry.status === FileStatus.POST_OCR_COMPLETED ||
        entry.status === FileStatus.COMPLETED
      if (entryHasSegments && entry.fileId) {
        prefetchSegments(entry.fileId)
      }
    },
    [prefetchSegments]
  )

  const [drawerRightAdditional, setDrawerRightAdditional] = React.useState(
    currentAdditionalRight
  )
  const [imageDimensions, setImageDimensions] = React.useState({
    width: 0,
    height: 0,
  })
  const [imageReloadKey, setImageReloadKey] = React.useState(Date.now())
  const [layoutAnnotations, setLayoutAnnotations] = React.useState<
    SimpleAnnotation[]
  >([])
  const [selectedAnnotation, setSelectedAnnotation] =
    React.useState<SimpleAnnotation | null>(null)
  const [selectedSegmentId, setSelectedSegmentId] = React.useState<
    string | null
  >(null)
  const [additionalDrawerTabOverride, setAdditionalDrawerTabOverride] =
    React.useState<'ocr' | 'ocr_corrector' | null>(null)
  const [segmentCacheBustKey, setSegmentCacheBustKey] = React.useState(
    Date.now()
  )

  const hasOcrResults =
    fileStatus === FileStatus.OCR_COMPLETED ||
    fileStatus === FileStatus.POST_OCR_COMPLETED ||
    fileStatus === FileStatus.COMPLETED

  const hasPostOcrResults =
    fileStatus === FileStatus.POST_OCR_COMPLETED ||
    fileStatus === FileStatus.COMPLETED

  const { data: fetchedOcrResults } = useFileOcrResults(
    hasOcrResults ? selectedFileId : null
  )

  const ocrSegments = React.useMemo(
    () => (fetchedOcrResults ? toEditorSegments(fetchedOcrResults) : []),
    [fetchedOcrResults]
  )

  const { data: fetchedPostOcrResults } = useFilePostOcrCorrectionResults(
    hasPostOcrResults ? selectedFileId : null
  )

  const postOcrSegments = React.useMemo(
    () =>
      fetchedPostOcrResults ? toEditorSegments(fetchedPostOcrResults) : [],
    [fetchedPostOcrResults]
  )

  const cropSegmentsMutation = useCropSegments()
  const revertImageEnhancementMutation = useRevertImageEnhancement()
  const revertSegmentationMutation = useRevertSegmentation()
  const revertOcrMutation = useRevertOcr()
  const revertPostOcrCorrectionMutation = useRevertPostOcrCorrection()
  const revertSegmentMutation = useRevertSegment()
  const resetFileMutation = useResetFile()
  const ocrSaveWordEditMutation = useOcrSaveWordEdit()
  const postOcrSaveWordEditMutation = usePostOcrSaveWordEdit()

  const [revertingSegmentId, setRevertingSegmentId] = React.useState<
    string | null
  >(null)

  const handleRevertSegment = React.useCallback(
    (segmentId: string) => {
      setRevertingSegmentId(segmentId)
      revertSegmentMutation.mutate(segmentId, {
        onSuccess: () => {
          setTimeout(() => {
            setRevertingSegmentId(null)
            setSegmentCacheBustKey(Date.now())
            void queryClient.invalidateQueries({
              queryKey: SegmentManagementQueryKeys.all,
            })
          }, 0)
        },
        onError: () => {
          setRevertingSegmentId(null)
        },
      })
    },
    [revertSegmentMutation, queryClient]
  )

  const handleResetFile = React.useCallback(() => {
    if (!selectedImageFileName) return
    resetFileMutation.mutate(
      {
        inputDir: selectedPath,
        fileName: selectedImageFileName,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            setLayoutAnnotations([])
            setSelectedAnnotation(null)
            setSelectedSegmentId(null)
            setSegmentCacheBustKey(Date.now())
            setImageReloadKey(Date.now())
            setAdditionalRightCollapsed(true)
            setRightCollapsed(false)
            void queryClient.invalidateQueries({
              queryKey: FileManagerQueryKeys.all,
            })
            void queryClient.invalidateQueries({
              queryKey: SegmentManagementQueryKeys.all,
            })
            void queryClient.invalidateQueries({
              queryKey: OcrQueryKeys.all,
            })
            void queryClient.invalidateQueries({
              queryKey: PostOcrCorrectionQueryKeys.all,
            })
            setAdditionalDrawerTabOverride(null)
            const params = new URLSearchParams(searchParams)
            params.delete('view')
            navigate(
              { pathname: '/', search: params.toString() },
              { replace: true }
            )
          }, 0)
        },
      }
    )
  }, [
    selectedPath,
    selectedImageFileName,
    resetFileMutation,
    queryClient,
    searchParams,
    navigate,
  ])

  const handleRevertImageEnhancement = React.useCallback(() => {
    if (!selectedImageFileName) return
    revertImageEnhancementMutation.mutate(
      { inputDir: selectedPath, fileName: selectedImageFileName },
      {
        onSuccess: () => {
          setTimeout(() => {
            setImageReloadKey(Date.now())
            void queryClient.invalidateQueries({
              queryKey: FileManagerQueryKeys.all,
            })
          }, 0)
        },
      }
    )
  }, [
    selectedPath,
    selectedImageFileName,
    revertImageEnhancementMutation,
    queryClient,
  ])

  const handleRevertLayoutIdentification = React.useCallback(() => {
    setLayoutAnnotations([])
  }, [])

  const handleRevertSegmentation = React.useCallback(() => {
    if (!selectedImageFileName) return
    revertSegmentationMutation.mutate(
      { inputDir: selectedPath, fileName: selectedImageFileName },
      {
        onSuccess: () => {
          setTimeout(() => {
            setLayoutAnnotations([])
            setSelectedSegmentId(null)
            void queryClient.invalidateQueries({
              queryKey: FileManagerQueryKeys.all,
            })
            void queryClient.invalidateQueries({
              queryKey: SegmentManagementQueryKeys.all,
            })
            // Remove view=segment from URL
            const params = new URLSearchParams(searchParams)
            params.delete('view')
            navigate(
              { pathname: '/', search: params.toString() },
              { replace: true }
            )
          }, 0)
        },
      }
    )
  }, [
    selectedPath,
    selectedImageFileName,
    revertSegmentationMutation,
    queryClient,
    searchParams,
    navigate,
  ])

  const handleRevertOcr = React.useCallback(() => {
    if (!selectedImageFileName) return
    revertOcrMutation.mutate(
      { inputDir: selectedPath, fileName: selectedImageFileName },
      {
        onSuccess: () => {
          setTimeout(() => {
            void queryClient.invalidateQueries({
              queryKey: FileManagerQueryKeys.all,
            })
            void queryClient.invalidateQueries({
              queryKey: SegmentManagementQueryKeys.all,
            })
            void queryClient.invalidateQueries({
              queryKey: OcrQueryKeys.all,
            })
            void queryClient.invalidateQueries({
              queryKey: PostOcrCorrectionQueryKeys.all,
            })
            setAdditionalRightCollapsed(true)
            setRightCollapsed(false)
          }, 0)
        },
      }
    )
  }, [selectedPath, selectedImageFileName, revertOcrMutation, queryClient])

  // Reset annotations, selection, and cropped segments when image changes
  React.useEffect(() => {
    setLayoutAnnotations([])
    setSelectedAnnotation(null)
    setSelectedSegmentId(null)
    setImageReloadKey(Date.now())
    setSegmentCacheBustKey(Date.now())
  }, [imageParam])

  React.useEffect(() => {
    if (hasSegments && croppedSegments.length > 0 && imageParam) {
      const params = new URLSearchParams(searchParams)
      if (params.get('view') !== 'segment') {
        params.set('view', 'segment')
        navigate(
          { pathname: '/', search: params.toString() },
          { replace: true }
        )
      }
    }
  }, [hasSegments, croppedSegments.length, imageParam, searchParams, navigate])

  const handleLayoutIdentificationComplete = React.useCallback(
    (annotations: SimpleAnnotation[]) => {
      setTimeout(() => {
        setLayoutAnnotations(prev => {
          const newIds = new Set(annotations.map(a => a.id))
          const kept = prev.filter(a => !newIds.has(a.id))
          return [...kept, ...annotations]
        })
      }, 0)
    },
    []
  )

  const handleAnnotationSelect = React.useCallback(
    (annotation: SimpleAnnotation | null) => {
      setSelectedAnnotation(annotation)
    },
    []
  )

  const handleLabelTypeChange = React.useCallback(
    (annotation: SimpleAnnotation, newLabelType: string) => {
      setLayoutAnnotations(prev =>
        prev.map(a =>
          a.id === annotation.id ? { ...a, labelType: newLabelType } : a
        )
      )
    },
    []
  )

  const handleAddSegment = React.useCallback(() => {
    setLayoutAnnotations(prev => [
      ...prev,
      {
        id: uuidv4(),
        label: 'Text',
        labelType: 'text',
        bounds: { x: 0, y: 0, width: 300, height: 300 },
        type: 'MANUAL' as const,
      },
    ])
  }, [])

  const handleAnnotationCreate = React.useCallback(
    (annotation: SimpleAnnotation) => {
      setLayoutAnnotations(prev => [
        ...prev,
        { ...annotation, type: 'MANUAL' as const },
      ])
    },
    []
  )

  const handleAnnotationUpdate = React.useCallback(
    (annotation: SimpleAnnotation, previous: SimpleAnnotation) => {
      setLayoutAnnotations(prev =>
        prev.map(a => (a.id === previous.id ? annotation : a))
      )
    },
    []
  )

  const handleAnnotationDelete = React.useCallback(
    (annotation: SimpleAnnotation) => {
      setLayoutAnnotations(prev => prev.filter(a => a.id !== annotation.id))
    },
    []
  )

  const handleEditAnnotation = React.useCallback(
    (id: string, bounds: AnnotationBounds) => {
      setLayoutAnnotations(prev =>
        prev.map(a =>
          a.id === id
            ? { ...a, labelType: a.labelType || 'text', bounds, id: uuidv4() }
            : a
        )
      )
    },
    []
  )

  const handleFinalizeSegmentation = React.useCallback(() => {
    if (!selectedImageFileName) return

    const segments = layoutAnnotations.map(
      ({ label, labelType, bounds, confidence, type, modelRunId }) => ({
        label: label || (labelType === 'non-text' ? 'Picture' : 'Text'),
        labelType: (labelType as LabelType) ?? LabelType.TEXT,
        confidence,
        type: type ?? 'GENERATED',
        boundingBox: {
          x1: bounds.x,
          y1: bounds.y,
          x2: bounds.x + bounds.width,
          y2: bounds.y + bounds.height,
        },
        modelRunId: type === 'MANUAL' ? null : (modelRunId ?? null),
      })
    )

    cropSegmentsMutation.mutate(
      {
        inputDir: selectedPath,
        fileName: selectedImageFileName,
        segments,
      },
      {
        onSuccess: result => {
          if (result.success) {
            void queryClient.invalidateQueries({
              queryKey: FileManagerQueryKeys.all,
            })
            const params = new URLSearchParams(searchParams)
            params.set('view', 'segment')
            navigate({ pathname: '/', search: params.toString() })
          }
        },
      }
    )
  }, [
    layoutAnnotations,
    selectedPath,
    selectedImageFileName,
    cropSegmentsMutation,
    searchParams,
    navigate,
    queryClient,
  ])

  const handleImageEnhancementSuccess = React.useCallback(() => {
    // Defer state update to avoid "Should not already be working" when
    // mutation onSuccess runs during React commit/passive phase
    setTimeout(() => {
      setImageReloadKey(Date.now())
      void queryClient.invalidateQueries({
        queryKey: FileManagerQueryKeys.all,
      })
    }, 0)
  }, [queryClient])

  const handleSegmentProcessingSuccess = React.useCallback(() => {
    setTimeout(() => {
      setSegmentCacheBustKey(Date.now())
      void queryClient.invalidateQueries({
        queryKey: SegmentManagementQueryKeys.all,
      })
    }, 0)
  }, [queryClient])

  const handleOcrComplete = React.useCallback(
    (result: OcrProcessingResultDto) => {
      if (!result.success || !result.data.length) return
      setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: OcrQueryKeys.all,
        })
        void queryClient.invalidateQueries({
          queryKey: FileManagerQueryKeys.all,
        })
        setAdditionalRightCollapsed(false)
        setAdditionalDrawerTabOverride('ocr')
        setRightCollapsed(true)
      }, 0)
    },
    [queryClient]
  )

  const handlePostOcrComplete = React.useCallback(
    (result: PostOcrCorrectionProcessingResultDto) => {
      if (!result.success || !result.data.length) return
      setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: PostOcrCorrectionQueryKeys.all,
        })
        void queryClient.invalidateQueries({
          queryKey: FileManagerQueryKeys.all,
        })
        setAdditionalRightCollapsed(false)
        setAdditionalDrawerTabOverride('ocr_corrector')
        setRightCollapsed(true)
      }, 0)
    },
    [queryClient]
  )

  const handleRevertPostOcr = React.useCallback(() => {
    if (!selectedImageFileName) return
    revertPostOcrCorrectionMutation.mutate(
      { inputDir: selectedPath, fileName: selectedImageFileName },
      {
        onSuccess: () => {
          setTimeout(() => {
            void queryClient.invalidateQueries({
              queryKey: FileManagerQueryKeys.all,
            })
            void queryClient.invalidateQueries({
              queryKey: OcrQueryKeys.all,
            })
            void queryClient.invalidateQueries({
              queryKey: PostOcrCorrectionQueryKeys.all,
            })
            setAdditionalRightCollapsed(true)
            setRightCollapsed(false)
          }, 0)
        },
      }
    )
  }, [
    selectedPath,
    selectedImageFileName,
    revertPostOcrCorrectionMutation,
    queryClient,
  ])

  const handleSaveOcrWordEdit = React.useCallback(
    (segmentId: string, lineId: number, wordIndex: number, newText: string) => {
      ocrSaveWordEditMutation.mutate({
        segmentId,
        lineId,
        wordIndex,
        newText,
      })
    },
    [ocrSaveWordEditMutation]
  )

  const handleSavePostOcrWordEdit = React.useCallback(
    (segmentId: string, lineId: number, wordIndex: number, newText: string) => {
      postOcrSaveWordEditMutation.mutate({
        segmentId,
        lineId,
        wordIndex,
        newText,
      })
    },
    [postOcrSaveWordEditMutation]
  )

  React.useEffect(() => {
    if (
      (fetchedOcrResults && fetchedOcrResults.length > 0) ||
      (fetchedPostOcrResults && fetchedPostOcrResults.length > 0)
    ) {
      setAdditionalRightCollapsed(false)
    }
  }, [selectedFileId]) // eslint-disable-line react-hooks/exhaustive-deps

  const onImageDimensionsLoad = React.useCallback(
    (width: number, height: number) => {
      setImageDimensions({ width, height })
    },
    []
  )

  const { data: aiModels, isLoading: isAiModelsLoading } = useAiModels()

  if (isAiModelsLoading) {
    return
  }

  return (
    <div className='flex min-h-screen bg-[#EAEAEA]'>
      <LeftDrawer
        width={LEFT_WIDTH}
        collapsed={leftCollapsed}
        onToggle={setLeftCollapsed}
        entries={treeRoot}
        isEditor={!!selectedImageFileName}
        selectedFileId={selectedFileId}
      />
      <main
        className='flex-1 p-3'
        style={{
          marginLeft: currentLeft,
          marginRight: !additionalRightCollapsed
            ? drawerRightAdditional
            : currentRight +
              (!!selectedImageFileName && rightCollapsed ? 55 : 0),
        }}
      >
        <div className='mt-1 px-4 h-full overflow-auto'>
          {isError && (
            <div className='text-sm text-red-600'>Failed to load folder.</div>
          )}
          {!isLoading && !isError && (
            <FileManager
              entries={entries}
              entriesRoot={entriesRoot}
              selectedPath={selectedPath}
              imageReloadKey={imageReloadKey}
              onImageDimensionsLoad={onImageDimensionsLoad}
              layoutAnnotations={layoutAnnotations}
              onAnnotationSelect={handleAnnotationSelect}
              onAnnotationCreate={handleAnnotationCreate}
              onAnnotationUpdate={handleAnnotationUpdate}
              onAnnotationDelete={handleAnnotationDelete}
              onLabelTypeChange={handleLabelTypeChange}
              croppedSegments={croppedSegments}
              segmentsLoading={segmentsLoading}
              selectedSegmentId={selectedSegmentId}
              onSelectSegment={setSelectedSegmentId}
              segmentCacheBustKey={segmentCacheBustKey}
              onImageDoubleClick={handleImageDoubleClick}
              onRevertSegment={handleRevertSegment}
              revertingSegmentId={revertingSegmentId}
              onResetFile={handleResetFile}
              isResettingFile={resetFileMutation.isPending}
              showResetButton={
                !!(
                  selectedFileEntry?.metadata?.imageEnhancement.imageModified ||
                  (fileStatus && fileStatus !== FileStatus.INITIALIZED)
                )
              }
            />
          )}
        </div>
      </main>

      {imageParam && (
        <AdditionalRightDrawer
          width={drawerRightAdditional}
          setWidth={setDrawerRightAdditional}
          offset={rightCollapsed ? COLLAPSED : RIGHT_WIDTH}
          collapsed={additionalRightCollapsed}
          setCollapsed={setAdditionalRightCollapsed}
          ocrSegments={ocrSegments}
          postOcrSegments={postOcrSegments}
          selectedSegmentId={selectedSegmentId}
          activeTabOverride={additionalDrawerTabOverride}
          onTabOverrideApplied={() => setAdditionalDrawerTabOverride(null)}
          onSaveOcrWordEdit={handleSaveOcrWordEdit}
          onSavePostOcrWordEdit={handleSavePostOcrWordEdit}
        />
      )}

      <RightDrawer
        width={RIGHT_WIDTH}
        collapsed={rightCollapsed}
        setCollapsed={setRightCollapsed}
        aiModels={
          aiModels ?? {
            imageEnhancement: [],
            layoutIdentification: [],
            segmentManagement: [],
            ocr: [],
            postOcrCorrection: [],
          }
        }
        imageWidth={imageDimensions.width}
        imageHeight={imageDimensions.height}
        selectedImagePath={selectedPath}
        selectedImageFileName={selectedImageFileName}
        onImageEnhancementSuccess={handleImageEnhancementSuccess}
        onLayoutIdentificationComplete={handleLayoutIdentificationComplete}
        onAddSegment={handleAddSegment}
        selectedAnnotation={selectedAnnotation}
        onEditAnnotation={handleEditAnnotation}
        onFinalizeSegmentation={handleFinalizeSegmentation}
        fileStatus={fileStatus}
        onOcrComplete={handleOcrComplete}
        selectedSegmentId={selectedSegmentId}
        onSegmentProcessingSuccess={handleSegmentProcessingSuccess}
        imageModified={
          selectedFileEntry?.metadata?.imageEnhancement.imageModified
        }
        onRevertImageEnhancement={handleRevertImageEnhancement}
        isRevertingImageEnhancement={revertImageEnhancementMutation.isPending}
        onRevertLayoutIdentification={handleRevertLayoutIdentification}
        onRevertSegmentation={handleRevertSegmentation}
        isRevertingSegmentation={revertSegmentationMutation.isPending}
        onRevertOcr={handleRevertOcr}
        isRevertingOcr={revertOcrMutation.isPending}
        onPostOcrComplete={handlePostOcrComplete}
        onRevertPostOcr={handleRevertPostOcr}
        isRevertingPostOcr={revertPostOcrCorrectionMutation.isPending}
        layoutAnnotationsCount={layoutAnnotations.length}
        selectedFileId={selectedFileId}
      />
    </div>
  )
}

export const HomePage: React.FC = () => {
  return (
    <BatchSelectionProvider>
      <HomePageInner />
    </BatchSelectionProvider>
  )
}
