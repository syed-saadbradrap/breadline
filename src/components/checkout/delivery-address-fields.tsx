'use client'

import { useEffect, useEffectEvent, useRef, useState, useTransition } from 'react'
import { Crosshair, Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import type { GeoSuggestion, ResolvedLocation } from '@/lib/geocode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocationPinField } from '@/components/checkout/location-pin-field'
import { cn } from '@/lib/utils'

type Fields = {
  address: string
  city: string
  postalCode: string
  locationPin: string
}

export function DeliveryAddressFields({
  values,
  onChange,
  errors
}: {
  values: Fields
  onChange: (patch: Partial<Fields>) => void
  errors?: Partial<Record<keyof Fields, string>>
}) {
  const [query, setQuery] = useState(values.address)
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [searching, startSearch] = useTransition()
  const wrapRef = useRef<HTMLDivElement>(null)
  const skipNextSearch = useRef(false)
  const autoTried = useRef(false)

  const applyLocation = useEffectEvent((loc: ResolvedLocation) => {
    skipNextSearch.current = true
    setQuery(loc.address)
    onChange({
      address: loc.address,
      city: loc.city || 'Karachi',
      postalCode: loc.postalCode || values.postalCode,
      locationPin: loc.mapsUrl
    })
    setSuggestions([])
    setOpen(false)
  })

  const detectLocation = useEffectEvent(async (silent = false) => {
    setDetecting(true)
    try {
      const gps = await getGpsCoords().catch(() => null)
      if (gps) {
        const loc = await reverseGeocode(gps.lat, gps.lng, 'gps')
        applyLocation(loc)
        if (!silent) toast.success('Exact GPS location applied')
        return
      }

      const ip = await fetch('/api/geo/ip').then(async (r) => {
        if (!r.ok) throw new Error('ip')
        return r.json() as Promise<{ lat: number; lng: number }>
      })
      const loc = await reverseGeocode(ip.lat, ip.lng, 'ip')
      applyLocation(loc)
      if (!silent) toast.success('Approximate location from IP applied — adjust pin if needed')
    } catch {
      if (!silent) toast.error('Could not detect location. Type your address or allow GPS.')
    } finally {
      setDetecting(false)
    }
  })

  useEffect(() => {
    if (autoTried.current) return
    autoTried.current = true
    void detectLocation(true)
  }, [detectLocation])

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false
      return
    }
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }

    const timer = window.setTimeout(() => {
      startSearch(async () => {
        try {
          const res = await fetch(`/api/geo/search?q=${encodeURIComponent(query.trim())}`)
          if (!res.ok) return
          const data = (await res.json()) as GeoSuggestion[]
          setSuggestions(Array.isArray(data) ? data : [])
          setOpen(true)
        } catch {
          // ignore
        }
      })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pickSuggestion = (s: GeoSuggestion) => {
    skipNextSearch.current = true
    const addressLine = s.address || s.title
    setQuery(addressLine)
    onChange({
      address: addressLine,
      city: s.city || 'Karachi',
      postalCode: s.postalCode || '',
      locationPin: s.mapsUrl
    })
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink/60">Delivery address with live suggestions</p>
        <Button
          type="button"
          size="sm"
          variant="soft"
          onClick={() => void detectLocation(false)}
          disabled={detecting}
        >
          {detecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
          {detecting ? 'Detecting…' : 'Detect exact location'}
        </Button>
      </div>

      <div className="relative sm:col-span-2" ref={wrapRef}>
        <Label htmlFor="address">Address</Label>
        <div className="relative mt-1.5">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <Input
            id="address"
            value={query}
            autoComplete="off"
            placeholder="Type area, street, or society (English)…"
            className="pl-10"
            onChange={(e) => {
              setQuery(e.target.value)
              onChange({ address: e.target.value })
              setOpen(true)
            }}
            onFocus={() => suggestions.length && setOpen(true)}
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink/35" />
          )}
        </div>
        {errors?.address && <p className="mt-1 text-xs text-brand">{errors.address}</p>}

        {open && suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-ink/10 bg-white py-1 shadow-lg">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-brand/5'
                  )}
                  onClick={() => pickSuggestion(s)}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">{s.title || s.address}</span>
                    <span className="block truncate text-xs text-ink/50">
                      {s.subtitle || s.label}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={values.city}
          onChange={(e) => onChange({ city: e.target.value })}
        />
        {errors?.city && <p className="mt-1 text-xs text-brand">{errors.city}</p>}
      </div>
      <div>
        <Label htmlFor="postalCode">Postal code</Label>
        <Input
          id="postalCode"
          value={values.postalCode}
          onChange={(e) => onChange({ postalCode: e.target.value })}
        />
      </div>

      <LocationPinField
        value={values.locationPin}
        onChange={(v) => onChange({ locationPin: v })}
        error={errors?.locationPin}
        onResolved={applyLocation}
      />
    </div>
  )
}

async function getGpsCoords(): Promise<{ lat: number; lng: number }> {
  if (!navigator.geolocation) throw new Error('no-geo')
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('denied')),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    )
  })
}

async function reverseGeocode(lat: number, lng: number, source: 'gps' | 'ip') {
  const res = await fetch(
    `/api/geo/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}&source=${source}`
  )
  if (!res.ok) throw new Error('reverse')
  return res.json() as Promise<ResolvedLocation>
}
