import Reveal from './Reveal'
import Divider from './Divider'
import { wedding } from '../config'

export default function Palette() {
  return (
    <section className="section palette">
      <Reveal>
        <h2 className="h-script">Colours Palette</h2>
        <Divider />
        <p className="body-copy">We would love to see you dressed in our wedding colours.</p>
        <ul className="swatches">
          {wedding.colours.map((c) => (
            <li key={c.name}>
              <span className="swatch" style={{ background: c.hex }} />
              <span className="swatch-name">{c.name}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
