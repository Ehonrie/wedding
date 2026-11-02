import { useRef, useState } from 'react'
import gsap from 'gsap'
import Ornaments, { OrnamentDefs } from './Ornaments'
import WaxSeal from './WaxSeal'
import { wedding } from '../config'
import './envelope.css'

interface Props {
  /** Fired on the tap itself (a user gesture), so audio is allowed to start. */
  onOpenStart: () => void
  /** Fired once the envelope has fully dissolved. */
  onOpened: () => void
}

export default function Envelope({ onOpenStart, onOpened }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [opening, setOpening] = useState(false)

  const open = () => {
    if (opening || !root.current) return
    setOpening(true)
    onOpenStart()

    const q = gsap.utils.selector(root.current)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: onOpened })

    // idle loops are released by .is-opening; pin the current look so GSAP starts from it
    gsap.set(q('.env-orn-bright'), { opacity: 0.95 })
    gsap.set(q('.env-hint'), { opacity: 0.85 })

    tl.to(q('.env-hint'), { opacity: 0, y: 8, duration: 0.3 }, 0)
      .to(q('.env-seal'), { scale: 0.9, duration: 0.18, ease: 'power2.out' }, 0)
      .to(q('.env-seal'), { scale: 1, duration: 0.5, ease: 'elastic.out(1,0.4)' }, 0.18)
      // flap lifts away on its top hinge
      .to(q('.env-flap'), { rotateX: -180, duration: 1.5, ease: 'power3.inOut' }, 0.35)
      .to(q('.env-flap-shade'), { opacity: 1, duration: 0.7 }, 0.35)
      // warm light spills from behind the seal
      .to(q('.env-light'), { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 1.0)
      .fromTo(q('.env-rays'), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 1.0)
      .to(q('.env-orn-bright'), { opacity: 1, duration: 0.9 }, 1.1)
      .to(q('.env-light'), { scale: 7, duration: 1.4, ease: 'power3.in' }, 2.1)
      .to(q('.env-seal'), { scale: 1.5, opacity: 0, duration: 1.0 }, 2.2)
      // dissolve the whole envelope into the invitation
      .to(q('.env-flash'), { opacity: 1, duration: 0.6, ease: 'power2.in' }, 2.7)
      .to(root.current, { opacity: 0, duration: 0.9, ease: 'power1.out' }, 3.2)

    if (reduced) tl.timeScale(3)
  }

  return (
    <div
      className={`env${opening ? ' is-opening' : ''}`}
      ref={root}
      role="dialog"
      aria-label="Wedding invitation envelope"
    >
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <OrnamentDefs />
      </svg>

      <div className="env-body">
        <div className="env-grain" />
        <Ornaments className="env-orn env-orn-dim" />
        <Ornaments className="env-orn env-orn-bright env-shimmer" />
        <svg className="env-seams" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="0,100 50,50 100,100" />
        </svg>
      </div>

      {/* revealed when the flap lifts */}
      <div className="env-inner" />
      <div className="env-rays" />
      <div className="env-light" />

      <div className="env-flap">
        <div className="env-flap-face env-flap-front">
          <svg viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="0,0 50,50 100,0" />
          </svg>
          <div className="env-flap-shade" />
        </div>
        <div className="env-flap-face env-flap-back" />
      </div>

      <button className="env-seal" onClick={open} aria-label="Open the invitation">
        <WaxSeal tone="gold" mark={wedding.couple.monogram} size={132} />
      </button>

      <p className="env-hint">Tap the seal to open</p>
      <div className="env-flash" />
    </div>
  )
}
