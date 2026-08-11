/** Breadline kitchen hours in Asia/Karachi (overnight). */
export const STORE_TIMEZONE = 'Asia/Karachi'
export const OPEN_HOUR = 16 // 4:00 PM
export const CLOSE_HOUR = 3 // 3:00 AM

export const HOURS_LABEL = 'Daily 4:00 PM – 3:00 AM'
export const OPENS_AT_LABEL = '4:00 PM'

function karachiParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: STORE_TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).formatToParts(date)

  const num = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0)

  const hour = num('hour')
  const minute = num('minute')
  return {
    hour,
    minute,
    minutes: hour * 60 + minute,
    year: num('year'),
    month: num('month'),
    day: num('day')
  }
}

/** Open from 4:00 PM through 2:59 AM; closed from 3:00 AM to 3:59 PM. */
export function isStoreOpen(date = new Date()) {
  const { minutes } = karachiParts(date)
  const openAt = OPEN_HOUR * 60
  const closeAt = CLOSE_HOUR * 60
  return minutes >= openAt || minutes < closeAt
}

/** Next kitchen open instant (4:00 PM Asia/Karachi), as ISO UTC. */
export function nextOpenAtIso(date = new Date()) {
  const k = karachiParts(date)
  const openAt = OPEN_HOUR * 60
  // If still before today's open (closed daytime), open is today 4 PM.
  // If after midnight but before close (open), or after open — next open is tomorrow 4 PM when currently open overnight;
  // when closed after midnight until 4 PM, open is today 4 PM.
  let year = k.year
  let month = k.month
  let day = k.day

  if (isStoreOpen(date) || k.minutes >= openAt) {
    // Already in/after today's open window → next calendar open is tomorrow 4 PM
    const noonUtcGuess = Date.parse(
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00+05:00`
    )
    const tomorrow = new Date(noonUtcGuess + 24 * 60 * 60 * 1000)
    const t = karachiParts(tomorrow)
    year = t.year
    month = t.month
    day = t.day
  }

  const openLocal = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(OPEN_HOUR).padStart(2, '0')}:00:00+05:00`
  return new Date(openLocal).toISOString()
}

export function nextOpenFriendly(date = new Date()) {
  const iso = nextOpenAtIso(date)
  const when = new Date(iso)
  const k = karachiParts(date)
  const openParts = karachiParts(when)
  const isToday = k.day === openParts.day && k.month === openParts.month && k.year === openParts.year
  return isToday ? `today at ${OPENS_AT_LABEL}` : `tomorrow at ${OPENS_AT_LABEL}`
}

export function storeStatus(date = new Date()) {
  const open = isStoreOpen(date)
  return {
    open,
    label: open ? 'Open now' : 'Closed',
    detail: open
      ? `Ordering until ${CLOSE_HOUR}:00 AM`
      : `Opens ${nextOpenFriendly(date)}`,
    hoursLabel: HOURS_LABEL,
    nextOpenLabel: nextOpenFriendly(date),
    nextOpenAt: nextOpenAtIso(date),
    timezone: STORE_TIMEZONE
  }
}
