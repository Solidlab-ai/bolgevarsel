'use client'
import { useState, useEffect } from 'react'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

const STORAGE_KEY = 'bv_cookie_consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      // Vis banner kun hvis ingen valg er gjort ennå
      if (saved !== 'granted' && saved !== 'denied') {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  function choose(consent: 'granted' | 'denied') {
    try {
      localStorage.setItem(STORAGE_KEY, consent)
    } catch {}
    // Oppdater Google Consent Mode
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: consent,
      })
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Samtykke til informasjonskapsler"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#0a2a3d',
        color: 'white',
        padding: '1.2rem 1.5rem',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '1.2rem',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, flex: '1 1 320px', color: 'rgba(255,255,255,0.85)' }}>
          Vi bruker informasjonskapsler for å forstå hvordan nettstedet brukes (Google Analytics). Nødvendige kapsler for innlogging er alltid aktive. Les mer i{' '}
          <a href="/personvern" style={{ color: '#7fd4f0', textDecoration: 'underline' }}>personvernerklæringen</a>.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => choose('denied')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'transparent',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Kun nødvendige
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: 100,
              border: 'none',
              background: '#7fd4f0',
              color: '#0a2a3d',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Godta alle
          </button>
        </div>
      </div>
    </div>
  )
}
