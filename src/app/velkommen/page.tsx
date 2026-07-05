export const dynamic = 'force-dynamic'

export default function Velkommen() {
  const steg = [
    {
      ikon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1.5 3.5h15l-7.5 6L1.5 3.5z" stroke="#1a6080" strokeWidth="1.3" fill="none" strokeLinejoin="round"/><path d="M1.5 3.5v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-11" stroke="#1a6080" strokeWidth="1.3" fill="none"/></svg>
      ),
      tekst: 'Sjekk innboksen — du har fått en innloggingslenke. Klikk den for å komme til Min side.',
    },
    {
      ikon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z" stroke="#1a6080" strokeWidth="1.3" fill="none"/><path d="M3 16.5c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="#1a6080" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
      ),
      tekst: 'Legg til mottakere — familiemedlemmer, venner eller kollegaer som skal motta varsel.',
    },
    {
      ikon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L9 16M2 9L16 9" stroke="#1a6080" strokeWidth="1.3" strokeLinecap="round"/><circle cx="9" cy="9" r="7.5" stroke="#1a6080" strokeWidth="1.3" fill="none"/></svg>
      ),
      tekst: 'Legg til kystlokasjoner — Tånes, Stavanger havn, Jærstranden eller der du ferdes.',
    },
    {
      ikon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 11 Q4.5 7 7 11 Q9.5 15 12 11 Q14.5 7 17 11" stroke="#1a6080" strokeWidth="1.5" strokeLinecap="round" fill="none"/><path d="M2 14.5 Q4.5 12 7 14.5 Q9.5 17 12 14.5 Q14.5 12 17 14.5" stroke="#1a6080" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/><circle cx="14" cy="4" r="2.5" fill="#f59e0b"/><path d="M14 0.5L14 1.5M14 6.5L14 7.5M10.5 4L11.5 4M16.5 4L17.5 4M11.5 1.5L12.2 2.2M16.5 1.5L15.8 2.2" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round"/></svg>
      ),
      tekst: 'Fra i morgen mottar du daglig bølge- og værvarsel — rett i appen. E-post og SMS er også tilgjengelig.',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#e8f4f8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <nav style={{ padding: '1rem 2rem', borderBottom: '0.5px solid rgba(10,42,61,0.1)', background: 'rgba(232,244,248,0.97)' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          <svg width="220" height="36" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="#0a2a3d" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="#1a6080" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
            <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="#0a2a3d" letterSpacing="-0.8">bølgevarsel<tspan fill="#1a6080" fontWeight="400">.no</tspan></text>
          </svg>
        </a>
      </nav>

      {/* Innhold */}
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>

        {/* Bølgeikon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#0a2a3d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
              <path d="M5 30 Q12 20 19 30 Q26 40 33 30 Q40 20 47 30" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <path d="M4 38 Q11 33 18 38 Q25 43 32 38 Q39 33 46 38" stroke="rgba(125,211,240,0.6)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <circle cx="38" cy="13" r="6" fill="#fcd34d"/>
              <path d="M38 5L38 4M38 22L38 21M30 13L29 13M47 13L46 13M32.5 7.5L31.5 6.5M44 7.5L45 6.5" stroke="#fcd34d" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 500, color: '#0a2a3d', margin: '0 0 0.6rem', letterSpacing: '-0.02em' }}>
          Velkommen om bord!
        </h1>
        <p style={{ color: '#4a6a7a', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Abonnementet ditt er nå aktivt. Følg stegene under for å komme i gang.
        </p>

        {/* Sjekk innboksen */}
        <div style={{ background: 'white', borderRadius: 14, padding: '1.25rem 1.5rem', border: '1px solid rgba(26,96,128,0.2)', marginBottom: '1rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#e8f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M1.5 3.5h15l-7.5 6L1.5 3.5z" stroke="#1a6080" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
                <path d="M1.5 3.5v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-11" stroke="#1a6080" strokeWidth="1.3" fill="none"/>
              </svg>
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: 600, color: '#0a2a3d' }}>Sjekk innboksen din</h2>
              <p style={{ margin: 0, color: '#4a6a7a', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Vi har sendt deg en <strong>innloggingslenke</strong> på e-post. Klikk på den for å logge inn på Min side og sette opp lokasjoner og mottakere.
              </p>
            </div>
          </div>
        </div>

        {/* Hva skjer videre */}
        <div style={{ background: 'white', borderRadius: 14, border: '0.5px solid rgba(10,42,61,0.08)', marginBottom: '2rem', overflow: 'hidden', textAlign: 'left' }}>
          <div style={{ padding: '0.9rem 1.25rem', background: '#f8fbfc', borderBottom: '0.5px solid rgba(10,42,61,0.07)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b8fa3', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Kom i gang — fire steg</span>
          </div>
          {steg.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start', padding: '0.9rem 1.25rem', borderTop: i > 0 ? '0.5px solid rgba(10,42,61,0.06)' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e8f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                {s.ikon}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1a6080', background: '#e8f4f8', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>{s.tekst}</p>
              </div>
            </div>
          ))}
        </div>

        <a href="/min-side" style={{ display: 'inline-block', background: '#0a2a3d', color: 'white', padding: '0.9rem 2.5rem', borderRadius: '100px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
          Gå til Min side →
        </a>

        <p style={{ marginTop: '1.2rem', fontSize: '0.8rem', color: 'rgba(10,42,61,0.45)', lineHeight: 1.7 }}>
          Ikke funnet e-posten? Sjekk søppelpost.&nbsp;·&nbsp;
          <a href="/logg-inn" style={{ color: '#1a6080' }}>Logg inn manuelt</a>
          &nbsp;·&nbsp;
          <a href="/hjelp" style={{ color: '#1a6080' }}>Hjelpesenter</a>
        </p>
      </div>
    </div>
  )
}
