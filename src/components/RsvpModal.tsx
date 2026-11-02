import { useEffect, useState, type FormEvent } from 'react'
import Ticket from './Ticket'
import { ApiError, lookupTicket, submitRsvp, type GuestRecord } from '../lib/api'
import { saveMyRsvp } from '../lib/storage'
import { wedding } from '../config'

type View = 'form' | 'retrieve' | 'ticket' | 'declined'

interface Props {
  existing: GuestRecord | null
  onClose: () => void
  onSaved: (record: GuestRecord) => void
}

export default function RsvpModal({ existing, onClose, onSaved }: Props) {
  const [view, setView] = useState<View>(existing?.attending ? 'ticket' : 'form')
  const [record, setRecord] = useState<GuestRecord | null>(existing)
  const [name, setName] = useState(existing?.name ?? '')
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [attending, setAttending] = useState<boolean | null>(null)
  const [guests, setGuests] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const finish = (r: GuestRecord) => {
    setRecord(r)
    if (r.attending) {
      saveMyRsvp(r)
      onSaved(r)
    }
    setView(r.attending ? 'ticket' : 'declined')
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (attending === null) return setError('Please choose whether you will attend.')
    setBusy(true)
    try {
      finish(await submitRsvp({ name: name.trim(), phone, attending, guests: attending ? guests : 1 }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const retrieve = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const r = await lookupTicket(name.trim(), phone)
      if (!r.attending || !r.ticketId) {
        setError('That RSVP was recorded as not attending, so there is no ticket.')
      } else {
        finish(r)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const identityFields = (
    <>
      <label className="field">
        <span>Your full name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" maxLength={80} />
      </label>
      <label className="field">
        <span>Phone number</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="08012345678"
          pattern="[0-9+ \-]{10,18}"
          title="Enter a valid phone number"
        />
      </label>
    </>
  )

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Confirm your attendance">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {view === 'form' && (
          <form onSubmit={submit}>
            <h2 className="modal-title">Confirm Your Attendance</h2>
            {identityFields}

            <fieldset className="field choice">
              <legend>Will you be attending?</legend>
              <label className={attending === true ? 'on' : ''}>
                <input type="radio" name="attending" checked={attending === true} onChange={() => setAttending(true)} />
                Joyfully accept
              </label>
              <label className={attending === false ? 'on' : ''}>
                <input type="radio" name="attending" checked={attending === false} onChange={() => setAttending(false)} />
                Regretfully decline
              </label>
            </fieldset>

            {attending && (
              <div className="field">
                <span>Number of guests attending (including you)</span>
                <div className="stepper">
                  <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Fewer guests">
                    −
                  </button>
                  <output>{guests}</output>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.min(wedding.rsvp.maxGuests, g + 1))}
                    aria-label="More guests"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {error && <p className="form-error">{error}</p>}
            <button className="btn solid wide" disabled={busy}>
              {busy ? 'Sending…' : attending ? 'Confirm & get my ticket' : 'Submit'}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setError('')
                setView('retrieve')
              }}
            >
              Already RSVP’d? Retrieve my ticket
            </button>
          </form>
        )}

        {view === 'retrieve' && (
          <form onSubmit={retrieve}>
            <h2 className="modal-title">Retrieve Your Ticket</h2>
            <p className="modal-note">Enter the name and number you used when you RSVP’d.</p>
            {identityFields}
            {error && <p className="form-error">{error}</p>}
            <button className="btn solid wide" disabled={busy}>
              {busy ? 'Looking…' : 'Find my ticket'}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setError('')
                setView('form')
              }}
            >
              Back to RSVP
            </button>
          </form>
        )}

        {view === 'ticket' && record && (
          <>
            <h2 className="modal-title">You’re on the list!</h2>
            <Ticket guest={record} />
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setName('')
                setPhone('')
                setAttending(null)
                setGuests(1)
                setView('form')
              }}
            >
              Not you? RSVP for someone else
            </button>
          </>
        )}

        {view === 'declined' && (
          <div className="declined">
            <h2 className="modal-title">Thank you for letting us know</h2>
            <p className="modal-note">
              You will be missed, {record?.name.split(' ')[0]}. Thank you for your love and prayers.
            </p>
            <button className="btn solid wide" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
