'use client'
import { useState } from 'react'

export default function KontaktForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [company, setCompany] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, company }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setStatus('sent')
      } else {
        setStatus('error')
        setError(data.error || 'Noe gikk galt. Prøv igjen.')
      }
    } catch {
      setStatus('error')
      setError('Noe gikk galt. Prøv igjen senere.')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: 12,
    border: '1px solid rgba(10,42,61,0.15)',
    background: 'white',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    color: '#0a2a3d',
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#0a2a3d',
    marginBottom: '0.4rem',
  }

  if (status === 'sent') {
    return (
      <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(10,42,61,0.06)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌊</div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.6rem', fontWeight: 400, color: '#0a2a3d', marginBottom: '0.6rem' }}>Takk for meldingen!</h2>
        <p style={{ color: '#2c4a5e', lineHeight: 1.7 }}>Vi har mottatt henvendelsen din og svarer vanligvis innen én virkedag.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem', color: '#1a6080', textDecoration: 'none', fontWeight: 500 }}>← Tilbake til forsiden</a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 20, padding: '2rem', boxShadow: '0 8px 32px rgba(10,42,61,0.06)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div>
        <label htmlFor="k-navn" style={labelStyle}>Navn</label>
        <input id="k-navn" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Ditt navn" />
      </div>
      <div>
        <label htmlFor="k-epost" style={labelStyle}>E-post</label>
        <input id="k-epost" type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="din@epost.no" />
      </div>
      <div>
        <label htmlFor="k-emne" style={labelStyle}>Emne <span style={{ color: '#6b8fa3', fontWeight: 400 }}>(valgfritt)</span></label>
        <input id="k-emne" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} placeholder="Hva gjelder det?" />
      </div>
      <div>
        <label htmlFor="k-melding" style={labelStyle}>Melding</label>
        <textarea id="k-melding" required value={message} onChange={(e) => setMessage(e.target.value)} rows={6} style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }} placeholder="Skriv meldingen din her…" />
      </div>

      {/* Honeypot — skjult for ekte brukere, fanger bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />

      {error && <p style={{ color: '#dc2626', fontSize: '0.9rem', margin: 0 }}>{error}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          padding: '0.95rem',
          borderRadius: 100,
          border: 'none',
          background: status === 'sending' ? '#6b8fa3' : '#0a2a3d',
          color: 'white',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: status === 'sending' ? 'default' : 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.2s',
        }}
      >
        {status === 'sending' ? 'Sender…' : 'Send melding'}
      </button>
    </form>
  )
}
