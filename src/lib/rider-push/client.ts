function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return output
}

export function pushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export async function registerRiderServiceWorker() {
  return navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    updateViaCache: 'none'
  })
}

export async function enableRiderPush(pin: string): Promise<'ok' | 'denied' | 'unsupported'> {
  if (!pushSupported()) return 'unsupported'

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'denied'

  const keyRes = await fetch('/api/rider/push/vapid', { cache: 'no-store' })
  const keyData = (await keyRes.json()) as { publicKey?: string; error?: string }
  if (!keyRes.ok || !keyData.publicKey) {
    throw new Error(keyData.error || 'Push is not configured')
  }

  const registration = await registerRiderServiceWorker()
  await navigator.serviceWorker.ready

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyData.publicKey)
    })
  }

  const serialized = subscription.toJSON()
  const res = await fetch('/api/rider/push/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Rider-Pin': pin
    },
    body: JSON.stringify(serialized)
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || 'Failed to save push subscription')
  }

  return 'ok'
}

export async function hasRiderPushSubscription() {
  if (!pushSupported()) return false
  try {
    const registration = await navigator.serviceWorker.getRegistration('/')
    if (!registration) return false
    const sub = await registration.pushManager.getSubscription()
    return Boolean(sub)
  } catch {
    return false
  }
}
