import { useState } from 'react'

const COLOURS = ['#c9a24a', '#b07ccf', '#e8cf8a', '#7a3a94']

/** A few slow drifting petals. Pure CSS animation, so it costs almost nothing. */
export default function Petals({ count = 14 }: { count?: number }) {
  const [petals] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      size: 8 + Math.random() * 10,
      delay: -Math.random() * 20,
      duration: 14 + Math.random() * 12,
      drift: (Math.random() - 0.5) * 140,
      colour: COLOURS[i % COLOURS.length],
    })),
  )

  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.3,
            background: p.colour,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
