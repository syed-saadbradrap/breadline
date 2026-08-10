'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingBag, UtensilsCrossed, User } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { SearchModal } from './search-modal'
import { CartDrawer } from '@/components/cart/cart-drawer'

export function MobileBottomNav() {
  const pathname = usePathname()
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const item = (active: boolean) =>
    cn(
      'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold touch-manipulation',
      active ? 'text-brand' : 'text-ink/50'
    )

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Mobile"
      >
        <div className="flex items-stretch">
          <Link href="/" className={item(pathname === '/')}>
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link href="/menu" className={item(pathname.startsWith('/menu'))}>
            <UtensilsCrossed className="h-5 w-5" />
            Menu
          </Link>
          <button type="button" className={item(false)} onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search className="h-5 w-5" />
            Search
          </button>
          <button type="button" className={item(false)} onClick={() => setCartOpen(true)} aria-label="Cart">
            <span className="relative">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-2 -top-1 rounded-md bg-brand px-1 text-[9px] text-white">
                  {count}
                </span>
              )}
            </span>
            Cart
          </button>
          <Link
            href="/account"
            className={item(pathname.startsWith('/account') || pathname === '/login')}
          >
            <User className="h-5 w-5" />
            Account
          </Link>
        </div>
      </nav>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}
