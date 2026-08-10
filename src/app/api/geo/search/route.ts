import { NextResponse } from 'next/server'
import { KARACHI_VIEWBOX, mapNominatimSuggestion, type NominatimResult } from '@/lib/geocode'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()

  if (q.length < 2) {
    return NextResponse.json([])
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('q', q)
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('limit', '7')
    url.searchParams.set('countrycodes', 'pk')
    url.searchParams.set('viewbox', KARACHI_VIEWBOX)
    url.searchParams.set('bounded', '0')

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BreadlineWeb/1.0 (contact@breadline.com)'
      },
      next: { revalidate: 30 }
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Search failed' }, { status: 502 })
    }

    const data = (await res.json()) as NominatimResult[]
    return NextResponse.json((data || []).map(mapNominatimSuggestion))
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
