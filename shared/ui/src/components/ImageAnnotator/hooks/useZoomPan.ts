import { useCallback, useEffect, useRef, useState } from 'react'
import type { ZoomConfig, ZoomState } from '../ImageAnnotator.types'
import { DEFAULT_ZOOM_CONFIG } from '../ImageAnnotator.constants'

type UseZoomPanOptions = {
  enabled: boolean
  panEnabled: boolean
  config?: ZoomConfig
  containerRef: React.RefObject<HTMLDivElement | null>
  onZoomChange?: (state: ZoomState) => void
  onPanModeChange?: (isPanMode: boolean) => void
}

type UseZoomPanReturn = {
  zoom: number
  panX: number
  panY: number
  zoomIn: () => void
  zoomOut: () => void
  setZoom: (level: number) => void
  resetZoom: () => void
  getZoomState: () => ZoomState
  isPanning: boolean
  /** Whether pan mode is currently active (toggle state) */
  isPanModeActive: boolean
  /** Toggle pan mode on/off */
  togglePanMode: () => void
  /** Set pan mode explicitly */
  setPanModeActive: (active: boolean) => void
}

export const useZoomPan = ({
  enabled,
  panEnabled,
  config,
  containerRef,
  onZoomChange,
  onPanModeChange,
}: UseZoomPanOptions): UseZoomPanReturn => {
  const mergedConfig: Required<ZoomConfig> = {
    ...DEFAULT_ZOOM_CONFIG,
    ...config,
  }

  const [zoom, setZoomState] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const [isPanModeActive, setIsPanModeActive] = useState(false)

  // Track pan start position
  const panStartRef = useRef({ x: 0, y: 0 })
  const panOffsetRef = useRef({ x: 0, y: 0 })

  // Pinch zoom tracking
  const initialPinchDistanceRef = useRef<number | null>(null)
  const initialZoomRef = useRef(1)

  // Clamp zoom to bounds
  const clampZoom = useCallback(
    (value: number): number => {
      return Math.max(
        mergedConfig.minZoom,
        Math.min(mergedConfig.maxZoom, value)
      )
    },
    [mergedConfig.minZoom, mergedConfig.maxZoom]
  )

  // Zoom in by one step
  const zoomIn = useCallback(() => {
    if (!enabled) return
    setZoomState(prev => {
      const newZoom = clampZoom(prev + mergedConfig.zoomStep)
      return newZoom
    })
  }, [enabled, clampZoom, mergedConfig.zoomStep])

  // Zoom out by one step
  const zoomOut = useCallback(() => {
    if (!enabled) return
    setZoomState(prev => {
      const newZoom = clampZoom(prev - mergedConfig.zoomStep)
      // Reset pan if zooming back to 1 or below
      if (newZoom <= 1) {
        setPanX(0)
        setPanY(0)
      }
      return newZoom
    })
  }, [enabled, clampZoom, mergedConfig.zoomStep])

  // Set zoom to specific level
  const setZoom = useCallback(
    (level: number) => {
      if (!enabled) return
      const newZoom = clampZoom(level)
      setZoomState(newZoom)
      if (newZoom <= 1) {
        setPanX(0)
        setPanY(0)
      }
    },
    [enabled, clampZoom]
  )

  // Reset zoom to 1 and center
  const resetZoom = useCallback(() => {
    setZoomState(1)
    setPanX(0)
    setPanY(0)
    // Also reset scroll position
    const container = containerRef.current
    if (container) {
      container.scrollLeft = 0
      container.scrollTop = 0
    }
  }, [containerRef])

  // Get current zoom state
  const getZoomState = useCallback((): ZoomState => {
    return { zoom, panX, panY }
  }, [zoom, panX, panY])

  // Toggle pan mode
  const togglePanMode = useCallback(() => {
    setIsPanModeActive(prev => !prev)
  }, [])

  // Set pan mode explicitly
  const setPanModeActive = useCallback((active: boolean) => {
    setIsPanModeActive(active)
  }, [])

  // Notify parent of zoom changes
  useEffect(() => {
    onZoomChange?.({ zoom, panX, panY })
  }, [zoom, panX, panY, onZoomChange])

  // Notify parent of pan mode changes
  useEffect(() => {
    onPanModeChange?.(isPanModeActive)
  }, [isPanModeActive, onPanModeChange])

  // Mouse wheel zoom handler (Ctrl/Cmd + scroll)
  useEffect(() => {
    if (!enabled || !mergedConfig.wheelZoom) return

    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Only zoom if Ctrl (Windows/Linux) or Cmd (Mac) is pressed
      if (!e.ctrlKey && !e.metaKey) return

      e.preventDefault()
      e.stopPropagation()

      const delta =
        e.deltaY > 0 ? -mergedConfig.zoomStep : mergedConfig.zoomStep
      setZoomState(prev => {
        const newZoom = clampZoom(prev + delta)
        if (newZoom <= 1) {
          setPanX(0)
          setPanY(0)
        }
        return newZoom
      })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [
    enabled,
    mergedConfig.wheelZoom,
    mergedConfig.zoomStep,
    clampZoom,
    containerRef,
  ])

  // Mouse drag pan handler - uses scroll instead of transform
  // Only active when isPanModeActive is true
  useEffect(() => {
    if (!enabled || !panEnabled || !isPanModeActive) return

    const container = containerRef.current
    if (!container) return

    const handleMouseDown = (e: MouseEvent) => {
      // Only pan if zoomed in and not clicking on toolbar buttons
      if (zoom <= 1) return
      if ((e.target as HTMLElement).closest('button, input, [role="button"]'))
        return

      // Left mouse button for panning when in pan mode
      if (e.button !== 0) return

      e.preventDefault()
      e.stopPropagation()

      setIsPanning(true)
      panStartRef.current = { x: e.clientX, y: e.clientY }
      // Store current scroll position
      panOffsetRef.current = { x: container.scrollLeft, y: container.scrollTop }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return

      const deltaX = e.clientX - panStartRef.current.x
      const deltaY = e.clientY - panStartRef.current.y

      // Update scroll position (inverse of mouse movement)
      container.scrollLeft = panOffsetRef.current.x - deltaX
      container.scrollTop = panOffsetRef.current.y - deltaY
    }

    const handleMouseUp = () => {
      if (isPanning) {
        setIsPanning(false)
      }
    }

    container.addEventListener('mousedown', handleMouseDown, { capture: true })
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown, {
        capture: true,
      })
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [enabled, panEnabled, isPanModeActive, zoom, isPanning, containerRef])

  // Touch pinch-to-zoom handler
  useEffect(() => {
    if (!enabled || !mergedConfig.pinchZoom) return

    const container = containerRef.current
    if (!container) return

    const getDistance = (touches: TouchList): number => {
      if (touches.length < 2) return 0
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialPinchDistanceRef.current = getDistance(e.touches)
        initialZoomRef.current = zoom
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistanceRef.current !== null) {
        e.preventDefault()
        const currentDistance = getDistance(e.touches)
        const scale = currentDistance / initialPinchDistanceRef.current
        const newZoom = clampZoom(initialZoomRef.current * scale)
        setZoomState(newZoom)
        if (newZoom <= 1) {
          setPanX(0)
          setPanY(0)
        }
      }
    }

    const handleTouchEnd = () => {
      initialPinchDistanceRef.current = null
    }

    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, mergedConfig.pinchZoom, zoom, clampZoom, containerRef])

  // Center scroll position when zoom changes
  useEffect(() => {
    const container = containerRef.current
    if (!container || !enabled || zoom <= 1) return

    // Center the scroll position when zooming
    const scrollWidth = container.scrollWidth - container.clientWidth
    const scrollHeight = container.scrollHeight - container.clientHeight

    if (scrollWidth > 0) {
      container.scrollLeft = scrollWidth / 2
    }
    if (scrollHeight > 0) {
      container.scrollTop = scrollHeight / 2
    }
  }, [zoom, enabled, containerRef])

  return {
    zoom,
    panX,
    panY,
    zoomIn,
    zoomOut,
    setZoom,
    resetZoom,
    getZoomState,
    isPanning,
    isPanModeActive,
    togglePanMode,
    setPanModeActive,
  }
}
