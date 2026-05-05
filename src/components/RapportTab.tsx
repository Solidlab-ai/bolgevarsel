'use client'
import React, { useState, useEffect, useRef } from 'react'
import BvSelect from './BvSelect'

type Loc = { id: string; name: string; lat: number; lon: number }

const PROFILER = [
  { value: '', label: 'Generell sjørapport' },
  { value: 'surfer', label: 'Surfer' },
  { value: 'kitesurfer', label: 'Kitesurfer' },
  { value: 'windsurfer', label: 'Windsurfer' },
  { value: 'seiler', label: 'Seiler' },
  { value: 'fisker', label: 'Fisker' },
  { value: 'familie', label: 'Barn/ungdom med båt' },
  { value: 'baatforer', label: 'Båtfører' },
  { value: 'kajakk', label: 'Padler / kajakk' },
  { value: 'fridykker', label: 'Fridykker / snorkling' },
]

const PERIODER = [
  { value: '1', label: 'I dag' },
  { value: '2', label: 'I dag + i morgen' },
  { value: '3', label: 'Neste 3 dager' },
  { value: '7', label: 'Denne uken' },
]

const SCORE_COLORS = ['#94a3b8', '#16a34a', '#65a30d', '#ca8a04', '#ea580c', '#dc2626']

function profileTips(profile: string, day: any): { items: {icon: string; label: string; value: string; highlight?: boolean}[] } {
  const wave = day.avgWave, wind = day.windNow, period = day.avgPeriod
  const seaTemp = day.seaTemp, waveDir = day.waveDir, windDirLabel = day.windDirLabel

  if (profile === 'surfer') {
    // Offshore (vind fra land = bra) vs onshore (vind mot land = dårlig)
    // Vestkysten: offshore er typisk NØ-Ø, onshore er V-SV
    const offshoreDir = ['NNO','NO','ONO','O','OSO']
    const isOffshore = offshoreDir.includes(windDirLabel)
    const windQuality = isOffshore ? 'Offshore — perfekt!' : wind < 4 ? 'Svak — greit' : 'Onshore — messy'
    const windQColor = isOffshore ? '#16a34a' : wind < 4 ? '#ca8a04' : '#ea580c'

    // Våtdrakt basert på sjøtemp
    let wetsuit = '5/4mm + hette'
    if (seaTemp >= 20) wetsuit = 'Shorts/bikini'
    else if (seaTemp >= 17) wetsuit = '2mm shorty'
    else if (seaTemp >= 14) wetsuit = '3/2mm'
    else if (seaTemp >= 11) wetsuit = '4/3mm'
    else if (seaTemp >= 8) wetsuit = '5/4mm'

    // Brett-anbefaling
    let board = 'Longboard'
    if (wave >= 2.0 && period >= 10) board = 'Shortboard / fish'
    else if (wave >= 1.5 && period >= 8) board = 'Mid-length / fish'
    else if (wave >= 0.8) board = 'Funboard / mid-length'

    return { items: [
      { icon: '~', label: 'Vindkvalitet', value: `${windQuality} (${windDirLabel})`, highlight: isOffshore },
      { icon: '⌛', label: 'Bølgeperiode', value: `${period.toFixed(0)}s — ${period >= 10 ? 'god grunn-swell' : period >= 8 ? 'ok periode' : 'kort — choppy'}` },
      { icon: '🤿', label: 'Drakt', value: `${wetsuit} (sjø ${seaTemp?.toFixed(1) ?? '?'}°C)` },
      { icon: <svg width='14' height='14' viewBox='0 0 14 14' fill='none'><path d='M2 10 Q4 7 7 8 Q10 9 12 6' stroke='#1a6080' strokeWidth='1.3' strokeLinecap='round' fill='none'/><path d='M2 10 Q3 12 5 11' stroke='#1a6080' strokeWidth='1' strokeLinecap='round' fill='none'/></svg>, label: 'Brett-tips', value: board },
      { icon: <svg width='14' height='14' viewBox='0 0 14 14' fill='none'><path d='M7 1.5C5.3 1.5 4 2.8 4 4.5c0 2.3 3 7 3 7s3-4.7 3-7C10 2.8 8.7 1.5 7 1.5z' stroke='#1a6080' strokeWidth='1.2' fill='none'/><circle cx='7' cy='4.5' r='1.2' stroke='#1a6080' strokeWidth='1' fill='none'/></svg>, label: 'Bølgeretning', value: `Fra ${waveDir} — sjekk lokale spots` },
    ]}
  }

  if (profile === 'seiler') {
    const beaufort = wind < 2 ? 'Stille (0)' : wind < 4 ? 'Flau vind (1-2)' : wind < 6 ? 'Lett bris (3)' : wind < 8 ? 'Laber bris (4)' : wind < 11 ? 'Frisk bris (5)' : 'Liten kuling (6+)'
    return { items: [
      { icon: '🧭', label: 'Vindstyrke', value: `${wind.toFixed(1)} m/s — ${beaufort}` },
      { icon: '⚓', label: 'Vindretning', value: windDirLabel },
      { icon: <svg width='14' height='14' viewBox='0 0 14 14' fill='none'><path d='M1 7 Q3 4 5 7 Q7 10 9 7 Q11 4 13 7' stroke='#1a6080' strokeWidth='1.3' strokeLinecap='round' fill='none'/><path d='M1 10 Q3 8 5 10 Q7 12 9 10 Q11 8 13 10' stroke='#4da8cc' strokeWidth='1' strokeLinecap='round' fill='none' opacity='0.5'/></svg>, label: 'Bølgeforhold', value: `${wave.toFixed(1)}m fra ${waveDir} — ${wave < 0.5 ? 'speil' : wave < 1.5 ? 'lett krusning' : 'krevende'}` },
      { icon: <svg width='14' height='14' viewBox='0 0 14 14' fill='none'><path d='M7 2 L7 10 L2 10 Z' stroke='#1a6080' strokeWidth='1.2' fill='none' strokeLinejoin='round'/><path d='M7 10 L12 10' stroke='#1a6080' strokeWidth='1.2' strokeLinecap='round'/></svg>, label: 'Seiloppsett', value: wind < 5 ? 'Storseil + spinnaker' : wind < 12 ? 'Fullt seil' : 'Reif seilet' },
    ]}
  }

  if (profile === 'fisker') {
    return { items: [
      { icon: <svg width='14' height='14' viewBox='0 0 14 14' fill='none'><path d='M2 4 Q5 2 8 4' stroke='#1a6080' strokeWidth='1.2' strokeLinecap='round' fill='none'/><path d='M8 4 L10 8 L8 10 L4 8 Z' stroke='#1a6080' strokeWidth='1.1' fill='none' strokeLinejoin='round'/><path d='M10 8 L13 10' stroke='#1a6080' strokeWidth='1.1' strokeLinecap='round'/></svg>, label: 'Fiskeforhold', value: wave < 0.5 ? 'Ideelt — stille hav' : wave < 1.0 ? 'Greit — lette bølger' : 'Krevende — hold kystlinjen' },
      { icon: <svg width='14' height='14' viewBox='0 0 14 14' fill='none'><path d='M1 7 Q3 4 5 7 Q7 10 9 7 Q11 4 13 7' stroke='#1a6080' strokeWidth='1.3' strokeLinecap='round' fill='none'/></svg>, label: 'Bølgehøyde', value: `${wave.toFixed(1)}m fra ${waveDir}` },
      { icon: '💨', label: 'Vind', value: `${wind.toFixed(1)} m/s fra ${windDirLabel}` },
      { icon: '🌡', label: 'Sjøtemperatur', value: seaTemp !== null ? `${seaTemp.toFixed(1)}°C` : '—' },
    ]}
  }

  if (profile === 'fridykker') {
    let siktDesc = wave < 0.2 && wind < 3 ? 'Utmerket sikt forventet' : wave < 0.5 ? 'God sikt' : 'Redusert sikt — bølger'
    let drysuit = '7mm eller tørdrakt'
    if (seaTemp >= 20) drysuit = 'Lett 3mm'
    else if (seaTemp >= 14) drysuit = '5mm'
    else if (seaTemp >= 10) drysuit = '7mm'
    return { items: [
      { icon: '👁', label: 'Forventet sikt', value: siktDesc, highlight: wave < 0.3 },
      { icon: '🌡', label: 'Sjøtemperatur', value: seaTemp !== null ? `${seaTemp.toFixed(1)}°C` : '—' },
      { icon: <svg width='14' height='14' viewBox='0 0 14 14' fill='none'><circle cx='7' cy='7' r='5.5' stroke='#1a6080' strokeWidth='1.2' fill='none'/><path d='M4 7h6M7 4v6' stroke='#1a6080' strokeWidth='1' strokeLinecap='round'/></svg>, label: 'Drakt-anbefaling', value: drysuit },
      { icon: '🌊', label: 'Bølgehøyde', value: `${wave.toFixed(1)}m — ${wave < 0.3 ? 'perfekt' : wave < 0.5 ? 'ok' : 'for urolig'}` },
    ]}
  }

  if (profile === 'kajakk') {
    return { items: [
      { icon: '💨', label: 'Vind', value: `${wind.toFixed(1)} m/s fra ${windDirLabel} — ${wind < 4 ? 'ideelt' : wind < 8 ? 'greit' : 'krevende'}` },
      { icon: <svg width='14' height='14' viewBox='0 0 14 14' fill='none'><path d='M1 7 Q3 4 5 7 Q7 10 9 7 Q11 4 13 7' stroke='#1a6080' strokeWidth='1.3' strokeLinecap='round' fill='none'/></svg>, label: 'Bølger', value: `${wave.toFixed(1)}m — ${wave < 0.3 ? 'padlerparadis' : wave < 0.7 ? 'lett' : 'kun erfarne'}` },
      { icon: '🧭', label: 'Tips', value: 'Hold alltid kysten i sikte' },
    ]}
  }

  return { items: [] }
}

function WeatherIcon({ symbol, size = 16 }: { symbol: string; size?: number }) {
  const s = symbol.replace('_night', '').replace('_day', '').replace('_polartwilight', '')
  if (s === 'clearsky') return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" fill="#f59e0b"/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <line key={i} x1={8+Math.cos(deg*Math.PI/180)*4.2} y1={8+Math.sin(deg*Math.PI/180)*4.2}
          x2={8+Math.cos(deg*Math.PI/180)*5.5} y2={8+Math.sin(deg*Math.PI/180)*5.5}
          stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round"/>
      ))}
    </svg>
  )
  if (s === 'fair' || s === 'partlycloudy') return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="6" r="2.5" fill="#f59e0b"/>
      <ellipse cx="9.5" cy="10" rx="4" ry="2.5" fill="#94a3b8"/>
      <ellipse cx="7" cy="11" rx="3" ry="2" fill="#94a3b8"/>
    </svg>
  )
  if (s === 'cloudy' || s === 'fog') return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <ellipse cx="9" cy="8" rx="5" ry="3.5" fill="#94a3b8"/>
      <ellipse cx="6" cy="9.5" rx="4" ry="3" fill="#94a3b8"/>
    </svg>
  )
  if (s.includes('rain') || s.includes('shower') || s === 'drizzle') return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="6" rx="5.5" ry="3.5" fill="#475569"/>
      <path d="M4 10.5L3 13.5M7.5 10.5L6.5 13.5M11 10.5L10 13.5" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
  if (s.includes('thunder')) return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="5.5" rx="5.5" ry="3" fill="#475569"/>
      <path d="M8.5 8.5L6.5 12L8 12L7 15L10 10.5L8.5 10.5Z" fill="#fbbf24"/>
    </svg>
  )
  if (s.includes('snow') || s.includes('sleet')) return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="6" rx="5" ry="3.5" fill="#94a3b8"/>
      <circle cx="5" cy="11.5" r="1" fill="white" stroke="#94a3b8" strokeWidth="0.8"/>
      <circle cx="8" cy="12.5" r="1" fill="white" stroke="#94a3b8" strokeWidth="0.8"/>
      <circle cx="11" cy="11.5" r="1" fill="white" stroke="#94a3b8" strokeWidth="0.8"/>
    </svg>
  )
  return null
}

function HourlyBars({ hourly }: { hourly: any[] }) {
  const [hov, setHov] = useState<number | null>(null)
  const maxW = Math.max(...hourly.map(h => h.wave), 0.1)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <div style={{ fontSize: 12, color: '#6b8fa3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bølgehøyde per time</div>
        {hov !== null && (
          <div style={{ fontSize: 13, fontWeight: 500, color: SCORE_COLORS[Math.min(Math.floor(hourly[hov].wave * 2), 5)] }}>
            {hourly[hov].time} · {hourly[hov].wave.toFixed(1)}m · {hourly[hov].wind.toFixed(1)} m/s
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
        {hourly.map((h, i) => {
          const pct = Math.max((h.wave / maxW) * 100, 4)
          const isHov = hov === i
          const color = h.wave < 0.5 ? '#16a34a' : h.wave < 1.5 ? '#65a30d' : h.wave < 2.5 ? '#ca8a04' : '#dc2626'
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end', cursor: 'pointer' }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
              <div style={{ opacity: hov === null || isHov ? 1 : 0.4, transition: '0.15s', marginBottom: 1 }}>
                <WeatherIcon symbol={h.symbol} size={13} />
              </div>
              <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: color, height: `${pct.toFixed(0)}%`, minHeight: 3,
                opacity: hov === null || isHov ? 1 : 0.4, transform: isHov ? 'scaleY(1.06)' : 'scaleY(1)', transformOrigin: 'bottom', transition: '0.15s' }} />
              <div style={{ fontSize: 11, color: isHov ? '#0a2a3d' : '#6b8fa3', fontWeight: isHov ? 500 : 400 }}>{h.time.slice(0, 5)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DayCard({ day, profile }: { day: any; profile: string }) {
  const r = day.rating
  const [oppsummering, setOppsummering] = React.useState<string | null>(null)
  const [oppLoading, setOppLoading] = React.useState(false)

  React.useEffect(() => {
    setOppsummering(null)
    setOppLoading(true)
    fetch('/api/min-side/oppsummering', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lokasjon: day.dateLabel, profile: profile || null, day }),
    })
      .then(res => res.json())
      .then(d => { if (d.tekst) setOppsummering(d.tekst) })
      .catch(() => {})
      .finally(() => setOppLoading(false))
  }, [day, profile])

  return (
    <div style={{ background: '#f8fbfc', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#0a2a3d', textTransform: 'capitalize' }}>{day.dateLabel}</div>
        <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 11px', borderRadius: 100, background: r.farge + '20', color: r.farge }}>{r.tekst}</span>
      </div>

      {/* AI-oppsummering */}
      {oppLoading && (
        <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', marginBottom: 12, padding: '10px 12px', background: 'white', borderRadius: 8 }}>
          Henter oppsummering...
        </div>
      )}
      {oppsummering && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: '0 0 4px', fontSize: 13, color: '#334155', lineHeight: 1.65, background: 'white', borderRadius: 8, padding: '10px 12px', borderLeft: `3px solid ${r.farge}` }}>
            {oppsummering}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 4 }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <circle cx="5.5" cy="5.5" r="4.5" stroke="#94a3b8" strokeWidth="1" fill="none"/>
              <path d="M3.5 5.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" fill="none"/>
              <circle cx="5.5" cy="3.5" r=".5" fill="#94a3b8"/>
            </svg>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Generert av AI — kan inneholde feil. Sjekk alltid offisielle farevarsler.</span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 6, marginBottom: 12 }}>
        {[
          { label: 'Bølger snitt', val: `${day.avgWave.toFixed(1)}m`, sub: `maks ${day.maxWave.toFixed(1)}m` },
          { label: 'Vind', val: `${day.windNow.toFixed(1)} m/s`, sub: day.windDesc },
          { label: 'Periode / retning', val: `${day.avgPeriod.toFixed(0)}s`, sub: day.waveDir },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#6b8fa3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 300, color: '#0a2a3d' }}>{s.val}</div>
            <div style={{ fontSize: 12, color: '#6b8fa3', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <HourlyBars hourly={day.hourly} />
      <div>
        {[
          { label: 'Soloppgang', val: day.sunrise ?? '—', sun: true },
          { label: 'Solnedgang', val: day.sunset ?? '—', sun: true },
          { label: 'Lufttemperatur', val: `${Math.round(day.temp)}°C` },
          ...(day.seaTemp !== null ? [{ label: 'Sjøtemperatur', val: `${day.seaTemp.toFixed(1)}°C` }] : []),
          ...(day.totalPrecip > 0 ? [{ label: 'Nedbør', val: `${day.totalPrecip} mm`, rain: true }] : []),
        ].map((row: any, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: i === 0 ? 'none' : '0.5px solid rgba(10,42,61,0.07)' }}>
            <span style={{ fontSize: 13, color: '#6b8fa3', display: 'flex', alignItems: 'center', gap: 5 }}>
              {row.sun && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="2.5" fill="#f59e0b"/>
                  {[0,45,90,135,180,225,270,315].map((deg, j) => (
                    <line key={j}
                      x1={6 + Math.cos(deg*Math.PI/180)*3.5} y1={6 + Math.sin(deg*Math.PI/180)*3.5}
                      x2={6 + Math.cos(deg*Math.PI/180)*4.8} y2={6 + Math.sin(deg*Math.PI/180)*4.8}
                      stroke="#f59e0b" strokeWidth="1" strokeLinecap="round"/>
                  ))}
                </svg>
              )}
              {row.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: row.green ? '#16a34a' : row.sun ? '#d97706' : row.rain ? '#3b82f6' : '#0a2a3d' }}>{row.val}</span>
          </div>
        ))}
      </div>

      {/* Profilspesifikke tips */}
      {profile && (() => {
        const tips = profileTips(profile, day)
        if (!tips.items.length) return null
        return (
          <div style={{ marginTop: 10, background: 'white', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, color: '#6b8fa3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {({'surfer':'Surfer-tips','seiler':'Seiler-tips','fisker':'Fisker-tips','fridykker':'Dykker-tips','kajakk':'Padler-tips'}[profile]||'Tips')}
            </div>
            {tips.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderTop: i === 0 ? 'none' : '0.5px solid rgba(10,42,61,0.06)' }}>
                <span style={{ fontSize: 13, color: '#6b8fa3' }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: item.highlight ? '#16a34a' : '#0a2a3d', textAlign: 'right', maxWidth: '60%' }}>{item.value}</span>
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}

export default function RapportTab({ locs, subEmail }: { locs: Loc[]; subEmail: string }) {
  const [locId, setLocId] = useState(locs[0]?.id ?? '')
  const [days, setDays] = useState('1')
  const [profile, setProfile] = useState('')
  const [loading, setLoading] = useState(false)
  const [rapport, setRapport] = useState<any[] | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [flerdagOppsummering, setFlerdagOppsummering] = useState<string | null>(null)

  // Auto-scroll: når rapport blir generert på mobil, scroll til toppen av resultatet
  const resultRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (rapport && resultRef.current && window.innerWidth < 800) {
      // Liten delay så DOM rekker å oppdatere
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [rapport])
  const [flerdagLoading, setFlerdagLoading] = useState(false)

  const selectedLoc = locs.find(l => l.id === locId)

  async function generer() {
    if (!selectedLoc) return
    setLoading(true); setRapport(null); setEmailSent(false)
    setFlerdagOppsummering(null)
    try {
      const r = await fetch(`/api/min-side/rapport?lat=${selectedLoc.lat}&lon=${selectedLoc.lon}&days=${days}&profile=${profile}`)
      const d = await r.json()
      if (d.ok) {
        setRapport(d.days)
        // Hent flerdag-oppsummering hvis mer enn 1 dag
        if (parseInt(days) > 1) {
          setFlerdagLoading(true)
          fetch('/api/min-side/oppsummering-flerdag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lokasjon: selectedLoc.name, profile: profile || null, days: d.days }),
          })
            .then(res => res.json())
            .then(od => { if (od.tekst) setFlerdagOppsummering(od.tekst) })
            .catch(() => {})
            .finally(() => setFlerdagLoading(false))
        }
      }
    } finally { setLoading(false) }
  }

  async function sendEmail() {
    if (!rapport || !selectedLoc) return
    setSendingEmail(true)
    try {
      await fetch('/api/min-side/rapport-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail, locName: selectedLoc.name, profile, days: rapport }),
      })
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 3000)
    } finally { setSendingEmail(false) }
  }

  function printRapport() {
    window.print()
  }

  const S = {
    inp: { width: '100%', padding: '8px 12px', borderRadius: 8, border: '0.5px solid rgba(10,42,61,0.12)', background: '#f8fbfc', fontSize: 14, color: '#0a2a3d', outline: 'none' } as React.CSSProperties,
    btnP: { background: '#0a2a3d', color: 'white', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
    btnG: { background: '#f8fbfc', color: '#0a2a3d', border: '0.5px solid rgba(10,42,61,0.12)', borderRadius: 8, padding: '9px 12px', fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 } as React.CSSProperties,
  }

  return (
    <div className="bv-rapport-wrap">
      <style>{`
        .bv-rapport-wrap { display: flex; flex-direction: column; gap: 0; }
        .bv-rapport-config { order: 1; }
        .bv-rapport-result { order: 2; }
        @media (max-width: 799px) {
          /* På mobil: rapport over, konfig under (resultatet er det viktigste) */
          .bv-rapport-config { order: 2; margin-top: 12px; }
          .bv-rapport-result { order: 1; }
        }
      `}</style>
      {/* Konfigurasjon */}
      <div className="bv-rapport-config" style={{ background: '#f8fbfc', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="#1a6080" strokeWidth="1.2" fill="none"/><path d="M1 5.5h12" stroke="#1a6080" strokeWidth="1.2"/><path d="M4.5 1v2M9.5 1v2" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#0a2a3d' }}>Generer rapport</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b8fa3', marginBottom: 4 }}>Lokasjon</div>
            <BvSelect
              value={locId}
              onChange={setLocId}
              options={locs.map(l => ({ value: l.id, label: l.name }))}
              ariaLabel="Lokasjon"
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b8fa3', marginBottom: 4 }}>Periode</div>
            <BvSelect
              value={days}
              onChange={setDays}
              options={PERIODER}
              ariaLabel="Periode"
            />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#6b8fa3', marginBottom: 4 }}>Aktivitetsprofil</div>
          <BvSelect
            value={profile}
            onChange={setProfile}
            options={PROFILER}
            ariaLabel="Aktivitetsprofil"
          />
        </div>
        <button style={{ ...S.btnP, width: '100%', opacity: loading ? 0.6 : 1 }} onClick={generer} disabled={loading || !selectedLoc}>
          {loading ? 'Henter data...' : 'Generer rapport'}
        </button>
      </div>

      {/* Rapport */}
      {rapport && (
        <div className="bv-rapport-result" ref={resultRef}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 13, color: '#6b8fa3', flex: '1 1 auto', minWidth: 0 }}>{selectedLoc?.name} · {PROFILER.find(p => p.value === profile)?.label || 'Standard'}</div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button style={{ ...S.btnG, whiteSpace: 'nowrap' }} onClick={printRapport}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 4.5V2h7v2.5M2 4.5h9a1 1 0 0 1 1 1v4H10v2H3v-2H1v-4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.1" fill="none"/></svg>
                Last ned PDF
              </button>
              <button style={{ ...S.btnG, opacity: sendingEmail ? 0.6 : 1, color: emailSent ? '#16a34a' : '#0a2a3d', whiteSpace: 'nowrap' }} onClick={sendEmail} disabled={sendingEmail}>
                {emailSent ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7l3.5 3.5L11 4" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Sendt!
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 2h11l-5 5L1 2z" stroke="currentColor" strokeWidth="1.1" fill="none"/><path d="M1 2v7.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V2" stroke="currentColor" strokeWidth="1.1" fill="none"/></svg>
                    Send til e-post
                  </>
                )}
              </button>
            </div>
          </div>
          {/* Flerdag-oppsummering */}
          {parseInt(days) > 1 && (flerdagLoading || flerdagOppsummering) && (
            <div style={{ background: '#f0f8fc', border: '1px solid rgba(26,96,128,0.15)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#4da8cc', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>
                Oversikt — {PERIODER.find(p => p.value === days)?.label}
              </div>
              {flerdagLoading ? (
                <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>Analyserer perioden...</div>
              ) : (
                <>
                  <p style={{ margin: '0 0 8px', fontSize: 13, color: '#334155', lineHeight: 1.65 }}>{flerdagOppsummering}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <circle cx="5.5" cy="5.5" r="4.5" stroke="#94a3b8" strokeWidth="1" fill="none"/>
                      <path d="M3.5 5.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" fill="none"/>
                      <circle cx="5.5" cy="3.5" r=".5" fill="#94a3b8"/>
                    </svg>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>Generert av AI — kan inneholde feil. Sjekk alltid offisielle farevarsler.</span>
                  </div>
                </>
              )}
            </div>
          )}
          {rapport.map((day, i) => <DayCard key={i} day={day} profile={profile} />)}
          <button style={{ ...S.btnG, width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => setRapport(null)}>
            Ny rapport
          </button>
        </div>
      )}

      {locs.length === 0 && (
        <p style={{ color: '#6b8fa3', fontSize: 14, textAlign: 'center', padding: '1rem 0' }}>
          Legg til lokasjoner i «Lokasjoner»-fanen for å generere rapporter.
        </p>
      )}
    </div>
  )
}
