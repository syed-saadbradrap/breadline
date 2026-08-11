import { NextResponse } from 'next/server'
import { getRiderPin } from '@/lib/online-orders/store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { pin?: string }
    const pin = String(body.pin || '').trim()
    const expected = getRiderPin()
    if (!pin || pin !== expected) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
