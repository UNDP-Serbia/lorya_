import React from 'react'
import type { ZoomToolbarConfig } from './ImageAnnotator.types'
import { DEFAULT_TOOLBAR_CONFIG } from './ImageAnnotator.constants'

type ZoomToolbarProps = {
  config?: ZoomToolbarConfig
  zoom: number
  isFullscreen: boolean
  isPanModeActive: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onToggleFullscreen: () => void
  onTogglePanMode: () => void
  fullscreenEnabled?: boolean
  zoomInCustomIcon?: React.ReactNode
  zoomOutCustomIcon?: React.ReactNode
  resetCustomIcon?: React.ReactNode
  fullscreenCustomIcon?: React.ReactNode
}

export const ZoomToolbar: React.FC<ZoomToolbarProps> = ({
  config,
  zoom,
  isFullscreen,
  isPanModeActive,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleFullscreen,
  onTogglePanMode,
  fullscreenEnabled = false,
  zoomInCustomIcon = null,
  zoomOutCustomIcon = null,
  resetCustomIcon = null,
  fullscreenCustomIcon = null,
}) => {
  const mergedConfig: Required<ZoomToolbarConfig> = {
    ...DEFAULT_TOOLBAR_CONFIG,
    ...config,
  }

  if (!mergedConfig.show) return null

  const positionStyles: React.CSSProperties = {
    position: 'absolute',
    zIndex: 1100,
    ...(mergedConfig.position === 'top-left' && { top: 8, left: 8 }),
    ...(mergedConfig.position === 'top-right' && { top: -78, right: 8 }),
    ...(mergedConfig.position === 'bottom-left' && { bottom: 8, left: 8 }),
    ...(mergedConfig.position === 'bottom-right' && { bottom: 8, right: 8 }),
  }

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    padding: 0,
    border: 'none',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#374151',
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s, transform 0.1s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  }

  const buttonHoverStyle = {
    backgroundColor: '#f3f4f6',
  }

  const zoomLevelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
    height: 32,
    padding: '0 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#374151',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    borderRadius: 6,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  }

  // SVG icons
  const ZoomInIcon = () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='11' cy='11' r='8' />
      <line x1='21' y1='21' x2='16.65' y2='16.65' />
      <line x1='11' y1='8' x2='11' y2='14' />
      <line x1='8' y1='11' x2='14' y2='11' />
    </svg>
  )

  const ZoomOutIcon = () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='11' cy='11' r='8' />
      <line x1='21' y1='21' x2='16.65' y2='16.65' />
      <line x1='8' y1='11' x2='14' y2='11' />
    </svg>
  )

  const ResetIcon = () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
      <path d='M3 3v5h5' />
    </svg>
  )

  const FullscreenIcon = () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M8 3H5a2 2 0 0 0-2 2v3' />
      <path d='M21 8V5a2 2 0 0 0-2-2h-3' />
      <path d='M3 16v3a2 2 0 0 0 2 2h3' />
      <path d='M16 21h3a2 2 0 0 0 2-2v-3' />
    </svg>
  )

  const ExitFullscreenIcon = () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M8 3v3a2 2 0 0 1-2 2H3' />
      <path d='M21 8h-3a2 2 0 0 1-2-2V3' />
      <path d='M3 16h3a2 2 0 0 1 2 2v3' />
      <path d='M16 21v-3a2 2 0 0 1 2-2h3' />
    </svg>
  )

  const MoveIcon = () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <polyline points='5 9 2 12 5 15' />
      <polyline points='9 5 12 2 15 5' />
      <polyline points='15 19 12 22 9 19' />
      <polyline points='19 9 22 12 19 15' />
      <line x1='2' y1='12' x2='22' y2='12' />
      <line x1='12' y1='2' x2='12' y2='22' />
    </svg>
  )

  const buttonActiveStyle: React.CSSProperties = {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  }

  const ToolbarButton: React.FC<{
    onClick: () => void
    title: string
    children: React.ReactNode
    isActive?: boolean
  }> = ({ onClick, title, children, isActive = false }) => {
    const [isHovered, setIsHovered] = React.useState(false)

    return (
      <button
        onClick={e => {
          e.stopPropagation()
          onClick()
        }}
        title={title}
        style={{
          ...buttonStyle,
          ...(isActive ? buttonActiveStyle : {}),
          ...(isHovered && !isActive ? buttonHoverStyle : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </button>
    )
  }

  return (
    <div
      style={{
        ...positionStyles,
        display: 'flex',
        gap: 4,
        padding: 4,
        backgroundColor: 'transparent',
        borderRadius: 10,
        pointerEvents: 'auto',
      }}
    >
      {mergedConfig.showPanToggle && zoom > 1 && (
        <ToolbarButton
          onClick={onTogglePanMode}
          title={isPanModeActive ? 'Switch to draw mode' : 'Switch to pan mode'}
          isActive={isPanModeActive}
        >
          <MoveIcon />
        </ToolbarButton>
      )}

      {mergedConfig.showZoomOut && (
        <ToolbarButton onClick={onZoomOut} title='Zoom out'>
          {!zoomOutCustomIcon ? <ZoomOutIcon /> : zoomOutCustomIcon}
        </ToolbarButton>
      )}

      {mergedConfig.showZoomLevel && (
        <div style={zoomLevelStyle}>{Math.round(zoom * 100)}%</div>
      )}

      {mergedConfig.showZoomIn && (
        <ToolbarButton onClick={onZoomIn} title='Zoom in'>
          {!zoomInCustomIcon ? <ZoomInIcon /> : zoomInCustomIcon}
        </ToolbarButton>
      )}

      {mergedConfig.showReset && (
        <ToolbarButton onClick={onReset} title='Reset zoom'>
          {!resetCustomIcon ? <ResetIcon /> : resetCustomIcon}
        </ToolbarButton>
      )}

      {mergedConfig.showFullscreen && fullscreenEnabled && (
        <ToolbarButton
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {fullscreenCustomIcon ? (
            fullscreenCustomIcon
          ) : isFullscreen ? (
            <ExitFullscreenIcon />
          ) : (
            <FullscreenIcon />
          )}
        </ToolbarButton>
      )}
    </div>
  )
}
