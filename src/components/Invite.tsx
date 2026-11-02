import Reveal from './Reveal'
import Divider from './Divider'
import { wedding } from '../config'

export default function Invite() {
  const { hosts, couple } = wedding
  return (
    <section className="section invite" id="invite">
      <Reveal>
        <p className="kicker">The families of</p>
        <p className="host">
          {hosts.familyA[0]}
          <br />
          {hosts.familyA[1]}
        </p>
        <p className="kicker small">and</p>
        <p className="host">{hosts.familyB[0]}</p>
      </Reveal>
      <Reveal delay={120}>
        <Divider />
        <p className="script-line">{wedding.invitationLine}</p>
        <p className="child-names">
          <span>{couple.firstFull}</span>
          <i>&amp;</i>
          <span>{couple.secondFull}</span>
        </p>
      </Reveal>
    </section>
  )
}
