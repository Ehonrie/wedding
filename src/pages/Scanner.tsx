import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import {
  ApiError,
  checkIn,
  DEMO_PIN,
  fetchGuestList,
  isDemoMode,
  type CheckinResult,
  type GuestRecord,
} from '../lib/api'
import { wedding } from '../config'
import './scanner.css'

const PIN_KEY = 'ap_scan_pin'
const CACHE_KEY = 'ap_scan_cache'
const QUEUE_KEY = 'ap_scan_queue'

function read<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function Scanner() {
  const [pin, setPin] = useState(() => read(sessionStorage, PIN_KEY, ''))
  const [authed, setAuthed] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [busyLogin, setBusyLogin] = useState(false)

  const [guests, setGuests] = useState<GuestRecord[]>(() => read(localStorage, CACHE_KEY, []))
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [search, setSearch] = useState('')
  const [queued, setQueued] = useState(() => read<string[]>(localStorage, QUEUE_KEY, []).length)
  const locked = useRef(false) // ignore repeat decodes while a result is on screen

  const updateGuests = useCallback((fn: (g: GuestRecord[]) => GuestRecord[]) => {
    setGuests((prev) => {
      const next = fn(prev)
      write(localStorage, CACHE_KEY, next)
      return next
    })
  }, [])

  const loadList = useCallback(
    async (p: string) => {
      const list = await fetchGuestList(p)
      updateGuests(() => list)
    },
    [updateGuests],
  )

  // resume a session that already unlocked in this tab
  useEffect(() => {
    if (!pin) return
    loadList(pin)
      .then(() => setAuthed(true))
      .catch((err) => {
        if (err instanceof ApiError) {
          sessionStorage.removeItem(PIN_KEY)
          setPin('')
        } else if (guests.length) {
          setAuthed(true) // offline but we have a cached list
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (e: FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setBusyLogin(true)
    try {
      await loadList(pinInput)
      write(sessionStorage, PIN_KEY, pinInput)
      setPin(pinInput)
      setAuthed(true)
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : 'Could not reach the server. Check the connection.')
    } finally {
      setBusyLogin(false)
    }
  }

  const flushQueue = useCallback(async () => {
    const queue = read<string[]>(localStorage, QUEUE_KEY, [])
    if (!queue.length || !pin) return
    const remaining: string[] = []
    for (const id of queue) {
      try {
        await checkIn(pin, id)
      } catch {
        remaining.push(id)
      }
    }
    write(localStorage, QUEUE_KEY, remaining)
    setQueued(remaining.length)
  }, [pin])

  useEffect(() => {
    window.addEventListener('online', flushQueue)
    return () => window.removeEventListener('online', flushQueue)
  }, [flushQueue])

  const markLocal = useCallback(
    (ticketId: string, at: string) =>
      updateGuests((g) => g.map((r) => (r.ticketId === ticketId && !r.checkedInAt ? { ...r, checkedInAt: at } : r))),
    [updateGuests],
  )

  const handleTicket = useCallback(
    async (raw: string) => {
      const ticketId = raw.trim().toUpperCase()
      locked.current = true
      try {
        const r = await checkIn(pin, ticketId)
        if (r.status === 'ok') markLocal(ticketId, r.guest.checkedInAt || new Date().toISOString())
        setResult(r)
        flushQueue()
      } catch (err) {
        if (err instanceof ApiError) {
          setResult({ status: 'invalid' })
          return
        }
        // network is down: decide from the cached list and sync later
        const cached = guests.find((g) => g.ticketId === ticketId)
        if (!cached) setResult({ status: 'invalid' })
        else if (cached.checkedInAt) setResult({ status: 'duplicate', guest: cached })
        else {
          const at = new Date().toISOString()
          markLocal(ticketId, at)
          const queue = [...read<string[]>(localStorage, QUEUE_KEY, []), ticketId]
          write(localStorage, QUEUE_KEY, queue)
          setQueued(queue.length)
          setResult({ status: 'offline', guest: { ...cached, checkedInAt: at } })
        }
      }
    },
    [pin, guests, markLocal, flushQueue],
  )

  const handleRef = useRef(handleTicket)
  useEffect(() => {
    handleRef.current = handleTicket
  }, [handleTicket])

  // camera
  useEffect(() => {
    if (!authed) return
    const scanner = new Html5Qrcode('qr-reader')
    const started = scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: (w, h) => ({ width: Math.min(w, h) * 0.72, height: Math.min(w, h) * 0.72 }) },
        (text) => {
          if (locked.current) return
          handleRef.current(text)
        },
        () => {},
      )
      .catch(() => setCameraError('Camera unavailable. Allow camera access, or use the manual search below.'))
    return () => {
      started.then(() => scanner.stop()).catch(() => {}).finally(() => { try { scanner.clear() } catch { /* already cleared */ } })
    }
  }, [authed])

  const next = () => {
    setResult(null)
    locked.current = false
  }

  const attending = useMemo(() => guests.filter((g) => g.attending && g.ticketId), [guests])
  const stats = useMemo(() => {
    const expected = attending.reduce((n, g) => n + g.guests, 0)
    const arrived = attending.filter((g) => g.checkedInAt).reduce((n, g) => n + g.guests, 0)
    return { expected, arrived }
  }, [attending])

  const matches = useMemo(() => {
    const s = search.trim().toLowerCase()
    if (s.length < 2) return []
    return attending
      .filter((g) => g.name.toLowerCase().includes(s) || g.phone.includes(s) || g.ticketId.toLowerCase().includes(s))
      .slice(0, 6)
  }, [attending, search])

  if (!authed) {
    return (
      <main className="scan scan-login">
        <form onSubmit={login} className="scan-card">
          <p className="scan-brand">{wedding.couple.monogram}</p>
          <h1>Entrance Scanner</h1>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Enter PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            autoFocus
            required
          />
          {loginError && <p className="scan-error">{loginError}</p>}
          <button disabled={busyLogin}>{busyLogin ? 'Checking…' : 'Unlock'}</button>
          {isDemoMode && <p className="scan-demo">Demo mode · PIN is {DEMO_PIN} · data lives in this browser only</p>}
        </form>
      </main>
    )
  }

  return (
    <main className="scan">
      <header className="scan-head">
        <div>
          <p className="scan-brand">{wedding.couple.monogram} · Entrance</p>
          <p className="scan-stats">
            <strong>{stats.arrived}</strong> of {stats.expected} guests in
          </p>
        </div>
        {queued > 0 && <button className="scan-sync" onClick={flushQueue}>{queued} to sync</button>}
      </header>

      {isDemoMode && <p className="scan-demo">Demo mode · data lives in this browser only</p>}

      <div className="scan-viewport">
        <div id="qr-reader" />
        {cameraError && <p className="scan-error pad">{cameraError}</p>}
      </div>

      <section className="scan-manual">
        <input
          type="search"
          placeholder="Search name, phone or ticket"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul>
          {matches.map((g) => (
            <li key={g.ticketId}>
              <div>
                <strong>{g.name}</strong>
                <span>
                  {g.guests} {g.guests === 1 ? 'guest' : 'guests'} · {g.ticketId}
                  {g.checkedInAt && ` · in at ${timeOf(g.checkedInAt)}`}
                </span>
              </div>
              <button onClick={() => handleTicket(g.ticketId)}>Check in</button>
            </li>
          ))}
        </ul>
        <button className="scan-refresh" onClick={() => loadList(pin).catch(() => {})}>
          Refresh guest list
        </button>
      </section>

      {result && (
        <div className={`scan-result ${result.status}`} role="alert">
          {result.status === 'invalid' ? (
            <>
              <p className="big">Invalid ticket</p>
              <p>This code is not on the guest list.</p>
            </>
          ) : (
            <>
              <p className="big">
                {result.status === 'duplicate' ? 'Already checked in' : result.status === 'offline' ? 'Valid · offline' : 'Welcome'}
              </p>
              <p className="who">{result.guest.name}</p>
              <p className="party">
                {result.guest.guests} {result.guest.guests === 1 ? 'guest' : 'guests'}
              </p>
              {result.status === 'duplicate' && result.guest.checkedInAt && (
                <p>Scanned at {timeOf(result.guest.checkedInAt)}</p>
              )}
              {result.status === 'offline' && <p>Will sync when the connection returns.</p>}
            </>
          )}
          <button onClick={next} autoFocus>
            Scan next
          </button>
        </div>
      )}
    </main>
  )
}
