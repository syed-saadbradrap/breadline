import type { OnlineOrderPayload, OnlineOrderRecord, OnlineOrderStatus } from './types'

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
  return rows.map(rowToRecord)
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
