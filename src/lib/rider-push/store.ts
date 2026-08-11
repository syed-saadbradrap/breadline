export type PushSubscriptionJSON = {
  endpoint: string
  expirationTime?: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

/** Sentinel row in online_orders — avoids a separate SQL migration. */
const CATALOG_ID = '00000000-0000-4000-8000-000000000001'

type CatalogPayload = {
  id: string
  orderNumber: string
  createdAt: string
  type: 'takeaway'
  customerName: string
  phone: string
  paymentMethod: 'cod'
  items: []
  subtotal: number
  deliveryFee: number
  tax: number
  discount: number
  total: number
  estimatedMinutes: number
  pushSubscriptions: PushSubscriptionJSON[]
}

type MemoryStore = {
  subs: Map<string, PushSubscriptionJSON>
}

declare global {
  // eslint-disable-next-line no-var
  var __breadlineRiderPush: MemoryStore | undefined
}

function memory(): MemoryStore {
  if (!globalThis.__breadlineRiderPush) {
    globalThis.__breadlineRiderPush = { subs: new Map() }
  }
  return globalThis.__breadlineRiderPush
}

function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function supabaseHeaders(prefer?: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: prefer || 'return=representation'
  }
}

function emptyCatalog(): CatalogPayload {
  const now = new Date().toISOString()
  return {
    id: CATALOG_ID,
    orderNumber: 'RIDER-PUSH',
    createdAt: now,
    type: 'takeaway',
    customerName: 'Rider Push Catalog',
    phone: '0000',
    paymentMethod: 'cod',
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    tax: 0,
    discount: 0,
    total: 0,
    estimatedMinutes: 0,
    pushSubscriptions: []
  }
}

async function loadCatalog(): Promise<CatalogPayload> {
  const url = `${process.env.SUPABASE_URL}/rest/v1/online_orders?id=eq.${CATALOG_ID}&select=payload`
  const res = await fetch(url, {
    headers: supabaseHeaders(),
    cache: 'no-store'
  })
  if (!res.ok) throw new Error('Failed to load push catalog')
  const rows = (await res.json()) as Array<{ payload: CatalogPayload }>
  if (!rows[0]?.payload) return emptyCatalog()
  const payload = rows[0].payload
  if (!Array.isArray(payload.pushSubscriptions)) payload.pushSubscriptions = []
  return payload
}

async function saveCatalog(payload: CatalogPayload) {
  const now = new Date().toISOString()
  const upsertUrl = `${process.env.SUPABASE_URL}/rest/v1/online_orders`
  const res = await fetch(upsertUrl, {
    method: 'POST',
    headers: supabaseHeaders('resolution=merge-duplicates,return=minimal'),
    body: JSON.stringify({
      id: CATALOG_ID,
      order_number: 'RIDER-PUSH',
      status: 'cancelled',
      payload,
      created_at: payload.createdAt || now,
      updated_at: now
    })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to save push catalog: ${text}`)
  }
}

export async function saveRiderPushSubscription(sub: PushSubscriptionJSON) {
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    throw new Error('Invalid push subscription')
  }

  if (!hasSupabase()) {
    memory().subs.set(sub.endpoint, sub)
    return
  }

  const catalog = await loadCatalog()
  const next = catalog.pushSubscriptions.filter((s) => s.endpoint !== sub.endpoint)
  next.push(sub)
  catalog.pushSubscriptions = next
  await saveCatalog(catalog)
}

export async function deleteRiderPushSubscription(endpoint: string) {
  if (!hasSupabase()) {
    memory().subs.delete(endpoint)
    return
  }

  const catalog = await loadCatalog()
  catalog.pushSubscriptions = catalog.pushSubscriptions.filter((s) => s.endpoint !== endpoint)
  await saveCatalog(catalog)
}

export async function listRiderPushSubscriptions(): Promise<PushSubscriptionJSON[]> {
  if (!hasSupabase()) {
    return Array.from(memory().subs.values())
  }

  const catalog = await loadCatalog()
  return catalog.pushSubscriptions.filter((s) => s?.endpoint && s.keys?.p256dh && s.keys?.auth)
}
