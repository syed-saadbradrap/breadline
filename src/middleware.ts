import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSecurityHeaders } from '@/lib/security-headers'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const isProd = process.env.NODE_ENV === 'production'
  const headers = getSecurityHeaders(isProd)

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }

  // Avoid caching authenticated-looking client shells aggressively
  if (request.nextUrl.pathname.startsWith('/account')) {
    response.headers.set('Cache-Control', 'private, no-store')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Apply to all routes except Next internals and common static assets.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)'
  ]
}
