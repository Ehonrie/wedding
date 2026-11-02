import Divider from './Divider'
import { wedding } from '../config'

export default function Hero({ play }: { play: boolean }) {
  const { couple } = wedding
  return (
    <section className={`hero${play ? ' play' : ''}`}>
      <img className="flowers flowers-top" src="/art/flowers-top.jpg" alt="" />
      <div className="hero-body">
        <img className="monogram" src="/art/monogram.jpg" alt={`${couple.monogram} monogram`} />
        <p className="eyebrow h-1">Together with their families</p>
        <h1 className="names">
          <span className="name h-2">{couple.first}</span>
          <span className="amp h-3">&amp;</span>
          <span className="name h-4">{couple.second}</span>
        </h1>
        <p className="fullnames h-5">
          {couple.firstFull} <i>&amp;</i> {couple.secondFull}
        </p>
        <div className="h-6">
          <Divider />
        </div>
        <p className="date h-6">{wedding.dateLabel}</p>
        <p className="time h-7">{wedding.timeLabel}</p>
      </div>
      <a className="scroll-hint h-8" href="#invite">
        <span>Scroll down</span>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </a>
    </section>
  )
}
