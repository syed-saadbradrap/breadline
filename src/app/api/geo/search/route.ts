import { NextResponse } from 'next/server'
import {
  KARACHI_VIEWBOX,
  biasSearchQuery,
  dedupeSuggestions,
  mapNominatimSuggestion,
  toEnglishText,
  type GeoSuggestion,
  type NominatimResult
} from '@/lib/geocode'
import { siteInfo } from '@/data/site'

export const runtime = 'edge'

const NOMINATIM_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'en',
  'User-Agent': 'BreadlineWeb/1.0 (contact@breadline.com)'
}

async function nominatimSearch(q: string, bounded: boolean): Promise<NominatimResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('q', q)
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '8')
  url.searchParams.set('countrycodes', 'pk')
  url.searchParams.set('viewbox', KARACHI_VIEWBOX)
  url.searchParams.set('bounded', bounded ? '1' : '0')
  url.searchParams.set('accept-language', 'en')

  const res = await fetch(url.toString(), {
    headers: NOMINATIM_HEADERS,
    next: { revalidate: 30 }
  })

  if (!res.ok) return []
  const data = (await res.json()) as NominatimResult[]
  return Array.isArray(data) ? data : []
}

type PhotonFeature = {
  properties?: {
    osm_id?: number
    name?: string
    street?: string
    housenumber?: string
    district?: string
    city?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
  }
  geometry?: { coordinates?: [number, number] }
}

/** Photon autocomplete — stronger for free-text street/area names. */
async function photonSearch(q: string): Promise<GeoSuggestion[]> {
  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', q)
  url.searchParams.set('lat', String(siteInfo.lat))
  url.searchParams.set('lon', String(siteInfo.lng))
  url.searchParams.set('limit', '8')
  url.searchParams.set('lang', 'en')
  url.searchParams.set('bbox', '66.80,24.72,67.45,25.20')

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 30 }
  })
  if (!res.ok) return []

  const data = (await res.json()) as { features?: PhotonFeature[] }
  const features = Array.isArray(data.features) ? data.features : []

  return features
    .map((f, i) => {
      const p = f.properties || {}
      const [lng, lat] = f.geometry?.coordinates || []
      if (lat == null || lng == null) return null
      if (p.country && !/pakistan/i.test(p.country)) return null

      const street = toEnglishText(
        [p.housenumber, p.street || p.name].filter(Boolean).join(' ')
      )
      const area = toEnglishText(p.district || '')
      const city = toEnglishText(p.city || p.county || 'Karachi') || 'Karachi'
      const postalCode = toEnglishText(p.postcode || '')
      const title = street || toEnglishText(p.name || '') || 'Selected location'
      const subtitle = [area, city, postalCode, 'Pakistan'].filter(Boolean).join(', ')
      const address = [title, area].filter(Boolean).join(', ')

      return {
        id: `ph-${p.osm_id ?? i}-${lat.toFixed(5)}`,
        title,
        subtitle,
        label: `${title} — ${subtitle}`,
        address,
        city: /karachi/i.test(city) ? 'Karachi' : city,
        postalCode,
        lat,
        lng,
        mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`
      } satisfies GeoSuggestion
    })
    .filter(Boolean) as GeoSuggestion[]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()

  if (q.length < 2) {
    return NextResponse.json([])
  }

  try {
    const biased = biasSearchQuery(q)

    const [bounded, photon] = await Promise.all([
      nominatimSearch(biased, true),
      photonSearch(biased).catch(() => [] as GeoSuggestion[])
    ])

    let nominatim = bounded
    if (nominatim.length < 3) {
      const wider = await nominatimSearch(biased, false)
      nominatim = [...nominatim, ...wider]
    }

    const fromNominatim = nominatim.map(mapNominatimSuggestion)
    const suggestions = dedupeSuggestions([...photon, ...fromNominatim]).slice(0, 8)
    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
