import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Breadline Rider',
    short_name: 'Breadline',
    description: 'Breadline rider deliveries — food ready alerts',
    start_url: '/rider',
    display: 'standalone',
    background_color: '#1a1212',
    theme_color: '#c41e22',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  }
}
