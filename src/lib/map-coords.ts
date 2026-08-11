export type MapCoords = { lat: number; lng: number }

export function parseCoordsFromPin(value?: string): MapCoords | null {
  if (!value?.trim()) return null
  const raw = value.trim()

  const qMatch = raw.match(/[?&]q=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/i)
  if (qMatch) return { lat: Number(qMatch[1]), lng: Number(qMatch[2]) }

  const atMatch = raw.match(/@(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
  if (atMatch) return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) }

  const pair = raw.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/)
  if (pair) return { lat: Number(pair[1]), lng: Number(pair[2]) }

  return null
}
