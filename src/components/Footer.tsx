import { wedding } from '../config'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-body">
        <p className="script-line">Hope to see you there!</p>
        <p className="footer-names">
          {wedding.couple.first} &amp; {wedding.couple.second}
        </p>
      </div>
      <img className="flowers flowers-bottom" src="/art/flowers-bottom.jpg" alt="" />
    </footer>
  )
}
