import { useCallback, useEffect, useState } from 'react'

type UseFullscreenOptions = {
  enabled: boolean
  elementRef: React.RefObject<HTMLElement | null>
  onFullscreenChange?: (isFullscreen: boolean) => void
}

type UseFullscreenReturn = {
  isFullscreen: boolean
  toggleFullscreen: () => void
  enterFullscreen: () => Promise<void>
  exitFullscreen: () => Promise<void>
}

// Type definitions for vendor-prefixed fullscreen API
interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>
  mozRequestFullScreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
}

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null
  mozFullScreenElement?: Element | null
  msFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void>
  mozCancelFullScreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
}

export const useFullscreen = ({
  enabled,
  elementRef,
  onFullscreenChange,
}: UseFullscreenOptions): UseFullscreenReturn => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Check if fullscreen API is available
  const isFullscreenAvailable = useCallback((): boolean => {
    const doc = document as FullscreenDocument
    return !!(
      doc.fullscreenEnabled ||
      doc.webkitFullscreenElement !== undefined ||
      doc.mozFullScreenElement !== undefined ||
      doc.msFullscreenElement !== undefined
    )
  }, [])

  // Get current fullscreen element
  const getFullscreenElement = useCallback((): Element | null => {
    const doc = document as FullscreenDocument
    return (
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement ||
      null
    )
  }, [])

  // Enter fullscreen mode
  const enterFullscreen = useCallback(async () => {
    if (!enabled || !isFullscreenAvailable()) return

    const element = elementRef.current as FullscreenElement | null
    if (!element) return

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen()
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen()
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen()
      }
    } catch (err) {
      console.warn('Failed to enter fullscreen:', err)
    }
  }, [enabled, elementRef, isFullscreenAvailable])

  // Exit fullscreen mode
  const exitFullscreen = useCallback(async () => {
    const doc = document as FullscreenDocument

    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen()
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen()
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen()
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen()
      }
    } catch (err) {
      console.warn('Failed to exit fullscreen:', err)
    }
  }, [])

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!enabled) return

    if (getFullscreenElement()) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }, [enabled, getFullscreenElement, enterFullscreen, exitFullscreen])

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!getFullscreenElement()
      setIsFullscreen(isFs)
      onFullscreenChange?.(isFs)
    }

    // Add listeners for all vendor prefixes
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      )
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange
      )
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [getFullscreenElement, onFullscreenChange])

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen()
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen, exitFullscreen])

  return {
    isFullscreen,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
  }
}
