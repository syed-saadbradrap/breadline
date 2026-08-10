import { NextResponse } from 'next/server'

export const runtime = 'edge'

type IpWho = {
  success?: boolean
  latitude?: number
  longitude?: number
  city?: string
  region?: string
  postal?: string
  message?: string
}

export async function GET(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip =
      forwarded?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      ''

    const endpoint = ip
      ? `https://ipwho.is/${encodeURIComponent(ip)}`
      : 'https://ipwho.is/'

    const res = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 }
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'IP lookup failed' }, { status: 502 })
    }

    const data = (await res.json()) as IpWho
    if (data.success === false || data.latitude == null || data.longitude == null) {
      return NextResponse.json({ error: data.message || 'Location unavailable' }, { status: 404 })
    }

    return NextResponse.json({
      lat: data.latitude,
      lng: data.longitude,
      city: data.city || 'Karachi',
      region: data.region || '',
      postalCode: data.postal || '',
      source: 'ip',
      accuracy: 'approximate'
    })
  } catch {
    return NextResponse.json({ error: 'IP lookup failed' }, { status: 500 })
  }
}
