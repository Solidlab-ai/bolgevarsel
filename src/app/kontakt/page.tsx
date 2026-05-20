import KontaktForm from './KontaktForm'

export const metadata = {
  title: 'Kontakt oss',
  description: 'Har du spørsmål om Bølgevarsel? Send oss en melding, så svarer vi vanligvis innen én virkedag.',
}

export default function Kontakt() {
  return (
    <div style={{ minHeight: '100vh', background: '#e8f4f8', fontFamily: 'DM Sans, sans-serif' }}>
      <nav style={{ padding: '1.2rem 2.5rem', borderBottom: '1px solid rgba(10,42,61,0.08)', background: 'rgba(232,244,248,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <a href="/" aria-label="Tilbake til forsiden" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1a6080', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Tilbake til forsiden</span>
        </a>
        <a href="/" style={{ textDecoration: 'none' }}>
          <svg width="180" height="30" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="#0a2a3d" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="#1a6080" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />
            <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="#0a2a3d" letterSpacing="-0.8">bølgevarsel<tspan fill="#1a6080" fontWeight="400">.no</tspan></text>
          </svg>
        </a>
      </nav>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2.5rem', fontWeight: 300, color: '#0a2a3d', marginBottom: '1rem' }}>Kontakt oss</h1>
        <p style={{ color: '#2c4a5e', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Har du spørsmål om abonnement, lokasjoner eller noe annet? Fyll ut skjemaet under, så svarer vi vanligvis innen én virkedag. Du kan også sende e-post direkte til <a href="mailto:hei@bolgevarsel.no" style={{ color: '#1a6080' }}>hei@bolgevarsel.no</a>, eller besøke <a href="/hjelp" style={{ color: '#1a6080' }}>hjelpesenteret</a>.
        </p>

        <KontaktForm />

        <p style={{ color: '#6b8fa3', fontSize: '0.85rem', lineHeight: 1.6, marginTop: '2rem', textAlign: 'center' }}>
          Bølgevarsel.no leveres av Stå på Pinne AS · org.nr 935 233 488 · Stavanger
        </p>
      </div>
    </div>
  )
}
