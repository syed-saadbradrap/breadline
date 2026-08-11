import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Manrope } from 'next/font/google'
import { Toaster } from 'sonner'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Preloader } from '@/components/layout/preloader'
import { OrderTypePopup } from '@/components/layout/order-type-popup'
import { StoreClosedPopup } from '@/components/layout/store-closed-popup'
import './globals.css'

const display = Bebas_Neue({
  variable: '--font-display-face',
  subsets: ['latin'],
  weight: '400',
  display: 'swap'
})

const body = Manrope({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap'
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#c41e22',
  colorScheme: 'light'
}

export const metadata: Metadata = {
  metadataBase: new URL('https://breadline-syed-8387s-projects.vercel.app'),
  title: {
    default: 'Breadline | Sandwiches & Burgers',
    template: '%s | Breadline'
  },
  description:
    'Premium quality sandwiches and burgers in North Karachi. Toast. Bite. Repeat. Est. 2026.',
  applicationName: 'Breadline',
  keywords: [
    'Breadline',
    'burgers',
    'sandwiches',
    'wraps',
    'North Karachi',
    'Sector 9',
    'food delivery'
  ],
  authors: [{ name: 'Breadline' }],
  creator: 'Breadline',
  publisher: 'Breadline',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico']
  },
  openGraph: {
    title: 'Breadline — Sandwiches & Burgers',
    description:
      'Premium quality sandwiches and burgers. Toast. Bite. Repeat. Est. 2026 · Sector 9, North Karachi.',
    type: 'website',
    locale: 'en_PK',
    siteName: 'Breadline',
    url: '/',
    images: [
      {
        url: '/images/og.png',
        width: 1200,
        height: 1200,
        alt: 'Breadline — Sandwiches & Burgers · Toast. Bite. Repeat.'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breadline — Sandwiches & Burgers',
    description:
      'Premium quality sandwiches and burgers. Toast. Bite. Repeat. Est. 2026 · Sector 9, North Karachi.',
    images: ['/images/og.png']
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  other: {
    'format-detection': 'telephone=no'
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Breadline',
  image: '/images/breadline-logo-badge.png',
  servesCuisine: ['Burgers', 'Sandwiches', 'Wraps', 'Fast Food'],
  priceRange: '$$',
  telephone: '+92-342-4511939',
  email: 'contact@breadline.com',
  openingHours: 'Mo-Su 16:00-03:00',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Sector 9',
    addressLocality: 'North Karachi',
    addressRegion: 'Sindh',
    addressCountry: 'PK'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 24.9735,
    longitude: 67.0662
  },
  hasMap: 'https://www.google.com/maps/search/?api=1&query=Sector%209%2C%20North%20Karachi%2C%20Karachi%2C%20Pakistan',
  url: 'https://breadline.com',
  acceptsReservations: false
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-hidden pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(sessionStorage.getItem('bl-preloader-seen')!=='1'){document.documentElement.classList.add('bl-boot');}}catch(e){document.documentElement.classList.add('bl-boot');}})();`
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div id="bl-boot-screen" aria-hidden="true">
          <div style={{ textAlign: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/breadline-logo.png"
              alt=""
              width={88}
              height={88}
              style={{
                width: 88,
                height: 88,
                borderRadius: '9999px',
                objectFit: 'cover',
                boxShadow: '0 0 40px rgba(196,30,34,0.4)'
              }}
            />
            <div
              style={{
                marginTop: 28,
                fontFamily: 'var(--font-display-face), sans-serif',
                fontSize: 48,
                letterSpacing: '0.06em',
                lineHeight: 1
              }}
            >
              <span style={{ color: '#fff' }}>BREAD</span>
              <span style={{ color: '#c41e22' }}>LINE</span>
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)'
              }}
            >
              Toast. Bite. Repeat.
            </div>
          </div>
        </div>
        <Preloader />
        <StoreClosedPopup />
        <OrderTypePopup />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBottomNav />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
