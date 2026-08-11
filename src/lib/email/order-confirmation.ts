import nodemailer from 'nodemailer'
import { siteInfo } from '@/data/site'
import { formatMoney } from '@/lib/utils'
import type { OnlineOrderPayload } from '@/lib/online-orders/types'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function money(n: number) {
  return formatMoney(n, 'Rs.')
}

export function buildOrderConfirmationHtml(order: OnlineOrderPayload) {
  const isDelivery = order.type === 'delivery'
  const logoUrl = `${siteInfo.siteUrl}${siteInfo.logo}`
  const trackUrl = `${siteInfo.siteUrl}/track-order?id=${order.id}`
  const addressLine = [order.address, order.city, order.postalCode].filter(Boolean).join(', ')

  const itemRows = order.items
    .map((item) => {
      const extras = item.modifiers?.length
        ? `<div style="color:#6b6b6b;font-size:12px;margin-top:4px;">${escapeHtml(
            item.modifiers.join(', ')
          )}</div>`
        : ''
      const note = item.note
        ? `<div style="color:#8a8a8a;font-size:12px;margin-top:2px;font-style:italic;">Note: ${escapeHtml(
            item.note
          )}</div>`
        : ''
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #eee;vertical-align:top;">
            <div style="font-weight:700;color:#141414;font-size:15px;">
              ${item.quantity}× ${escapeHtml(item.name)}
            </div>
            ${extras}${note}
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#141414;white-space:nowrap;">
            ${money(item.lineTotal)}
          </td>
        </tr>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Order ${escapeHtml(order.orderNumber)} confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f3f1ef;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f1ef;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(20,20,20,0.08);">
          <tr>
            <td style="background:linear-gradient(145deg,#1a1a1a 0%,#2b1515 55%,#c41e22 140%);padding:28px 28px 24px;text-align:center;">
              <img src="${logoUrl}" width="64" height="64" alt="Breadline" style="display:block;margin:0 auto 14px;border-radius:999px;border:2px solid rgba(255,255,255,0.25);" />
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.55);">
                ${escapeHtml(siteInfo.tagline)}
              </div>
              <h1 style="margin:10px 0 0;font-size:34px;line-height:1;letter-spacing:0.04em;color:#ffffff;">
                BREAD<span style="color:#ff5a5f;">LINE</span>
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#c41e22;">
                Order confirmed
              </p>
              <h2 style="margin:10px 0 0;font-family:Georgia,serif;font-size:28px;line-height:1.15;color:#141414;">
                Thanks, ${escapeHtml(order.customerName.split(' ')[0] || order.customerName)}!
              </h2>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#5c5c5c;">
                We’ve received your order <strong style="color:#141414;">${escapeHtml(order.orderNumber)}</strong>
                and the kitchen is on it. Estimated
                ${isDelivery ? 'delivery' : 'pickup'}:
                <strong style="color:#141414;">~${order.estimatedMinutes} mins</strong>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 28px 0;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf7f5;border-radius:16px;">
                <tr>
                  <td style="padding:16px 18px;width:50%;vertical-align:top;">
                    <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8a8a8a;font-weight:700;">Type</div>
                    <div style="margin-top:6px;font-size:15px;font-weight:700;color:#141414;text-transform:capitalize;">${order.type}</div>
                  </td>
                  <td style="padding:16px 18px;width:50%;vertical-align:top;">
                    <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8a8a8a;font-weight:700;">Payment</div>
                    <div style="margin-top:6px;font-size:15px;font-weight:700;color:#141414;">
                      ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Cash at Restaurant'}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:0 18px 16px;">
                    <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8a8a8a;font-weight:700;">
                      ${isDelivery ? 'Deliver to' : 'Pickup at'}
                    </div>
                    <div style="margin-top:6px;font-size:14px;line-height:1.45;color:#141414;">
                      ${
                        isDelivery
                          ? escapeHtml(addressLine || 'Address on file')
                          : escapeHtml(`${siteInfo.address}, ${siteInfo.city}`)
                      }
                    </div>
                    ${
                      order.instructions
                        ? `<div style="margin-top:8px;font-size:13px;color:#6b6b6b;">Instructions: ${escapeHtml(
                            order.instructions
                          )}</div>`
                        : ''
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 28px 8px;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#8a8a8a;font-weight:700;margin-bottom:4px;">
                Your order
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${itemRows}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 28px 8px;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;color:#5c5c5c;">
                <tr>
                  <td style="padding:6px 0;">Subtotal</td>
                  <td style="padding:6px 0;text-align:right;">${money(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;">${isDelivery ? 'Delivery fee' : 'Pickup'}</td>
                  <td style="padding:6px 0;text-align:right;">${money(order.deliveryFee)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;">Tax</td>
                  <td style="padding:6px 0;text-align:right;">${money(order.tax)}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0 0;font-size:18px;font-weight:800;color:#141414;border-top:1px solid #eee;">Total</td>
                  <td style="padding:14px 0 0;text-align:right;font-size:18px;font-weight:800;color:#c41e22;border-top:1px solid #eee;">
                    ${money(order.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px 28px;font-family:Arial,Helvetica,sans-serif;" align="center">
              <a href="${trackUrl}" style="display:inline-block;background:#c41e22;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 26px;border-radius:999px;">
                Track your order
              </a>
              <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#8a8a8a;">
                Questions? Call us at
                <a href="${siteInfo.phoneHref}" style="color:#c41e22;text-decoration:none;font-weight:700;">${siteInfo.phone}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#141414;padding:20px 28px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
              <div style="color:#ffffff;font-size:13px;font-weight:700;">${escapeHtml(siteInfo.name)} · ${escapeHtml(
                siteInfo.address
              )}</div>
              <div style="margin-top:6px;color:rgba(255,255,255,0.45);font-size:12px;">${escapeHtml(
                siteInfo.hours
              )}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildOrderConfirmationText(order: OnlineOrderPayload) {
  const lines = [
    `Breadline — Order confirmed`,
    ``,
    `Hi ${order.customerName},`,
    `Order ${order.orderNumber} is confirmed.`,
    `Type: ${order.type}`,
    `Estimated: ~${order.estimatedMinutes} mins`,
    ``,
    ...order.items.map((i) => `${i.quantity}x ${i.name} — ${money(i.lineTotal)}`),
    ``,
    `Subtotal: ${money(order.subtotal)}`,
    `Delivery: ${money(order.deliveryFee)}`,
    `Tax: ${money(order.tax)}`,
    `Total: ${money(order.total)}`,
    ``,
    `Track: ${siteInfo.siteUrl}/track-order?id=${order.id}`,
    `Call: ${siteInfo.phone}`
  ]
  return lines.join('\n')
}

type SendResult =
  | { sent: true; id?: string; via: 'smtp' | 'resend' }
  | { sent: false; reason: string; detail?: string }

function fromAddress() {
  return process.env.EMAIL_FROM?.trim() || 'Breadline <onboarding@resend.dev>'
}

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  )
}

async function sendViaSmtp(opts: {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}): Promise<SendResult> {
  const host = process.env.SMTP_HOST!.trim()
  const port = Number(process.env.SMTP_PORT || 465)
  const user = process.env.SMTP_USER!.trim()
  const pass = process.env.SMTP_PASS!.trim()
  const secure = process.env.SMTP_SECURE !== 'false' && port === 465

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  })

  const info = await transporter.sendMail({
    from: fromAddress(),
    to: opts.to,
    replyTo: opts.replyTo || siteInfo.email,
    subject: opts.subject,
    html: opts.html,
    text: opts.text
  })

  return { sent: true, id: info.messageId, via: 'smtp' }
}

async function sendViaResend(opts: {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { sent: false, reason: 'missing_api_key' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [opts.to],
      reply_to: opts.replyTo || siteInfo.email,
      subject: opts.subject,
      html: opts.html,
      text: opts.text
    })
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('[email] Resend failed:', errText)
    return { sent: false, reason: 'provider_error', detail: errText }
  }

  const data = (await res.json()) as { id?: string }
  return { sent: true, id: data.id, via: 'resend' }
}

async function deliverEmail(opts: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<SendResult> {
  // SMTP (e.g. Gmail) can send to any customer inbox without a verified domain.
  if (smtpConfigured()) {
    try {
      return await sendViaSmtp(opts)
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      console.error('[email] SMTP failed:', detail)
      // Fall through to Resend if configured
      if (!process.env.RESEND_API_KEY) {
        return { sent: false, reason: 'smtp_error', detail }
      }
    }
  }

  return sendViaResend(opts)
}

export async function sendOrderConfirmationEmail(order: OnlineOrderPayload) {
  const to = order.email?.trim().toLowerCase()
  if (!to) {
    return { sent: false as const, reason: 'missing_email' }
  }

  if (!smtpConfigured() && !process.env.RESEND_API_KEY) {
    console.warn('[email] No SMTP or RESEND_API_KEY — confirmation not sent')
    return { sent: false as const, reason: 'missing_api_key' }
  }

  const html = buildOrderConfirmationHtml(order)
  const text = buildOrderConfirmationText(order)
  const subject = `Order confirmed · ${order.orderNumber} · Breadline`

  const customer = await deliverEmail({ to, subject, html, text })

  const notify = (process.env.ORDER_NOTIFY_EMAIL?.trim() || siteInfo.email || '').toLowerCase()
  if (notify && notify !== to) {
    const staffHtml = html.replace('Order confirmed', 'New online order')
    const staffSubject = `New order · ${order.orderNumber} · ${order.customerName}`
    const staff = await deliverEmail({
      to: notify,
      subject: staffSubject,
      html: staffHtml,
      text: `New online order\n\n${text}`
    }).catch((err) => {
      console.error('[email] notify copy failed', err)
      return { sent: false as const, reason: 'notify_failed' }
    })
    if (!staff.sent) {
      console.warn('[email] restaurant notify not sent', staff)
    }
  }

  if (!customer.sent) {
    // Resend sandbox can only mail the account owner until a domain is verified.
    if (customer.detail?.includes('verify a domain')) {
      console.error(
        '[email] Resend blocked customer send. Verify breadline.com at resend.com/domains OR set SMTP_HOST/SMTP_USER/SMTP_PASS (Gmail app password).'
      )
    }
    return customer
  }

  return customer
}
