import { NextResponse } from 'next/server'
import { assertRiderPin } from '@/lib/online-orders/store'
import { saveRiderPushSubscription } from '@/lib/rider-push/store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    assertRiderPin(request)
    const body = (await request.json()) as {
      endpoint?: string
      keys?: { p256dh?: string; auth?: string }
      expirationTime?: number | null
    }

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    await saveRiderPushSubscription({
      endpoint: body.endpoint,
      expirationTime: body.expirationTime ?? null,
      keys: {
        p256dh: body.keys.p256dh,
        auth: body.keys.auth
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const status = (error as Error & { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Failed'
    return NextResponse.json({ error: message }, { status })
  }
}
