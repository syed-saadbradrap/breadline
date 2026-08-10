import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Manrope } from 'next/font/google'
import { Toaster } from 'sonner'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Preloader } from '@/components/layout/preloader'
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
  metadataBase: new URL('https://breadline.local'),
  title: {
    default: 'Breadline | Crispy Burgers, Wraps & Sandwiches',
    template: '%s | Breadline'
  },
  description:
    'Order from Breadline — freshly prepared burgers, wraps, sandwiches and sides. Toast. Bite. Repeat.',
  openGraph: {
    title: 'Breadline',
    description: 'Crispy. Juicy. Irresistible. Order burgers, wraps and sandwiches online.',
    type: 'website',
    locale: 'en_PK',
    siteName: 'Breadline',
    images: [{ url: '/images/breadline-logo.png', width: 512, height: 512, alt: 'Breadline' }]
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
  image: '/images/breadline-logo.png',
  servesCuisine: ['Burgers', 'Sandwiches', 'Wraps', 'Fast Food'],
  priceRange: '$$',
  telephone: '+92-300-0000000',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Your City',
    addressCountry: 'PK'
  },
  url: 'https://breadline.local',
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBottomNav />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
