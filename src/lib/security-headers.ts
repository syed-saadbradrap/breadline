/** Shared security headers for middleware + next.config */
export function getSecurityHeaders(isProd: boolean): Record<string, string> {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.google.com https://*.gstatic.com https://*.googleapis.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
    "font-src 'self' data:",
    "connect-src 'self' https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
    "media-src 'self'",
    "frame-src 'self' https://www.google.com https://maps.google.com https://www.google.com/maps",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')

  const headers: Record<string, string> = {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-DNS-Prefetch-Control': 'on'
  }

  if (isProd) {
    headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload'
  }

  return headers
}
