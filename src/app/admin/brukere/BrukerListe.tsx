'use client'
import { useState, useMemo } from 'react'

const dato = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'

const dagerSiden = (d?: string | null) =>
  d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null

// Grønn = kan motta varsel. Gul = fungerer, men noe skurrer. Rød = mottar ingenting.
function helse(r: any): { farge: string; tekst: string } {
  const kanal = r.antPush > 0 || r.antMottakere > 0
  if (r.locked) return { farge: '#f87171', tekst: 'Sperret' }
  if (!kanal || r.antLokasjoner === 0) return { farge: '#f87171', tekst: 'Ingen varsler' }
  if (r.forfalt) return { farge: '#f87171', tekst: 'Trekk forfalt' }
  if (r.antInnlogginger === 0) return { farge: '#fbbf24', tekst: 'Aldri logget inn' }
  if (r.antPush === 0) return { farge: '#fbbf24', tekst: 'Kun SMS' }
  const d = dagerSiden(r.sisteInnlogging)
  if (d !== null && d > 30) return { farge: '#fbbf24', tekst: `Inaktiv ${d}d` }
  return { farge: '#4ade80', tekst: 'Sunn' }
}

const PLANER: Record<string, string> = {
  kyst: 'Basis', 'kyst-pluss': 'Standard', familie: 'Familie', pro: 'Pro', sikkerhet: 'Sikkerhet',
}

export default function BrukerListe({ rader }: { rader: any[] }) {
  const [søk, setSøk] = useState('')
  const [filter, setFilter] = useState<'alle' | 'problem' | 'aktive' | 'trial'>('alle')

  const synlige = useMemo(() => rader.filter(r => {
    if (søk && !r.email.toLowerCase().includes(søk.toLowerCase()) && !(r.phone_number || '').includes(søk)) return false
    if (filter === 'problem') return helse(r).farge !== '#4ade80'
    if (filter === 'aktive') return r.status === 'active'
    if (filter === 'trial') return r.status === 'trialing'
    return true
  }), [rader, søk, filter])

  const antProblem = rader.filter(r => helse(r).farge === '#f87171').length
  const nye7d = rader.filter(r => (dagerSiden(r.created_at) ?? 99) <= 7).length

  const inp: React.CSSProperties = {
    flex: 1, padding: '0.8rem 1.2rem', borderRadius: 100, border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none',
  }
  const chip = (aktiv: boolean): React.CSSProperties => ({
    background: aktiv ? '#4da8cc' : 'rgba(255,255,255,0.05)', color: aktiv ? 'white' : 'rgba(255,255,255,0.55)',
    padding: '0.5rem 1rem', borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer', fontSize: '0.83rem', fontFamily: 'inherit', whiteSpace: 'nowrap',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#071622', fontFamily: 'DM Sans, sans-serif', color: 'white' }}>
      <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <a href="/admin" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem' }}>← Admin</a>
        <span style={{ background: '#ef4444', padding: '2px 8px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 600 }}>ADMIN</span>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.2rem 1.5rem' }}>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.8rem', fontWeight: 300, margin: '0 0 0.4rem' }}>Brukere</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
          {rader.length} abonnenter · {nye7d} nye siste 7 dager ·{' '}
          <span style={{ color: antProblem ? '#f87171' : 'inherit' }}>{antProblem} med problem</span>
        </p>

        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          <input value={søk} onChange={e => setSøk(e.target.value)} placeholder="Søk på e-post eller telefon..." style={inp} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
          {([['alle', 'Alle'], ['problem', `Problem (${antProblem})`], ['aktive', 'Aktive'], ['trial', 'Prøveperiode']] as const).map(([k, v]) => (
            <button key={k} onClick={() => setFilter(k as any)} style={chip(filter === k)}>{v}</button>
          ))}
        </div>

        {synlige.length === 0 && <p style={{ color: 'rgba(255,255,255,0.35)' }}>Ingen treff.</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {synlige.map(r => <Rad key={r.id} r={r} />)}
        </div>
      </div>
    </div>
  )
}

function Rad({ r }: { r: any }) {
  const h = helse(r)
  const alder = dagerSiden(r.created_at)
  const meta = [
    PLANER[r.plan] || r.plan,
    r.status,
    `${r.antLokasjoner} lok.`,
    r.antPush > 0 ? `${r.antPush} push` : 'ingen push',
    r.antMottakere > 0 ? `${r.antMottakere} SMS` : 'ingen SMS',
  ].join(' · ')

  return (
    <a href={`/admin/bruker/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.9rem 1.1rem',
        background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${h.farge}`,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{meta}</div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>{dato(r.created_at)}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{alder} dager</div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 108 }}>
          <div style={{ color: h.farge, fontSize: '0.8rem', fontWeight: 600 }}>{h.tekst}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
            {r.sisteInnlogging ? `inne ${dagerSiden(r.sisteInnlogging)}d siden` : 'aldri inne'}
          </div>
        </div>
      </div>
    </a>
  )
}
