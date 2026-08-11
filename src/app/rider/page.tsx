'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  Bell,
  BellRing,
  Bike,
  CheckCircle2,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Package
} from 'lucide-react'
import { toast } from 'sonner'
import type { OnlineOrderRecord, RiderDeliveryStatus } from '@/lib/online-orders/types'
import {
  enableRiderPush,
  hasRiderPushSubscription,
  pushSupported
} from '@/lib/rider-push/client'
import { cn } from '@/lib/utils'

const PIN_KEY = 'breadline-rider-pin'

function notifyFoodReady(order: OnlineOrderRecord) {
  const title = 'Food ready — deliver now'
  const body = `#${order.orderNumber} · ${order.customerName}`
  toast.success(title, { description: body, duration: 8000 })
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const n = new Notification(title, {
        body,
        tag: `rider-${order.id}`,
        icon: '/images/breadline-logo.png'
      })
      window.setTimeout(() => n.close(), 12000)
    }
  } catch {
    /* ignore */
  }
  try {
    if (navigator.vibrate) navigator.vibrate([180, 80, 180])
  } catch {
    /* ignore */
  }
}

function formatMoney(n: number) {
  return `Rs ${Math.round(n).toLocaleString('en-PK')}`
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

function mapsNavigateUrl(order: OnlineOrderRecord) {
  const pin = (order.locationPin || '').trim()
  if (/^https?:\/\//i.test(pin)) return pin
  if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(pin)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pin)}`
  }
  const q = [order.address, order.city, order.postalCode].filter(Boolean).join(', ')
  if (!q) return 'https://www.google.com/maps'
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`
}

function phoneHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '')
  return `tel:${digits}`
}

function statusLabel(status: RiderDeliveryStatus) {
  if (status === 'out_for_delivery') return 'On the way'
  if (status === 'delivered') return 'Delivered'
  return 'Food ready'
}

export default function RiderPage() {
  const [pin, setPin] = useState('')
  const [inputPin, setInputPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [orders, setOrders] = useState<OnlineOrderRecord[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pushOn, setPushOn] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const seenReadyIds = useRef<Set<string>>(new Set())
  const seededSeen = useRef(false)

  const headers = useCallback(
    (p: string) => ({
      'Content-Type': 'application/json',
      'X-Rider-Pin': p
    }),
    []
  )

  const loadOrders = useCallback(
    async (p: string, soft = false) => {
      if (soft) setRefreshing(true)
      else setLoading(true)
      try {
        const res = await fetch('/api/rider/orders', {
          headers: headers(p),
          cache: 'no-store'
        })
        const data = (await res.json()) as { orders?: OnlineOrderRecord[]; error?: string }
        if (!res.ok) {
          if (res.status === 401) {
            sessionStorage.removeItem(PIN_KEY)
            setPin('')
            toast.error('Session expired — login again')
          } else {
            toast.error(data.error || 'Failed to load orders')
          }
          return
        }
        const next = data.orders || []
        const readyNow = next.filter((o) => o.riderStatus === 'ready')

        if (!seededSeen.current) {
          readyNow.forEach((o) => seenReadyIds.current.add(o.id))
          seededSeen.current = true
        } else {
          for (const order of readyNow) {
            if (!seenReadyIds.current.has(order.id)) {
              seenReadyIds.current.add(order.id)
              notifyFoodReady(order)
            }
          }
        }

        setOrders(next)
      } catch {
        toast.error('Network error')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [headers]
  )

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PIN_KEY)
      if (saved) {
        setPin(saved)
        void loadOrders(saved)
      }
    } catch {
      /* ignore */
    }
  }, [loadOrders])

  useEffect(() => {
    if (!pin) return
    const id = window.setInterval(() => void loadOrders(pin, true), 10000)
    return () => window.clearInterval(id)
  }, [pin, loadOrders])

  async function turnOnPush(p: string) {
    if (!pushSupported()) {
      toast.error("Push isn't supported on this phone — use Chrome and Add to Home Screen")
      return
    }
    setPushBusy(true)
    try {
      const result = await enableRiderPush(p)
      if (result === 'denied') {
        toast.error('Notifications are blocked — allow them in phone settings')
        setPushOn(false)
        return
      }
      if (result === 'unsupported') {
        toast.error("Push notifications aren't supported")
        return
      }
      setPushOn(true)
      toast.success("Mobile notifications on — you'll get an alert when food is ready")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Push enable failed')
    } finally {
      setPushBusy(false)
    }
  }

  useEffect(() => {
    if (!pin) return
    // Always re-save subscription to server (local ON but server empty = silent push miss)
    void (async () => {
      const local = await hasRiderPushSubscription()
      setPushOn(local)
      await turnOnPush(pin)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when pin changes
  }, [pin])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    const next = inputPin.trim()
    if (!next) return
    setLoading(true)
    try {
      const res = await fetch('/api/rider/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: next })
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        toast.error(data.error || 'Invalid PIN')
        setLoading(false)
        return
      }
      sessionStorage.setItem(PIN_KEY, next)
      setPin(next)
      setInputPin('')
      await loadOrders(next)
      toast.success('Logged in')
      void turnOnPush(next)
    } catch {
      toast.error('Login failed')
      setLoading(false)
    }
  }

  function logout() {
    sessionStorage.removeItem(PIN_KEY)
    setPin('')
    setOrders([])
    seenReadyIds.current = new Set()
    seededSeen.current = false
  }

  async function setStatus(order: OnlineOrderRecord, riderStatus: RiderDeliveryStatus) {
    if (!pin) return
    setBusyId(order.id)
    try {
      const res = await fetch(`/api/rider/orders/${order.id}`, {
        method: 'PATCH',
        headers: headers(pin),
        body: JSON.stringify({ riderStatus })
      })
      const data = (await res.json()) as { order?: OnlineOrderRecord; error?: string }
      if (!res.ok) {
        toast.error(data.error || 'Update failed')
        return
      }
      if (data.order) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? data.order! : o)))
      }
      toast.success(
        riderStatus === 'delivered'
          ? 'Marked delivered'
          : riderStatus === 'out_for_delivery'
            ? 'Delivery started'
            : 'Updated'
      )
      await loadOrders(pin, true)
    } catch {
      toast.error('Update failed')
    } finally {
      setBusyId(null)
    }
  }

  const active = orders.filter((o) => o.riderStatus !== 'delivered')
  const done = orders.filter((o) => o.riderStatus === 'delivered')

  if (!pin) {
    return (
      <div className="relative min-h-[100dvh] overflow-hidden bg-[#1a1212] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(196,30,34,0.45), transparent 55%), radial-gradient(circle at 80% 80%, rgba(196,30,34,0.12), transparent 40%)'
          }}
        />
        <div className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-5 py-10">
          <div className="mb-8 text-center">
            <Image
              src="/images/breadline-logo.png"
              alt="Breadline"
              width={72}
              height={72}
              className="mx-auto h-[72px] w-[72px] rounded-full object-cover ring-2 ring-white/20"
              priority
            />
            <h1 className="mt-5 font-display text-5xl tracking-[0.06em]">
              <span className="text-white">BREAD</span>
              <span className="text-brand">LINE</span>
            </h1>
            <p className="mt-2 text-sm font-medium tracking-[0.2em] text-white/50 uppercase">
              Rider
            </p>
          </div>

          <form
            onSubmit={login}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
          >
            <label htmlFor="rider-pin" className="text-sm font-medium text-white/70">
              Enter rider PIN
            </label>
            <input
              id="rider-pin"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3.5 text-center text-2xl tracking-[0.35em] text-white outline-none focus:border-brand"
              placeholder="••••"
            />
            <button
              type="submit"
              disabled={loading || inputPin.length < 4}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold tracking-wide text-white transition hover:bg-brand-dark disabled:opacity-50"
            >
              <Bike className="h-4 w-4" />
              {loading ? 'Signing in…' : 'Open deliveries'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#f3efeb] text-ink">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#1a1212] text-white">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/breadline-logo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div>
              <p className="font-display text-xl leading-none tracking-[0.04em]">
                BREAD<span className="text-brand">LINE</span>
              </p>
              <p className="mt-0.5 text-[10px] font-semibold tracking-[0.18em] text-white/45 uppercase">
                Rider · {active.length} active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void loadOrders(pin, true)}
              className="rounded-full p-2.5 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Refresh"
            >
              <RefreshCw className={cn('h-5 w-5', refreshing && 'animate-spin')} />
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-full p-2.5 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-4 pb-10">
        <div
          className={cn(
            'mb-4 flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-3',
            pushOn
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          )}
        >
          <div className="flex min-w-0 items-start gap-2.5">
            {pushOn ? (
              <BellRing className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <Bell className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold">
                {pushOn ? 'Notifications ON' : 'Notifications OFF'}
              </p>
              <p className="mt-0.5 text-xs opacity-80">
                {pushOn
                  ? "You'll get a phone alert when kitchen marks ready — even if the app is closed."
                  : 'Turn on to get a mobile alert when food is ready.'}
              </p>
            </div>
          </div>
          {!pushOn ? (
            <button
              type="button"
              disabled={pushBusy}
              onClick={() => void turnOnPush(pin)}
              className="shrink-0 rounded-xl bg-ink px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {pushBusy ? '…' : 'Turn ON'}
            </button>
          ) : null}
        </div>

        {loading && orders.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink/50">Loading deliveries…</p>
        ) : active.length === 0 && done.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Package className="h-10 w-10 text-ink/25" />
            <p className="mt-3 font-semibold">Waiting for kitchen</p>
            <p className="mt-1 max-w-xs text-sm text-ink/50">
              When the kitchen marks an order ready, you&apos;ll get a notification here — then
              start the delivery.
            </p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-bold tracking-[0.16em] text-ink/45 uppercase">
                  Active
                </h2>
                <ul className="space-y-3">
                  {active.map((order) => (
                    <RiderOrderCard
                      key={order.id}
                      order={order}
                      busy={busyId === order.id}
                      onStart={() => void setStatus(order, 'out_for_delivery')}
                      onDelivered={() => void setStatus(order, 'delivered')}
                    />
                  ))}
                </ul>
              </section>
            )}

            {done.length > 0 && (
              <section className={cn(active.length > 0 && 'mt-8')}>
                <h2 className="mb-3 text-xs font-bold tracking-[0.16em] text-ink/45 uppercase">
                  Delivered today
                </h2>
                <ul className="space-y-3 opacity-80">
                  {done.map((order) => (
                    <RiderOrderCard key={order.id} order={order} busy={false} />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function RiderOrderCard({
  order,
  busy,
  onStart,
  onDelivered
}: {
  order: OnlineOrderRecord
  busy: boolean
  onStart?: () => void
  onDelivered?: () => void
}) {
  const status = (order.riderStatus || 'ready') as RiderDeliveryStatus
  const delivered = status === 'delivered'
  const onWay = status === 'out_for_delivery'

  return (
    <li className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-black/5 px-4 py-3">
        <div>
          <p className="font-display text-2xl tracking-[0.04em] text-ink">
            #{order.orderNumber}
          </p>
          <p className="text-xs text-ink/45">{formatTime(order.createdAt)}</p>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase',
            delivered && 'bg-emerald-50 text-emerald-700',
            onWay && 'bg-amber-50 text-amber-800',
            status === 'ready' && 'bg-brand-soft text-brand-dark'
          )}
        >
          {statusLabel(status)}
        </span>
      </div>

      <div className="space-y-3 px-4 py-3">
        <div>
          <p className="text-base font-bold">{order.customerName}</p>
          <p className="mt-0.5 text-sm font-semibold text-brand">{formatMoney(order.total)}</p>
        </div>

        <div className="flex items-start gap-2 text-sm text-ink/70">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <span>
            {[order.address, order.city, order.postalCode].filter(Boolean).join(', ') ||
              'Address not provided'}
            {order.instructions ? (
              <span className="mt-1 block text-ink/50">Note: {order.instructions}</span>
            ) : null}
          </span>
        </div>

        <ul className="space-y-1 rounded-xl bg-[#f7f5f3] px-3 py-2.5 text-sm">
          {order.items.map((item, i) => (
            <li key={`${order.id}-${i}`} className="flex justify-between gap-2">
              <span>
                <span className="font-semibold">{item.quantity}×</span> {item.name}
                {item.modifiers?.length ? (
                  <span className="block text-xs text-ink/45">{item.modifiers.join(', ')}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-black/5 p-3">
        <a
          href={phoneHref(order.phone)}
          className="flex items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-bold text-white"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
        <a
          href={mapsNavigateUrl(order)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white py-3 text-sm font-bold text-ink"
        >
          <Navigation className="h-4 w-4" />
          Navigate
        </a>
      </div>

      {!delivered && (
        <div className="space-y-2 px-3 pb-3">
          {!onWay && onStart ? (
            <button
              type="button"
              disabled={busy}
              onClick={onStart}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-white disabled:opacity-50"
            >
              <Bike className="h-4 w-4" />
              {busy ? 'Updating…' : 'Start delivery'}
            </button>
          ) : null}
          {onWay && onDelivered ? (
            <button
              type="button"
              disabled={busy}
              onClick={onDelivered}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {busy ? 'Updating…' : 'Mark delivered'}
            </button>
          ) : null}
        </div>
      )}
    </li>
  )
}
