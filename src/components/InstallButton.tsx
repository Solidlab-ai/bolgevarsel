'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  prompt(): Promise<void>
}

interface InstallButtonProps {
  variant?: 'nav' | 'drawer'
  className?: string
}

export default function InstallButton({ variant = 'nav', className }: InstallButtonProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Sjekk om allerede kjører som PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Detekter iOS Safari
    const userAgent = window.navigator.userAgent
    const iosSafari =
      /iPad|iPhone|iPod/.test(userAgent) &&
      !(window as any).MSStream
    setIsIOS(iosSafari)

    // Lytt etter beforeinstallprompt (Android Chrome, Desktop Chrome, Edge)
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Reset hvis appen blir installert
    const installedHandler = () => {
      setInstallEvent(null)
      setIsStandalone(true)
    }
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  async function handleClick() {
    // iOS: vis instruks-modal
    if (isIOS && !installEvent) {
      setShowIOSModal(true)
      return
    }

    // Android/Desktop: trigger native prompt
    if (installEvent) {
      await installEvent.prompt()
      const { outcome } = await installEvent.userChoice
      if (outcome === 'accepted') {
        localStorage.setItem('bv_installed', 'true')
        setInstallEvent(null)
      }
    }
  }

  // Skjul knappen hvis:
  // - Allerede installert (kjører som PWA)
  // - Ikke iOS OG ingen install-event (browser støtter ikke PWA)
  if (isStandalone) return null
  if (!isIOS && !installEvent) return null

  // Knapp-stil basert på variant
  const navStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    background: 'rgba(26, 96, 128, 0.08)',
    color: '#0a2a3d',
    border: '1px solid rgba(26, 96, 128, 0.2)',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  }

  const drawerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(26, 96, 128, 0.08)',
    color: '#0a2a3d',
    border: '1px solid rgba(26, 96, 128, 0.2)',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginBottom: 8,
  }

  const buttonStyle = variant === 'drawer' ? drawerStyle : navStyle

  return (
    <>
      <button onClick={handleClick} style={buttonStyle} className={className} aria-label="Installer Bølgevarsel som app">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M7 1v8m0 0L4 6m3 3l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 11v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Installer app
      </button>

      {/* iOS instruks-modal */}
      {showIOSModal && (
        <div
          onClick={() => setShowIOSModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 42, 61, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'bvFadeIn 0.25s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '28px 24px',
              maxWidth: 380,
              width: '100%',
              boxShadow: '0 20px 60px rgba(10, 42, 61, 0.3)',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              animation: 'bvSlideUpModal 0.3s cubic-bezier(.4,0,.2,1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <img src="/icon0" alt="Bølgevarsel" width={48} height={48} style={{ borderRadius: 12 }} />
              <div>
                <p style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: 20,
                  fontWeight: 400,
                  color: '#0a2a3d',
                  margin: 0,
                }}>
                  Installer på iPhone
                </p>
                <p style={{ fontSize: 12, color: '#6b8fa3', margin: 0 }}>
                  Få Bølgevarsel som app
                </p>
              </div>
            </div>

            <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', gap: 12, marginBottom: 14, fontSize: 14, color: '#2c4a5e', lineHeight: 1.5 }}>
                <span style={{
                  flexShrink: 0,
                  width: 24, height: 24,
                  borderRadius: '50%',
                  background: '#1a6080',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                }}>1</span>
                <span>
                  Trykk Del-knappen{' '}
                  <span style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 2px' }}>
                    <svg width="16" height="20" viewBox="0 0 14 18" fill="none">
                      <path d="M7 11V1m0 0L3 5m4-4l4 4M2 9v6h10V9" stroke="#1a6080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {' '}nederst i Safari
                </span>
              </li>
              <li style={{ display: 'flex', gap: 12, marginBottom: 14, fontSize: 14, color: '#2c4a5e', lineHeight: 1.5 }}>
                <span style={{
                  flexShrink: 0,
                  width: 24, height: 24,
                  borderRadius: '50%',
                  background: '#1a6080',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                }}>2</span>
                <span>Bla ned og velg <strong>«Legg til på Hjem-skjerm»</strong></span>
              </li>
              <li style={{ display: 'flex', gap: 12, fontSize: 14, color: '#2c4a5e', lineHeight: 1.5 }}>
                <span style={{
                  flexShrink: 0,
                  width: 24, height: 24,
                  borderRadius: '50%',
                  background: '#1a6080',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                }}>3</span>
                <span>Trykk <strong>«Legg til»</strong> oppe i høyre hjørne</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              style={{
                marginTop: 20,
                width: '100%',
                padding: '12px 16px',
                background: '#0a2a3d',
                color: 'white',
                border: 'none',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Skjønner
            </button>
          </div>

          <style jsx>{`
            @keyframes bvFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes bvSlideUpModal {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
