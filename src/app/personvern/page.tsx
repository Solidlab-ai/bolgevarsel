export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Personvern',
  description: 'Personvernerklæring for Bølgevarsel.no — hvilke data vi samler inn, hvordan vi bruker dem, informasjonskapsler og dine rettigheter.',
}

const h2 = { fontSize: '1.2rem', fontWeight: 500, color: '#0a2a3d', marginTop: '2.2rem', marginBottom: '0.5rem' } as const
const p = { color: '#2c4a5e', lineHeight: 1.7, marginBottom: '0.8rem' } as const
const link = { color: '#1a6080' } as const

export default function Personvern() {
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

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2.5rem', fontWeight: 300, color: '#0a2a3d', marginBottom: '1rem' }}>Personvernerklæring</h1>
        <p style={p}>Denne erklæringen forklarer hvordan Bølgevarsel.no behandler personopplysninger. Vi er opptatt av å verne om personvernet ditt og behandler kun data som er nødvendig for å levere tjenesten.</p>

        <h2 style={h2}>Behandlingsansvarlig</h2>
        <p style={p}>Bølgevarsel.no leveres av Stå på Pinne AS (org.nr 935 233 488), Stavanger. Spørsmål om personvern rettes til <a href="mailto:hei@bolgevarsel.no" style={link}>hei@bolgevarsel.no</a>.</p>

        <h2 style={h2}>Hvilke opplysninger vi samler inn</h2>
        <p style={p}>Vi samler inn opplysningene du selv oppgir når du oppretter abonnement eller kontakter oss:</p>
        <ul style={{ ...p, paddingLeft: '1.2rem' }}>
          <li>E-postadresse (for innlogging og varsler)</li>
          <li>Telefonnummer til deg og eventuelle mottakere (for SMS-varsler)</li>
          <li>Lokasjoner og aktivitetsprofiler du legger inn</li>
          <li>Navn på mottakere du registrerer</li>
          <li>Meldinger du sender via kontaktskjemaet</li>
        </ul>
        <p style={p}>Betalingsinformasjon (kortdata) håndteres i sin helhet av Vipps og Stripe — vi mottar og lagrer aldri kortnummer eller annen sensitiv betalingsinformasjon.</p>

        <h2 style={h2}>Behandlingsgrunnlag og formål</h2>
        <p style={p}>Vi behandler opplysningene for å oppfylle avtalen om abonnement (GDPR art. 6 nr. 1 b) — det vil si å levere daglige bølge- og værvarsler på e-post og SMS, og administrere abonnementet ditt. Bruk av analyse­verktøy skjer på grunnlag av samtykke (art. 6 nr. 1 a), som du når som helst kan trekke tilbake. Vi selger aldri opplysninger til tredjeparter.</p>

        <h2 style={h2}>Informasjonskapsler (cookies)</h2>
        <p style={p}>Vi bruker informasjonskapsler for to formål: nødvendig drift og anonymisert statistikk. Du velger selv om du vil tillate statistikk-kapsler via samtykkebanneret når du besøker nettstedet første gang.</p>
        <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#2c4a5e' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid rgba(10,42,61,0.12)' }}>
                <th style={{ padding: '8px 10px' }}>Kapsel</th>
                <th style={{ padding: '8px 10px' }}>Formål</th>
                <th style={{ padding: '8px 10px' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(10,42,61,0.08)' }}>
                <td style={{ padding: '8px 10px' }}>bv_session</td>
                <td style={{ padding: '8px 10px' }}>Holder deg innlogget på Min side</td>
                <td style={{ padding: '8px 10px' }}>Nødvendig</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(10,42,61,0.08)' }}>
                <td style={{ padding: '8px 10px' }}>Google Analytics (_ga m.fl.)</td>
                <td style={{ padding: '8px 10px' }}>Anonymisert statistikk om bruk av nettstedet</td>
                <td style={{ padding: '8px 10px' }}>Statistikk (krever samtykke)</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 10px' }}>Vercel Analytics</td>
                <td style={{ padding: '8px 10px' }}>Anonym ytelses- og besøksmåling uten cookies</td>
                <td style={{ padding: '8px 10px' }}>Nødvendig</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={p}>Google Analytics lastes med Google Consent Mode og setter ingen statistikk-kapsler før du har gitt samtykke. Du kan endre valget ditt ved å tømme nettleserdata for nettstedet, eller ta kontakt med oss.</p>

        <h2 style={h2}>Lagringstid</h2>
        <p style={p}>Opplysninger knyttet til abonnementet ditt lagres så lenge du er kunde, og slettes innen rimelig tid etter at abonnementet avsluttes — med unntak av det vi er pålagt å oppbevare etter bokføringsloven (kvitteringer/fakturagrunnlag i inntil 5 år). Meldinger fra kontaktskjemaet slettes når henvendelsen er ferdig behandlet.</p>

        <h2 style={h2}>Databehandlere</h2>
        <p style={p}>Vi bruker følgende underleverandører som behandler data på våre vegne:</p>
        <ul style={{ ...p, paddingLeft: '1.2rem' }}>
          <li>Supabase — database og lagring (EU)</li>
          <li>Vercel — drift og hosting av nettstedet</li>
          <li>Vipps og Stripe — betalingsformidling</li>
          <li>46elks — utsending av SMS</li>
          <li>Resend — utsending av e-post</li>
          <li>Google Analytics — anonymisert statistikk (kun ved samtykke)</li>
        </ul>

        <h2 style={h2}>Dine rettigheter</h2>
        <p style={p}>Du har rett til innsyn i, retting og sletting av opplysningene vi har om deg, samt rett til å trekke tilbake samtykke og til dataportabilitet. Henvendelser sendes til <a href="mailto:hei@bolgevarsel.no" style={link}>hei@bolgevarsel.no</a>, og vi svarer normalt innen 30 dager. Mener du at vi behandler opplysninger i strid med regelverket, kan du klage til Datatilsynet (datatilsynet.no).</p>

        <h2 style={h2}>Endringer</h2>
        <p style={p}>Vi kan oppdatere denne erklæringen ved endringer i tjenesten eller regelverket. Vesentlige endringer varsles på e-post til aktive abonnenter.</p>

        <p style={{ color: '#6b8fa3', marginTop: '3rem', fontSize: '0.9rem' }}>Sist oppdatert: 20. mai 2026</p>
      </div>
    </div>
  )
}
