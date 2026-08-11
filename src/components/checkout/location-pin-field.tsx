'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { MapPin, Crosshair, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ResolvedLocation } from '@/lib/geocode'
import type { MapCoords } from '@/lib/map-coords'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MapPinPicker = dynamic(
  () => import('@/components/checkout/map-pin-picker').then((m) => m.MapPinPicker),
  {
    ssr: false,
    loading: () => (
      <div className="mb-3 flex h-[240px] items-center justify-center rounded-2xl border border-ink/10 bg-muted text-sm text-ink/50 sm:h-[280px]">
        Loading map…
      </div>
    )
  }
)

export function LocationPinField({
  value,
  onChange,
  error,
  onResolved
}: {
  value: string
  onChange: (value: string) => void
  error?: string
  onResolved?: (loc: ResolvedLocation) => void
}) {
  const [loading, setLoading] = useState(false)
  const [mapBusy, setMapBusy] = useState(false)

  const applyCoords = async (
    coords: MapCoords,
    opts?: { fillAddress?: boolean; source?: 'gps' | 'search' }
  ) => {
    const mapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    onChange(mapsUrl)

    if (!opts?.fillAddress) return

    setMapBusy(true)
    try {
      const res = await fetch(
        `/api/geo/reverse?lat=${coords.lat}&lng=${coords.lng}&source=${opts.source || 'gps'}`
      )
      if (!res.ok) {
        toast.message('Pin saved — type your street/area in Address if needed')
        return
      }
      const loc = (await res.json()) as ResolvedLocation
      onChange(loc.mapsUrl)
      onResolved?.(loc)
    } catch {
      toast.message('Pin saved — type your street/area in Address if needed')
    } finally {
      setMapBusy(false)
    }
  }

  const useMyLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Location not supported on this device')
      return
    }

    setLoading(true)
    try {
      const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          () => reject(new Error('denied')),
          { enableHighAccuracy: true, timeout: 15000 }
        )
      })

      await applyCoords(
        { lat: coords.latitude, lng: coords.longitude },
        { fillAddress: true, source: 'gps' }
      )
      toast.success('Exact pin placed on map')
    } catch {
      toast.error('Could not get GPS. Allow location or tap the map to place pin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sm:col-span-2">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Label htmlFor="locationPin">Pin location</Label>
        <Button
          type="button"
          size="sm"
          variant="soft"
          onClick={() => void useMyLocation()}
          disabled={loading}
          className="h-8"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
          {loading ? 'Pinning…' : 'Exact GPS pin'}
        </Button>
      </div>

      <MapPinPicker
        value={value}
        onPick={(coords) => {
          void applyCoords(coords, { fillAddress: true, source: 'gps' }).then(() => {
            toast.success('Pin + address updated')
          })
        }}
        className="mb-3"
      />

      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
        <Input
          id="locationPin"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pin updates when you tap the map"
          className="pl-10"
          readOnly
        />
        {mapBusy && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink/35" />
        )}
      </div>
      {error && <p className="mt-1 text-xs text-brand">{error}</p>}
      <p className="mt-1.5 text-xs text-ink/45">
        Tap or drag the red pin — we’ll fill the address from that spot automatically.
      </p>
      {value && (
        <a
          href={value.startsWith('http') ? value : `https://www.google.com/maps?q=${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex text-xs font-semibold text-brand hover:underline"
        >
          Open pin in Google Maps
        </a>
      )}
    </div>
  )
}
