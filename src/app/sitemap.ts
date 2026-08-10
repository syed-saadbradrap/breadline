import type { MetadataRoute } from 'next'
import { products } from '@/data/products'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://breadline.local'
  const staticRoutes = [
    '',
    '/menu',
    '/about',
    '/contact',
    '/cart',
    '/checkout',
    '/track-order',
    '/login',
    '/register',
    '/account',
    '/account/orders'
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7
  }))

  const productRoutes = products.map((p) => ({
    url: `${base}/menu/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  return [...staticRoutes, ...productRoutes]
}
