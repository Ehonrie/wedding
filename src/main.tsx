import { lazy, StrictMode, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// The scanner pulls in a camera/QR library guests never need, so it loads only on /#/scan.
const Scanner = lazy(() => import('./pages/Scanner.tsx'))

// Hash routing keeps this working on any static host with no rewrite rules: /#/scan opens the door scanner.
function Root() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash.startsWith('#/scan') ? (
    <Suspense fallback={null}>
      <Scanner />
    </Suspense>
  ) : (
    <App />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
