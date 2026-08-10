export type GeoSuggestion = {
  id: string
  title: string
  subtitle: string
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
  name?: string
  display_name: string
  lat: string
  lon: string
  type?: string
  class?: string
  address?: {
    road?: string
    pedestrian?: string
    footway?: string
    path?: string
    house_number?: string
    neighbourhood?: string
    suburb?: string
    quarter?: string
    residential?: string
    village?: string
    hamlet?: string
    town?: string
    city?: string
    city_district?: string
    county?: string
    state_district?: string
    state?: string
    postcode?: string
    country?: string
  }
}

const KARACHI_VIEWBOX = '66.80,24.72,67.45,25.20' // left,bottom,right,top

/** Strip Urdu/Arabic script and tidy punctuation so UI stays English. */
export function toEnglishText(value: string): string {
  return value
    .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/,(?:\s*,)+/g, ',')
    .replace(/^,\s*|,\s*$/g, '')
    .trim()
}

function part(value?: string): string {
  return value ? toEnglishText(value) : ''
}

function buildStreet(a: NominatimResult['address'], fallbackName?: string): string {
  if (!a) return part(fallbackName)
  const line = [part(a.house_number), part(a.road || a.pedestrian || a.footway || a.path)]
    .filter(Boolean)
    .join(' ')
  const area = part(a.neighbourhood || a.residential || a.quarter || a.suburb || a.village || a.hamlet)
  return [line, area].filter(Boolean).join(', ') || part(fallbackName)
}

function buildCity(a: NominatimResult['address']): string {
  if (!a) return 'Karachi'
  const city = part(a.city || a.town || a.city_district || a.county || a.state_district)
  if (!city) return 'Karachi'
  if (/karachi/i.test(city)) return 'Karachi'
  return city
}

function buildSubtitle(a: NominatimResult['address'], city: string, postalCode: string): string {
  const bits = [
    part(a?.suburb),
    city,
    postalCode,
    part(a?.state) || 'Sindh',
    'Pakistan'
  ].filter(Boolean)

  // Drop consecutive duplicates (e.g. suburb === city)
  const unique: string[] = []
  for (const bit of bits) {
    if (!unique.some((u) => u.toLowerCase() === bit.toLowerCase())) unique.push(bit)
  }
  return unique.join(', ')
}

export function mapNominatim(
  result: NominatimResult,
  source: ResolvedLocation['source'] = 'search'
): ResolvedLocation {
  const lat = Number(result.lat)
  const lng = Number(result.lon)
  const street = buildStreet(result.address, result.name || result.display_name)
  const city = buildCity(result.address)
  const postalCode = part(result.address?.postcode)
  const address =
    street ||
    toEnglishText(result.display_name)
      .split(',')
      .slice(0, 3)
      .join(', ')
      .trim()

  return {
    address,
    city,
    postalCode,
    lat,
    lng,
    mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
    source,
    accuracy: source === 'gps' ? 'exact' : 'approximate'
  }
}

export function mapNominatimSuggestion(result: NominatimResult): GeoSuggestion {
  const resolved = mapNominatim(result, 'search')
  const title =
    resolved.address ||
    part(result.name) ||
    toEnglishText(result.display_name).split(',')[0] ||
    'Selected location'
  const subtitle = buildSubtitle(result.address, resolved.city, resolved.postalCode)
  const label = [title, subtitle].filter(Boolean).join(' — ')

  return {
    id: String(result.place_id),
    title,
    subtitle,
    label,
    address: resolved.address || title,
    city: resolved.city,
    postalCode: resolved.postalCode,
    lat: resolved.lat,
    lng: resolved.lng,
    mapsUrl: resolved.mapsUrl
  }
}

export function dedupeSuggestions(items: GeoSuggestion[]): GeoSuggestion[] {
  const seen = new Set<string>()
  const out: GeoSuggestion[] = []
  for (const item of items) {
    const key = `${item.title.toLowerCase()}|${item.lat.toFixed(4)}|${item.lng.toFixed(4)}`
    if (seen.has(key) || !item.title) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

/** Bias free-text search toward Karachi delivery areas. */
export function biasSearchQuery(q: string): string {
  const trimmed = q.trim()
  if (!trimmed) return trimmed
  if (/karachi|pakistan|sindh/i.test(trimmed)) return trimmed
  return `${trimmed}, Karachi, Pakistan`
}

export { KARACHI_VIEWBOX }
export type { NominatimResult }
