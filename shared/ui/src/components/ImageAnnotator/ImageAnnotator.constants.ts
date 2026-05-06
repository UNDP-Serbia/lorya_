import type {
  LabelStyleConfig,
  ZoomConfig,
  ZoomToolbarConfig,
} from './ImageAnnotator.types'

/** Default color palette for multi-colored annotations */
export const DEFAULT_COLOR_PALETTE = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
]

/** Default label style */
export const DEFAULT_LABEL_STYLE: Required<LabelStyleConfig> = {
  fontSize: 12,
  fontWeight: 'bold',
  color: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  padding: 4,
  borderRadius: 4,
  position: 'top',
  maxWidth: 150,
}

/** Default zoom configuration */
export const DEFAULT_ZOOM_CONFIG: Required<ZoomConfig> = {
  minZoom: 0.5,
  maxZoom: 5,
  zoomStep: 0.25,
  wheelZoom: true,
  pinchZoom: true,
}

/** Default toolbar configuration */
export const DEFAULT_TOOLBAR_CONFIG: Required<ZoomToolbarConfig> = {
  show: false,
  position: 'top-right',
  showZoomIn: true,
  showZoomOut: true,
  showReset: true,
  showFullscreen: true,
  showZoomLevel: true,
  showPanToggle: true,
}
