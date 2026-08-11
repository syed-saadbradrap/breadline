import type {
  OnlineOrderPayload,
  OnlineOrderRecord,
  OnlineOrderStatus,
  RiderDeliveryStatus
} from './types'

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

export async function updateRiderStatus(
  id: string,
  riderStatus: RiderDeliveryStatus
): Promise<OnlineOrderRecord | null> {
  if (!hasSupabase()) {
    const store = memory()
    const idx = store.orders.findIndex((o) => o.id === id)
    if (idx < 0) return null
    const now = new Date().toISOString()
    const previous = store.orders[idx].riderStatus
    store.orders[idx] = {
      ...store.orders[idx],
      riderStatus,
      riderUpdatedAt: now,
      updatedAt: now
    }
    if (riderStatus === 'ready' && previous !== 'ready') {
      void import('@/lib/rider-push/send')
        .then(({ notifyRidersFoodReady }) =>
          notifyRidersFoodReady({
            id: store.orders[idx].id,
            orderNumber: store.orders[idx].orderNumber,
            customerName: store.orders[idx].customerName
          })
        )
        .catch((err) => console.error('Rider push notify failed', err))
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
  if (current.type !== 'delivery' || current.status !== 'accepted') {
    const err = new Error('Order is not available for rider update')
    ;(err as Error & { status: number }).status = 400
    throw err
  }

  const previousStatus = current.riderStatus
  const now = new Date().toISOString()
  const {
    status: _status,
    updatedAt: _updatedAt,
    posOrderNumber: _posOrderNumber,
    posOrderId: _posOrderId,
    ...payloadBase
  } = current
  const payload: OnlineOrderPayload = {
    ...payloadBase,
    riderStatus,
    riderUpdatedAt: now
  }

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
    throw new Error(`Failed to update rider status: ${text}`)
  }
  const updated = (await res.json()) as Record<string, unknown>[]
  const record = updated[0] ? rowToRecord(updated[0]) : null

  if (record && riderStatus === 'ready' && previousStatus !== 'ready') {
    void import('@/lib/rider-push/send')
      .then(({ notifyRidersFoodReady }) =>
        notifyRidersFoodReady({
          id: record.id,
          orderNumber: record.orderNumber,
          customerName: record.customerName
        })
      )
      .catch((err) => console.error('Rider push notify failed', err))
  }

  return record
}
