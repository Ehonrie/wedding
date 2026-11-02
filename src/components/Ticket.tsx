import { useEffect, useState } from 'react'
import { qrDataUrl, renderTicketPng } from '../lib/ticketPng'
import type { GuestRecord } from '../lib/api'
import { wedding } from '../config'

export default function Ticket({ guest }: { guest: GuestRecord }) {
  const [qr, setQr] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    qrDataUrl(guest.ticketId).then((url) => !cancelled && setQr(url))
    return () => {
      cancelled = true
    }
  }, [guest.ticketId])

  const save = async () => {
    setSaving(true)
    try {
      const blob = await renderTicketPng(guest)
      const file = new File([blob], `ticket-${guest.ticketId}.png`, { type: 'image/png' })
      // Phones: open the native share sheet so "Save Image" is one tap away.
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Wedding ticket' })
          return
        } catch (e) {
          if ((e as DOMException).name === 'AbortError') return
        }
      }
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = file.name
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ticket-wrap">
      <div className="ticket">
        <p className="ticket-admit">Your ticket</p>
        <p className="ticket-mono">{wedding.couple.monogram}</p>
        <p className="ticket-names">
          {wedding.couple.first} &amp; {wedding.couple.second}
        </p>
        <p className="ticket-date">{wedding.dateLabel}</p>

        <div className="ticket-qr">{qr ? <img src={qr} alt={`QR code for ticket ${guest.ticketId}`} /> : <span className="spinner" />}</div>

        <p className="ticket-guest">{guest.name}</p>
        <p className="ticket-meta">
          {guest.guests} {guest.guests === 1 ? 'guest' : 'guests'} · <code>{guest.ticketId}</code>
        </p>
        <p className="ticket-venue">
          {wedding.events[0].time} · {wedding.events[0].venue}
        </p>
      </div>
      <p className="ticket-tip">Show this QR code at the entrance. Screenshot it or save the image so you have it offline.</p>
      <button className="btn solid" onClick={save} disabled={saving}>
        {saving ? 'Preparing…' : 'Save ticket image'}
      </button>
    </div>
  )
}
