'use client'

import { useEffect, useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Bike, ShoppingBag, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { useFulfillmentStore } from '@/store/fulfillment-store'
import type { OrderType } from '@/types/order'
import { siteInfo } from '@/data/site'
import { cn } from '@/lib/utils'

const PRELOADER_KEY = 'bl-preloader-seen'

export function OrderTypePopup() {
  const hasChosen = useFulfillmentStore((s) => s.hasChosen)
  const orderType = useFulfillmentStore((s) => s.orderType)
  const pickerOpen = useFulfillmentStore((s) => s.pickerOpen)
  const setOrderType = useFulfillmentStore((s) => s.setOrderType)
  const openPicker = useFulfillmentStore((s) => s.openPicker)
  const closePicker = useFulfillmentStore((s) => s.closePicker)
  const [ready, setReady] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const finish = () => setHydrated(true)
    if (useFulfillmentStore.persist.hasHydrated()) {
      finish()
      return
    }
    return useFulfillmentStore.persist.onFinishHydration(finish)
  }, [])

  useEffect(() => {
    const markReady = () => setReady(true)

    try {
      if (sessionStorage.getItem(PRELOADER_KEY) === '1') {
        markReady()
        return
      }
    } catch {
      // ignore
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
    if (!hydrated || !ready) return
    if (!hasChosen) openPicker()
  }, [hydrated, ready, hasChosen, openPicker])

  const open = hydrated && ready && (pickerOpen || !hasChosen)

  const choose = (type: OrderType) => {
    setOrderType(type)
    toast.success(
      type === 'delivery'
        ? 'Delivery selected — we’ll bring it to you'
        : 'Takeaway selected — pick up at Breadline'
    )
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (next) openPicker()
        else closePicker()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-[90] w-full rounded-t-3xl bg-white p-5 shadow-2xl focus:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(440px,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:p-7"
          onPointerDownOutside={(e) => {
            if (!hasChosen) e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            if (!hasChosen) e.preventDefault()
          }}
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15 sm:hidden" />

          <Dialog.Title className="font-display text-3xl tracking-[0.03em] text-ink sm:text-4xl">
            How do you want it?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-ink/60">
            Choose delivery or takeaway before you start ordering.
          </Dialog.Description>

          <div className="mt-5 grid gap-3">
            <OptionCard
              active={hasChosen && orderType === 'delivery'}
              icon={<Bike className="h-6 w-6" />}
              title="Delivery"
              subtitle="Order to your door in North Karachi"
              onClick={() => choose('delivery')}
            />
            <OptionCard
              active={hasChosen && orderType === 'takeaway'}
              icon={<ShoppingBag className="h-6 w-6" />}
              title="Takeaway"
              subtitle={`Pickup at ${siteInfo.address}`}
              onClick={() => choose('takeaway')}
            />
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-ink/45">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            You can change this anytime from the top bar.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function OptionCard({
  icon,
  title,
  subtitle,
  onClick,
  active
}: {
  icon: ReactNode
  title: string
  subtitle: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition',
        active
          ? 'border-brand bg-brand/5 shadow-sm'
          : 'border-ink/10 bg-white hover:border-brand/40 hover:bg-brand/[0.03]'
      )}
    >
      <span
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
          active ? 'bg-brand text-white' : 'bg-muted text-brand'
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-xl tracking-[0.03em] text-ink">{title}</span>
        <span className="mt-0.5 block text-sm text-ink/55">{subtitle}</span>
      </span>
    </button>
  )
}
