'use client'

import { useState } from 'react'
import { MapPin, Crosshair } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LocationPinField({
  value,
  onChange,
  error
}: {
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const [loading, setLoading] = useState(false)

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location not supported on this device')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`
        onChange(link)
        setLoading(false)
        toast.success('Pin location added')
      },
      () => {
        setLoading(false)
        toast.error('Could not get location. Allow location access or paste a Maps pin link.')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  return (
    <div className="sm:col-span-2">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Label htmlFor="locationPin">Pin location (optional)</Label>
        <Button
          type="button"
          size="sm"
          variant="soft"
          onClick={useMyLocation}
          disabled={loading}
          className="h-8"
        >
          <Crosshair className="h-3.5 w-3.5" />
          {loading ? 'Getting…' : 'Use my location'}
        </Button>
      </div>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
        <Input
          id="locationPin"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste Google Maps pin link, or tap Use my location"
          className="pl-10"
        />
      </div>
      {error && <p className="mt-1 text-xs text-brand">{error}</p>}
      <p className="mt-1.5 text-xs text-ink/45">
        Helps the rider find you faster — WhatsApp/Google Maps pin link also works.
      </p>
      {value && (
        <a
          href={value}
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
