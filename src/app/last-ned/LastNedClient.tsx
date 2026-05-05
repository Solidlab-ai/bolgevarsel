'use client'

import { useEffect, useState } from 'react'

type Platform = 'ios' | 'android' | 'desktop' | 'unknown'

export default function LastNedClient() {
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [isStandalone, setIsStandalone] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    // Detekter plattform
    const ua = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream
    const isAndroid = /Android/.test(ua)
    const isMobile = isIOS || isAndroid

    if (isIOS) setPlatform('ios')
    else if (isAndroid) setPlatform('android')
    else if (!isMobile) setPlatform('desktop')

    // Sjekk om allerede installert
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Lytt på beforeinstallprompt (Android Chrome)
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleAndroidInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

  if (isStandalone) {
    return (
      <main style={S.page}>
        <div style={S.card}>
          <div style={S.successIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#16a34a" strokeWidth="2.5" fill="#dcfce7"/>
              <path d="M14 24l7 7 14-14" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={S.h1}>Du har allerede appen!</h1>
          <p style={S.lead}>Bølgevarsel er allerede installert på enheten din.</p>
          <a href="/min-side" style={S.btnPrimary}>Åpne Min side</a>
        </div>
      </main>
    )
  }

  return (
    <main style={S.page}>
      <div style={S.card}>
        <Logo/>
        <h1 style={S.h1}>Last ned Bølgevarsel</h1>
        <p style={S.lead}>
          Få sjø-rapporter rett på telefonen — anbefalt for deg som har et aktivt abonnement på Bølgevarsel.
        </p>

        {platform === 'ios' && <IosInstructions/>}
        {platform === 'android' && <AndroidInstructions onInstall={handleAndroidInstall} canInstall={!!installPrompt}/>}
        {platform === 'desktop' && <DesktopInstructions/>}
        {platform === 'unknown' && <GenericInstructions/>}

        <div style={S.divider}/>

        <div style={S.benefits}>
          <Benefit
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 11 Q5 7 8 11 Q11 15 14 11 Q17 7 18 11" stroke="#1a6080" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                <path d="M2 15 Q5 12 8 15 Q11 18 14 15 Q17 12 18 15" stroke="#1a6080" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.5"/>
              </svg>
            }
            text="Live sjødata for dine lokasjoner"
          />
          <Benefit
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="5" y="2" width="10" height="16" rx="1.5" stroke="#1a6080" strokeWidth="1.6" fill="none"/>
                <line x1="9" y1="15.5" x2="11" y2="15.5" stroke="#1a6080" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            }
            text="Ikon på hjem-skjermen som en vanlig app"
          />
          <Benefit
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 8a5 5 0 0110 0v4l1.5 2h-13L5 12V8z" stroke="#1a6080" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
                <path d="M8 16.5a2 2 0 004 0" stroke="#1a6080" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
              </svg>
            }
            text="Daglige varsler på SMS eller e-post"
          />
          <Benefit
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#dc2626" strokeWidth="1.6" fill="none"/>
                <line x1="10" y1="6" x2="10" y2="11" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="10" cy="14" r="0.9" fill="#dc2626"/>
              </svg>
            }
            text="SOS-knapp for nødsituasjoner (Sikkerhet-plan)"
          />
        </div>

        <div style={S.divider}/>

        <div style={S.subscriptionCta}>
          <div style={{fontSize:13,color:'#475569',lineHeight:1.5,marginBottom:10}}>
            <strong style={{color:'#0a2a3d'}}>Ikke abonnent ennå?</strong> App-en gir deg full tilgang til daglige sjø-varsler, lokasjonsovervåking og SOS-funksjon når du har et aktivt abonnement.
          </div>
          <a href="/" style={S.btnSecondary}>Se abonnementer</a>
        </div>

        <p style={S.smallNote}>
          Bølgevarsel installeres direkte fra nettleseren — ingen App Store eller Google Play.
        </p>
      </div>
    </main>
  )
}

function Logo() {
  return (
    <div style={{display:'flex',justifyContent:'center',marginBottom:24}}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect width="80" height="80" rx="18" fill="#0a2a3d"/>
        <path d="M16 36 Q24 26 32 36 Q40 46 48 36 Q56 26 64 36" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M18 50 Q26 42 34 50 Q42 58 50 50 Q58 42 62 50" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      </svg>
    </div>
  )
}

function IosInstructions() {
  return (
    <div style={S.instructionBox}>
      <div style={S.platformBadge}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 3.5c-.4-.5-1-.8-1.7-.8-.9 0-1.4.4-2 .4-.5 0-1.1-.4-1.9-.4-1 0-2 .6-2.5 1.6-1.1 2.1-.3 5.2 1 7 .6.8 1.3 1.7 2.2 1.7.8 0 1.1-.5 2.1-.5s1.3.5 2.2.5c.9 0 1.5-.9 2.1-1.7.4-.5.7-1.1.9-1.7-2.4-.9-2.5-3.7-.4-4.1zM8 2.5c.4-.5.6-1.1.6-1.7-.5 0-1.1.3-1.6.8-.4.4-.7 1-.6 1.7.6 0 1.1-.3 1.6-.8z" fill="currentColor"/></svg>
        iPhone / iPad
      </div>
      <h2 style={S.h2}>Installer på 3 steg:</h2>
      <ol style={S.steps}>
        <li className="last-ned-step">
          <strong>Trykk på del-knappen</strong> nederst i Safari
          <span style={S.iconWrap}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2v12M11 2l-4 4M11 2l4 4" stroke="#1a6080" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 11v8a1 1 0 001 1h10a1 1 0 001-1v-8" stroke="#1a6080" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
        </li>
        <li className="last-ned-step">
          <strong>Bla ned og trykk «Legg til på Hjem-skjerm»</strong>
          <span style={S.iconWrap}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="3" width="16" height="16" rx="3" stroke="#1a6080" strokeWidth="1.8" fill="none"/>
              <path d="M11 7v8M7 11h8" stroke="#1a6080" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
        </li>
        <li className="last-ned-step">
          <strong>Trykk «Legg til»</strong> øverst til høyre
        </li>
      </ol>
      <TipBox>
        <strong>Tips:</strong> Du må bruke <strong>Safari</strong> — Chrome på iPhone støtter ikke installasjon.
      </TipBox>
    </div>
  )
}

function AndroidInstructions({ onInstall, canInstall }: { onInstall: () => void; canInstall: boolean }) {
  return (
    <div style={S.instructionBox}>
      <div style={S.platformBadge}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" fill="none"/><circle cx="5" cy="6" r=".7" fill="currentColor"/><circle cx="9" cy="6" r=".7" fill="currentColor"/><path d="M4.5 9c.5.7 1.4 1.2 2.5 1.2s2-.5 2.5-1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/></svg>
        Android
      </div>
      {canInstall ? (
        <>
          <h2 style={S.h2}>Klar til å installere</h2>
          <p style={{color:'#475569',fontSize:14,marginBottom:16}}>
            Trykk på knappen under, så installeres appen direkte:
          </p>
          <button onClick={onInstall} style={S.btnPrimary}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{marginRight:6}}><path d="M9 1v12M9 13l-4-4M9 13l4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 15h14" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            Installer Bølgevarsel
          </button>
        </>
      ) : (
        <>
          <h2 style={S.h2}>Installer på 3 steg:</h2>
          <ol style={S.steps}>
            <li className="last-ned-step"><strong>Trykk på menyen</strong> (de tre prikkene øverst til høyre i Chrome)</li>
            <li className="last-ned-step"><strong>Velg «Installer app»</strong> eller «Legg til på startskjerm»</li>
            <li className="last-ned-step"><strong>Trykk «Installer»</strong> i dialogen som åpner seg</li>
          </ol>
          <TipBox>
            <strong>Tips:</strong> Bruk <strong>Chrome</strong> for best resultat.
          </TipBox>
        </>
      )}
    </div>
  )
}

function DesktopInstructions() {
  return (
    <div style={S.instructionBox}>
      <div style={S.platformBadge}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2" width="11" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M5 12h4M7 9.5V12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        Datamaskin
      </div>
      <h2 style={S.h2}>Bruk på telefonen din</h2>
      <p style={{color:'#475569',fontSize:14,marginBottom:16,lineHeight:1.6}}>
        Bølgevarsel er laget for mobil. Åpne denne siden på din iPhone eller Android-telefon for å installere appen.
      </p>
      <p style={{color:'#475569',fontSize:14,marginBottom:16,lineHeight:1.6}}>
        Du kan også bruke Bølgevarsel direkte i nettleseren her på datamaskinen:
      </p>
      <a href="/min-side" style={S.btnPrimary}>Åpne i nettleseren</a>
      <TipBox>
        <strong>Tips:</strong> Send denne lenken til deg selv via SMS eller e-post for å åpne den på mobilen:
        <br/>
        <code style={{background:'#fff',padding:'4px 8px',borderRadius:4,marginTop:6,display:'inline-block',fontSize:12}}>
          https://bolgevarsel.no/last-ned
        </code>
      </TipBox>
    </div>
  )
}

function GenericInstructions() {
  return (
    <div style={S.instructionBox}>
      <h2 style={S.h2}>Installer Bølgevarsel</h2>
      <p style={{color:'#475569',fontSize:14,lineHeight:1.6}}>
        Åpne denne siden på din mobiltelefon (iPhone eller Android), så får du instruksjoner for hvordan du installerer appen.
      </p>
    </div>
  )
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:14,padding:'10px 0'}}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: '#f8fbfc', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{icon}</div>
      <span style={{fontSize:14,color:'#0a2a3d',lineHeight:1.4}}>{text}</span>
    </div>
  )
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={S.tipBox}>
      <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginTop:1}}>
          <path d="M8 1.5a4.5 4.5 0 00-2.5 8.25V11a1 1 0 001 1h3a1 1 0 001-1v-1.25A4.5 4.5 0 008 1.5z" stroke="#a16207" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
          <line x1="6.5" y1="13.5" x2="9.5" y2="13.5" stroke="#a16207" strokeWidth="1.3" strokeLinecap="round"/>
          <line x1="7" y1="15" x2="9" y2="15" stroke="#a16207" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <div style={{flex:1}}>{children}</div>
      </div>
    </div>
  )
}

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #c8e8f5 0%, #e8f4f8 100%)',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    padding: '2rem 1rem',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  } as React.CSSProperties,
  card: {
    background: 'white',
    borderRadius: 24,
    padding: '2.5rem 1.75rem',
    maxWidth: 480,
    width: '100%',
    boxShadow: '0 4px 24px rgba(10, 42, 61, 0.1)',
  } as React.CSSProperties,
  successIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20,
  } as React.CSSProperties,
  h1: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 28,
    fontWeight: 400,
    color: '#0a2a3d',
    margin: '0 0 8px',
    textAlign: 'center',
  } as React.CSSProperties,
  h2: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 18,
    fontWeight: 400,
    color: '#0a2a3d',
    margin: '0 0 14px',
  } as React.CSSProperties,
  lead: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 1.6,
    textAlign: 'center',
    margin: '0 0 28px',
  } as React.CSSProperties,
  instructionBox: {
    background: '#f8fbfc',
    borderRadius: 14,
    padding: '20px 18px',
    marginBottom: 20,
  } as React.CSSProperties,
  platformBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#e8f4f8',
    color: '#1a6080',
    padding: '5px 12px',
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 14,
  } as React.CSSProperties,
  steps: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    counterReset: 'step',
  } as React.CSSProperties,
  iconWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    background: 'white',
    borderRadius: 6,
    marginLeft: 8,
    border: '1px solid rgba(10,42,61,0.08)',
    verticalAlign: 'middle',
  } as React.CSSProperties,
  tipBox: {
    background: '#fef9e7',
    border: '1px solid #fde68a',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 13,
    color: '#7c5a00',
    lineHeight: 1.5,
    marginTop: 16,
    marginBottom: 0,
  } as React.CSSProperties,
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    background: '#0a2a3d',
    color: 'white',
    padding: '14px 20px',
    borderRadius: 100,
    border: 'none',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'none',
    transition: 'background 0.15s',
  } as React.CSSProperties,
  divider: {
    height: 1,
    background: 'rgba(10,42,61,0.08)',
    margin: '24px 0',
  } as React.CSSProperties,
  subscriptionCta: {
    background: '#f0f8fc',
    border: '1px solid rgba(26,96,128,0.15)',
    borderRadius: 12,
    padding: '16px 18px',
    marginBottom: 20,
  } as React.CSSProperties,
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white',
    color: '#0a2a3d',
    padding: '10px 18px',
    borderRadius: 100,
    border: '1px solid rgba(10,42,61,0.15)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'none',
    transition: 'all 0.15s',
  } as React.CSSProperties,
  benefits: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  } as React.CSSProperties,
  smallNote: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 1.5,
    margin: 0,
  } as React.CSSProperties,
}

// CSS for ordered list med stilig nummerering
if (typeof document !== 'undefined') {
  const styleId = 'bv-last-ned-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.innerHTML = `
      .last-ned-step {
        counter-increment: step;
        position: relative;
        padding: 12px 12px 12px 48px;
        margin-bottom: 8px;
        background: white;
        border-radius: 10px;
        font-size: 14px;
        color: #0a2a3d;
        line-height: 1.5;
      }
      .last-ned-step::before {
        content: counter(step);
        position: absolute;
        left: 14px;
        top: 12px;
        width: 24px;
        height: 24px;
        background: #1a6080;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 12px;
      }
    `
    document.head.appendChild(style)
  }
}
