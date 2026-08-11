'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { checkoutSchema, type CheckoutInput } from '@/lib/validation'
import { useCartStore, cartLineTotal } from '@/store/cart-store'
import { useOrderStore } from '@/store/order-store'
import { useFulfillmentStore } from '@/store/fulfillment-store'
import { CartSummary } from '@/components/cart/cart-summary'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/ui/empty-state'
import { DeliveryAddressFields } from '@/components/checkout/delivery-address-fields'
import { LocationMap } from '@/components/ui/location-map'
import { calcDeliveryFee, calcTax } from '@/lib/pricing'
import { HOURS_LABEL, isStoreOpen, nextOpenAtIso, nextOpenFriendly } from '@/lib/hours'
import { createOrderNumber } from '@/lib/utils'
import type { Order } from '@/types/order'

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const clear = useCartStore((s) => s.clear)
  const addOrder = useOrderStore((s) => s.addOrder)
  const preferredType = useFulfillmentStore((s) => s.orderType)
  const scheduleForOpen = useFulfillmentStore((s) => s.scheduleForOpen)
  const scheduleLabel = useFulfillmentStore((s) => s.scheduleLabel)
  const enableScheduleForOpen = useFulfillmentStore((s) => s.enableScheduleForOpen)
  const clearScheduleForOpen = useFulfillmentStore((s) => s.clearScheduleForOpen)
  const [storeOpen, setStoreOpen] = useState(true)

  useEffect(() => {
    const tick = () => {
      const open = isStoreOpen()
      setStoreOpen(open)
      if (open) clearScheduleForOpen()
    }
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [clearScheduleForOpen])

  const canOrder = storeOpen || scheduleForOpen
  const setFulfillment = useFulfillmentStore((s) => s.setOrderType)

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      orderType: preferredType,
      address: '',
      city: 'Karachi',
      postalCode: '',
      instructions: '',
      locationPin: '',
      paymentMethod: preferredType === 'takeaway' ? 'cash_restaurant' : 'cod'
    }
  })

  const orderType = form.watch('orderType')

  useEffect(() => {
    form.setValue('orderType', preferredType)
  }, [preferredType, form])

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Nothing to checkout" description="Add items from the menu first." />
      </div>
    )
  }

  const onSubmit = async (data: CheckoutInput) => {
    const openNow = isStoreOpen()
    setStoreOpen(openNow)
    if (!openNow && !scheduleForOpen) {
      toast.error(`We’re closed right now. Schedule for open, or order during ${HOURS_LABEL}.`)
      return
    }

    const deliveryFee = calcDeliveryFee(subtotal, data.orderType)
    const tax = calcTax(subtotal)
    const scheduledFor = !openNow ? nextOpenAtIso() : undefined
    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber: createOrderNumber(),
      createdAt: new Date().toISOString(),
      type: data.orderType,
      status: 'received',
      customerName: data.fullName,
      phone: data.phone,
      email: data.email || undefined,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      instructions: data.instructions,
      locationPin: data.locationPin || undefined,
      paymentMethod: data.paymentMethod,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        modifiers: i.modifiers.map((m) => m.name),
        note: i.note,
        lineTotal: cartLineTotal(i)
      })),
      subtotal,
      deliveryFee,
      tax,
      discount: 0,
      total: subtotal + deliveryFee + tax,
      estimatedMinutes: data.orderType === 'delivery' ? 40 : 25,
      ...(scheduledFor ? { scheduledFor } : {})
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      })
      const payload = (await res.json().catch(() => null)) as {
        error?: string
        emailSent?: boolean
        emailReason?: string
      } | null
      if (!res.ok) {
        throw new Error(payload?.error || 'Could not send order to restaurant')
      }
      addOrder(order)
      clear()
      if (scheduledFor) {
        toast.success(`Scheduled — kitchen will prep ${scheduleLabel || nextOpenFriendly()}`)
      } else {
        toast.success('Order placed — sent to Breadline POS')
      }
      if (order.email && payload?.emailSent === false) {
        toast.warning(
          'Order placed, but confirmation email could not be sent. Please check your inbox later or call the restaurant.',
          { duration: 7000 }
        )
      } else if (order.email && payload?.emailSent) {
        toast.message(`Confirmation sent to ${order.email}`)
      }
      router.push(`/order-confirmation?id=${order.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not place order')
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="min-w-0 space-y-5 sm:space-y-6">
        <div>
          <h1 className="font-display text-[clamp(2.25rem,6vw,3.5rem)] tracking-[0.03em]">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-ink/60 sm:text-base">
            Almost there — tell us where to send your feast.
          </p>
        </div>

        {!storeOpen ? (
          <div className="rounded-2xl border border-brand/20 bg-brand-soft px-4 py-3 text-sm text-brand-dark">
            {scheduleForOpen ? (
              <>
                <p className="font-bold">Scheduled order</p>
                <p className="mt-1 text-brand-dark/80">
                  Kitchen is closed now — your order will be prepared{' '}
                  {scheduleLabel || nextOpenFriendly()}.
                </p>
              </>
            ) : (
              <>
                <p className="font-bold">We’re closed right now.</p>
                <p className="mt-1 text-brand-dark/80">
                  Online ordering is available {HOURS_LABEL}. Or schedule for{' '}
                  {nextOpenFriendly()}.
                </p>
                <button
                  type="button"
                  className="mt-2 text-sm font-bold underline underline-offset-2"
                  onClick={() => {
                    enableScheduleForOpen(nextOpenFriendly())
                    toast.success(`Schedule mode on — ${nextOpenFriendly()}`)
                  }}
                >
                  Schedule for {nextOpenFriendly()}
                </button>
              </>
            )}
          </div>
        ) : null}

        <section className="rounded-2xl border border-ink/5 bg-white p-4 sm:rounded-3xl sm:p-5">
          <h2 className="font-display text-xl tracking-[0.04em]">Customer information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...form.register('fullName')} />
              <Err msg={form.formState.errors.fullName?.message} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register('phone')} />
              <Err msg={form.formState.errors.phone?.message} />
            </div>
            <div>
              <Label htmlFor="email">Email (order confirmation)</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@email.com"
                {...form.register('email')}
              />
              <Err msg={form.formState.errors.email?.message} />
              <p className="mt-1 text-xs text-ink/45">
                We’ll send a premium confirmation with your items &amp; total.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink/5 bg-white p-4 sm:rounded-3xl sm:p-5">
          <h2 className="font-display text-xl tracking-[0.04em]">Order type</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(['delivery', 'takeaway'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  form.setValue('orderType', t)
                  setFulfillment(t)
                  form.setValue(
                    'paymentMethod',
                    t === 'takeaway' ? 'cash_restaurant' : 'cod'
                  )
                }}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold capitalize ${
                  orderType === t ? 'border-brand bg-brand/5 text-brand' : 'border-ink/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {orderType === 'delivery' ? (
            <div>
              <DeliveryAddressFields
                values={{
                  address: form.watch('address') || '',
                  city: form.watch('city') || '',
                  postalCode: form.watch('postalCode') || '',
                  locationPin: form.watch('locationPin') || ''
                }}
                onChange={(patch) => {
                  if (patch.address !== undefined) {
                    form.setValue('address', patch.address, { shouldValidate: true })
                  }
                  if (patch.city !== undefined) {
                    form.setValue('city', patch.city, { shouldValidate: true })
                  }
                  if (patch.postalCode !== undefined) {
                    form.setValue('postalCode', patch.postalCode, { shouldValidate: true })
                  }
                  if (patch.locationPin !== undefined) {
                    form.setValue('locationPin', patch.locationPin, { shouldValidate: true })
                  }
                }}
                errors={{
                  address: form.formState.errors.address?.message,
                  city: form.formState.errors.city?.message,
                  locationPin: form.formState.errors.locationPin?.message
                }}
              />
              <div className="mt-4">
                <Label htmlFor="instructions">Delivery instructions</Label>
                <Textarea id="instructions" {...form.register('instructions')} />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="rounded-2xl bg-muted p-4 text-sm text-ink/70">
                Pickup at Breadline — Sector 9, North Karachi. We’ll notify you when your order is
                ready.
              </p>
              <LocationMap title="Pickup pin" />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-ink/5 bg-white p-4 sm:rounded-3xl sm:p-5">
          <h2 className="font-display text-xl tracking-[0.04em]">Payment</h2>
          <div className="mt-4 grid gap-3">
            <PayOption
              active={form.watch('paymentMethod') === 'cod'}
              label="Cash on Delivery"
              onClick={() => form.setValue('paymentMethod', 'cod')}
            />
            <PayOption
              active={form.watch('paymentMethod') === 'cash_restaurant'}
              label="Cash at Restaurant"
              onClick={() => form.setValue('paymentMethod', 'cash_restaurant')}
            />
          </div>
        </section>

        <Button
          type="submit"
          size="lg"
          className="w-full lg:w-auto"
          disabled={form.formState.isSubmitting || !canOrder}
        >
          {!canOrder
            ? 'Closed — schedule or come back at 4:00 PM'
            : form.formState.isSubmitting
              ? scheduleForOpen
                ? 'Scheduling…'
                : 'Placing order…'
              : scheduleForOpen
                ? `Schedule for ${scheduleLabel || 'open'}`
                : 'Place Order'}
        </Button>
      </form>

      <div className="order-first lg:order-none lg:sticky lg:top-28 lg:self-start">
        <CartSummary orderType={orderType} />
      </div>
    </div>
  )
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-brand">{msg}</p>
}

function PayOption({
  active,
  label,
  onClick
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${
        active ? 'border-brand bg-brand/5 text-brand' : 'border-ink/10'
      }`}
    >
      {label}
    </button>
  )
}
