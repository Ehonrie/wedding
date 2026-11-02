import Reveal from './Reveal'
import Divider from './Divider'
import { wedding } from '../config'

const q = encodeURIComponent

export default function Venues() {
  return (
    <section className="section venues">
      <Reveal>
        <h2 className="h-script">Location</h2>
        <Divider />
      </Reveal>
      {wedding.events.map((ev) => (
        <Reveal className="venue" key={ev.id}>
          <p className="venue-label">{ev.title}</p>
          <h3 className="venue-name">{ev.venue}</h3>
          <p className="venue-date">
            {wedding.dateLabel} · {ev.note ?? ev.time}
          </p>
          <p className="venue-address">{ev.address}</p>
          <div className="map-frame">
            <iframe
              title={`Map of ${ev.venue}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${q(ev.mapQuery)}&output=embed`}
            />
          </div>
          <div className="venue-actions">
            <a
              className="btn ghost"
              href={`https://www.google.com/maps/search/?api=1&query=${q(ev.mapQuery)}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in Maps
            </a>
            <a
              className="btn ghost"
              href={`https://www.google.com/maps/dir/?api=1&destination=${q(ev.mapQuery)}`}
              target="_blank"
              rel="noreferrer"
            >
              Directions
            </a>
          </div>
        </Reveal>
      ))}
    </section>
  )
}
