import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { wedding } from '../config'

gsap.registerPlugin(ScrollTrigger)

function Rose() {
  return (
    <svg viewBox="-34 -34 68 68" width="38" height="38" aria-hidden="true">
      <defs>
        <radialGradient id="rose-g" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#b25bd1" />
          <stop offset="0.6" stopColor="#5d1f78" />
          <stop offset="1" stopColor="#2a0b3a" />
        </radialGradient>
      </defs>
      <circle r="24" fill="url(#rose-g)" />
      <g fill="none" stroke="#e8cf8a" strokeWidth="1.3" strokeLinecap="round">
        <path d="M0,-22 C12,-22 22,-12 20,2 C18,15 5,22 -8,20 C-19,18 -24,5 -20,-7 C-17,-17 -8,-22 0,-22Z" />
        <path d="M1,-14 C9,-14 16,-7 14,1 C12,10 3,15 -5,13 C-13,11 -16,3 -13,-4 C-11,-11 -5,-14 1,-14Z" />
        <path d="M1,-7 C5,-7 9,-3 8,1 C7,6 2,9 -2,8 C-7,6 -8,1 -6,-2 C-4,-5 -2,-7 1,-7Z" />
        <path d="M0,-2 C3,-3 5,0 3,2 C1,4 -2,3 -2,0" />
      </g>
    </svg>
  )
}

export default function Schedule() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('.tl-item')
      const rose = el.querySelector('.tl-rose')
      const track = el.querySelector('.tl-track')

      // the rose travels down the line as you scroll
      gsap.fromTo(
        rose,
        { y: 0 },
        {
          y: () => (track as HTMLElement).offsetHeight,
          ease: 'none',
          scrollTrigger: { trigger: track, start: 'top 60%', end: 'bottom 55%', scrub: 0.6 },
        },
      )
      gsap.fromTo(
        el.querySelector('.tl-fill'),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: { trigger: track, start: 'top 60%', end: 'bottom 55%', scrub: 0.6 },
        },
      )

      // each stop lights up as the rose reaches it
      items.forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 58%',
          onEnter: () => item.classList.add('active'),
          onLeaveBack: () => item.classList.remove('active'),
        })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section schedule" ref={root}>
      <h2 className="h-script">Schedule of Events</h2>
      <div className="tl-track">
        <div className="tl-line">
          <div className="tl-fill" />
        </div>
        <div className="tl-rose">
          <Rose />
        </div>
        {wedding.events.map((ev, i) => (
          <article className={`tl-item ${i % 2 ? 'right' : 'left'}`} key={ev.id}>
            <span className="tl-dot" />
            <div className="tl-card">
              <p className="tl-time">{ev.time}</p>
              <h3 className="tl-title">{ev.title}</h3>
              <p className="tl-venue">{ev.venue}</p>
              {ev.note && <p className="tl-note">{ev.note}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
