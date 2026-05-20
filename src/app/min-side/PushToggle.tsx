'use client'
import { useState, useEffect } from 'react'

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

// Hjelper: konverter base64 VAPID-nøkkel til Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

type PushState = 'loading' | 'unsupported' | 'denied' | 'off' | 'on' | 'working'

export function PushToggle({ email }: { email: string }) {
  const [state, setState] = useState<PushState>('loading')
  const [error, setError] = useState('')

  // Sjekk støtte + nåværende status ved oppstart
  useEffect(() => {
    if (typeof window === 'undefined') return
    const supported =
      'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    if (!supported || !PUBLIC_VAPID_KEY) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }
    // Sjekk om vi allerede har et aktivt abonnement
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? 'on' : 'off'))
      .catch(() => setState('off'))
  }, [])

  async function enable() {
    setState('working')
    setError('')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'off')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      })
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subscription: sub.toJSON(), userAgent: navigator.userAgent }),
      })
      if (!res.ok) throw new Error('subscribe feilet')
      setState('on')
    } catch (e) {
      setError('Kunne ikke aktivere varsler. Prøv igjen.')
      setState('off')
    }
  }

  async function disable() {
    setState('working')
    setError('')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setState('off')
    } catch {
      setError('Kunne ikke skru av. Prøv igjen.')
      setState('on')
    }
  }

  // Skjul helt hvis nettleseren ikke støtter push (f.eks. iOS i Safari uten PWA)
  if (state === 'unsupported') return null

  const isOn = state === 'on'
  const isWorking = state === 'working' || state === 'loading'

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#1a6080', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5c-1.9 0-3.3 1.5-3.3 3.4v2L2 8.5v.6h9v-.6l-1.2-1.6v-2c0-1.9-1.4-3.4-3.3-3.4zM5.3 10.2a1.2 1.2 0 0 0 2.4 0" stroke="#1a6080" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
        Push-varsler
      </div>
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid rgba(26,96,128,0.18)', padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#0a2a3d' }}>Varsler på denne enheten</span>
          </div>
          {state === 'denied' ? (
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: '#fef2f2', color: '#991b1b' }}>Blokkert</span>
          ) : (
            <div
              style={{ position: 'relative', width: 36, height: 20, cursor: isWorking ? 'default' : 'pointer', opacity: isWorking ? 0.5 : 1 }}
              onClick={() => { if (!isWorking) isOn ? disable() : enable() }}
              role="switch"
              aria-checked={isOn}
              aria-label="Skru push-varsler av eller på"
            >
              <div style={{ position: 'absolute', inset: 0, borderRadius: 100, background: isOn ? '#1a6080' : 'rgba(10,42,61,0.15)', transition: '0.2s' }} />
              <div style={{ position: 'absolute', top: 2, left: isOn ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>
          {state === 'denied'
            ? 'Du har blokkert varsler i nettleseren. Skru på igjen i nettleserinnstillingene for å bruke push.'
            : isOn
            ? 'Du får varsler direkte på denne enheten.'
            : 'Få varsler rett på enheten. Fungerer best når appen er lagt til på hjemskjermen.'}
        </div>
        {error && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{error}</div>}
      </div>
    </div>
  )
}
