import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hjelpesenter – Bølgevarsel',
  description: 'Finn svar på spørsmål om Bølgevarsel — kom i gang, forstå varsler, administrer kontoen din og les vanlige spørsmål.',
  alternates: { canonical: 'https://bolgevarsel.no/hjelp' },
  openGraph: {
    title: 'Hjelpesenter – Bølgevarsel',
    description: 'Alt du trenger for å komme i gang med daglige sjøvarsler.',
    url: 'https://bolgevarsel.no/hjelp',
  },
}


// Egne SVG-ikoner i Bølgevarsel-stil
function IkonBolge() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 20 Q6 15 10 20 Q14 25 18 20 Q22 15 26 20 Q28 22 30 20" stroke="#0a2a3d" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M2 26 Q6 21 10 26 Q14 31 18 26 Q22 21 26 26 Q28 28 30 26" stroke="#4da8cc" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <circle cx="22" cy="9" r="4" fill="#ffbc40" opacity="0.8"/>
      <path d="M4 13 Q8 9 12 11" stroke="#0a2a3d" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3"/>
    </svg>
  )
}

function IkonVarsel() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 22 Q8 17 12 22 Q16 27 20 22 Q24 17 28 22" stroke="#0a2a3d" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M14 8 L14 4 M14 8 C10 8 7 11 7 15 L7 20 L21 20 L21 15 C21 11 18 8 14 8Z" stroke="#0a2a3d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="11" y1="20" x2="17" y2="20" stroke="#4da8cc" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function IkonKonto() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="11" r="5" stroke="#0a2a3d" strokeWidth="1.8" fill="none"/>
      <path d="M6 26 C6 21 10 18 16 18 C22 18 26 21 26 26" stroke="#0a2a3d" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M20 26 Q22 22 26 22" stroke="#4da8cc" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  )
}

function IkonFaq() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 22 Q8 17 12 22 Q16 27 20 22 Q24 17 28 22" stroke="#4da8cc" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <circle cx="16" cy="13" r="8" stroke="#0a2a3d" strokeWidth="1.8" fill="none"/>
      <path d="M13 10.5 C13 8.5 15 7.5 16.5 8 C18 8.5 19 10 18 11.5 C17 13 16 13 16 15" stroke="#0a2a3d" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <circle cx="16" cy="17.5" r="1" fill="#0a2a3d"/>
    </svg>
  )
}

const KATEGORIER = [
  {
    slug: 'kom-i-gang',
    tittel: 'Kom i gang',
    Ikon: IkonBolge,
    beskrivelse: 'Alt du trenger for å sette opp ditt første bølgevarsel',
    artikler: [
      { slug: 'hva-er-bolgevarsel', tittel: 'Hva er Bølgevarsel?' },
      { slug: 'velg-plan', tittel: 'Hvilken plan passer for meg?' },
      { slug: 'registrering', tittel: 'Slik registrerer du deg' },
      { slug: 'legg-til-lokasjon', tittel: 'Legg til din kystlokasjon' },
      { slug: 'legg-til-mottakere', tittel: 'Legg til mottakere (barn, ektefelle)' },
      { slug: 'csv-import', tittel: 'Importer mottakere fra CSV' },
      { slug: 'aktivitetsprofiler', tittel: 'Aktivitetsprofiler — tilpass varselet' },
      { slug: 'leveringstidspunkt', tittel: 'Velg leveringstidspunkt' },
    ],
  },
  {
    slug: 'varsler',
    tittel: 'Varsler og rapporter',
    Ikon: IkonVarsel,
    beskrivelse: 'Forstå SMS-varslene og e-postrapportene dine',
    artikler: [
      { slug: 'nar-sendes-varsel', tittel: 'Når sendes varselet?' },
      { slug: 'forsta-sms', tittel: 'Forstå SMS-varselet' },
      { slug: 'forsta-epost', tittel: 'Forstå e-postrapporten' },
      { slug: 'farevarsel', tittel: 'Hva er et farevarsel?' },
      { slug: 'pause-sms', tittel: 'Pause eller skru av SMS-varsler' },
      { slug: 'rapport-fanen', tittel: 'Bruk rapport-fanen på Min side' },
      { slug: 'kritisk-farevarsel', tittel: 'Kritisk farevarsel — alltid på' },
      { slug: 'push-varsler', tittel: 'Push-varsler i nettleseren' },
    ],
  },
  {
    slug: 'konto',
    tittel: 'Konto og abonnement',
    Ikon: IkonKonto,
    beskrivelse: 'Administrer kontoen din, bytt plan eller si opp',
    artikler: [
      { slug: 'min-side', tittel: 'Oversikt over Min side' },
      { slug: 'logg-inn', tittel: 'Slik logger du inn' },
      { slug: 'endre-epost', tittel: 'Endre e-postadresse' },
      { slug: 'bytte-plan', tittel: 'Bytte abonnementsplan' },
      { slug: 'si-opp', tittel: 'Si opp abonnementet' },
      { slug: 'betaling', tittel: 'Betaling og faktura' },
    ],
  },
  {
    slug: 'faq',
    tittel: 'Vanlige spørsmål',
    Ikon: IkonFaq,
    beskrivelse: 'Svar på de mest stilte spørsmålene',
    artikler: [
      { slug: 'hvor-noyaktig', tittel: 'Hvor nøyaktig er værdataene?' },
      { slug: 'hvilke-lokasjoner', tittel: 'Hvilke lokasjoner kan jeg velge?' },
      { slug: 'sms-ikke-mottatt', tittel: 'Jeg har ikke mottatt SMS — hva gjør jeg?' },
      { slug: 'flere-lokasjoner', tittel: 'Kan jeg ha flere lokasjoner?' },
      { slug: 'datakilder', tittel: 'Hvilke datakilder bruker dere?' },
      { slug: 'aktivitetsprofil-sms', tittel: 'Hva betyr aktivitetsprofil på SMS?' },
    ],
  },
]

export default function HjelpPage() {
  return (
    <div style={{ minHeight:'100vh', background:'#f0f4f8', fontFamily:'DM Sans, sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'Hva er Bølgevarsel?', acceptedAnswer: { '@type': 'Answer', text: 'Bølgevarsel er en norsk tjeneste som sender daglig sjø- og værvarsel på e-post og SMS — med AI-oppsummering, bølger, vind, temperatur og værikon, skreddersydd for din kystlokasjon.' } },
            { '@type': 'Question', name: 'Når sendes varselet?', acceptedAnswer: { '@type': 'Answer', text: 'Standard er kl. 12:00, men du velger selv mellom 04:00 og 12:00 — per abonnement eller per mottaker.' } },
            { '@type': 'Question', name: 'Hvilke lokasjoner støttes?', acceptedAnswer: { '@type': 'Answer', text: 'Vi støtter hele norskekysten via Open-Meteo Marine API og met.no.' } },
            { '@type': 'Question', name: 'Kan jeg ha flere mottakere?', acceptedAnswer: { '@type': 'Answer', text: 'Ja, du kan ha opptil 5 mottakere per lokasjon — for eksempel deg selv, ektefelle og svigerforeldre.' } },
            { '@type': 'Question', name: 'Hva koster det?', acceptedAnswer: { '@type': 'Answer', text: 'Vi tilbyr tre planer: Basis (49 kr/mnd, e-postrapport), Standard (99 kr/mnd, SMS-farevarsel til deg) og Familie (199 kr/mnd, SMS til opptil 5 mottakere og 3 lokasjoner). Alle planer har 7 dagers gratis prøveperiode.' } },
            { '@type': 'Question', name: 'Hvordan betaler jeg?', acceptedAnswer: { '@type': 'Answer', text: 'Du kan betale med Vipps eller betalingskort (Visa/Mastercard via Stripe). Alle planer starter med 7 dagers gratis prøveperiode, og du kan si opp når som helst.' } },
          ]
        }) }}
      />
      <nav style={{ padding:'1.2rem 2rem', borderBottom:'1px solid rgba(10,42,61,0.08)', background:'rgba(240,244,248,0.95)', position:'sticky' as const, top:0, zIndex:100 }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center' }}>
            <svg width="200" height="32" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="#0a2a3d" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="#1a6080" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
              <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="#0a2a3d" letterSpacing="-0.8">bølgevarsel<tspan fill="#1a6080" fontWeight="400">.no</tspan></text>
            </svg>
          </Link>
          <Link href="/min-side" style={{ background:'#0a2a3d', color:'white', padding:'0.5rem 1.2rem', borderRadius:100, textDecoration:'none', fontSize:'0.85rem', fontWeight:500 }}>
            Min side →
          </Link>
        </div>
      </nav>

      {/* Hero med bølge-SVG */}
      <div style={{ background:'linear-gradient(160deg,#0d3350 0%,#1a6080 60%,#0a2a3d 100%)', padding:'4rem 2rem 5rem', textAlign:'center', color:'white', position:'relative', overflow:'hidden' }}>
        <svg viewBox="0 0 1440 60" style={{ position:'absolute', bottom:0, left:0, width:'100%' }} preserveAspectRatio="none">
          <path d="M0 30 Q180 0 360 30 Q540 60 720 30 Q900 0 1080 30 Q1260 60 1440 30 L1440 60 L0 60 Z" fill="#f0f4f8"/>
        </svg>
        <p style={{ margin:'0 0 8px', fontSize:'11px', letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', fontWeight:600 }}>Hjelpesenter</p>
        <h1 style={{ margin:'0 0 1rem', fontFamily:"'Fraunces', Georgia, serif", fontSize:'2.6rem', fontWeight:400, letterSpacing:'-0.02em', lineHeight:1.2 }}>Hvordan kan vi hjelpe deg?</h1>
        <p style={{ margin:'0 auto 2rem', fontSize:'1.05rem', color:'rgba(255,255,255,0.65)', maxWidth:480, lineHeight:1.7 }}>
          Alt du trenger for å komme i gang med daglige sjøvarsler
        </p>
        <div style={{ display:'flex', gap:'0.6rem', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/min-side" style={{ background:'rgba(255,255,255,0.12)', color:'white', padding:'0.6rem 1.4rem', borderRadius:100, textDecoration:'none', fontSize:'0.88rem', border:'1px solid rgba(255,255,255,0.2)', backdropFilter:'blur(4px)' }}>
            Logg inn på Min side
          </Link>
          <a href="mailto:hei@bolgevarsel.no" style={{ background:'rgba(255,255,255,0.12)', color:'white', padding:'0.6rem 1.4rem', borderRadius:100, textDecoration:'none', fontSize:'0.88rem', border:'1px solid rgba(255,255,255,0.2)', backdropFilter:'blur(4px)' }}>
            Kontakt oss
          </a>
        </div>
      </div>

      {/* Kategorikort */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'3rem 1.5rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(380px,1fr))', gap:'1.5rem' }}>
          {KATEGORIER.map(kat => (
            <div key={kat.slug} style={{ background:'white', borderRadius:20, padding:'2rem', boxShadow:'0 2px 16px rgba(10,42,61,0.07)', border:'1px solid rgba(10,42,61,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.6rem' }}>
                <div style={{ width:48, height:48, background:'#f0f8fc', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <kat.Ikon />
                </div>
                <div>
                  <h2 style={{ margin:0, fontFamily:"'Fraunces', Georgia, serif", fontWeight:400, fontSize:'1.15rem', color:'#0a2a3d', letterSpacing:'-0.01em' }}>{kat.tittel}</h2>
                  <p style={{ margin:'2px 0 0', fontSize:'0.82rem', color:'#6b8fa3' }}>{kat.beskrivelse}</p>
                </div>
              </div>
              <div style={{ borderTop:'1px solid #f1f5f9', marginTop:'1rem', paddingTop:'0.8rem', display:'flex', flexDirection:'column' as const, gap:'0' }}>
                {kat.artikler.map((art, i) => (
                  <Link key={art.slug} href={`/hjelp/${kat.slug}/${art.slug}`}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.55rem 0.6rem', borderRadius:8, textDecoration:'none', color:'#334155', fontSize:'0.88rem', borderBottom: i < kat.artikler.length - 1 ? '1px solid #f8fbfc' : 'none' }}>
                    <span>{art.tittel}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="#4da8cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Kontaktboks */}
        <div style={{ marginTop:'3rem', background:'linear-gradient(135deg,#0d3350,#1a6080)', borderRadius:20, padding:'2.5rem', textAlign:'center', color:'white', position:'relative', overflow:'hidden' }}>
          <svg viewBox="0 0 400 80" style={{ position:'absolute', bottom:0, right:0, opacity:0.08, width:300 }}>
            <path d="M0 40 Q50 20 100 40 Q150 60 200 40 Q250 20 300 40 Q350 60 400 40" fill="none" stroke="white" strokeWidth="3"/>
            <path d="M0 60 Q60 40 120 60 Q180 80 240 60 Q300 40 360 60 Q380 70 400 60" fill="none" stroke="white" strokeWidth="2"/>
          </svg>
          <h2 style={{ margin:'0 0 0.5rem', fontFamily:"'Fraunces', Georgia, serif", fontWeight:400, fontSize:'1.6rem', letterSpacing:'-0.02em' }}>Fant du ikke svaret?</h2>
          <p style={{ margin:'0 0 1.5rem', color:'rgba(255,255,255,0.65)', fontSize:'0.95rem' }}>Vi svarer raskt på e-post i hverdagene</p>
          <a href="mailto:hei@bolgevarsel.no" style={{ display:'inline-block', background:'white', color:'#0a2a3d', padding:'0.9rem 2rem', borderRadius:100, textDecoration:'none', fontWeight:600, fontSize:'0.92rem' }}>
            Send oss en e-post →
          </a>
        </div>
      </div>
    </div>
  )
}
