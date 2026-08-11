import webpush from 'web-push'
import {
  deleteRiderPushSubscription,
  listRiderPushSubscriptions,
  type PushSubscriptionJSON
} from './store'

function vapidConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  )
}

function configureWebPush() {
  if (!vapidConfigured()) return false
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:contact@breadline.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  return true
}

export async function sendRiderPush(payload: {
  title: string
  body: string
  url?: string
  tag?: string
}) {
  if (!configureWebPush()) {
    console.warn('VAPID keys missing — rider push skipped')
    return { sent: 0, failed: 0 }
  }

  const subs = await listRiderPushSubscriptions()
  if (subs.length === 0) {
    console.warn('Rider push skipped — no phone subscriptions saved (open /rider and Allow notifications)')
    return { sent: 0, failed: 0 }
  }

  const data = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/rider',
    tag: payload.tag || 'breadline-rider',
    icon: '/icon.png',
    badge: '/icon.png'
  })

  let sent = 0
  let failed = 0

  await Promise.all(
    subs.map(async (sub: PushSubscriptionJSON) => {
      try {
        await webpush.sendNotification(sub, data)
        sent += 1
      } catch (error) {
        failed += 1
        const status = (error as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await deleteRiderPushSubscription(sub.endpoint).catch(() => undefined)
        } else {
          console.error('Rider push failed', status, error)
        }
      }
    })
  )

  return { sent, failed }
}

export async function notifyRidersFoodReady(order: {
  id: string
  orderNumber: string
  customerName: string
}) {
  return sendRiderPush({
    title: 'Food ready — deliver now',
    body: `#${order.orderNumber} · ${order.customerName}`,
    url: '/rider',
    tag: `rider-ready-${order.id}`
  })
}
