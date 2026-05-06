// Component
export { ImageAnnotator } from './ImageAnnotator'

// Conversion utilities
export {
  toImageAnnotation,
  toSimpleAnnotation,
  toImageAnnotations,
  toSimpleAnnotations,
} from './ImageAnnotator'

// Types
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
  // Zoom, Pan & Fullscreen types
  ZoomConfig,
  ZoomToolbarConfig,
  ZoomState,
  ImageAnnotatorHandle,
} from './ImageAnnotator.types'

// Constants
export {
  DEFAULT_COLOR_PALETTE,
  DEFAULT_ZOOM_CONFIG,
  DEFAULT_TOOLBAR_CONFIG,
} from './ImageAnnotator.constants'
