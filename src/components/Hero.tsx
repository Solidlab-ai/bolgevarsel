'use client'
import { useState, useEffect } from 'react'
import styles from './Hero.module.css'

const dagNavn = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag']
const månedNavn = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember']

function getDagensDato() {
  const nå = new Date()
  return `${dagNavn[nå.getDay()]} ${nå.getDate()}. ${månedNavn[nå.getMonth()]}`
}

const retning = (deg: number) => {
  const retninger = ['N','NØ','Ø','SØ','S','SV','V','NV']
  return retninger[Math.round(deg / 45) % 8]
}

const vindBeskrivelse = (ms: number) => {
  if (ms < 0.5) return 'Stille'
  if (ms < 1.6) return 'Flau vind'
  if (ms < 3.4) return 'Svak vind'
  if (ms < 5.5) return 'Lett bris'
  if (ms < 8.0) return 'Laber bris'
  if (ms < 10.8) return 'Frisk bris'
  if (ms < 13.9) return 'Liten kuling'
  if (ms < 17.2) return 'Stiv kuling'
  if (ms < 20.8) return 'Sterk kuling'
  if (ms < 24.5) return 'Liten storm'
  if (ms < 28.5) return 'Full storm'
  return 'Orkan'
}

const sjøStatus = (vindMs: number, bølgeM: number) => {
  if (vindMs >= 20.8 || bølgeM >= 4.0) return { tekst: 'FAREVARSEL – Bli på land!', ikon: '', fare: true }
  if (vindMs >= 13.9 || bølgeM >= 2.5) return { tekst: 'Farlige forhold – ikke gå ut', ikon: '', fare: true }
  if (vindMs >= 10.8 || bølgeM >= 1.5) return { tekst: 'Kuling – kun erfarne', ikon: '', fare: false }
  if (vindMs >= 8.0 || bølgeM >= 1.0)  return { tekst: 'Moderat – vær forsiktig', ikon: '', fare: false }
  if (vindMs >= 5.5 || bølgeM >= 0.5)  return { tekst: 'Greit for erfarne', ikon: '', fare: false }
  return { tekst: 'Gode forhold — fin dag på sjøen', ikon: '', fare: false }
}

const LOCATIONS = [
  { name: 'Tånes',          lat: 58.97, lon: 5.72 },
  { name: 'Stavanger havn', lat: 58.97, lon: 5.73 },
  { name: 'Jærstrendene',   lat: 58.77, lon: 5.52 },
  { name: 'Tananger',       lat: 58.94, lon: 5.58 },
  { name: 'Karmøy',         lat: 59.28, lon: 5.29 },
  { name: 'Haugesund',      lat: 59.41, lon: 5.27 },
  { name: 'Kristiansand',   lat: 58.15, lon: 8.00 },
  { name: 'Lillesand',      lat: 58.25, lon: 8.38 },
  { name: 'Grimstad',       lat: 58.34, lon: 8.59 },
  { name: 'Drøbak',         lat: 59.66, lon: 10.63 },
  { name: 'Oslofjorden',    lat: 59.45, lon: 10.55 },
]

type LiveData = {
  name: string
  date: string
  vær: string
  sjøTemp: string | null
  vind: string
  vindBeskr: string
  bølger: string
  status: string
  fare: boolean
  loaded: boolean
}

async function fetchLocation(loc: typeof LOCATIONS[0]): Promise<LiveData> {
  try {
    const lat = Math.round(loc.lat * 10000) / 10000
    const lon = Math.round(loc.lon * 10000) / 10000

    // Proxy til met.no (TOS-compliant, User-Agent satt server-side)
    const [metRes, marineRes] = await Promise.all([
      fetch(`/api/varsel?lat=${lat}&lon=${lon}`),
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_period,sea_surface_temperature&timezone=Europe/Oslo`),
    ])
    const [metData, marineData] = await Promise.all([metRes.json(), marineRes.json()])

    const timeseries = metData.properties?.timeseries ?? []
    const next24 = timeseries.slice(0, 24)
    const maxVindMs = Math.round(Math.max(...next24.map((t: any) => t.data?.instant?.details?.wind_speed ?? 0)) * 10) / 10
    const now = timeseries[0]?.data?.instant?.details ?? {}
    const vindMs = Math.round((now.wind_speed ?? 0) * 10) / 10
    const vindDir = Math.round(now.wind_from_direction ?? 0)
    const temp = Math.round(now.air_temperature ?? 0)

    // Bølger fra Open-Meteo Marine
    const bølgeM = marineData.current?.wave_height ?? Math.pow(maxVindMs * 0.10, 2)
    const periode = marineData.current?.wave_period
    const sjøTemp = marineData.current?.sea_surface_temperature

    const status = sjøStatus(maxVindMs, bølgeM)
    const bølgeTekst = periode
      ? `${bølgeM.toFixed(1)} m · ${Math.round(periode)}s`
      : `${bølgeM.toFixed(1)} m`

    return {
      name: loc.name,
      date: getDagensDato(),
      vær: `${temp}°C`,
      sjøTemp: sjøTemp != null ? `${sjøTemp.toFixed(1)}°C` : null,
      vind: `${vindMs} m/s (maks ${maxVindMs}) fra ${retning(vindDir)}`,
      vindBeskr: vindBeskrivelse(vindMs),
      bølger: bølgeTekst,
      status: status.tekst,
      fare: status.fare,
      loaded: true,
    }
  } catch {
    return {
      name: loc.name, date: getDagensDato(),
      vær: '–', sjøTemp: null, vind: '–', vindBeskr: '',
      bølger: '–', status: 'Kunne ikke hente data', fare: false, loaded: true,
    }
  }
}

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)
  const [liveData, setLiveData] = useState<LiveData[]>(
    LOCATIONS.map(l => ({
      name: l.name, date: getDagensDato(),
      vær: '…', sjøTemp: null, vind: '…', vindBeskr: '',
      bølger: '…', status: 'Henter data…', fare: false, loaded: false,
    }))
  )

  useEffect(() => {
    LOCATIONS.forEach(async (loc, i) => {
      const data = await fetchLocation(loc)
      setLiveData(prev => { const n = [...prev]; n[i] = data; return n })
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % LOCATIONS.length)
        setFading(false)
      }, 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const loc = liveData[current]

  return (
    <section className={styles.hero}>
      <svg className={styles.heroBg} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8e8f5"/><stop offset="100%" stopColor="#e8f4f8"/></linearGradient>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a6080"/><stop offset="100%" stopColor="#0a2a3d"/></linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#skyGrad)"/>
        <circle cx="1100" cy="200" r="80" fill="#fff4e0" opacity="0.4"/>
        <circle cx="1100" cy="200" r="50" fill="#ffd580" opacity="0.5"/>
        <circle cx="1100" cy="200" r="30" fill="#ffbc40" opacity="0.7"/>
        <g opacity="0.7"><ellipse cx="200" cy="140" rx="90" ry="30" fill="white"/><ellipse cx="240" cy="125" rx="60" ry="25" fill="white"/><ellipse cx="160" cy="130" rx="50" ry="22" fill="white"/></g>
        <g opacity="0.5"><ellipse cx="700" cy="100" rx="70" ry="22" fill="white"/><ellipse cx="740" cy="88" rx="50" ry="20" fill="white"/></g>
        <path d="M0 480 L120 380 L260 440 L380 360 L500 420 L620 350 L760 420 L900 380 L1040 430 L1180 370 L1320 420 L1440 380 L1440 580 L0 580 Z" fill="#2a6a8a" opacity="0.25"/>
        <path d="M0 520 L150 440 L300 490 L450 420 L600 475 L750 430 L900 470 L1100 420 L1260 460 L1440 430 L1440 600 L0 600 Z" fill="#1e5a7a" opacity="0.3"/>
        <ellipse cx="300" cy="540" rx="110" ry="28" fill="#2a5a3a" opacity="0.85"/>
        <path d="M210 540 Q260 510 300 505 Q340 510 390 540 Z" fill="#3a6a4a" opacity="0.9"/>
        <rect x="296" y="490" width="8" height="22" fill="#e8e0d0" rx="1"/>
        <rect x="293" y="487" width="14" height="5" fill="#cc3333" rx="1"/>
        <circle cx="300" cy="487" r="3" fill="#ffcc00" opacity="0.9"/>
        <ellipse cx="1180" cy="560" rx="80" ry="20" fill="#2a5a3a" opacity="0.7"/>
        <path d="M1120 558 Q1160 535 1180 532 Q1200 535 1240 558 Z" fill="#3a6a4a" opacity="0.8"/>
        <path d="M0 570 Q180 550 360 565 Q540 580 720 562 Q900 545 1080 560 Q1260 575 1440 558 L1440 900 L0 900 Z" fill="url(#seaGrad)"/>
        <g opacity="0.35">
          <path d="M-100 610 Q60 595 200 612 Q340 629 480 610 Q620 591 760 610 Q900 629 1040 610 Q1180 591 1320 610 Q1400 619 1540 610" fill="none" stroke="white" strokeWidth="2"><animateTransform attributeName="transform" type="translate" from="0 0" to="100 0" dur="4s" repeatCount="indefinite"/></path>
          <path d="M-100 635 Q80 620 220 637 Q360 654 500 634 Q640 614 780 634 Q920 654 1060 634 Q1200 614 1340 634 Q1420 643 1540 634" fill="none" stroke="white" strokeWidth="1.5"><animateTransform attributeName="transform" type="translate" from="0 0" to="-80 0" dur="5.5s" repeatCount="indefinite"/></path>
        </g>
        <g><line x1="900" y1="550" x2="900" y2="520" stroke="#8a7a6a" strokeWidth="1.5"/><path d="M900 550 L878 545 L900 525 Z" fill="rgba(255,255,255,0.85)"/><path d="M900 550 L920 545 L900 535 Z" fill="rgba(255,255,255,0.6)"/><path d="M882 550 Q900 554 918 550" fill="#5a4a3a"/></g>
      </svg>
      <div className={styles.content}>
        <div className={styles.eyebrow}><span className={styles.line}/>Norsk sjøvarseltjeneste — fra Lindesnes til Nordkapp<span className={styles.line}/></div>
        <h1 className={styles.h1}>Sjøvarsel rett i <em>lomma</em></h1>
        <p className={styles.sub}>Vi henter, analyserer og leverer sjødata for dine kyststeder — rett i appen, ferdig tilpasset deg. Farevarsel på SMS er alltid på, uansett.</p>
        <div className={styles.actions}>
          <a href="/registrer" className={styles.btnPrimary}>Kom i gang — fra 49 kr/mnd</a>
          <a href="#hvordan" className={styles.btnGhost}>Se eksempel på varsel →</a>
        </div>
        <div className={styles.trialBadge}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm0 3v3M6.5 9.5h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          7 dager gratis — kortet belastes ikke før etter prøveperioden
        </div>
      </div>
      <div className={styles.smsFloat} style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        <div className={styles.smsHeader}>
          <div className={styles.smsDot}/>
          <span className={styles.smsLabel}>Bølgevarsel · {loc.name} · {loc.date}</span>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot}/>
            Live
          </span>
        </div>
        <div className={styles.smsBody}>
          {/* Bølger */}
          <div className={styles.smsRow}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
              <path d="M1 7 Q3 5 5 7 Q7 9 9 7 Q11 5 13 7 Q14 8 15 7" stroke="#1a6080" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M1 10.5 Q3 8.5 5 10.5 Q7 12.5 9 10.5 Q11 8.5 13 10.5 Q14 11.5 15 10.5" stroke="#4da8cc" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
            </svg>
            <span>Bølger: {loc.bølger}</span>
          </div>
          {/* Vind */}
          <div className={styles.smsRow}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
              <path d="M1 6 Q6 4 10 6 Q12 7 14 6" stroke="#1a6080" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M1 9.5 Q5 8 8 9.5 Q10 10.5 12 9.5" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
              <path d="M14 6 Q16 6 16 7.5 Q16 9 14 9 H9" stroke="#1a6080" strokeWidth="1.1" strokeLinecap="round" opacity="0.35"/>
            </svg>
            <span>Vind: {loc.vindBeskr ? `${loc.vindBeskr} · ` : ''}{loc.vind}</span>
          </div>
          {/* Luft + sjøtemp */}
          <div className={styles.smsRow}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
              <path d="M8 2 V9" stroke="#1a6080" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="8" cy="12" r="2.5" stroke="#1a6080" strokeWidth="1.3" fill="none"/>
              <path d="M10 4.5 H12 M10 6.5 H11.5" stroke="#1a6080" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
            </svg>
            <span>Luft: {loc.vær}{loc.sjøTemp ? ` · Sjø: ${loc.sjøTemp}` : ''}</span>
          </div>
          {/* Status */}
          <div className={styles.smsGood} style={{ color: loc.fare ? '#dc2626' : '#1a7a50' }}>
            <span className={styles.smsGoodIcon} style={{ background: loc.fare ? '#dc2626' : '#1a7a50' }}>
              {loc.fare
                ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L9 9H1Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round" fill="none"/><path d="M5 4V6" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5 L4.5 7.5 L8.5 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
            </span>
            <span>{loc.status}</span>
          </div>
          <span className={styles.smsTag}>Levert når du vil</span>
        </div>
      </div>
    </section>
  )
}
