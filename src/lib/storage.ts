import type { GuestRecord } from './api'

const KEY = 'ap_my_rsvp'

// Browser storage can throw (private windows, blocked site data), so every access is guarded.
export function loadMyRsvp(): GuestRecord | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as GuestRecord) : null
  } catch {
    return null
  }
}

export function saveMyRsvp(record: GuestRecord) {
  try {
    localStorage.setItem(KEY, JSON.stringify(record))
  } catch {
    /* ignore */
  }
}
