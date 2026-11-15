import { useCallback, useEffect, useState } from 'react'
import Reveal from './Reveal'
import Divider from './Divider'
import { wedding } from '../config'

export default function Gallery() {
  // photos that fail to load (file not added yet) are dropped from the grid
  const [broken, setBroken] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<number | null>(null)

  const photos = wedding.photos.gallery.filter((p) => !broken.has(p.src))

  const markBroken = (src: string) => setBroken((prev) => new Set(prev).add(src))

  const step = useCallback(
    (dir: 1 | -1) =>
      setOpen((i) => (i === null ? i : (i + dir + photos.length) % photos.length)),
    [photos.length],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, step])

  // keep the hidden probes mounted so broken files get detected, but show nothing if none load
  const probes = wedding.photos.gallery.map((p) => (
    <img key={p.src} src={p.src} alt="" hidden onError={() => markBroken(p.src)} />
  ))

  if (photos.length === 0) return <>{probes}</>

  return (
    <section className="section gallery" id="gallery">
      {probes}
      <Reveal>
        <h2 className="h-script">Our Moments</h2>
        <Divider />
      </Reveal>
      <div className="gallery-grid">
        {photos.map((p, i) => (
          <Reveal key={p.src} className="gallery-item" delay={(i % 2) * 120}>
            <button type="button" onClick={() => setOpen(i)} aria-label={`View photo ${i + 1}`}>
              <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
            </button>
          </Reveal>
        ))}
      </div>

      {open !== null && photos[open] && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={() => setOpen(null)}
        >
          <button type="button" className="lb-close" aria-label="Close" onClick={() => setOpen(null)}>
            &times;
          </button>
          {photos.length > 1 && (
            <button
              type="button"
              className="lb-nav prev"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation()
                step(-1)
              }}
            >
              &#8249;
            </button>
          )}
          <img src={photos[open].src} alt={photos[open].alt} onClick={(e) => e.stopPropagation()} />
          {photos.length > 1 && (
            <button
              type="button"
              className="lb-nav next"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation()
                step(1)
              }}
            >
              &#8250;
            </button>
          )}
        </div>
      )}
    </section>
  )
}
