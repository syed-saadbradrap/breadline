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
        <Dialog.Overlay className="fixed inset-0 z-[92] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[92] w-full overflow-hidden rounded-t-[1.75rem] bg-[#1a1212] text-white shadow-2xl focus:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(440px,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1.75rem]">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'radial-gradient(ellipse 90% 60% at 50% -20%, rgba(196,30,34,0.55), transparent 55%)'
            }}
          />

          <div className="relative px-5 pb-6 pt-5 sm:px-7 sm:pb-7 sm:pt-6">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20 sm:hidden" />

            <div className="flex flex-col items-center text-center">
              <Image
                src="/images/breadline-logo.png"
                alt="Breadline"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white/20"
                priority
              />
              <p className="mt-4 text-[11px] font-bold tracking-[0.28em] text-white/45 uppercase">
                Kitchen closed
              </p>
              <Dialog.Title className="mt-2 font-display text-[2.5rem] leading-none tracking-[0.04em]">
                We’re closed
                <span className="text-brand"> right now</span>
              </Dialog.Title>
              <Dialog.Description className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
                Online ordering is paused. Menu dekh sakte ho, ya order schedule kar lo — kitchen{' '}
                <strong className="font-semibold text-white">{openLabel}</strong> open hogi.
              </Dialog.Description>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/55">
              <Clock className="h-3.5 w-3.5 shrink-0 text-brand" />
              Hours · {HOURS_LABEL} · Karachi
            </div>

            <div className="mt-5 grid gap-3">
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
              className="mt-4 w-full py-2 text-center text-xs font-medium text-white/40 transition hover:text-white/70"
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
        'flex w-full items-center gap-3.5 rounded-2xl border px-4 py-4 text-left transition',
        primary
          ? 'border-brand/40 bg-brand text-white hover:bg-brand-dark'
          : 'border-white/12 bg-white/5 text-white hover:border-white/25 hover:bg-white/10'
      )}
    >
      <span
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          primary ? 'bg-white/15' : 'bg-white/10 text-brand'
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-xl tracking-[0.03em]">{title}</span>
        <span className={cn('mt-0.5 block text-sm', primary ? 'text-white/80' : 'text-white/50')}>
          {subtitle}
        </span>
      </span>
    </button>
  )
}
