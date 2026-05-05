'use client'

import { useEffect, useState, useRef } from 'react'

interface SosCountdownModalProps {
  open: boolean
  emergencyContactCount: number
  fallbackLocation?: { name: string; lat: number; lon: number } | null
  onClose: () => void
}

/**
 * Fullskjerm-modal med 5-sek countdown for SOS-utløsning.
 * Triggeres typisk via ?sos=trigger i URL.
 *
 * Flow:
 *  - Vises åpen → 5 sek countdown starter automatisk
 *  - Bruker kan trykke "Send NÅ" for å hoppe over countdown
 *  - Bruker kan trykke "Avbryt" eller ESC for å avbryte
 *  - Når countdown når 0 → henter GPS + caller emergency-sos API
 */
export default function SosCountdownModal({
  open,
  emergencyContactCount,
  fallbackLocation,
  onClose,
}: SosCountdownModalProps) {
  const [countdown, setCountdown] = useState(5)
  const [phase, setPhase] = useState<'counting' | 'sending' | 'sent' | 'error'>('counting')
  const [result, setResult] = useState<{ contacts_notified: number; location?: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const sentRef = useRef(false)

  // Reset state når modalen åpnes
  useEffect(() => {
    if (open) {
      setCountdown(5)
      setPhase('counting')
      setResult(null)
      setErrorMsg('')
      sentRef.current = false
    }
  }, [open])

  // Countdown tick
  useEffect(() => {
    if (!open || phase !== 'counting') return
    if (countdown <= 0) {
      sendSos()
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [open, phase, countdown])

  // ESC for å avbryte
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase === 'counting') {
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, phase, onClose])

  // Lås body-scroll når åpen
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  async function sendSos() {
    if (sentRef.current) return
    sentRef.current = true
    setPhase('sending')

    try {
      // Hent GPS i sanntid med 10s timeout
      let lat: number | null = null
      let lng: number | null = null
      let locName = ''

      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Ingen geolocation'))
            return
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          })
        })
        lat = Math.round(pos.coords.latitude * 10000) / 10000
        lng = Math.round(pos.coords.longitude * 10000) / 10000
        locName = `GPS: ${lat}, ${lng}`

        // Reverse geocoding for lesbart navn
        try {
          const geo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=12&accept-language=no`,
          )
          const geoData = await geo.json()
          if (geoData.display_name) {
            locName = geoData.display_name.split(',').slice(0, 3).join(',').trim()
          }
        } catch {}
      } catch {
        // GPS feilet → bruk fallback (første registrerte lokasjon)
        if (fallbackLocation) {
          lat = fallbackLocation.lat
          lng = fallbackLocation.lon
          locName = fallbackLocation.name + ' (registrert lokasjon)'
        }
      }

      const res = await fetch('/api/min-side/emergency-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lng,
          location_name: locName,
          alert_type: 'manual_sos',
        }),
      })
      const d = await res.json()

      if (d.success) {
        setResult({ contacts_notified: d.contacts_notified || 0, location: locName })
        setPhase('sent')
      } else {
        setErrorMsg(d.error || 'Kunne ikke sende varsel')
        setPhase('error')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ukjent feil')
      setPhase('error')
    }
  }

  if (!open) return null

  // Hvis ingen nødkontakter - vis melding i stedet for countdown
  if (emergencyContactCount === 0 && phase === 'counting') {
    return (
      <Backdrop>
        <Card>
          <Title>Ingen nødkontakter</Title>
          <p style={{ color: '#7a8a9a', fontSize: 14, lineHeight: 1.5, margin: '8px 0 24px' }}>
            Du må legge til minst én nødkontakt før du kan sende SOS. Gå til Nødkontakt-fanen for å legge til.
          </p>
          <button
            onClick={onClose}
            style={{
              background: '#0a2a3d',
              color: 'white',
              padding: '12px 32px',
              borderRadius: 999,
              border: 'none',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              width: '100%',
            }}
          >
            Lukk
          </button>
        </Card>
      </Backdrop>
    )
  }

  return (
    <Backdrop>
      <Card>
        {phase === 'counting' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#fee2e2', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <span style={{
                  fontSize: 38, fontWeight: 700, color: '#991b1b',
                  fontFamily: 'inherit',
                }}>{countdown}</span>
              </div>
              <Title>Sender SOS om {countdown} sek</Title>
              <p style={{ color: '#991b1b', fontSize: 14, marginTop: 6 }}>
                Varsler {emergencyContactCount} kontakt{emergencyContactCount > 1 ? 'er' : ''} med GPS-posisjon
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={sendSos}
                style={{
                  background: '#dc2626', color: 'white',
                  padding: '14px 24px', borderRadius: 999,
                  border: 'none', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Send NÅ
              </button>
              <button
                onClick={onClose}
                style={{
                  background: 'white', color: '#0a2a3d',
                  padding: '14px 24px', borderRadius: 999,
                  border: '1.5px solid rgba(10,42,61,0.2)',
                  fontSize: 15, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Avbryt
              </button>
            </div>
          </>
        )}

        {phase === 'sending' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spinner />
            <Title style={{ marginTop: 16 }}>Sender varsel...</Title>
            <p style={{ color: '#7a8a9a', fontSize: 13, marginTop: 6 }}>
              Henter GPS-posisjon og varsler kontaktene dine
            </p>
          </div>
        )}

        {phase === 'sent' && result && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#dcfce7', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <Title>Varsel sendt</Title>
            <p style={{ color: '#7a8a9a', fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
              {result.contacts_notified} kontakt{result.contacts_notified > 1 ? 'er' : ''} ble varslet.
              {result.location && (
                <><br/><span style={{ fontSize: 12 }}>Posisjon: {result.location}</span></>
              )}
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: 20, background: '#0a2a3d', color: 'white',
                padding: '12px 32px', borderRadius: 999,
                border: 'none', fontSize: 15, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', width: '100%',
              }}
            >
              Lukk
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <Title style={{ color: '#991b1b' }}>Kunne ikke sende</Title>
            <p style={{ color: '#7a8a9a', fontSize: 14, marginTop: 8 }}>
              {errorMsg || 'Noe gikk galt. Prøv igjen, eller ring 113 direkte.'}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => { sentRef.current = false; setCountdown(5); setPhase('counting') }}
                style={{
                  flex: 1, background: '#dc2626', color: 'white',
                  padding: '12px 16px', borderRadius: 999,
                  border: 'none', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Prøv igjen
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1, background: 'white', color: '#0a2a3d',
                  padding: '12px 16px', borderRadius: 999,
                  border: '1.5px solid rgba(10,42,61,0.2)',
                  fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Lukk
              </button>
            </div>
          </div>
        )}
      </Card>
    </Backdrop>
  )
}

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(10, 42, 61, 0.7)',
      backdropFilter: 'blur(6px)',
      zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>{children}</div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'white', borderRadius: 24,
      padding: 28, maxWidth: 380, width: '100%',
      boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
    }}>{children}</div>
  )
}

function Title({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      fontFamily: "'Fraunces', Georgia, serif",
      fontSize: 22, fontWeight: 400, color: '#0a2a3d',
      margin: 0, ...style,
    }}>{children}</h2>
  )
}

function Spinner() {
  return (
    <>
      <div style={{
        width: 40, height: 40, margin: '0 auto',
        border: '3px solid rgba(10,42,61,0.1)',
        borderTopColor: '#dc2626',
        borderRadius: '50%',
        animation: 'bv-spin 0.8s linear infinite',
      }}/>
      <style>{`@keyframes bv-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
