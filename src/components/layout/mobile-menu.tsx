'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const links = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/account', label: 'My Account' },
  { href: '/account/orders', label: 'My Orders' },
  { href: '/login', label: 'Login' }
]

export function MobileMenu({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 md:hidden" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(360px,92vw)] flex-col bg-white p-5 pt-[calc(1.25rem+env(safe-area-inset-top))] shadow-2xl focus:outline-none sm:p-6 md:hidden">
          <div className="mb-6 flex items-center justify-between sm:mb-8">
            <Dialog.Title className="font-display text-2xl tracking-[0.04em]">
              <span className="text-ink">BREAD</span>
              <span className="text-brand">LINE</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-xl p-2 hover:bg-muted" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <nav className="flex-1 space-y-1 overflow-auto">
            {links.map((l) => (
              <Dialog.Close key={l.href} asChild>
                <Link
                  href={l.href}
                  className="block rounded-2xl px-4 py-3.5 text-base font-semibold text-ink hover:bg-muted"
                >
                  {l.label}
                </Link>
              </Dialog.Close>
            ))}
          </nav>
          <Dialog.Close asChild>
            <Button asChild className="mt-6 w-full">
              <Link href="/menu">Order Now</Link>
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
