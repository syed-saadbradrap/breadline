export type GeoSuggestion = {
  id: string
  label: string
  address: string
  city: string
  postalCode: string
  lat: number
  lng: number
  mapsUrl: string
}

export type ResolvedLocation = {
  address: string
  city: string
  postalCode: string
  lat: number
  lng: number
  mapsUrl: string
  source: 'gps' | 'ip' | 'search'
  accuracy?: 'exact' | 'approximate'
}

type NominatimResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: {
    road?: string
    pedestrian?: string
    neighbourhood?: string
    suburb?: string
    village?: string
    town?: string
    city?: string
    city_district?: string
    county?: string
    state_district?: string
    state?: string
    postcode?: string
    house_number?: string
  }
}

const KARACHI_VIEWBOX = '66.80,24.72,67.45,25.20' // left,bottom,right,top

function buildStreet(a: NominatimResult['address']): string {
  if (!a) return ''
  const parts = [
    [a.house_number, a.road || a.pedestrian].filter(Boolean).join(' '),
    a.neighbourhood,
    a.suburb,
    a.village
  ].filter(Boolean)
  return parts.join(', ')
}

function buildCity(a: NominatimResult['address']): string {
  if (!a) return 'Karachi'
  return a.city || a.town || a.city_district || a.county || a.state_district || 'Karachi'
}

export function mapNominatim(result: NominatimResult, source: ResolvedLocation['source'] = 'search'): ResolvedLocation {
  const lat = Number(result.lat)
  const lng = Number(result.lon)
  const street = buildStreet(result.address)
  const address = street || result.display_name.split(',').slice(0, 3).join(',').trim()
  return {
    address,
    city: buildCity(result.address),
    postalCode: result.address?.postcode || '',
    lat,
    lng,
    mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
    source,
    accuracy: source === 'gps' ? 'exact' : 'approximate'
  }
}

export function mapNominatimSuggestion(result: NominatimResult): GeoSuggestion {
  const resolved = mapNominatim(result, 'search')
  return {
    id: String(result.place_id),
    label: result.display_name,
    address: resolved.address,
    city: resolved.city,
    postalCode: resolved.postalCode,
    lat: resolved.lat,
    lng: resolved.lng,
    mapsUrl: resolved.mapsUrl
  }
}

export { KARACHI_VIEWBOX }
export type { NominatimResult }
