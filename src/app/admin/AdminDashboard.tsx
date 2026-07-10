'use client'
import { useState } from 'react'

const S = {
  page: { minHeight: '100vh', background: '#071622', fontFamily: 'DM Sans, sans-serif', color: 'white' } as React.CSSProperties,
  nav: { padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' } as React.CSSProperties,
  card: { background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' } as React.CSSProperties,
  statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '1.2rem 1.5rem', border: '1px solid rgba(255,255,255,0.08)', flex: 1 } as React.CSSProperties,
  badge: (active: boolean) => ({ background: active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: active ? '#4ade80' : '#f87171', padding: '2px 8px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600 }) as React.CSSProperties,
  planBadge: (plan: string) => ({ background: plan === 'pro' ? 'rgba(251,191,36,0.15)' : plan === 'familie' ? 'rgba(96,165,250,0.15)' : 'rgba(77,168,204,0.15)', color: plan === 'pro' ? '#fbbf24' : plan === 'familie' ? '#60a5fa' : '#4da8cc', padding: '2px 8px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600 }) as React.CSSProperties,
}

type Props = {
  subscribers: any[]
  stats: {
    aktive: number; inntekt: number; smskostnad: number; netto: number; smsPrMnd: number; totalMottakere: number
    trialing: number; betalende: number; paused: number; cancelled: number
    inaktive: number; churned: number; dagligSmsMottakere: number
    nyeDenneMnd: number; viaVipps: number; viaKort: number; snittPerKunde: number
    pushSubs: number; totalLokasjoner: number; antallTest: number; smsFraElks: boolean
  }
  planTelling: any[]
}

export default function AdminDashboard({ subscribers, stats, planTelling }: Props) {
  const [søk, setSøk] = useState('')
  const [valgt, setValgt] = useState<any>(null)
  const [melding, setMelding] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [showSmsModal, setShowSmsModal] = useState(false)
  const [smsTo, setSmsTo] = useState('')
  const [smsText, setSmsText] = useState('')
  const [smsSending, setSmsSending] = useState(false)
  const [kpiModal, setKpiModal] = useState<string | null>(null)

  const filtrert = subscribers.filter(s =>
    s.email.toLowerCase().includes(søk.toLowerCase())
  )

  async function loggUt() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  async function sendManualSms() {
    if (!smsTo || !smsText) return
    setSmsSending(true)
    try {
      const res = await fetch('/api/admin/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: smsTo, message: smsText }),
      })
      const d = await res.json()
      if (d.success) {
        setMelding('✅ SMS sendt til ' + smsTo)
        setSmsTo(''); setSmsText(''); setShowSmsModal(false)
      } else {
        setMelding('❌ Feil: ' + (d.error || 'Ukjent feil'))
      }
    } catch (err: any) {
      setMelding('❌ Feil: ' + err.message)
    }
    setSmsSending(false)
    setTimeout(() => setMelding(''), 5000)
  }

  async function oppdaterStatus(id: string, status: string) {
    await fetch('/api/admin/bruker', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscriber_id: id, field: 'status', value: status }) })
    window.location.reload()
  }

  // ── KPI-modal: data og innhold per boks ──────────────────────
  const planNavn: Record<string, string> = { kyst: 'Basis', 'kyst-pluss': 'Standard', familie: 'Familie', pro: 'Pro', sikkerhet: 'Sikkerhet' }
  const fmtDato = (d: string | null) => d ? new Date(d).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const betalingsnavn = (s: any) => s.payment_provider === 'vipps' ? 'Vipps' : 'Kort'

  // Samme test-gjenkjenning som i page.tsx — KPI-lister skal kun vise ekte kunder
  const erTest = (email: string) => {
    if (!email) return false
    const e = email.toLowerCase()
    return e.includes('+test') || e.includes('+tester') || e.includes('+vippser') ||
      e.endsWith('@ulrik.biz') || e.startsWith('prod-smoke') || e.endsWith('@bolgevarsel.no')
  }
  const ekte = subscribers.filter(s => !erTest(s.email))

  const startMnd = new Date(); startMnd.setDate(1); startMnd.setHours(0, 0, 0, 0)

  const kpiData: Record<string, { tittel: string; forklaring?: string; kunder?: any[]; ekstra?: React.ReactNode }> = {
    betalende: {
      tittel: 'Betalende kunder',
      forklaring: 'Aktive abonnenter pluss frosne (de har en levende betalingsavtale). Trial, deaktiverte og avsluttede er ikke med. Kun ekte kunder — testkontoer er filtrert bort.',
      kunder: ekte.filter(s => s.status === 'active' || s.status === 'paused'),
    },
    trial: {
      tittel: 'I prøveperiode',
      forklaring: 'Ekte kunder i 7 dagers gratis prøveperiode. De konverterer til betalende når perioden utløper.',
      kunder: ekte.filter(s => s.status === 'trialing'),
    },
    nye: {
      tittel: 'Nye denne måneden',
      forklaring: `Ekte kunder registrert siden 1. ${startMnd.toLocaleDateString('nb-NO', { month: 'long' })}.`,
      kunder: ekte.filter(s => s.created_at && new Date(s.created_at) >= startMnd),
    },
    avsluttet: {
      tittel: 'Avsluttet / churn',
      forklaring: 'Ekte kunder som har sagt opp (cancelled) eller blitt deaktivert (inactive). Begge teller som tapt kunde.',
      kunder: ekte.filter(s => s.status === 'cancelled' || s.status === 'inactive'),
    },
    pwa: {
      tittel: 'PWA-installasjoner',
      forklaring: 'Dette tallet er en proxy: antall enheter som har skrudd på push-varsler. På iPhone krever push at appen er installert på hjemskjermen, så det er et godt installasjonssignal — men ikke en eksakt teller. For helt nøyaktig tall kan vi legge til egen «display-mode: standalone»-sporing.',
    },
    mrr: {
      tittel: 'Inntekt per måned (MRR)',
      forklaring: 'Summert listepris for aktive kunder. Merk at rabattkoder (BETATESTER og lignende) ligger i Stripe og ikke er trukket fra her, så flere beta- og vennekunder betaler trolig mindre eller null. Reell inntekt er derfor lavere enn dette. For eksakt MRR henter vi faktisk fakturert beløp fra Stripe senere.',
      kunder: ekte.filter(s => s.status === 'active'),
    },
    sms: {
      tittel: 'SMS-kostnad per måned',
      forklaring: stats.smsFraElks
        ? `Hentet direkte fra 46elks for inneværende måned: ${stats.smsPrMnd} SMS sendt til en kostnad av ${stats.smskostnad} kr. Tallet dekker all utgående SMS — daglige rapporter, farevarsel, innloggingskoder og manuelle meldinger.`
        : `46elks svarte ikke, så dette er et estimat: ${stats.dagligSmsMottakere} mottakere med daglig SMS i 30 dager, til 1,43 kr per melding.`,
    },
    netto: {
      tittel: 'Netto per måned',
      forklaring: `Inntekt (${stats.inntekt} kr) minus SMS-kostnad (${Math.round(stats.smskostnad)} kr) gir ${Math.round(stats.netto)} kr. Dette er et grovt overslag: rabatter er ikke trukket fra inntekten, og gebyrer, drift og API-kostnader er ikke med.`,
    },
    miks: {
      tittel: 'Betalingsmiks',
      forklaring: `Av ekte aktive kunder betaler ${stats.viaVipps} med Vipps og ${stats.viaKort} med kort.`,
      kunder: ekte.filter(s => s.status === 'active'),
    },
    lokasjoner: {
      tittel: 'Lokasjoner som følges',
      forklaring: 'Kystlokasjoner blant ekte kunder (testkontoer er filtrert bort). Populære steder kan si noe om hvor markedet er.',
      ekstra: (() => {
        const teller: Record<string, number> = {}
        ekte.forEach(s => (s.bv_locations ?? []).forEach((l: any) => { teller[l.name] = (teller[l.name] ?? 0) + 1 }))
        const sortert = Object.entries(teller).sort((a, b) => b[1] - a[1])
        return (
          <div>
            {sortert.length === 0 && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Ingen lokasjoner ennå.</div>}
            {sortert.map(([navn, antall]) => (
              <div key={navn} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.9rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>📍 {navn}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{antall}</span>
              </div>
            ))}
          </div>
        )
      })(),
    },
  }

  function KpiKunderTabell({ kunder }: { kunder: any[] }) {
    if (!kunder.length) return <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Ingen kunder i denne kategorien akkurat nå.</div>
    return (
      <div>
        {kunder.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', gap: '0.5rem' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</div>
              <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)' }}>{planNavn[s.plan] ?? s.plan} · {betalingsnavn(s)} · {fmtDato(s.created_at)}</div>
            </div>
            <span style={S.badge(s.status === 'active')}>{s.status}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.3rem', fontWeight: 600 }}><svg width="220" height="36" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="rgba(125,211,240,0.55)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
              <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="white" letterSpacing="-0.8">bølgevarsel<tspan fill="#7dd3fc" fontWeight="400">.no</tspan></text>
            </svg></span>
          <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: 100, fontSize: '0.68rem', fontWeight: 600 }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {melding && <span style={{ fontSize: '0.85rem', color: melding.startsWith('✅') ? '#4ade80' : '#f87171' }}>{melding}</span>}
          <button onClick={() => setShowSmsModal(true)} style={{ background: 'rgba(77,168,204,0.2)', color: '#4da8cc', padding: '0.5rem 1rem', borderRadius: 100, border: '1px solid rgba(77,168,204,0.3)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}>
            📨 Send SMS
          </button>
          <a href="/admin/roadmap" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', padding: '0.5rem 1rem', borderRadius: 100, border: '1px solid rgba(96,165,250,0.2)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}>🗺️ Roadmap</a>
          <a href="/admin/farevarsel" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '0.5rem 1rem', borderRadius: 100, border: '1px solid rgba(239,68,68,0.2)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}>🚨 Farevarsel</a>
          <a href="/admin/nodvarsler" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '0.5rem 1rem', borderRadius: 100, border: '1px solid rgba(251,191,36,0.2)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}>🆘 Nodvarsler</a>
          <button onClick={loggUt} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', padding: '0.5rem 1rem', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>Logg ut</button>
        </div>
      </nav>

      {/* SMS Modal */}
      {showSmsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSmsModal(false)}>
          <div style={{ background: '#0d2d42', borderRadius: 20, padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', width: 420, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1.2rem', fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: '1.3rem', color: 'white' }}>📨 Send SMS</h3>
            <div style={{ marginBottom: '0.8rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Telefonnummer</label>
              <input value={smsTo} onChange={e => setSmsTo(e.target.value)} placeholder="+47XXXXXXXX"
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Melding</label>
              <textarea value={smsText} onChange={e => setSmsText(e.target.value)} rows={4} placeholder="Skriv meldingen her..."
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.3rem', textAlign: 'right' }}>{smsText.length} tegn</div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={sendManualSms} disabled={smsSending || !smsTo || !smsText}
                style={{ flex: 1, padding: '0.7rem', borderRadius: 10, border: 'none', background: smsSending || !smsTo || !smsText ? 'rgba(77,168,204,0.2)' : '#4da8cc', color: 'white', cursor: smsSending || !smsTo || !smsText ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: 500, fontFamily: 'inherit' }}>
                {smsSending ? 'Sender...' : 'Send SMS'}
              </button>
              <button onClick={() => setShowSmsModal(false)}
                style={{ padding: '0.7rem 1.2rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI-detalj modal */}
      {kpiModal && kpiData[kpiModal] && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setKpiModal(null)}>
          <div style={{ background: '#0d2d42', borderRadius: 20, padding: '1.8rem', border: '1px solid rgba(255,255,255,0.1)', width: 520, maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: '1.3rem', color: 'white' }}>{kpiData[kpiModal].tittel}</h3>
              <button onClick={() => setKpiModal(null)} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: 100, width: 30, height: 30, cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0, lineHeight: 1 }}>×</button>
            </div>
            {kpiData[kpiModal].forklaring && (
              <p style={{ margin: '0 0 1.2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.9rem 1.1rem' }}>{kpiData[kpiModal].forklaring}</p>
            )}
            {kpiData[kpiModal].ekstra}
            {kpiData[kpiModal].kunder && (
              <>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{kpiData[kpiModal].kunder!.length} kunder</div>
                <KpiKunderTabell kunder={kpiData[kpiModal].kunder!} />
              </>
            )}
          </div>
        </div>
      )}

      <div style={S.wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>📊 KPIene viser <strong style={{ color: 'rgba(255,255,255,0.8)' }}>kun ekte kunder</strong>.</span>
          <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', padding: '2px 10px', borderRadius: 100, fontSize: '0.72rem' }}>{stats.antallTest} testkontoer filtrert bort</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.7rem', fontWeight: 600 }}>Vekst & kunder</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { id: 'betalende', label: 'Betalende', verdi: stats.betalende, farge: '#4ade80', sub: `${stats.aktive} aktive · ${stats.paused} frosne` },
            { id: 'trial', label: 'I prøveperiode', verdi: stats.trialing, farge: '#fbbf24', sub: '7 dagers gratis' },
            { id: 'nye', label: 'Nye denne mnd', verdi: stats.nyeDenneMnd, farge: '#4da8cc', sub: 'siden 1. i mnd' },
            { id: 'avsluttet', label: 'Avsluttet / churn', verdi: stats.churned, farge: '#f87171', sub: `${stats.cancelled} oppsagt · ${stats.inaktive} deaktivert` },
            { id: 'pwa', label: 'PWA-installasjoner', verdi: stats.pushSubs, farge: '#a78bfa', sub: 'push-abonnenter (proxy)' },
          ].map(s => (
            <button key={s.label} onClick={() => setKpiModal(s.id)}
              style={{ ...S.statCard, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'border-color 0.15s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>{s.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 300, color: s.farge }}>{s.verdi}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.3rem' }}>{s.sub} ›</div>
            </button>
          ))}
        </div>

        {/* KPI: ØKONOMI & BRUK */}
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.7rem', fontWeight: 600 }}>Økonomi & bruk</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { id: 'mrr', label: 'Inntekt/mnd (MRR)', verdi: stats.inntekt + ' kr', farge: '#4ade80', sub: `listepris · snitt ${stats.snittPerKunde} kr` },
            { id: 'sms', label: 'SMS-kostnad/mnd', verdi: Math.round(stats.smskostnad) + ' kr', farge: '#fb923c', sub: stats.smsFraElks ? `${stats.smsPrMnd} SMS denne mnd` : `~${stats.smsPrMnd} SMS (estimat)` },
            { id: 'netto', label: 'Netto/mnd', verdi: Math.round(stats.netto) + ' kr', farge: stats.netto > 0 ? '#4ade80' : '#f87171', sub: 'inntekt − SMS' },
            { id: 'miks', label: 'Betalingsmiks', verdi: `${stats.viaVipps} / ${stats.viaKort}`, farge: '#60a5fa', sub: 'Vipps / kort' },
            { id: 'lokasjoner', label: 'Lokasjoner', verdi: stats.totalLokasjoner, farge: '#7dd3fc', sub: `${stats.totalMottakere} SMS-mottakere` },
          ].map(s => (
            <button key={s.label} onClick={() => setKpiModal(s.id)}
              style={{ ...S.statCard, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'border-color 0.15s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>{s.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 300, color: s.farge }}>{s.verdi}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.3rem' }}>{s.sub} ›</div>
            </button>
          ))}
        </div>

        {/* PLAN-FORDELING */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {planTelling.map(p => (
            <div key={p.id} style={{ ...S.card, flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>{p.name}</div>
              <div style={{ fontSize: '2rem', fontWeight: 300 }}>{p.antall}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{p.price} kr/mnd</div>
            </div>
          ))}
        </div>

        {/* ABONNENTER */}
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: '1.2rem' }}>👥 Abonnenter ({subscribers.length})</h2>
            <input placeholder="Søk e-post..." value={søk} onChange={e => setSøk(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: 100, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', width: 220 }} />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.8rem', fontWeight: 500 }}>E-post</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.8rem', fontWeight: 500 }}>Plan</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.8rem', fontWeight: 500 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.8rem', fontWeight: 500 }}>Lokasjoner</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.8rem', fontWeight: 500 }}>SMS-mott.</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.8rem', fontWeight: 500 }}>Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {filtrert.map(s => (
                <tr key={s.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }} onClick={() => window.location.href = `/admin/bruker/${s.id}`}>
                  <td style={{ padding: '0.75rem 0.8rem', fontSize: '0.9rem' }}>{s.email}</td>
                  <td style={{ padding: '0.75rem 0.8rem' }}><span style={S.planBadge(s.plan)}>{s.plan}</span></td>
                  <td style={{ padding: '0.75rem 0.8rem' }}><span style={S.badge(s.status === 'active')}>{s.status}</span></td>
                  <td style={{ padding: '0.75rem 0.8rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>{s.bv_locations?.length ?? 0}</td>
                  <td style={{ padding: '0.75rem 0.8rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>{s.bv_recipients?.filter((r: any) => r.active && r.sms_enabled !== false).length ?? 0}</td>
                  <td style={{ padding: '0.75rem 0.8rem' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {s.status !== 'active' && <button onClick={() => oppdaterStatus(s.id, 'active')} style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '3px 8px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Aktiver</button>}
                      {s.status === 'active' && <button onClick={() => oppdaterStatus(s.id, 'inactive')} style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '3px 8px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Deaktiver</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* DETALJER VED KLIKK */}
          {valgt && (
            <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1.2rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Detaljer — {valgt.email}</div>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>Lokasjoner</div>
                  {valgt.bv_locations?.map((l: any) => <div key={l.id} style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)' }}>📍 {l.name}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>Mottakere</div>
                  {valgt.bv_recipients?.map((r: any) => (
                    <div key={r.id} style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)' }}>
                      📱 {r.name || r.phone} · {r.phone} · <span style={{ color: r.active ? '#4ade80' : '#f87171' }}>{r.active ? 'Aktiv' : 'Pauset'}</span> · SMS: {r.sms_enabled !== false ? 'På' : 'Av'}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>Stripe</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{valgt.stripe_customer_id || 'Ikke koblet'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
