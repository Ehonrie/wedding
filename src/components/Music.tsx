import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const VOLUME = 0.45

/** Background music. Browsers only allow audio after a tap, so start() is called from the envelope tap. */
export function useMusic(src: string) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  const start = useCallback(() => {
    if (!audio.current) {
      const a = new Audio(src)
      a.loop = true
      a.volume = 0
      audio.current = a
    }
    const a = audio.current
    a.play()
      .then(() => {
        setPlaying(true)
        gsap.to(a, { volume: VOLUME, duration: 3 })
      })
      .catch(() => setPlaying(false)) // blocked or file missing: the button stays available
  }, [src])

  const toggle = useCallback(() => {
    const a = audio.current
    if (!a) return start()
    if (a.paused) {
      a.play().then(() => {
        setPlaying(true)
        gsap.to(a, { volume: VOLUME, duration: 1 })
      })
    } else {
      gsap.to(a, { volume: 0, duration: 0.5, onComplete: () => a.pause() })
      setPlaying(false)
    }
  }, [start])

  // don't keep playing in a background tab
  useEffect(() => {
    let resume = false
    const onVis = () => {
      const a = audio.current
      if (!a) return
      if (document.hidden && !a.paused) {
        resume = true
        a.pause()
      } else if (!document.hidden && resume) {
        resume = false
        a.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return { playing, start, toggle }
}

export function MusicButton({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <button className="music-btn" onClick={onToggle} aria-label={playing ? 'Pause music' : 'Play music'}>
      {playing ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
          <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M8 5l11 7-11 7z" fill="currentColor" />
        </svg>
      )}
    </button>
  )
}
