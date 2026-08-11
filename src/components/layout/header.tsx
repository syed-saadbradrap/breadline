'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bike, CalendarClock, Clock, Menu, Search, ShoppingBag, Store, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { useFulfillmentStore } from '@/store/fulfillment-store'
import { HOURS_LABEL, nextOpenFriendly, storeStatus } from '@/lib/hours'
import { MobileMenu } from './mobile-menu'
import { SearchModal } from './search-modal'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
]

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [storeClosed, setStoreClosed] = useState(false)
  const [openLabel, setOpenLabel] = useState('today at 4:00 PM')
  const [headerHeight, setHeaderHeight] = useState(0)
  const headerRef = useRef<HTMLElement>(null)
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const orderType = useFulfillmentStore((s) => s.orderType)
  const hasChosen = useFulfillmentStore((s) => s.hasChosen)
  const openPicker = useFulfillmentStore((s) => s.openPicker)
  const scheduleForOpen = useFulfillmentStore((s) => s.scheduleForOpen)
  const scheduleLabel = useFulfillmentStore((s) => s.scheduleLabel)
  const enableScheduleForOpen = useFulfillmentStore((s) => s.enableScheduleForOpen)
  const onHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const tick = () => {
      const status = storeStatus()
      setStoreClosed(!status.open)
      setOpenLabel(status.nextOpenLabel)
    }
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const measure = () => setHeaderHeight(el.getBoundingClientRect().height)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [storeClosed, scheduleForOpen, pathname])

  if (pathname.startsWith('/rider')) return null

  const transparent = onHome && !scrolled && !storeClosed
  const showSpacer = !onHome || storeClosed

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          // Above Leaflet map panes (they use high z-index)
          'fixed inset-x-0 top-0 z-[1100] pt-[env(safe-area-inset-top)] transition-all duration-300',
          transparent
            ? 'border-transparent bg-transparent text-white'
            : 'border-b border-ink/8 bg-white/92 text-ink shadow-[0_8px_30px_rgba(20,20,20,0.06)] backdrop-blur-md'
        )}
      >
        {storeClosed ? (
          <div
            role="status"
            className="border-b border-white/10 bg-ink text-white"
          >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-3 py-2 text-center text-xs sm:px-6 sm:text-sm">
              {scheduleForOpen ? (
                <>
                  <CalendarClock className="h-3.5 w-3.5 shrink-0 text-brand sm:h-4 sm:w-4" aria-hidden />
                  <p>
                    <span className="font-bold">Schedule mode</span>{' '}
                    <span className="text-white/70">
                      — prepared {scheduleLabel || openLabel}. Menu browse freely.
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 shrink-0 text-brand sm:h-4 sm:w-4" aria-hidden />
                  <p>
                    <span className="font-bold">We’re closed right now.</span>{' '}
                    <span className="text-white/70">Menu ok · {HOURS_LABEL}</span>
                  </p>
                  <button
                    type="button"
                    className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-dark sm:text-xs"
                    onClick={() => {
                      const label = nextOpenFriendly()
                      enableScheduleForOpen(label)
                      openPicker()
                      toast.success(`Schedule for ${label}`)
                    }}
                  >
                    Schedule · {openLabel}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}

        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:h-[76px] lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5" aria-label="Breadline home">
            <Image
              src="/images/breadline-logo.png"
              alt="Breadline"
              width={44}
              height={44}
              className={cn(
                'h-9 w-9 shrink-0 rounded-full object-cover shadow-sm ring-2 sm:h-11 sm:w-11',
                transparent ? 'ring-white/30' : 'ring-silver/70'
              )}
              priority
            />
            <div className="min-w-0 leading-none">
              <div className="font-display text-xl tracking-[0.04em] sm:text-2xl">
                <span className={transparent ? 'text-white' : 'text-ink'}>BREAD</span>
                <span className="text-brand">LINE</span>
              </div>
              <div
                className={cn(
                  'mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.2em] sm:block',
                  transparent ? 'text-white/55' : 'text-ink/45'
                )}
              >
                Toast. Bite. Repeat.
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {nav.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3.5 py-2 text-sm font-semibold transition',
                    transparent
                      ? active
                        ? 'text-white'
                        : 'text-white/70 hover:text-white'
                      : active
                        ? 'text-ink'
                        : 'text-ink/60 hover:text-ink'
                  )}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand" />}
                </Link>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
            {hasChosen && (
              <button
                type="button"
                onClick={openPicker}
                className={cn(
                  'mr-0.5 inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-semibold transition sm:px-2.5',
                  transparent
                    ? 'bg-white/12 text-white hover:bg-white/18'
                    : 'bg-brand/10 text-brand hover:bg-brand/15'
                )}
                aria-label="Change delivery or takeaway"
              >
                {orderType === 'delivery' ? (
                  <Bike className="h-3.5 w-3.5" />
                ) : (
                  <Store className="h-3.5 w-3.5" />
                )}
                <span className="capitalize">{orderType}</span>
              </button>
            )}
            {/* Search lives in bottom nav on mobile */}
            <button
              className={cn(
                'hidden rounded-xl p-2.5 transition md:inline-flex',
                transparent ? 'hover:bg-white/10' : 'hover:bg-muted'
              )}
              aria-label="Search menu"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/account"
              className={cn(
                'hidden rounded-xl p-2.5 transition sm:inline-flex',
                transparent ? 'hover:bg-white/10' : 'hover:bg-muted'
              )}
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              className={cn(
                'relative rounded-xl p-2 transition sm:p-2.5',
                transparent ? 'hover:bg-white/10' : 'hover:bg-muted'
              )}
              aria-label={`Cart with ${count} items`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-brand px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
            <Button asChild className="hidden lg:inline-flex" size="sm">
              <Link href="/menu">Order Now</Link>
            </Button>
            <button
              className={cn(
                'rounded-xl p-2 transition md:hidden sm:p-2.5',
                transparent ? 'hover:bg-white/10' : 'hover:bg-muted'
              )}
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Exact spacer = measured fixed header height (banner wrap-safe) */}
      {showSpacer ? (
        <div
          style={{ height: headerHeight || undefined }}
          className={cn(!headerHeight && 'h-14 sm:h-16 lg:h-[76px]')}
          aria-hidden
        />
      ) : null}

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}
