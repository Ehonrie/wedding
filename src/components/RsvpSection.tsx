import { useState } from 'react'
import Reveal from './Reveal'
import RsvpModal from './RsvpModal'
import WaxSeal from './WaxSeal'
import Divider from './Divider'
import { loadMyRsvp } from '../lib/storage'
import type { GuestRecord } from '../lib/api'
import { wedding } from '../config'

export default function RsvpSection() {
  const [open, setOpen] = useState(false)
  const [mine, setMine] = useState<GuestRecord | null>(loadMyRsvp)

  return (
    <section className="section rsvp" id="rsvp">
      <Reveal>
        <h2 className="h-script">Confirm Your Attendance</h2>
        <Divider />
        <p className="body-copy">
          To help us prepare for a joyful celebration, kindly confirm your attendance. Your ticket will be created
          right here.
        </p>
        <button className="rsvp-seal" onClick={() => setOpen(true)} aria-label="Open RSVP form">
          <WaxSeal tone="plum" mark="RSVP" caption={mine ? 'MY TICKET' : 'TAP HERE'} size={150} />
        </button>
        <p className="tap-hint">{mine ? 'View your ticket' : 'Click to open'}</p>

        <p className="body-copy small">Prefer to call? Reach us on</p>
        <ul className="phones">
          {wedding.rsvp.phones.map((p) => (
            <li key={p}>
              <a href={`tel:${p}`}>{p}</a>
            </li>
          ))}
        </ul>
      </Reveal>

      {open && <RsvpModal existing={mine} onClose={() => setOpen(false)} onSaved={setMine} />}
    </section>
  )
}
