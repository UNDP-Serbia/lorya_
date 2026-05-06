import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Annotorious,
  ImageAnnotator as AnnotoriousImageAnnotator,
  useAnnotations,
  useAnnotator,
} from '@annotorious/react'
import type { DrawingStyle, Color } from '@annotorious/react'
import '@annotorious/react/annotorious-react.css'
import closeIcon from '../../assets/close-icon.svg'

import {
  DEFAULT_LABEL_STYLE,
  DEFAULT_ZOOM_CONFIG,
  DEFAULT_TOOLBAR_CONFIG,
} from './ImageAnnotator.constants'
import { useZoomPan, useFullscreen } from './hooks'
import { ZoomToolbar } from './ZoomToolbar'
import type {
  ImageAnnotation,
  SimpleAnnotation,
  LabelStyleConfig,
  AnnotatorInstance,
  AnnotatorContentProps,
  AnnotationLabelProps,
  AnnotationLabelsOverlayProps,
  ImageAnnotatorProps,
  ImageAnnotatorHandle,
  ZoomConfig,
  ZoomToolbarConfig,
} from './ImageAnnotator.types'

// Re-export types for external use
export type {
  ImageAnnotation,
  SimpleAnnotation,
  AnnotationBounds,
  DrawingTool,
  AnnotationStyle,
  AnnotationStyleFunction,
  LabelPosition,
  LabelStyleConfig,
  ImageAnnotatorProps,
  ImageAnnotatorHandle,
  ZoomConfig,
  ZoomToolbarConfig,
  ZoomState,
} from './ImageAnnotator.types'

// Re-export constants
export { DEFAULT_COLOR_PALETTE } from './ImageAnnotator.constants'

// ============================================================================
// Label Type Color Mapping
// ============================================================================

const getLabelTypeColor = (labelType?: string | null): string => {
  if (labelType === 'non-text') return '#FFA963'
  return '#98E3FF'
}

// ============================================================================
// Conversion Utilities
// ============================================================================

/** Generate a unique ID */
const generateId = (): string =>
  `annotation-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

/** Convert SimpleAnnotation to ImageAnnotation (Annotorious format) */
export const toImageAnnotation = (
  simple: SimpleAnnotation
): ImageAnnotation => {
  const id = simple.id ?? generateId()
  const { x, y, width, height } = simple.bounds

  return {
    id,
    labelType: simple.labelType,
    confidence: simple.confidence,
    bodies: simple.label
      ? [
          {
            id: `${id}-body`,
            annotation: id,
            purpose: 'tagging',
            value: simple.label,
          },
        ]
      : [],
    target: {
      annotation: id,
      selector: {
        type: 'RECTANGLE',
        geometry: {
          x,
          y,
          w: width,
          h: height,
          bounds: {
            minX: x,
            minY: y,
            maxX: x + width,
            maxY: y + height,
          },
        },
      },
    },
  } as ImageAnnotation
}

/** Convert ImageAnnotation (Annotorious format) to SimpleAnnotation */
export const toSimpleAnnotation = (
  annotation: ImageAnnotation
): SimpleAnnotation => {
  const selector = annotation.target?.selector as {
    geometry?: {
      bounds?: { minX: number; minY: number; maxX: number; maxY: number }
    }
  }
  const bounds = selector?.geometry?.bounds ?? {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
  }

  // Get label from bodies (first tagging body)
  const labelBody = annotation.bodies?.find(
    (b: { purpose?: string }) => b.purpose === 'tagging'
  )
  const label = (labelBody as { value?: string })?.value ?? ''

  return {
    id: annotation.id,
    label,
    labelType: (annotation as unknown as Record<string, unknown>).labelType as
      | string
      | null
      | undefined,
    confidence: (annotation as unknown as Record<string, unknown>)
      .confidence as number | undefined,
    bounds: {
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
    },
  }
}

/** Convert array of SimpleAnnotation to ImageAnnotation[] */
export const toImageAnnotations = (
  simple: SimpleAnnotation[]
): ImageAnnotation[] => simple.map(toImageAnnotation)

/** Convert array of ImageAnnotation to SimpleAnnotation[] */
export const toSimpleAnnotations = (
  annotations: ImageAnnotation[]
): SimpleAnnotation[] => annotations.map(toSimpleAnnotation)

// ============================================================================
// Annotation Labels Component
// ============================================================================

/** Single annotation label */
const AnnotationLabel: React.FC<AnnotationLabelProps> = ({
  annotation,
  style,
  color,
  scale,
  editable = false,
  isEditing = false,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onLabelTypeChange,
}) => {
  const [editValue, setEditValue] = useState(annotation.label)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Reset edit value when annotation changes
  useEffect(() => {
    setEditValue(annotation.label)
  }, [annotation.label])

  // Show nothing only if no label AND not editable AND not editing
  if (!annotation.label && !editable && !isEditing) return null

  const { bounds } = annotation
  const labelColor = color ?? style.backgroundColor
  const labelHeight = style.fontSize + style.padding * 2

  // Scale bounds to match rendered image size
  const scaledX = bounds.x * scale
  const scaledY = bounds.y * scale
  const scaledWidth = bounds.width * scale
  const scaledHeight = bounds.height * scale

  // Calculate position based on style.position
  const getPositionStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
    }

    switch (style.position) {
      case 'top':
        // Above the top-left corner of the annotation
        return {
          ...base,
          left: scaledX,
          top: Math.max(0, scaledY - labelHeight - 2),
        }
      case 'bottom':
        return {
          ...base,
          left: scaledX,
          top: scaledY + scaledHeight + 2,
        }
      case 'top-left':
        // Inside, at the top-left corner
        return {
          ...base,
          left: scaledX + 2,
          top: scaledY + 2,
        }
      case 'top-right':
        // Inside, at the top-right corner
        return {
          ...base,
          left: scaledX + scaledWidth - 2,
          top: scaledY + 2,
          transform: 'translateX(-100%)',
        }
      case 'inside':
      default:
        // Centered at the top inside
        return {
          ...base,
          left: scaledX + scaledWidth / 2,
          top: scaledY + style.padding,
          transform: 'translateX(-50%)',
        }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSaveEdit?.(editValue)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditValue(annotation.label)
      onCancelEdit?.()
    }
  }

  const handleDoubleClick = () => {
    if (editable && onStartEdit) {
      onStartEdit()
    }
  }

  // Single click to add label for annotations without labels
  const handleClick = () => {
    if (editable && !annotation.label && onStartEdit) {
      onStartEdit()
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }

  // Editing mode - show input
  if (isEditing) {
    return (
      <div
        style={{
          ...getPositionStyle(),
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          pointerEvents: 'auto',
        }}
      >
        <input
          ref={inputRef}
          type='text'
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onSaveEdit?.(editValue)}
          style={{
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            color: '#000',
            backgroundColor: '#fff',
            padding: `${style.padding}px ${style.padding + 2}px`,
            borderRadius: style.borderRadius,
            border: '2px solid #3b82f6',
            outline: 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: 1,
            minWidth: 60,
          }}
        />
      </div>
    )
  }

  // Display mode
  const hasLabel = Boolean(annotation.label)

  return (
    <div
      style={{
        ...getPositionStyle(),
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        pointerEvents: editable ? 'auto' : 'none',
        cursor: editable ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      <div
        style={{
          fontSize: style.fontSize,
          fontWeight: hasLabel ? style.fontWeight : 'normal',
          color: hasLabel ? style.color : 'rgba(255, 255, 255, 0.7)',
          backgroundColor: labelColor,
          padding: `${style.padding}px ${style.padding + 2}px`,
          borderRadius: style.borderRadius,
          maxWidth: style.maxWidth,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: 1,
          fontStyle: hasLabel ? 'normal' : 'italic',
        }}
      >
        {annotation.label || '+ Add label'}
      </div>
      {/* Label type dropdown + Delete button - visible on hover when editable */}
      {editable && isHovered && (
        <select
          value={annotation.labelType ?? 'text'}
          onChange={e => {
            e.stopPropagation()
            onLabelTypeChange?.(e.target.value)
          }}
          onClick={e => e.stopPropagation()}
          onDoubleClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          style={{
            height: 18,
            fontSize: 10,
            border: '1px solid #ccc',
            borderRadius: 3,
            cursor: 'pointer',
            padding: '0 2px',
            backgroundColor: '#fff',
            color: '#333',
          }}
          title='Change label type'
        >
          <option value='text'>Text</option>
          <option value='non-text'>Non-text</option>
        </select>
      )}
      {editable && isHovered && (
        <button
          onClick={handleDeleteClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 16,
            height: 16,
            padding: 0,
            border: 'none',
            borderRadius: '50%',
            backgroundColor: '#fec1c1',
            cursor: 'pointer',
          }}
          title='Delete annotation'
        >
          <img src={closeIcon} alt='Delete' />
        </button>
      )}
    </div>
  )
}

/** Overlay component that renders all annotation labels */
const AnnotationLabelsOverlay: React.FC<AnnotationLabelsOverlayProps> = ({
  annotations,
  labelStyle,
  containerRef,
  editable = false,
  onLabelEdit,
  onDelete,
  onLabelTypeChange,
  currentZoom = 1,
}) => {
  const [scale, setScale] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Calculate scale directly from image dimensions
  // scale = clientWidth / naturalWidth (already includes zoom effect)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const img = container.querySelector('img')
    if (!img) return

    const updateScale = () => {
      if (img.naturalWidth > 0 && img.clientWidth > 0) {
        const newScale = img.clientWidth / img.naturalWidth
        setScale(newScale)
      }
    }

    // Update immediately
    updateScale()

    // Also update after a small delay to catch DOM updates
    const timeoutId = setTimeout(updateScale, 50)

    img.addEventListener('load', updateScale)
    window.addEventListener('resize', updateScale)

    // Use ResizeObserver to detect size changes from zoom
    const resizeObserver = new ResizeObserver(updateScale)
    resizeObserver.observe(img)

    return () => {
      clearTimeout(timeoutId)
      img.removeEventListener('load', updateScale)
      window.removeEventListener('resize', updateScale)
      resizeObserver.disconnect()
    }
  }, [containerRef, currentZoom])

  const handleStartEdit = (annotationId: string) => {
    setEditingId(annotationId)
  }

  const handleSaveEdit = (annotation: SimpleAnnotation, newLabel: string) => {
    if (newLabel.trim()) {
      // Save if there's a label and it's different (or annotation had no label)
      if (!annotation.label || newLabel.trim() !== annotation.label) {
        onLabelEdit?.(annotation, newLabel.trim())
      }
    }
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleDelete = (annotation: SimpleAnnotation) => {
    onDelete?.(annotation)
  }

  const handleLabelTypeChange = (
    annotation: SimpleAnnotation,
    newType: string
  ) => {
    onLabelTypeChange?.(annotation, newType)
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {annotations.map((annotation, index) => {
        const annotationId = annotation.id ?? `idx-${index}`
        const color = getLabelTypeColor(annotation.labelType)
        return (
          <AnnotationLabel
            key={annotationId}
            annotation={annotation}
            style={labelStyle}
            color={color}
            scale={scale}
            editable={editable}
            isEditing={editingId === annotationId}
            onStartEdit={() => handleStartEdit(annotationId)}
            onSaveEdit={newLabel => handleSaveEdit(annotation, newLabel)}
            onCancelEdit={handleCancelEdit}
            onDelete={() => handleDelete(annotation)}
            onLabelTypeChange={newType =>
              handleLabelTypeChange(annotation, newType)
            }
          />
        )
      })}
    </div>
  )
}

/**
 * Internal component that uses Annotorious hooks.
 * Must be rendered inside <Annotorious> context.
 */
const AnnotatorContent: React.FC<AnnotatorContentProps> = ({
  src,
  alt = 'Annotatable image',
  initialAnnotations,
  tool = 'rectangle',
  drawingEnabled = true,
  style,
  fillOpacity = 0.2,
  strokeWidth = 2,
  styleFunction,
  showLabels = false,
  labelStyle,
  imageClassName = '',
  containerClassName = '',
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationsChange,
  onAnnotationSelect,
  selectedAnnotationId,
  onLabelEdit,
  onLabelTypeChange,
  editable = false,
  onClick,
  debounce = 250,
  currentZoom = 1,
}) => {
  const anno: AnnotatorInstance | null = useAnnotator()
  // Use debounced annotations for callbacks
  const debouncedAnnotations = useAnnotations(debounce)
  // Use real-time annotations (no debounce) for labels to follow during drag
  const realtimeAnnotations = useAnnotations(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Track which annotation IDs came from the prop vs locally created
  const propAnnotationIdsRef = useRef<Set<string>>(new Set())
  // Skip sync when the prop change originated from an Annotorious user action
  const skipNextSyncRef = useRef(false)
  // Keep a ref to the latest annotations so the sync effect can read them without a dependency
  const latestAnnotationsRef = useRef<ImageAnnotation[]>([])
  latestAnnotationsRef.current = realtimeAnnotations

  // Merge label style with defaults
  const mergedLabelStyle: Required<LabelStyleConfig> = {
    ...DEFAULT_LABEL_STYLE,
    ...labelStyle,
  }

  // Convert real-time annotations to simple format for labels (follows drag in real-time)
  const simpleAnnotations = useMemo(
    () => toSimpleAnnotations(realtimeAnnotations),
    [realtimeAnnotations]
  )

  // Track annotation order for consistent coloring
  const annotationOrderRef = useRef<Map<string, number>>(new Map())
  const nextIndexRef = useRef(0)

  // Track selected annotation for delete key support
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null)

  // Handle label edit - update the annotation with new label
  const handleLabelEdit = useCallback(
    (annotation: SimpleAnnotation, newLabel: string) => {
      if (!anno || !annotation.id) return

      // Find the original ImageAnnotation
      const imageAnnotations = realtimeAnnotations.filter(
        a => a.id === annotation.id
      )
      if (imageAnnotations.length === 0) return

      const originalAnnotation = imageAnnotations[0]

      // Create updated annotation with new label using bodies array
      const updatedAnnotation = {
        ...originalAnnotation,
        bodies: [
          {
            id: `${annotation.id}-body`,
            annotation: annotation.id,
            purpose: 'tagging',
            value: newLabel,
          },
        ],
      } as ImageAnnotation

      // Update in Annotorious
      anno.updateAnnotation(updatedAnnotation)

      // Call callback
      onLabelEdit?.(annotation, newLabel)
    },
    [anno, realtimeAnnotations, onLabelEdit]
  )

  // Handle annotation delete from label overlay
  const handleDeleteFromOverlay = useCallback(
    (annotation: SimpleAnnotation) => {
      if (!anno || !annotation.id) return
      anno.removeAnnotation(annotation.id)
    },
    [anno]
  )

  // Handle label type change from dropdown
  const handleLabelTypeChange = useCallback(
    (annotation: SimpleAnnotation, newType: string) => {
      if (!anno || !annotation.id) return

      const imageAnnotations = realtimeAnnotations.filter(
        a => a.id === annotation.id
      )
      if (imageAnnotations.length === 0) return

      const originalAnnotation = imageAnnotations[0]

      const updatedAnnotation = {
        ...originalAnnotation,
        labelType: newType,
      } as ImageAnnotation

      anno.updateAnnotation(updatedAnnotation)

      onLabelTypeChange?.(annotation, newType)
    },
    [anno, realtimeAnnotations, onLabelTypeChange]
  )

  // Programmatic selection from external prop
  useEffect(() => {
    if (!anno) return
    if (selectedAnnotationId) {
      anno.setSelected(selectedAnnotationId)
    } else if (selectedAnnotationId === null) {
      anno.setSelected()
    }
  }, [anno, selectedAnnotationId])

  // Delete key handler for selected annotation
  useEffect(() => {
    if (!editable) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        localSelectedId &&
        anno
      ) {
        // Don't delete if we're in an input field
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return
        }
        e.preventDefault()
        anno.removeAnnotation(localSelectedId)
        setLocalSelectedId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editable, localSelectedId, anno])

  // Set up event listeners - convert to SimpleAnnotation format for callbacks
  useEffect(() => {
    if (!anno) return

    const handleCreate = (annotation: ImageAnnotation) => {
      const withType = { ...annotation, labelType: 'text' } as ImageAnnotation
      anno.updateAnnotation(withType)
      skipNextSyncRef.current = true
      onAnnotationCreate?.(toSimpleAnnotation(withType))
    }

    const handleUpdate = (
      annotation: ImageAnnotation,
      previous: ImageAnnotation
    ) => {
      skipNextSyncRef.current = true
      onAnnotationUpdate?.(
        toSimpleAnnotation(annotation),
        toSimpleAnnotation(previous)
      )
    }

    const handleDelete = (annotation: ImageAnnotation) => {
      skipNextSyncRef.current = true
      onAnnotationDelete?.(toSimpleAnnotation(annotation))
    }

    const handleSelect = (annotations: ImageAnnotation[]) => {
      const selected =
        annotations.length > 0 ? toSimpleAnnotation(annotations[0]) : null
      setLocalSelectedId(selected?.id ?? null)
      onAnnotationSelect?.(selected)
    }

    anno.on('createAnnotation', handleCreate)
    anno.on('updateAnnotation', handleUpdate)
    anno.on('deleteAnnotation', handleDelete)
    anno.on('selectionChanged', handleSelect)

    return () => {
      anno.off('createAnnotation', handleCreate)
      anno.off('updateAnnotation', handleUpdate)
      anno.off('deleteAnnotation', handleDelete)
      anno.off('selectionChanged', handleSelect)
    }
  }, [
    anno,
    onAnnotationCreate,
    onAnnotationUpdate,
    onAnnotationDelete,
    onAnnotationSelect,
  ])

  // Sync annotations from prop — replaces prop annotations while preserving locally-created ones
  // Skip sync when the prop change originated from a user action inside Annotorious
  useEffect(() => {
    if (!anno) return

    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false
      if (initialAnnotations?.length) {
        propAnnotationIdsRef.current = new Set(
          initialAnnotations.map(a => a.id)
        )
      } else {
        propAnnotationIdsRef.current = new Set()
      }
      return
    }

    if (!initialAnnotations?.length) {
      // Use setAnnotations with silent flag instead of clearAnnotations()
      // to avoid firing async deleteAnnotation events that pollute skipNextSyncRef
      anno.setAnnotations([], true)
      propAnnotationIdsRef.current = new Set()
      return
    }

    const newPropIds = new Set(initialAnnotations.map(a => a.id))
    const currentAnnotations = latestAnnotationsRef.current
    const localAnnotations = currentAnnotations.filter(
      a => !propAnnotationIdsRef.current.has(a.id) && !newPropIds.has(a.id)
    )

    propAnnotationIdsRef.current = newPropIds

    anno.setAnnotations(initialAnnotations, true)

    localAnnotations.forEach(a => anno.addAnnotation(a))
  }, [anno, initialAnnotations])

  // Update drawing tool
  useEffect(() => {
    if (!anno) return
    anno.setDrawingTool(tool)
  }, [anno, tool])

  // Update drawing enabled state
  useEffect(() => {
    if (!anno) return
    anno.setDrawingEnabled(drawingEnabled)
  }, [anno, drawingEnabled])

  // Notify parent of annotation changes - convert to SimpleAnnotation format
  // Use debounced annotations for callbacks to avoid spamming during drag
  useEffect(() => {
    onAnnotationsChange?.(toSimpleAnnotations(debouncedAnnotations))
  }, [debouncedAnnotations, onAnnotationsChange])

  // Get color index for an annotation (maintains consistent colors)
  const getAnnotationColorIndex = useCallback(
    (annotationId: string): number => {
      if (!annotationOrderRef.current.has(annotationId)) {
        annotationOrderRef.current.set(annotationId, nextIndexRef.current)
        nextIndexRef.current++
      }
      return annotationOrderRef.current.get(annotationId) ?? 0
    },
    []
  )

  // Style function for Annotorious
  const getAnnotationStyle = useCallback(
    (annotation: ImageAnnotation): DrawingStyle => {
      const index = getAnnotationColorIndex(annotation.id)
      const labelType = (annotation as unknown as Record<string, unknown>)
        .labelType as string | null | undefined
      const labelColor = getLabelTypeColor(labelType)

      // Use custom style function if provided
      if (styleFunction) {
        const customStyle = styleFunction(annotation, index)
        return {
          fill: (customStyle.fill ?? labelColor) as Color,
          fillOpacity: customStyle.fillOpacity,
          stroke: (customStyle.stroke ?? labelColor) as Color,
          strokeWidth: customStyle.strokeWidth,
        }
      }

      return {
        fill: (style?.fill ?? labelColor) as Color,
        fillOpacity: style?.fillOpacity ?? fillOpacity,
        stroke: (style?.stroke ?? labelColor) as Color,
        strokeWidth: style?.strokeWidth ?? strokeWidth,
      }
    },
    [fillOpacity, strokeWidth, style, styleFunction, getAnnotationColorIndex]
  )

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <AnnotoriousImageAnnotator
        tool={tool}
        style={getAnnotationStyle}
        containerClassName={containerClassName}
      >
        <img src={src} alt={alt} className={imageClassName} onClick={onClick} />
      </AnnotoriousImageAnnotator>
      {showLabels && simpleAnnotations.length > 0 && (
        <AnnotationLabelsOverlay
          annotations={simpleAnnotations}
          labelStyle={mergedLabelStyle}
          containerRef={containerRef}
          editable={editable}
          onLabelEdit={handleLabelEdit}
          onDelete={handleDeleteFromOverlay}
          onLabelTypeChange={handleLabelTypeChange}
          currentZoom={currentZoom}
        />
      )}
    </div>
  )
}

export const ImageAnnotator = forwardRef<
  ImageAnnotatorHandle,
  ImageAnnotatorProps
>(
  (
    {
      annotations,
      zoomEnabled = false,
      zoomConfig,
      panEnabled = true,
      fullscreenEnabled = false,
      toolbar,
      onZoomChange,
      onFullscreenChange,
      zoomInCustomIcon,
      zoomOutCustomIcon,
      resetCustomIcon,
      fullscreenCustomIcon,
      ...props
    },
    ref
  ) => {
    // Refs for zoom/fullscreen containers
    const zoomContainerRef = useRef<HTMLDivElement>(null)
    const fullscreenContainerRef = useRef<HTMLDivElement>(null)

    // Merge zoom config with defaults
    const mergedZoomConfig: Required<ZoomConfig> = {
      ...DEFAULT_ZOOM_CONFIG,
      ...zoomConfig,
    }

    // Merge toolbar config with defaults
    const mergedToolbarConfig: Required<ZoomToolbarConfig> = {
      ...DEFAULT_TOOLBAR_CONFIG,
      ...toolbar,
    }

    // Zoom/Pan hook
    const {
      zoom,
      zoomIn,
      zoomOut,
      setZoom,
      resetZoom,
      getZoomState,
      isPanning,
      isPanModeActive,
      togglePanMode,
    } = useZoomPan({
      enabled: zoomEnabled,
      panEnabled: panEnabled,
      config: mergedZoomConfig,
      containerRef: zoomContainerRef,
      onZoomChange,
    })

    // Fullscreen hook
    const { isFullscreen, toggleFullscreen } = useFullscreen({
      enabled: fullscreenEnabled,
      elementRef: fullscreenContainerRef,
      onFullscreenChange,
    })

    // Expose handle via ref
    useImperativeHandle(
      ref,
      () => ({
        zoomIn,
        zoomOut,
        setZoom,
        resetZoom,
        toggleFullscreen,
        getZoomState,
      }),
      [zoomIn, zoomOut, setZoom, resetZoom, toggleFullscreen, getZoomState]
    )

    // Convert SimpleAnnotation[] to ImageAnnotation[]
    const imageAnnotations = useMemo(() => {
      if (!annotations?.length) return undefined
      return annotations.map(toImageAnnotation)
    }, [annotations])

    // Container styles - using scroll-based zoom instead of CSS transform
    // This ensures Annotorious coordinates work correctly
    const fullscreenContainerStyle: React.CSSProperties = {
      position: 'relative',
      width: '100%',
      height: isFullscreen ? '100vh' : 'auto',
      backgroundColor: isFullscreen ? '#1a1a1a' : 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflow: isFullscreen ? 'auto' : 'visible',
    }

    const zoomContainerStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'auto',
      width: '100%',
      height: isFullscreen ? '100%' : 'auto',
      maxHeight: isFullscreen ? '100%' : undefined,
      cursor:
        isPanModeActive && zoom > 1
          ? isPanning
            ? 'grabbing'
            : 'grab'
          : 'default',
    }

    // Use actual width scaling instead of CSS transform
    // This preserves correct coordinate mapping for Annotorious
    const contentContainerStyle: React.CSSProperties = {
      width: zoomEnabled ? `${zoom * 100}%` : '100%',
      minWidth: zoomEnabled && zoom > 1 ? `${zoom * 100}%` : 'auto',
      transition: isPanning ? 'none' : 'width 0.15s ease-out',
    }

    return (
      <div ref={fullscreenContainerRef} style={fullscreenContainerStyle}>
        {/* Zoom Toolbar */}
        {(zoomEnabled || fullscreenEnabled) && (
          <ZoomToolbar
            config={mergedToolbarConfig}
            zoom={zoom}
            isFullscreen={isFullscreen}
            isPanModeActive={isPanModeActive}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={resetZoom}
            onToggleFullscreen={toggleFullscreen}
            onTogglePanMode={togglePanMode}
            fullscreenEnabled={fullscreenEnabled}
            zoomInCustomIcon={zoomInCustomIcon}
            zoomOutCustomIcon={zoomOutCustomIcon}
            resetCustomIcon={resetCustomIcon}
            fullscreenCustomIcon={fullscreenCustomIcon}
          />
        )}

        {/* Zoom/Pan Container - scrollable when zoomed */}
        <div ref={zoomContainerRef} style={zoomContainerStyle}>
          <div style={contentContainerStyle}>
            <Annotorious>
              <AnnotatorContent
                initialAnnotations={imageAnnotations}
                currentZoom={zoomEnabled ? zoom : 1}
                {...props}
              />
            </Annotorious>
          </div>
        </div>
      </div>
    )
  }
)

/**
 * Hook-friendly components for more control.
 * Use when you need access to Annotorious context in parent components.
 */
export const ImageAnnotatorProvider = Annotorious
export const ImageAnnotatorCanvas = AnnotoriousImageAnnotator
export { useAnnotations, useAnnotator }
