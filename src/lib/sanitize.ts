/** Lightweight client-side text hardening (not a substitute for server validation). */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const TAG_LIKE = /<\/?[a-zA-Z][^>]*>/g
const JS_URI = /javascript\s*:/gi
const DATA_URI = /data\s*:/gi

export function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(CONTROL_CHARS, '')
    .replace(TAG_LIKE, '')
    .replace(JS_URI, '')
    .replace(DATA_URI, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[^\d+\s()-]/g, '').trim().slice(0, 20)
}

export function clampInt(value: unknown, min: number, max: number, fallback = min): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(n)))
}
