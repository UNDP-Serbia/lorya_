import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Loading } from '@shared/ui'
import { useIsFetching, useIsMutating } from '@tanstack/react-query'

// A small global network loader that shows while any React Query fetches or mutations are pending.
// Includes a short delay to avoid flicker on very fast requests.
const SHOW_DELAY_MS = 150
const MIN_VISIBLE_MS = 300

export const GlobalNetworkLoader: React.FC = () => {
  const fetching = useIsFetching()
  const mutating = useIsMutating()
  const hasNetworkActivity = useMemo(
    () => fetching + mutating > 0,
    [fetching, mutating]
  )

  const [visible, setVisible] = useState(false)
  const showTimeout = useRef<number>(0)
  const hideTimeout = useRef<number>(0)

  useEffect(() => {
    if (hasNetworkActivity) {
      showTimeout.current = window.setTimeout(() => {
        setVisible(true)
      }, SHOW_DELAY_MS)
    } else {
      window.clearTimeout(showTimeout.current)

      hideTimeout.current = window.setTimeout(() => {
        setVisible(false)
      }, MIN_VISIBLE_MS)
    }

    return () => {
      window.clearTimeout(showTimeout.current)
      window.clearTimeout(hideTimeout.current)
    }
  }, [hasNetworkActivity])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.35) 100%)',
      }}
    >
      <Loading size={56} />
    </div>
  )
}
