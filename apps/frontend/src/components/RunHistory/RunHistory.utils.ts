export const formatDurationMs = (ms: number | null | undefined): string => {
  if (ms == null || !Number.isFinite(ms)) return '/'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export const formatRunTimestamp = (iso: string | null | undefined): string => {
  if (!iso) return '/'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '/'
  const datePart = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d) // YYYY-MM-DD
  const timePart = d.toTimeString().slice(0, 8) // HH:MM:SS
  return `${datePart} ${timePart}`
}
