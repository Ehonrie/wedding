import { useState } from 'react'
import Reveal from './Reveal'
import { wedding } from '../config'

/** Framed couple portrait. Renders nothing until the photo file exists. */
export default function Portrait() {
  const [failed, setFailed] = useState(false)
  const { src, alt } = wedding.photos.portrait

  if (failed) return null

  return (
    <Reveal className="portrait-wrap">
      <figure className="portrait">
        <img className="portrait-flora top" src="/art/flowers-top.jpg" alt="" aria-hidden="true" />
        <img src={src} alt={alt} decoding="async" onError={() => setFailed(true)} />
        <img className="portrait-flora bottom" src="/art/flowers-bottom.jpg" alt="" aria-hidden="true" />
      </figure>
    </Reveal>
  )
}
