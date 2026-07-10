'use client'

// ---------- hjelpere ----------
const dagerSiden = (d?: string | null) =>
  d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null

export const norskDato = (d?: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('nb-NO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const relativ = (d?: string | null) => {
  const n = dagerSiden(d)
  if (n === null) return ''
  if (n === 0) return 'i dag'
  if (n === 1) return 'i går'
  return `for ${n} dager siden`
}

const kr = (ore?: number | null) =>
  ore == null ? '—' : (ore / 100).toLocaleString('nb-NO', { minimumFractionDigits: 0 }) + ' kr'

// ---------- stiler ----------
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '1.2rem 1.4rem',
  border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1rem',
}
const label: React.CSSProperties = {
  fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
  letterSpacing: '0.08em', marginBottom: '0.9rem', display: 'block',
}

// ---------- små byggeklosser ----------
function Stat({ tittel, verdi, under, farge }: { tittel: string; verdi: string; under?: string; farge?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '0.8rem 0.9rem', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{tittel}</div>
      <div style={{ fontSize: '1.02rem', fontWeight: 600, color: farge || 'white', lineHeight: 1.25 }}>{verdi}</div>
      {under && <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{under}</div>}
    </div>
  )
}

function Banner({ type, tittel, punkter }: { type: 'rod' | 'gul' | 'gronn'; tittel: string; punkter: string[] }) {
  const f = { rod: '#f87171', gul: '#fbbf24', gronn: '#4ade80' }[type]
  const ikon = { rod: '⛔', gul: '⚠️', gronn: '✅' }[type]
  return (
    <div style={{ background: f + '14', border: `1px solid ${f}44`, borderRadius: 12, padding: '0.9rem 1.1rem', marginBottom: '0.8rem' }}>
      <div style={{ color: f, fontWeight: 600, fontSize: '0.9rem', marginBottom: punkter.length ? 6 : 0 }}>{ikon} {tittel}</div>
      {punkter.map((p, i) => (
        <div key={i} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.55 }}>· {p}</div>
      ))}
    </div>
  )
}

// ---------- diagnose: kan brukeren i det hele tatt motta et varsel? ----------
function lagDiagnose(sub: any, ins: any) {
  const problemer: string[] = []
  const advarsler: string[] = []

  const harPush = ins.pushCount > 0
  const harSms = (sub.bv_recipients ?? []).some((r: any) => r.active !== false && r.sms_enabled !== false)
  const harLokasjon = (sub.bv_locations ?? []).length > 0

  if (!harPush && !harSms) problemer.push('Ingen varselkanal: verken push-abonnement eller aktiv SMS-mottaker.')
  else if (!harPush) advarsler.push('Ingen push — får kun SMS. PWA er aldri installert.')
  if (!harLokasjon) problemer.push('Ingen lokasjon lagret — det finnes ingenting å varsle om.')
  if (sub.locked) problemer.push('Kontoen er sperret.')

  if (ins.innloggingerCount === 0) problemer.push('Har aldri logget inn.')
  else {
    const d = Math.floor((Date.now() - new Date(ins.sisteInnlogging).getTime()) / 86400000)
    if (d > 14) advarsler.push(`Ikke logget inn på ${d} dager.`)
  }

  const forfalt = sub.next_charge_due_at && new Date(sub.next_charge_due_at) < new Date()
  if (forfalt && !sub.last_charge_id) problemer.push('Trekk er forfalt, men ingen belastning er registrert.')
  if (sub.status === 'trialing' && sub.trial_ends_at && new Date(sub.trial_ends_at) < new Date())
    advarsler.push('Prøveperioden er utløpt, men status står fortsatt som «trialing».')

  if (problemer.length) return { type: 'rod' as const, tittel: 'Mottar ingen varsler', punkter: [...problemer, ...advarsler] }
  if (advarsler.length) return { type: 'gul' as const, tittel: 'Fungerer, men noe skurrer', punkter: advarsler }
  return { type: 'gronn' as const, tittel: 'Alt ser sunt ut', punkter: [] }
}

// ---------- hovedkomponent ----------
export default function Innsikt({ sub, insight: ins }: { sub: any; insight: any }) {
  const diagnose = lagDiagnose(sub, ins)
  const alder = Math.floor((Date.now() - new Date(sub.created_at).getTime()) / 86400000)

  return (
    <div style={card}>
      <span style={label}>Kundeinnsikt</span>
      <Banner {...diagnose} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.6rem', marginTop: '1rem' }}>
        <Stat tittel="Opprettet" verdi={norskDato(sub.created_at)} under={`${alder} dager gammel · ${relativ(sub.created_at)}`} />
        <Stat
          tittel="Siste innlogging"
          verdi={ins.sisteInnlogging ? norskDato(ins.sisteInnlogging) : 'Aldri'}
          under={ins.sisteInnlogging ? relativ(ins.sisteInnlogging) : `${ins.lenkerSendt} lenke(r) sendt, 0 brukt`}
          farge={ins.sisteInnlogging ? undefined : '#f87171'}
        />
        <Stat tittel="Innlogginger" verdi={String(ins.innloggingerCount)} under={`av ${ins.lenkerSendt} sendte lenker`} />
        <Stat
          tittel="Push (PWA)"
          verdi={ins.pushCount > 0 ? `${ins.pushCount} enhet(er)` : 'Ikke installert'}
          farge={ins.pushCount > 0 ? '#4ade80' : '#f87171'}
          under={ins.pushRaw[0]?.last_used_at ? 'Sist brukt ' + relativ(ins.pushRaw[0].last_used_at) : undefined}
        />
        <Stat tittel="SMS-mottakere" verdi={String((sub.bv_recipients ?? []).length)} farge={(sub.bv_recipients ?? []).length ? undefined : '#fbbf24'} />
        <Stat tittel="Lokasjoner" verdi={String((sub.bv_locations ?? []).length)} />
        <Stat tittel="Nødkontakter" verdi={String(ins.emergencyContacts)} under={ins.alerts.length ? `${ins.alerts.length} utløste varsler` : undefined} />
        <Stat tittel="Varslingstid" verdi={sub.send_time || '—'} under={sub.phone_number ? '📱 ' + sub.phone_number : 'Ingen telefon'} />
      </div>
    </div>
  )
}

// ---------- betaling: Vipps + Stripe + fakturaer ----------
export function Betaling({ sub, insight: ins }: { sub: any; insight: any }) {
  const forfalt = sub.next_charge_due_at && new Date(sub.next_charge_due_at) < new Date()
  const rad = (k: string, v: React.ReactNode) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '5px 0', fontSize: '0.86rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: 'rgba(255,255,255,0.45)' }}>{k}</span>
      <span style={{ color: 'white', textAlign: 'right' }}>{v}</span>
    </div>
  )

  return (
    <div style={card}>
      <span style={label}>Betaling · {sub.payment_provider || 'ingen leverandør'}</span>

      {sub.payment_provider === 'vipps' && (
        <>
          {rad('Vipps-avtale', sub.vipps_agreement_id || '—')}
          {rad('Avtalestatus', <span style={{ color: sub.vipps_status === 'ACTIVE' ? '#4ade80' : '#fbbf24' }}>{sub.vipps_status || '—'}</span>)}
          {rad('Neste trekk', <span style={{ color: forfalt ? '#f87171' : 'white' }}>{norskDato(sub.next_charge_due_at)}{forfalt ? ' (forfalt)' : ''}</span>)}
          {rad('Siste belastning', sub.last_charge_id
            ? `${sub.last_charge_status} · ${norskDato(sub.last_charge_at)}`
            : <span style={{ color: '#f87171' }}>Aldri registrert</span>)}
        </>
      )}

      {sub.stripe_customer_id && (
        <>
          {rad('Stripe customer', sub.stripe_customer_id)}
          <a href={`https://dashboard.stripe.com/customers/${sub.stripe_customer_id}`} target="_blank" rel="noopener noreferrer"
            style={{ color: '#4da8cc', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginTop: 8 }}>↗ Åpne i Stripe</a>
        </>
      )}

      {rad('Prøveperiode', sub.trial_ends_at
        ? `${norskDato(sub.trial_ends_at)}${new Date(sub.trial_ends_at) < new Date() ? ' — utløpt' : ''}`
        : '—')}

      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Fakturaer ({ins.invoices.length})
        </div>
        {ins.invoices.length === 0
          ? <div style={{ fontSize: '0.85rem', color: '#f87171' }}>Ingen fakturaer generert — ingen inntekt bokført på denne kunden.</div>
          : ins.invoices.map((f: any) => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '5px 0', color: 'rgba(255,255,255,0.75)' }}>
                <span>{f.invoice_number} · {norskDato(f.issued_at)}</span>
                <span style={{ color: f.paid_at ? '#4ade80' : '#fbbf24' }}>{kr(f.amount_gross_ore)} {f.paid_at ? '✓' : '· ubetalt'}</span>
              </div>
            ))}
      </div>
    </div>
  )
}
