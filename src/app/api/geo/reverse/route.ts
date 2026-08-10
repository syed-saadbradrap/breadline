import { NextResponse } from 'next/server'
import { mapNominatim, type NominatimResult } from '@/lib/geocode'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const source = (searchParams.get('source') as 'gps' | 'ip' | null) || 'gps'

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('lat', lat)
    url.searchParams.set('lon', lng)
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('zoom', '18')

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BreadlineWeb/1.0 (contact@breadline.com)'
      },
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Reverse geocode failed' }, { status: 502 })
    }

    const data = (await res.json()) as NominatimResult
    if (!data?.lat || !data?.lon) {
      return NextResponse.json({ error: 'No address found' }, { status: 404 })
    }

    return NextResponse.json(mapNominatim(data, source === 'ip' ? 'ip' : 'gps'))
  } catch {
    return NextResponse.json({ error: 'Reverse geocode failed' }, { status: 500 })
  }
}
