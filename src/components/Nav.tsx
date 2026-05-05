'use client'
import { useState, useEffect } from 'react'
import styles from './Nav.module.css'
import InstallButton from './InstallButton'
import SosButton from './SosButton'

const links = [
  { href: '#hvordan', label: 'Hvordan det fungerer' },
  { href: '#pris', label: 'Priser' },
  { href: '/varsel', label: 'Sjekk bølger' },
  { href: '/sjokamera', label: 'Sjøkamera' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/hjelp', label: 'Hjelp' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [logoHref, setLogoHref] = useState('/')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Smart logo: peker til /min-side hvis innlogget eller PWA-modus
  // mounted-flagg unngår hydration mismatch (server vet ikke om localStorage)
  useEffect(() => {
    setMounted(true)

    const checkState = () => {
      const loggedIn = !!localStorage.getItem('bv_email')
      const isPWA =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true

      setIsLoggedIn(loggedIn)
      setLogoHref(loggedIn || isPWA ? '/min-side' : '/')
    }

    checkState()

    // Sjekk på nytt hvis storage endres (f.eks. logg ut i annen fane)
    window.addEventListener('storage', checkState)
    return () => window.removeEventListener('storage', checkState)
  }, [])

  return (
    <>
      <nav className={styles.nav}>
        <a href={mounted ? logoHref : '/'} className={styles.logoLink} aria-label={mounted && isLoggedIn ? 'Til min side' : 'Til forsiden'}>
          <svg width="220" height="36" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="#0a2a3d" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="#1a6080" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
            <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="#0a2a3d" letterSpacing="-0.8">bølgevarsel<tspan fill="#1a6080" fontWeight="400">.no</tspan></text>
          </svg>
        </a>

        <ul className={styles.links}>
          {links.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
        </ul>

        <div className={styles.navRight}>
          <SosButton variant="nav" />
          <InstallButton variant="nav" />
          <a href="/min-side" className={styles.cta}>{mounted && isLoggedIn ? 'Min side' : 'Logg inn'}</a>
          <button className={styles.hamburger} onClick={() => setOpen(!open)} aria-label="Meny">
            <span className={`${styles.bar} ${open ? styles.barTop : ''}`}/>
            <span className={`${styles.bar} ${open ? styles.barMid : ''}`}/>
            <span className={`${styles.bar} ${open ? styles.barBot : ''}`}/>
          </button>
        </div>
      </nav>

      {open && <div className={styles.backdrop} onClick={() => setOpen(false)}/>}

      <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerLogo}>bølgevarsel.no</span>
          <button className={styles.drawerClose} onClick={() => setOpen(false)} aria-label="Lukk">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>
        <ul className={styles.drawerLinks}>
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} className={styles.drawerLink} onClick={() => setOpen(false)}>
                {l.label}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 7h6M7 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.drawerFooter}>
          <InstallButton variant="drawer" />
          <a href="/min-side" className={styles.drawerLogin}>{mounted && isLoggedIn ? 'Min side' : 'Logg inn'}</a>
          {(!mounted || !isLoggedIn) && <a href="/registrer" className={styles.drawerCta}>Start 7 dager gratis →</a>}
        </div>
      </aside>
    </>
  )
}
