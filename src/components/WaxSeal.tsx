import { useId, useMemo } from 'react'

interface Props {
  tone: 'gold' | 'plum'
  /** Big script text in the middle, e.g. "A&P". */
  mark: string
  /** Small caps line under the mark. */
  caption?: string
  size?: number
}

/** Irregular, hand-pressed wax edge. */
function blobPath(radius: number, seed: number): string {
  const points = 96
  const coords: string[] = []
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2
    const wobble =
      1 + 0.035 * Math.sin(a * 7 + seed) + 0.02 * Math.sin(a * 13 + seed * 2) + 0.012 * Math.sin(a * 29 + seed * 3)
    const r = radius * wobble
    coords.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`)
  }
  return `M${coords.join('L')}Z`
}

const PALETTE = {
  gold: { hi: '#f6e6b4', mid: '#d9b45f', lo: '#8f6a22', ink: '#7a5518', rim: '#f9efca' },
  plum: { hi: '#a04ec2', mid: '#5d1f78', lo: '#2a0b3a', ink: '#e9d3f3', rim: '#c58be0' },
}

export default function WaxSeal({ tone, mark, caption, size = 120 }: Props) {
  const uid = useId().replace(/:/g, '')
  const c = PALETTE[tone]
  const edge = useMemo(() => blobPath(46, tone === 'gold' ? 1.3 : 4.1), [tone])

  return (
    <svg className="wax-seal" width={size} height={size} viewBox="-50 -50 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={`wax-${uid}`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor={c.hi} />
          <stop offset="0.55" stopColor={c.mid} />
          <stop offset="1" stopColor={c.lo} />
        </radialGradient>
        <filter id={`emboss-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.6" dy="0.8" stdDeviation="0.4" floodColor="#000" floodOpacity="0.35" />
        </filter>
        <filter id={`cast-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>
      <path d={edge} fill={`url(#wax-${uid})`} filter={`url(#cast-${uid})`} />
      <circle r="33" fill="none" stroke={c.rim} strokeOpacity="0.55" strokeWidth="0.9" />
      <circle r="35.6" fill="none" stroke={c.lo} strokeOpacity="0.45" strokeWidth="0.6" />
      <g filter={`url(#emboss-${uid})`}>
        <text
          x="0"
          y={caption ? 3 : 9}
          textAnchor="middle"
          fontFamily="'Great Vibes', cursive"
          fontSize={mark.length > 3 ? 21 : caption ? 27 : 31}
          fill={c.ink}
        >
          {mark}
        </text>
        {caption && (
          <text
            x="0"
            y="19"
            textAnchor="middle"
            fontFamily="'Cinzel', serif"
            fontSize="6.4"
            letterSpacing="1.6"
            fill={c.ink}
          >
            {caption}
          </text>
        )}
      </g>
    </svg>
  )
}
