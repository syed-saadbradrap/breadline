import { NextResponse } from 'next/server'
import {
  KARACHI_VIEWBOX,
  biasSearchQuery,
  dedupeSuggestions,
  mapNominatimSuggestion,
  type NominatimResult
} from '@/lib/geocode'

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()

  if (q.length < 2) {
    return NextResponse.json([])
  }

  try {
    const biased = biasSearchQuery(q)

    // Prefer Karachi-bounded results first, then widen if thin.
    let results = await nominatimSearch(biased, true)
    if (results.length < 3) {
      const wider = await nominatimSearch(biased, false)
      results = [...results, ...wider]
    }

    const suggestions = dedupeSuggestions(results.map(mapNominatimSuggestion)).slice(0, 7)
    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
