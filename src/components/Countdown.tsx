import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import { wedding } from '../config'

const target = new Date(wedding.dateISO).getTime()

function remaining() {
  const diff = Math.max(0, target - Date.now())
  return {
    done: diff === 0,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function Countdown() {
  const [t, setT] = useState(remaining)

  useEffect(() => {
    const id = setInterval(() => setT(remaining()), 1000)
    return () => clearInterval(id)
  }, [])

  const cells: [string, number][] = [
    ['Days', t.days],
    ['Hours', t.hours],
    ['Minutes', t.minutes],
    ['Seconds', t.seconds],
  ]

  return (
    <section className="section countdown">
      <Reveal>
        <h2 className="h-script">{t.done ? 'The day has come' : 'The Celebration Begins In'}</h2>
        <div className="count-grid" role="timer" aria-label="Time until the wedding">
          {cells.map(([label, value]) => (
            <div className="count-cell" key={label}>
              <span className="count-num" key={value}>
                {label === 'Days' ? value : pad(value)}
              </span>
              <span className="count-label">{label}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
