import { useEffect, useState } from 'react'
import Envelope from './components/Envelope'
import Hero from './components/Hero'
import Invite from './components/Invite'
import Countdown from './components/Countdown'
import Schedule from './components/Schedule'
import Venues from './components/Venues'
import Palette from './components/Palette'
import RsvpSection from './components/RsvpSection'
import Footer from './components/Footer'
import Petals from './components/Petals'
import { MusicButton, useMusic } from './components/Music'
import { wedding } from './config'

export default function App() {
  const [opened, setOpened] = useState(false)
  const music = useMusic(wedding.music)

  // the page stays put underneath until the envelope has dissolved
  useEffect(() => {
    document.documentElement.style.overflow = opened ? '' : 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [opened])

  return (
    <>
      <main className="shell">
        <Hero play={opened} />
        <Invite />
        <Countdown />
        <Schedule />
        <Venues />
        <Palette />
        <RsvpSection />
        <Footer />
      </main>

      {opened && (
        <>
          <Petals />
          <MusicButton playing={music.playing} onToggle={music.toggle} />
        </>
      )}
      {!opened && <Envelope onOpenStart={music.start} onOpened={() => setOpened(true)} />}
    </>
  )
}
