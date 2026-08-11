import type {
  KitchenProgressStatus,
  OnlineOrderPayload,
  OnlineOrderRecord,
  OnlineOrderStatus,
  RiderDeliveryStatus
} from './types'
import type { OrderStatus } from '@/types/order'

type MemoryStore = {
  orders: OnlineOrderRecord[]
}

declare global {
  // eslint-disable-next-line no-var
  var __breadlineOnlineOrders: MemoryStore | undefined
}

function memory(): MemoryStore {
  if (!globalThis.__breadlineOnlineOrders) {
    globalThis.__breadlineOnlineOrders = { orders: [] }
  }
  return globalThis.__breadlineOnlineOrders
}

function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function supabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  }
}

function rowToRecord(row: Record<string, unknown>): OnlineOrderRecord {
  const payload = (row.payload || row) as OnlineOrderPayload
  return {
    ...payload,
    status: (row.status as OnlineOrderStatus) || 'pending',
    updatedAt: String(row.updated_at || row.updatedAt || payload.createdAt),
    posOrderNumber: (row.pos_order_number as string | undefined) || undefined,
    posOrderId: row.pos_order_id != null ? Number(row.pos_order_id) : undefined
  }
}

export async function createOnlineOrder(payload: OnlineOrderPayload): Promise<OnlineOrderRecord> {
  const record: OnlineOrderRecord = {
    ...payload,
    status: 'pending',
    updatedAt: new Date().toISOString()
  }

  if (!hasSupabase()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Online orders storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
      )
    }
    memory().orders.unshift(record)
    return record
  }

  const url = `${process.env.SUPABASE_URL}/rest/v1/online_orders`
  const res = await fetch(url, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({
      id: payload.id,
      order_number: payload.orderNumber,
      status: 'pending',
      payload,
      created_at: payload.createdAt,
      updated_at: record.updatedAt
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to save online order: ${text}`)
  }

  return record
}

export async function getOnlineOrderByLookup(lookup: string): Promise<OnlineOrderRecord | null> {
  const q = lookup.trim()
  if (!q) return null

  if (!hasSupabase()) {
    const all = memory().orders
    return (
      all.find(
        (o) =>
          o.id === q ||
          o.orderNumber.toLowerCase() === q.toLowerCase() ||
          o.posOrderNumber?.toLowerCase() === q.toLowerCase()
      ) || null
    )
  }

  const base = `${process.env.SUPABASE_URL}/rest/v1/online_orders`
  const headers = supabaseHeaders()

  // UUID / exact id
  if (/^[0-9a-f-]{36}$/i.test(q)) {
    const byId = await fetch(`${base}?id=eq.${encodeURIComponent(q)}&select=*`, {
      headers,
      cache: 'no-store'
    })
    if (byId.ok) {
      const rows = (await byId.json()) as Record<string, unknown>[]
      if (rows[0]) return rowToRecord(rows[0])
    }
  }

  const byNumber = await fetch(
    `${base}?order_number=eq.${encodeURIComponent(q)}&select=*&limit=1`,
    { headers, cache: 'no-store' }
  )
  if (byNumber.ok) {
    const rows = (await byNumber.json()) as Record<string, unknown>[]
    if (rows[0]) return rowToRecord(rows[0])
  }

  const byPos = await fetch(
    `${base}?pos_order_number=eq.${encodeURIComponent(q)}&select=*&limit=1`,
    { headers, cache: 'no-store' }
  )
  if (byPos.ok) {
    const rows = (await byPos.json()) as Record<string, unknown>[]
    if (rows[0]) return rowToRecord(rows[0])
  }

  return null
}

/** Map online order + kitchen/rider progress → customer timeline status. */
export function toCustomerTrackStatus(order: OnlineOrderRecord): OrderStatus | 'cancelled' {
  if (order.status === 'rejected' || order.status === 'cancelled') return 'cancelled'

  if (order.type === 'delivery') {
    if (order.riderStatus === 'delivered') return 'delivered'
    if (order.riderStatus === 'out_for_delivery') return 'out_for_delivery'
    if (order.riderStatus === 'ready' || order.kitchenStatus === 'READY') return 'ready'
    if (order.kitchenStatus === 'PREPARING') return 'preparing'
    if (order.status === 'accepted') return 'confirmed'
    return 'received'
  }

  if (order.kitchenStatus === 'COMPLETED') return 'completed'
  if (order.kitchenStatus === 'READY' || order.riderStatus === 'ready') return 'ready'
  if (order.kitchenStatus === 'PREPARING') return 'preparing'
  if (order.status === 'accepted') return 'confirmed'
  return 'received'
}

export async function listOnlineOrders(status?: OnlineOrderStatus): Promise<OnlineOrderRecord[]> {
  if (!hasSupabase()) {
    const all = memory().orders
    return status ? all.filter((o) => o.status === status) : all
  }

  const url = new URL(`${process.env.SUPABASE_URL}/rest/v1/online_orders`)
  url.searchParams.set('select', '*')
  url.searchParams.set('order', 'created_at.desc')
  if (status) url.searchParams.set('status', `eq.${status}`)

  const res = await fetch(url.toString(), {
    headers: supabaseHeaders(),
    cache: 'no-store'
  })
  if (!res.ok) throw new Error('Failed to list online orders')
  const rows = (await res.json()) as Record<string, unknown>[]
  return rows
    .map(rowToRecord)
    .filter((o) => o.orderNumber !== 'RIDER-PUSH' && o.id !== '00000000-0000-4000-8000-000000000001')
}

export async function updateOnlineOrder(
  id: string,
  patch: {
    status: OnlineOrderStatus
    posOrderNumber?: string
    posOrderId?: number
  }
): Promise<OnlineOrderRecord | null> {
  if (!hasSupabase()) {
    const store = memory()
    const idx = store.orders.findIndex((o) => o.id === id)
    if (idx < 0) return null
    store.orders[idx] = {
      ...store.orders[idx],
      status: patch.status,
      posOrderNumber: patch.posOrderNumber,
      posOrderId: patch.posOrderId,
      updatedAt: new Date().toISOString()
    }
    return store.orders[idx]
  }

  const url = `${process.env.SUPABASE_URL}/rest/v1/online_orders?id=eq.${encodeURIComponent(id)}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: supabaseHeaders(),
    body: JSON.stringify({
      status: patch.status,
      pos_order_number: patch.posOrderNumber ?? null,
      pos_order_id: patch.posOrderId ?? null,
      updated_at: new Date().toISOString()
    })
  })
  if (!res.ok) throw new Error('Failed to update online order')
  const rows = (await res.json()) as Record<string, unknown>[]
  return rows[0] ? rowToRecord(rows[0]) : null
}

export function assertPosKey(request: Request) {
  const expected = process.env.POS_API_KEY
  if (!expected) {
    throw new Error('POS_API_KEY is not configured on the website')
  }
  const auth = request.headers.get('authorization') || ''
  const headerKey = request.headers.get('x-pos-key') || ''
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
  const provided = headerKey || bearer
  if (!provided || provided !== expected) {
    const err = new Error('Unauthorized')
    ;(err as Error & { status: number }).status = 401
    throw err
  }
}

export function getRiderPin() {
  return (process.env.RIDER_PIN || '4444').trim()
}

export function assertRiderPin(request: Request) {
  const expected = getRiderPin()
  const auth = request.headers.get('authorization') || ''
  const headerPin = request.headers.get('x-rider-pin') || ''
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
  const provided = (headerPin || bearer).trim()
  if (!provided || provided !== expected) {
    const err = new Error('Unauthorized')
    ;(err as Error & { status: number }).status = 401
    throw err
  }
}

/**
 * Rider jobs only after kitchen marks food ready (POS sets riderStatus).
 * Until then accepted deliveries stay hidden from the rider portal.
 */
export async function listRiderOrders(opts?: {
  includeDelivered?: boolean
}): Promise<OnlineOrderRecord[]> {
  const accepted = await listOnlineOrders('accepted')
  const released = accepted.filter(
    (o) =>
      o.type === 'delivery' &&
      (o.riderStatus === 'ready' ||
        o.riderStatus === 'out_for_delivery' ||
        o.riderStatus === 'delivered')
  )
  const includeDelivered = opts?.includeDelivered ?? true
  const active = released.filter((o) => o.riderStatus !== 'delivered')
  if (!includeDelivered) return active

  const delivered = released.filter((o) => o.riderStatus === 'delivered').slice(0, 12)
  return [...active, ...delivered]
}

async function patchOrderPayload(
  id: string,
  mutate: (current: OnlineOrderRecord) => OnlineOrderPayload
): Promise<OnlineOrderRecord | null> {
  if (!hasSupabase()) {
    const store = memory()
    const idx = store.orders.findIndex((o) => o.id === id)
    if (idx < 0) return null
    const now = new Date().toISOString()
    const {
      status: _s,
      updatedAt: _u,
      posOrderNumber: _n,
      posOrderId: _i,
      ...base
    } = store.orders[idx]
    const payload = mutate(store.orders[idx])
    store.orders[idx] = {
      ...store.orders[idx],
      ...payload,
      updatedAt: now
    }
    return store.orders[idx]
  }

  const url = new URL(`${process.env.SUPABASE_URL}/rest/v1/online_orders`)
  url.searchParams.set('id', `eq.${id}`)
  url.searchParams.set('select', '*')
  const getRes = await fetch(url.toString(), {
    headers: supabaseHeaders(),
    cache: 'no-store'
  })
  if (!getRes.ok) throw new Error('Failed to load order')
  const rows = (await getRes.json()) as Record<string, unknown>[]
  if (!rows[0]) return null

  const current = rowToRecord(rows[0])
  const now = new Date().toISOString()
  const payload = mutate(current)

  const patchUrl = `${process.env.SUPABASE_URL}/rest/v1/online_orders?id=eq.${encodeURIComponent(id)}`
  const res = await fetch(patchUrl, {
    method: 'PATCH',
    headers: supabaseHeaders(),
    body: JSON.stringify({
      payload,
      updated_at: now
    })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to update order: ${text}`)
  }
  const updated = (await res.json()) as Record<string, unknown>[]
  return updated[0] ? rowToRecord(updated[0]) : null
}

export async function updateKitchenProgress(
  id: string,
  kitchenStatus: KitchenProgressStatus
): Promise<OnlineOrderRecord | null> {
  let previousRider: RiderDeliveryStatus | undefined
  const record = await patchOrderPayload(id, (current) => {
    previousRider = current.riderStatus
    const {
      status: _status,
      updatedAt: _updatedAt,
      posOrderNumber: _posOrderNumber,
      posOrderId: _posOrderId,
      ...payloadBase
    } = current
    const now = new Date().toISOString()
    const next: OnlineOrderPayload = {
      ...payloadBase,
      kitchenStatus,
      kitchenUpdatedAt: now
    }
    // READY or kitchen COMPLETED (= handed to rider) both release the mobile rider job
    if (
      current.type === 'delivery' &&
      (kitchenStatus === 'READY' || kitchenStatus === 'COMPLETED')
    ) {
      next.riderStatus =
        current.riderStatus === 'delivered' || current.riderStatus === 'out_for_delivery'
          ? current.riderStatus
          : 'ready'
      next.riderUpdatedAt = now
    }
    return next
  })

  if (
    record &&
    record.type === 'delivery' &&
    (kitchenStatus === 'READY' || kitchenStatus === 'COMPLETED') &&
    previousRider !== 'ready' &&
    previousRider !== 'out_for_delivery' &&
    previousRider !== 'delivered'
  ) {
    // Await push so serverless (Vercel) does not freeze before web-push finishes
    try {
      const { notifyRidersFoodReady } = await import('@/lib/rider-push/send')
      const result = await notifyRidersFoodReady({
        id: record.id,
        orderNumber: record.orderNumber,
        customerName: record.customerName
      })
      console.info('Rider push after kitchen', kitchenStatus, result)
    } catch (err) {
      console.error('Rider push notify failed', err)
    }
  }

  return record
}

export async function updateRiderStatus(
  id: string,
  riderStatus: RiderDeliveryStatus
): Promise<OnlineOrderRecord | null> {
  let previousStatus: RiderDeliveryStatus | undefined
  const record = await patchOrderPayload(id, (current) => {
    previousStatus = current.riderStatus
    if (current.type !== 'delivery' || current.status !== 'accepted') {
      const err = new Error('Order is not available for rider update')
      ;(err as Error & { status: number }).status = 400
      throw err
    }
    const {
      status: _status,
      updatedAt: _updatedAt,
      posOrderNumber: _posOrderNumber,
      posOrderId: _posOrderId,
      ...payloadBase
    } = current
    return {
      ...payloadBase,
      riderStatus,
      riderUpdatedAt: new Date().toISOString()
    }
  })

  if (record && riderStatus === 'ready' && previousStatus !== 'ready') {
    try {
      const { notifyRidersFoodReady } = await import('@/lib/rider-push/send')
      const result = await notifyRidersFoodReady({
        id: record.id,
        orderNumber: record.orderNumber,
        customerName: record.customerName
      })
      console.info('Rider push after riderStatus ready', result)
    } catch (err) {
      console.error('Rider push notify failed', err)
    }
  }

  return record
}
