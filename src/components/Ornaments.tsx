/**
 * Embossed-gold floral artwork for the envelope: layered roses, leafy vines up both edges
 * and fern sprigs along the bottom. Built procedurally so it stays crisp at any size.
 */

type Pt = [number, number]

/* ---------- geometry helpers ---------- */

/** A cupped petal pointing "up" (−y) from its base at the origin. */
function petal(s: number): string {
  return (
    `M${-s},0 C${-s * 1.15},${-s * 0.85} ${-s * 0.55},${-s * 1.35} 0,${-s * 1.2} ` +
    `C${s * 0.55},${-s * 1.35} ${s * 1.15},${-s * 0.85} ${s},0 ` +
    `C${s * 0.5},${s * 0.3} ${-s * 0.5},${s * 0.3} ${-s},0Z`
  )
}

/** A soft fold line down the middle of a petal, for texture. */
function fold(s: number): string {
  return `M0,${-s * 0.1} C${-s * 0.25},${-s * 0.5} ${-s * 0.2},${-s * 0.85} 0,${-s * 1.0}`
}

const RINGS = [
  { n: 10, r: 22, s: 14.5, rot: 0.2 },
  { n: 8, r: 17, s: 12.5, rot: 0 },
  { n: 7, r: 11.5, s: 9.5, rot: 0.35 },
  { n: 6, r: 7, s: 6.6, rot: 0.1 },
  { n: 5, r: 3.4, s: 4.2, rot: 0.5 },
]

function curl(maxR: number, turns: number): string {
  const steps = 48
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * turns
    const r = (i / steps) * maxR
    d += `${i ? 'L' : 'M'}${(Math.cos(t) * r).toFixed(1)},${(Math.sin(t) * r).toFixed(1)}`
  }
  return d
}

function bezier(p: Pt[], t: number): Pt {
  const u = 1 - t
  const x = u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0]
  const y = u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]
  return [x, y]
}

/** Direction of travel along the curve, in degrees. */
function tangentDeg(p: Pt[], t: number): number {
  const a = bezier(p, Math.max(0, t - 0.01))
  const b = bezier(p, Math.min(1, t + 0.01))
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI
}

const curveD = (p: Pt[]) => `M${p[0]} C${p[1]} ${p[2]} ${p[3]}`

/* ---------- shared symbols ---------- */

export function OrnamentDefs() {
  return (
    <defs>
      <linearGradient id="orn-gold" x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0" stopColor="#fbeab0" />
        <stop offset="0.45" stopColor="#dcae55" />
        <stop offset="1" stopColor="#9a6a24" />
      </linearGradient>
      <linearGradient id="orn-leaf-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f3d98e" />
        <stop offset="0.6" stopColor="#c8923f" />
        <stop offset="1" stopColor="#8d5f20" />
      </linearGradient>

      <g id="orn-rose" strokeLinejoin="round" strokeLinecap="round">
        {RINGS.flatMap((ring, ri) =>
          Array.from({ length: ring.n }, (_, i) => {
            const deg = ((ring.rot + (i * 2 * Math.PI) / ring.n) * 180) / Math.PI
            return (
              <g key={`${ri}-${i}`} transform={`rotate(${deg.toFixed(1)}) translate(0,${-ring.r})`}>
                <path d={petal(ring.s)} fill="url(#orn-gold)" stroke="#5a3410" strokeOpacity="0.6" strokeWidth="0.7" />
                <path d={fold(ring.s)} fill="none" stroke="#5a3410" strokeOpacity="0.35" strokeWidth="0.5" />
              </g>
            )
          }),
        )}
        <path d={curl(3, 2.2)} fill="none" stroke="#5a3410" strokeOpacity="0.7" strokeWidth="0.8" />
      </g>

      <g id="orn-leaf" strokeLinejoin="round" strokeLinecap="round">
        <path
          d="M0,0 C7,-9 21,-8.5 30,0 C21,8.5 7,9 0,0Z"
          fill="url(#orn-leaf-grad)"
          stroke="#5a3410"
          strokeOpacity="0.6"
          strokeWidth="0.7"
        />
        <path
          d="M1,0 L27,0 M8,0 L14,-5 M8,0 L14,5 M15,0 L21,-4 M15,0 L21,4"
          fill="none"
          stroke="#5a3410"
          strokeOpacity="0.45"
          strokeWidth="0.55"
        />
      </g>

      <g id="orn-bud" strokeLinejoin="round">
        <path
          d="M0,0 C-7,-6 -6,-17 0,-24 C6,-17 7,-6 0,0Z"
          fill="url(#orn-gold)"
          stroke="#5a3410"
          strokeOpacity="0.6"
          strokeWidth="0.7"
        />
        <path d="M0,-3 C-3,-9 -2,-16 0,-21" fill="none" stroke="#5a3410" strokeOpacity="0.4" strokeWidth="0.5" />
      </g>
    </defs>
  )
}

/* ---------- composition (left half; the right half is its mirror) ---------- */

const VINES: Pt[][] = [
  [[44, 120], [6, 240], [100, 320], [56, 415]],
  [[56, 415], [4, 510], [98, 590], [42, 705]],
]

// x, y, scale, rotation
const ROSES: [number, number, number, number][] = [
  [66, 262, 1.02, -10],
  [68, 412, 1.2, 15],
  [58, 566, 1.0, -22],
  [114, 330, 0.52, 30],
  [118, 498, 0.58, -8],
  [42, 160, 0.48, 12],
  [40, 676, 0.52, 40],
  [98, 636, 0.43, 5],
]

const BERRIES: Pt[] = [
  [100, 214], [26, 322], [96, 372], [20, 470], [102, 452], [20, 612], [88, 560], [66, 692],
  [74, 186], [112, 284], [36, 520], [92, 668],
]

function vineLeaves(vine: Pt[], count: number, seed: number) {
  return Array.from({ length: count }, (_, i) => {
    const t = 0.06 + (i / (count - 1)) * 0.88
    const [x, y] = bezier(vine, t)
    const side = i % 2 === 0 ? 1 : -1
    const angle = tangentDeg(vine, t) + side * (52 + 10 * Math.sin(i * 1.9 + seed))
    const scale = 0.78 + 0.34 * Math.abs(Math.sin(i * 1.3 + seed))
    return { x, y, angle, scale }
  })
}

function Fern({ stem, pairs }: { stem: Pt[]; pairs: number }) {
  return (
    <g>
      <path d={curveD(stem)} fill="none" stroke="#c8923f" strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: pairs }, (_, i) => {
        const t = 0.12 + (i / (pairs - 1)) * 0.78
        const [x, y] = bezier(stem, t)
        const a = tangentDeg(stem, t)
        const s = 1.05 - (i / pairs) * 0.5
        return (
          <g key={i}>
            <use href="#orn-leaf" transform={`translate(${x},${y}) rotate(${a + 42}) scale(${s})`} />
            <use href="#orn-leaf" transform={`translate(${x},${y}) rotate(${a - 42}) scale(${s})`} />
          </g>
        )
      })}
    </g>
  )
}

const SPRIG: Pt[] = [[196, 792], [150, 764], [118, 728], [92, 684]]

function Half() {
  return (
    <g>
      {VINES.map((v, i) => (
        <path key={i} d={curveD(v)} fill="none" stroke="#c8923f" strokeWidth="2.4" strokeLinecap="round" />
      ))}
      {VINES.flatMap((v, vi) =>
        vineLeaves(v, 10, vi * 2.1).map((l, i) => (
          <use
            key={`${vi}-${i}`}
            href="#orn-leaf"
            transform={`translate(${l.x.toFixed(1)},${l.y.toFixed(1)}) rotate(${l.angle.toFixed(1)}) scale(${l.scale.toFixed(2)})`}
          />
        )),
      )}
      {BERRIES.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3.1 : 2.2} fill="url(#orn-gold)" stroke="#5a3410" strokeOpacity="0.55" strokeWidth="0.6" />
      ))}
      <use href="#orn-bud" transform="translate(118,252) rotate(38) scale(0.9)" />
      <use href="#orn-bud" transform="translate(24,372) rotate(-52) scale(0.8)" />
      <use href="#orn-bud" transform="translate(118,578) rotate(42) scale(0.85)" />
      {ROSES.map(([x, y, s, r], i) => (
        <use key={i} href="#orn-rose" transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} />
      ))}
      <Fern stem={SPRIG} pairs={7} />
    </g>
  )
}

/** One full-envelope ornament layer. */
export default function Ornaments({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Half />
      <g transform="translate(400,0) scale(-1,1)">
        <Half />
      </g>
      {/* centre fern, rising from the bottom edge */}
      <Fern
        stem={[
          [200, 796],
          [200, 770],
          [200, 735],
          [200, 690],
        ]}
        pairs={7}
      />
      <use href="#orn-bud" transform="translate(200,692)" />
    </svg>
  )
}
