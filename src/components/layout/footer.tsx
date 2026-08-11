'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { siteInfo } from '@/data/site'

export function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/rider')) return null

  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:px-8">
        <div className="md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <Image
              src="/images/breadline-logo.png"
              alt="Breadline"
              width={52}
              height={52}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white/15 sm:h-[52px] sm:w-[52px]"
            />
            <div className="font-display text-3xl tracking-[0.04em]">
              <span className="text-white">BREAD</span>
              <span className="text-brand">LINE</span>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
            Freshly prepared burgers, wraps, sandwiches and sides made for your cravings.
          </p>
          <div className="mt-4 space-y-1 text-sm text-white/55">
            <p>{siteInfo.address}</p>
            <a
              href={siteInfo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-white"
            >
              View pin on Maps
            </a>
            <a href={siteInfo.phoneHref} className="block hover:text-white">
              {siteInfo.phone}
            </a>
            <a href={siteInfo.emailHref} className="block hover:text-white">
              {siteInfo.email}
            </a>
            <p>{siteInfo.hours}</p>
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">
            Toast. Bite. Repeat.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl tracking-[0.08em] text-brand">QUICK LINKS</h3>
          <div className="mt-4 space-y-2.5 text-sm text-white/65">
            <Link href="/" className="block transition hover:text-white">
              Home
            </Link>
            <Link href="/menu" className="block transition hover:text-white">
              Menu
            </Link>
            <Link href="/about" className="block transition hover:text-white">
              About
            </Link>
            <Link href="/contact" className="block transition hover:text-white">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl tracking-[0.08em] text-brand">HELP</h3>
          <div className="mt-4 space-y-2.5 text-sm text-white/65">
            <Link href="/contact" className="block transition hover:text-white">
              Contact
            </Link>
            <Link href="/checkout" className="block transition hover:text-white">
              Delivery info
            </Link>
            <Link href="/track-order" className="block transition hover:text-white">
              Track order
            </Link>
            <Link href="/account/orders" className="block transition hover:text-white">
              My orders
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl tracking-[0.08em] text-brand">FOLLOW</h3>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-white/65 sm:block sm:space-y-2.5">
            <a href="#" className="block transition hover:text-white">
              Instagram
            </a>
            <a href="#" className="block transition hover:text-white">
              Facebook
            </a>
            <a href="#" className="block transition hover:text-white">
              TikTok
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/40">
        © 2026 Breadline. All rights reserved.
      </div>
    </footer>
  )
}
