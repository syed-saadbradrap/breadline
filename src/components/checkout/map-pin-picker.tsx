'use client'

import { useEffect, useRef } from 'react'
import { siteInfo } from '@/data/site'
import { cn } from '@/lib/utils'
import { parseCoordsFromPin, type MapCoords } from '@/lib/map-coords'

export type { MapCoords }
export { parseCoordsFromPin }

const KARACHI: MapCoords = { lat: siteInfo.lat, lng: siteInfo.lng }

export function MapPinPicker({
  value,
  onPick,
  className
}: {
  value?: string
  onPick: (coords: MapCoords) => void
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const markerRef = useRef<import('leaflet').Marker | null>(null)
  const onPickRef = useRef(onPick)
  onPickRef.current = onPick

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false

    async function init() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      if (cancelled || !containerRef.current || mapRef.current) return

      const brandIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:28px;height:28px;border-radius:999px;
          background:#C41E22;border:3px solid #fff;
          box-shadow:0 4px 14px rgba(20,20,20,.35);
          transform:translate(-50%,-50%);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      })

      const start = parseCoordsFromPin(value) || KARACHI
      const map = L.map(containerRef.current, {
        center: [start.lat, start.lng],
        zoom: 16,
        zoomControl: true,
        attributionControl: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map)

      const marker = L.marker([start.lat, start.lng], {
        draggable: true,
        icon: brandIcon
      }).addTo(map)

      marker.on('dragend', () => {
        const p = marker.getLatLng()
        onPickRef.current({ lat: p.lat, lng: p.lng })
      })

      map.on('click', (e) => {
        marker.setLatLng(e.latlng)
        onPickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng })
      })

      mapRef.current = map
      markerRef.current = marker
      requestAnimationFrame(() => map.invalidateSize())
      window.setTimeout(() => map.invalidateSize(), 250)
    }

    void init()

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const marker = markerRef.current
    if (!map || !marker) return
    const coords = parseCoordsFromPin(value)
    if (!coords) return
    const current = marker.getLatLng()
    if (
      Math.abs(current.lat - coords.lat) < 0.00001 &&
      Math.abs(current.lng - coords.lng) < 0.00001
    ) {
      return
    }
    marker.setLatLng([coords.lat, coords.lng])
    map.panTo([coords.lat, coords.lng])
  }, [value])

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-ink/10 bg-muted shadow-sm',
        className
      )}
    >
      <div ref={containerRef} className="h-[240px] w-full sm:h-[280px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-3 pb-2.5 pt-8">
        <p className="text-center text-[11px] font-semibold text-white/95 sm:text-xs">
          Tap map or drag the red pin to set exact delivery location
        </p>
      </div>
    </div>
  )
}
