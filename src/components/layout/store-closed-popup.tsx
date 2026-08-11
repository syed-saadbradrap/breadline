'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import { CalendarClock, Clock, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'
import { HOURS_LABEL, nextOpenFriendly, storeStatus } from '@/lib/hours'
import { useFulfillmentStore } from '@/store/fulfillment-store'
import { cn } from '@/lib/utils'

const PRELOADER_KEY = 'bl-preloader-seen'
const CLOSED_POPUP_KEY = 'bl-closed-popup-dismissed'

export function StoreClosedPopup() {
  const pathname = usePathname()
  const router = useRouter()
  const scheduleForOpen = useFulfillmentStore((s) => s.scheduleForOpen)
  const enableScheduleForOpen = useFulfillmentStore((s) => s.enableScheduleForOpen)
  const clearScheduleForOpen = useFulfillmentStore((s) => s.clearScheduleForOpen)
  const openPicker = useFulfillmentStore((s) => s.openPicker)

  const [ready, setReady] = useState(false)
  const [closed, setClosed] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const [openLabel, setOpenLabel] = useState(`today at 4:00 PM`)

  useEffect(() => {
    const markReady = () => setReady(true)
    try {
      if (sessionStorage.getItem(PRELOADER_KEY) === '1') {
        markReady()
        return
      }
    } catch {
      /* ignore */
    }
    const onReady = () => markReady()
    window.addEventListener('breadline:ready', onReady)
    const timer = window.setTimeout(markReady, 4000)
    return () => {
      window.removeEventListener('breadline:ready', onReady)
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const tick = () => {
      const status = storeStatus()
      setClosed(!status.open)
      setOpenLabel(status.nextOpenLabel)
      if (status.open) {
        try {
          sessionStorage.removeItem(CLOSED_POPUP_KEY)
        } catch {
          /* ignore */
        }
        setDismissed(true)
        clearScheduleForOpen()
      }
    }
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [clearScheduleForOpen])

  useEffect(() => {
    if (!ready || !closed) return
    try {
      setDismissed(sessionStorage.getItem(CLOSED_POPUP_KEY) === '1')
    } catch {
      setDismissed(false)
    }
  }, [ready, closed])

  if (pathname.startsWith('/rider')) return null

  const open = ready && closed && !dismissed && !scheduleForOpen

  function dismiss() {
    try {
      sessionStorage.setItem(CLOSED_POPUP_KEY, '1')
    } catch {
      /* ignore */
    }
    setDismissed(true)
  }

  function browseMenu() {
    dismiss()
    toast.message('Menu browse karo — order kitchen open hone pe place hoga', {
      description: `We open ${nextOpenFriendly()}`
    })
    router.push('/menu')
  }

  function scheduleOrder() {
    enableScheduleForOpen(nextOpenFriendly())
    dismiss()
    openPicker()
    toast.success(`Schedule mode on — order ${nextOpenFriendly()} ke liye ready hoga`)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed z-[1200] overflow-hidden bg-[#1a1212] text-white shadow-2xl focus:outline-none',
            // True center on all breakpoints
            'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-[min(420px,calc(100vw-1.5rem))] max-h-[min(86dvh,640px)]',
            'rounded-[1.5rem] sm:rounded-[1.75rem]'
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(196,30,34,0.5), transparent 55%)'
            }}
          />

          <div className="relative max-h-[inherit] overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col items-center text-center">
              <Image
                src="/images/breadline-logo.png"
                alt="Breadline"
                width={56}
                height={56}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20 sm:h-14 sm:w-14"
                priority
              />
              <p className="mt-3 text-[10px] font-bold tracking-[0.28em] text-white/45 uppercase sm:text-[11px]">
                Kitchen closed
              </p>
              <Dialog.Title className="mt-1.5 font-display text-[1.85rem] leading-[1.05] tracking-[0.04em] sm:text-[2.25rem]">
                We’re closed
                <span className="text-brand"> right now</span>
              </Dialog.Title>
              <Dialog.Description className="mt-2.5 max-w-sm text-[13px] leading-relaxed text-white/65 sm:text-sm">
                Online ordering is paused. Menu dekh sakte ho, ya order schedule kar lo — kitchen{' '}
                <strong className="font-semibold text-white">{openLabel}</strong> open hogi.
              </Dialog.Description>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/55 sm:text-xs">
              <Clock className="h-3.5 w-3.5 shrink-0 text-brand" />
              <span className="truncate">Hours · {HOURS_LABEL} · Karachi</span>
            </div>

            <div className="mt-4 grid gap-2.5 sm:gap-3">
              <ActionButton
                primary
                icon={<CalendarClock className="h-5 w-5" />}
                title="Schedule my order"
                subtitle={`Place now · prepare ${openLabel}`}
                onClick={scheduleOrder}
              />
              <ActionButton
                icon={<UtensilsCrossed className="h-5 w-5" />}
                title="Browse the menu"
                subtitle="Explore — order when you’re ready"
                onClick={browseMenu}
              />
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="mt-3 w-full py-2 text-center text-xs font-medium text-white/40 transition hover:text-white/70 sm:mt-4"
            >
              Continue browsing site
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ActionButton({
  icon,
  title,
  subtitle,
  onClick,
  primary
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition sm:gap-3.5 sm:px-4 sm:py-4',
        primary
          ? 'border-brand/40 bg-brand text-white hover:bg-brand-dark'
          : 'border-white/12 bg-white/5 text-white hover:border-white/25 hover:bg-white/10'
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11',
          primary ? 'bg-white/15' : 'bg-white/10 text-brand'
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-lg tracking-[0.03em] sm:text-xl">{title}</span>
        <span
          className={cn(
            'mt-0.5 block text-xs sm:text-sm',
            primary ? 'text-white/80' : 'text-white/50'
          )}
        >
          {subtitle}
        </span>
      </span>
    </button>
  )
}
