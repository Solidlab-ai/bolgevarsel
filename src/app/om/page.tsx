import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Om oss — Bølgevarsel',
  description: 'Bølgevarsel er en venture fra Solidlab.ai i Stavanger — en SaaS-tjeneste som leverer daglig sjøvarsel på SMS for norskekysten.',
  alternates: { canonical: 'https://bolgevarsel.no/om' },
}

export default function OmPage() {
  return (
    <main style={{minHeight:'100vh',background:'#f5f1e8',padding:'5rem 1.5rem 6rem'}}>
      <div style={{maxWidth:'780px',margin:'0 auto'}}>

        <Link
          href="/"
          style={{
            display:'inline-flex',alignItems:'center',gap:'0.4rem',
            color:'#1a6080',textDecoration:'none',fontSize:'0.9rem',
            marginBottom:'2.5rem',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Tilbake til forsiden
        </Link>

        <span style={{
          display:'inline-block',
          fontSize:'0.7rem',textTransform:'uppercase',
          letterSpacing:'0.18em',color:'#4A5A62',
          marginBottom:'1rem',fontWeight:500,
        }}>Om Bølgevarsel</span>

        <h1 style={{
          fontFamily:"'DM Sans', sans-serif",
          fontSize:'clamp(2rem, 5vw, 3rem)',
          fontWeight:600,color:'#0a2a3d',
          letterSpacing:'-0.02em',lineHeight:1.15,
          margin:'0 0 1.5rem',
        }}>
          Sjøvarsel som <em>faktisk</em> kommer<br/>fram før du dro ut.
        </h1>

        <p style={{
          fontSize:'1.15rem',color:'#2c4a5e',
          lineHeight:1.6,margin:'0 0 3rem',
        }}>
          Bølgevarsel er bygget for folk som er glad i sjøen — og som er lei av å scrolle gjennom åtte vær-apper hver morgen. Vi henter ferske data fra met.no og Open-Meteo Marine, analyserer dem for kysten din, og sender deg det viktigste på SMS og e-post.
        </p>

        <section style={{
          padding:'2rem',background:'white',
          border:'0.5px solid rgba(10,42,61,0.1)',
          borderRadius:'14px',marginBottom:'3rem',
        }}>
          <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'1rem'}}>
            <span style={{width:'5px',height:'5px',borderRadius:'50%',background:'#4A5A62'}} />
            <span style={{
              fontSize:'0.7rem',textTransform:'uppercase',letterSpacing:'0.15em',
              color:'#4A5A62',fontWeight:500,
            }}>A venture from Solidlab</span>
          </div>
          <h2 style={{
            fontFamily:"'DM Sans', sans-serif",
            fontSize:'1.5rem',fontWeight:600,color:'#0a2a3d',
            letterSpacing:'-0.01em',margin:'0 0 0.75rem',
          }}>
            Bygget av Solidlab.ai i Stavanger
          </h2>
          <p style={{color:'#2c4a5e',lineHeight:1.7,margin:'0 0 1.25rem'}}>
            Bølgevarsel er én av flere venturer fra <strong>Solidlab</strong> — et nordisk venture-studio som bygger digitale produkter med fokus på enkelhet, pålitelighet og norsk håndverk. Vi tar ansvar for alt fra teknisk drift og GDPR til support og personvern.
          </p>
          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
            <a href="https://solidlab.ai" target="_blank" rel="noopener" style={{
              display:'inline-flex',alignItems:'center',gap:'0.4rem',
              padding:'0.65rem 1rem',background:'#0a2a3d',color:'white',
              borderRadius:'8px',textDecoration:'none',
              fontSize:'0.88rem',fontWeight:500,
            }}>
              Besøk Solidlab.ai
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="https://solidlab.ai/trust" target="_blank" rel="noopener" style={{
              display:'inline-flex',alignItems:'center',gap:'0.4rem',
              padding:'0.65rem 1rem',background:'transparent',color:'#0a2a3d',
              border:'0.5px solid rgba(10,42,61,0.2)',
              borderRadius:'8px',textDecoration:'none',
              fontSize:'0.88rem',fontWeight:500,
            }}>
              Trust &amp; Compliance
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </section>

        <h2 style={{
          fontFamily:"'DM Sans', sans-serif",
          fontSize:'1.6rem',fontWeight:600,color:'#0a2a3d',
          letterSpacing:'-0.01em',margin:'0 0 1.5rem',
        }}>Det vi står for</h2>

        <div style={{display:'grid',gap:'1.25rem',marginBottom:'3rem'}}>
          {[
            { tittel:'Norsk og kortfattet', tekst:'Vi skriver på norsk, holder oss til det viktigste, og kutter det som ikke betyr noe. SMS-en skal kunne leses på 10 sekunder.' },
            { tittel:'Pålitelige datakilder', tekst:'Vi bruker offisielle data fra met.no (Meteorologisk institutt) og Open-Meteo Marine. Ingen oppspinn, ingen reklame som forstyrrer varselet.' },
            { tittel:'Personvern på alvor', tekst:'Vi lagrer kun det vi trenger for å levere tjenesten. Ingen tracking-pixels for tredjeparter, ingen videresalg av data. Du kan slette kontoen din når som helst.' },
            { tittel:'Sikkerhet først', tekst:'Kritiske farevarsler kan ikke skrus av — selv om du har valgt å pause vanlige varsler. Vi prioriterer alltid sikkerheten din på sjøen.' },
          ].map((v, i) => (
            <div key={i} style={{
              padding:'1.5rem',background:'white',
              border:'0.5px solid rgba(10,42,61,0.08)',
              borderRadius:'12px',
            }}>
              <h3 style={{
                fontFamily:"'DM Sans', sans-serif",
                fontSize:'1.05rem',fontWeight:600,color:'#0a2a3d',
                margin:'0 0 0.4rem',
              }}>{v.tittel}</h3>
              <p style={{color:'#2c4a5e',lineHeight:1.6,margin:0,fontSize:'0.95rem'}}>{v.tekst}</p>
            </div>
          ))}
        </div>

        <h2 style={{
          fontFamily:"'DM Sans', sans-serif",
          fontSize:'1.3rem',fontWeight:600,color:'#0a2a3d',
          letterSpacing:'-0.01em',margin:'0 0 1rem',
        }}>Selskapsinformasjon</h2>

        <div style={{
          padding:'1.5rem',background:'rgba(10,42,61,0.03)',
          border:'0.5px solid rgba(10,42,61,0.06)',
          borderRadius:'10px',
          fontSize:'0.92rem',color:'#2c4a5e',lineHeight:1.8,
          marginBottom:'2.5rem',
        }}>
          <strong style={{color:'#0a2a3d'}}>Stå på Pinne AS</strong><br/>
          Org.nr 935 233 488 (drives under merkenavnet Solidlab)<br/>
          E-post: <a href="mailto:hei@bolgevarsel.no" style={{color:'#1a6080'}}>hei@bolgevarsel.no</a>
        </div>

        <div style={{
          padding:'2rem',
          background:'linear-gradient(135deg, #0a2a3d 0%, #1a6080 100%)',
          borderRadius:'14px',textAlign:'center',color:'white',
        }}>
          <h2 style={{
            fontFamily:"'DM Sans', sans-serif",
            fontSize:'1.4rem',fontWeight:600,
            margin:'0 0 0.5rem',color:'white',letterSpacing:'-0.01em',
          }}>Klar til å prøve?</h2>
          <p style={{color:'rgba(255,255,255,0.75)',margin:'0 0 1.5rem',fontSize:'0.95rem'}}>
            7 dager gratis prøveperiode. Avslutt når du vil.
          </p>
          <Link href="/registrer" style={{
            display:'inline-block',padding:'0.85rem 1.75rem',
            background:'white',color:'#0a2a3d',borderRadius:'8px',
            fontWeight:600,fontSize:'0.95rem',textDecoration:'none',
          }}>
            Kom i gang — fra 49 kr/mnd →
          </Link>
        </div>

      </div>
    </main>
  )
}
