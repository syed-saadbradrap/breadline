'use client'

import { useState } from 'react'
import { MapPin, Crosshair, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ResolvedLocation } from '@/lib/geocode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

      const res = await fetch(
        `/api/geo/reverse?lat=${coords.latitude}&lng=${coords.longitude}&source=gps`
      )
      if (!res.ok) throw new Error('reverse')
      const loc = (await res.json()) as ResolvedLocation
      onChange(loc.mapsUrl)
      onResolved?.(loc)
      toast.success('Exact pin location added')
    } catch {
      toast.error('Could not get exact location. Allow GPS or paste a Maps pin link.')
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
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
        <Input
          id="locationPin"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Auto-filled from GPS / IP, or paste Google Maps pin"
          className="pl-10"
        />
      </div>
      {error && <p className="mt-1 text-xs text-brand">{error}</p>}
      <p className="mt-1.5 text-xs text-ink/45">
        Exact GPS pin helps the rider. WhatsApp location link also works.
      </p>
      {value && (
        <a
          href={value.startsWith('http') ? value : `https://www.google.com/maps?q=${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex text-xs font-semibold text-brand hover:underline"
        >
          Preview pin on Maps
        </a>
      )}
    </div>
  )
}
