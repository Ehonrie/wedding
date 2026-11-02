import { API_URL } from '../config'

export interface RsvpInput {
  name: string
  phone: string
  attending: boolean
  guests: number
}

export interface GuestRecord {
  ticketId: string // empty when the guest declined
  name: string
  phone: string
  attending: boolean
  guests: number
  createdAt: string
  checkedInAt: string // empty until scanned at the door
}

export type CheckinResult =
  | { status: 'ok'; guest: GuestRecord }
  | { status: 'duplicate'; guest: GuestRecord }
  | { status: 'invalid' }
  | { status: 'offline'; guest: GuestRecord }

type Reply<T> = { ok: true; data: T } | { ok: false; error: string }

export const isDemoMode = API_URL === ''
export const DEMO_PIN = '1234'

export function normalisePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('234') && digits.length > 10) digits = '0' + digits.slice(3)
  return digits
}

const sameName = (a: string, b: string) =>
  a.toLowerCase().replace(/\s+/g, ' ').trim() === b.toLowerCase().replace(/\s+/g, ' ').trim()

async function remote<T>(action: string, payload: object): Promise<Reply<T>> {
  // text/plain keeps this a "simple" request so Apps Script needs no CORS preflight.
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  })
  if (!res.ok) throw new Error(`Server returned ${res.status}`)
  return res.json() as Promise<Reply<T>>
}

/* ---------- demo backend: same contract, persisted in this browser ---------- */

const DEMO_KEY = 'ap_demo_db'

function readDemo(): GuestRecord[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) ?? '[]') as GuestRecord[]
  } catch {
    return []
  }
}

function writeDemo(rows: GuestRecord[]) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(rows))
}

function newTicketId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(10))
  return 'AP-' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

async function demo<T>(action: string, payload: Record<string, unknown>): Promise<Reply<T>> {
  await new Promise((r) => setTimeout(r, 700))
  const rows = readDemo()
  const fail = (error: string) => ({ ok: false as const, error })
  const pinOk = payload.pin === DEMO_PIN

  switch (action) {
    case 'rsvp': {
      const input = payload as unknown as RsvpInput
      const phone = normalisePhone(input.phone)
      let row = rows.find((r) => r.phone === phone)
      if (row) {
        if (!sameName(row.name, input.name)) {
          return fail(
            'This number has already RSVP’d under a different name. Use “Retrieve my ticket” or a different number.',
          )
        }
        row.name = input.name
        row.attending = input.attending
        row.guests = input.guests
        if (input.attending && !row.ticketId) row.ticketId = newTicketId()
      } else {
        row = {
          ticketId: input.attending ? newTicketId() : '',
          name: input.name,
          phone,
          attending: input.attending,
          guests: input.guests,
          createdAt: new Date().toISOString(),
          checkedInAt: '',
        }
        rows.push(row)
      }
      writeDemo(rows)
      return { ok: true, data: row as T }
    }
    case 'lookup': {
      const row = rows.find(
        (r) => r.phone === normalisePhone(String(payload.phone)) && sameName(r.name, String(payload.name)),
      )
      return row ? { ok: true, data: row as T } : fail('We could not find an RSVP with that name and number.')
    }
    case 'list':
      return pinOk ? { ok: true, data: rows as T } : fail('Wrong PIN.')
    case 'checkin': {
      if (!pinOk) return fail('Wrong PIN.')
      const row = rows.find((r) => r.ticketId === payload.ticketId)
      if (!row) return { ok: true, data: { status: 'invalid' } as T }
      if (row.checkedInAt) return { ok: true, data: { status: 'duplicate', guest: row } as T }
      row.checkedInAt = new Date().toISOString()
      writeDemo(rows)
      return { ok: true, data: { status: 'ok', guest: row } as T }
    }
    default:
      return fail('Unknown action.')
  }
}

async function call<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const reply = isDemoMode ? await demo<T>(action, payload) : await remote<T>(action, payload)
  if (!reply.ok) throw new ApiError(reply.error)
  return reply.data
}

export class ApiError extends Error {}

/* ---------- public API ---------- */

export const submitRsvp = (input: RsvpInput) =>
  call<GuestRecord>('rsvp', { ...input, phone: normalisePhone(input.phone) })

export const lookupTicket = (name: string, phone: string) =>
  call<GuestRecord>('lookup', { name, phone: normalisePhone(phone) })

export const fetchGuestList = (pin: string) => call<GuestRecord[]>('list', { pin })

export const checkIn = (pin: string, ticketId: string) =>
  call<Exclude<CheckinResult, { status: 'offline' }>>('checkin', { pin, ticketId })
