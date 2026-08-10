import type { NextConfig } from 'next'
import { getSecurityHeaders } from './src/lib/security-headers'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'sonner']
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [384, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowSVG: false
  },
  async headers() {
    const security = getSecurityHeaders(isProd)
    return [
      {
        source: '/:path*',
        headers: Object.entries(security).map(([key, value]) => ({ key, value }))
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

export default nextConfig
