'use client'
import React, { useEffect, useState, useCallback } from 'react'

type Loc = { id: string; name: string; lat: number; lon: number; profile?: string | null }

type WeatherData = {
  windNow: number; windDir: number; windMax: number
  temp: number; seaTemp: number | null
  avgWave: number; maxWave: number; avgPeriod: number; waveDir: number
  score: number; hourly: HourlyPoint[]
}

type HourlyPoint = {
  time: string; wave: number; waveDir: number; period: number
  wind: number; windDir: number; temp: number; symbol: string
}

const SCORE_COLORS = ['#16a34a','#16a34a','#65a30d','#ca8a04','#ea580c','#dc2626']
const SCORE_LABELS = ['Rolig hav','Stille hav','Lett krusning','Moderat','Kuling','Farevarsel']

function ratingScore(wave: number, wind: number) {
  if (wind >= 24.5 || wave >= 4.0) return 5
  if (wind >= 20.8 || wave >= 3.0) return 4
  if (wind >= 13.9 || wave >= 2.0) return 3
  if (wind >= 10.8 || wave >= 1.5) return 2
  if (wind >= 8.0  || wave >= 1.0) return 1
  return 0
}

function dir(deg: number) {
  const d = ['N','NNO','NO','ONO','O','OSO','SO','SSO','S','SSV','SV','VSV','V','VNV','NV','NNV']
  return d[Math.round(deg / 22.5) % 16]
}

function windDesc(s: number) {
  if (s < 2) return 'Stille'; if (s < 4) return 'Svak vind'
  if (s < 8) return 'Lett bris'; if (s < 11) return 'Laber bris'
  if (s < 14) return 'Frisk bris'; if (s < 17) return 'Liten kuling'
  return 'Kuling+'
}

function bestTime(hourly: HourlyPoint[]) {
  if (!hourly.length) return '—'
  const best = hourly.reduce((b, h) =>
    ratingScore(h.wave, h.wind) < ratingScore(b.wave, b.wind) ? h : b, hourly[0])
  const s = ratingScore(best.wave, best.wind)
  if (s <= 1) return `${best.time} — roligst`
  if (s <= 2) return `${best.time} — akseptabelt`
  return 'Krevende hele dagen'
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const today = new Date().toISOString().slice(0, 10)
  const tLat = Math.round(lat * 10000) / 10000
  const tLon = Math.round(lon * 10000) / 10000

  // met.no via vår proxy (TOS-compliant)
  // Open-Meteo direkte fra klient (tillatt per deres vilkår)
  const [marineRes, metRes, sstRes] = await Promise.all([
    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${tLat}&longitude=${tLon}&hourly=wave_height,wave_direction,wave_period&current=wave_height,wave_period,wave_direction&timezone=Europe/Oslo&forecast_days=1`).catch(() => null),
    fetch(`/api/varsel?lat=${tLat}&lon=${tLon}`),
    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${tLat}&longitude=${tLon}&current=sea_surface_temperature&timezone=Europe/Oslo`).catch(() => null),
  ])

  const [marine, met, sst] = await Promise.all([
    marineRes?.ok ? marineRes.json() : Promise.resolve({}),
    metRes.json(),
    sstRes?.ok ? sstRes.json() : Promise.resolve({}),
  ])

  const hours: string[] = marine.hourly?.time ?? []
  const wH: number[] = marine.hourly?.wave_height ?? []
  const wD: number[] = marine.hourly?.wave_direction ?? []
  const wP: number[] = marine.hourly?.wave_period ?? []
  const ts: any[] = met.properties?.timeseries ?? []

  const keyHours = [6, 9, 12, 15, 18, 21]
  const hourly: HourlyPoint[] = keyHours.map(hr => {
    const idx = hours.findIndex(t => t.startsWith(`${today}T${String(hr).padStart(2, '0')}:00`))
    const mi = ts.findIndex(t => t.time?.startsWith(`${today}T${String(hr).padStart(2, '0')}:`))
    return {
      time: `${String(hr).padStart(2, '0')}:00`,
      wave: idx >= 0 ? (wH[idx] ?? 0) : 0,
      waveDir: idx >= 0 ? (wD[idx] ?? 0) : 0,
      period: idx >= 0 ? (wP[idx] ?? 0) : 0,
      wind: mi >= 0 ? (ts[mi]?.data?.instant?.details?.wind_speed ?? 0) : 0,
      windDir: mi >= 0 ? (ts[mi]?.data?.instant?.details?.wind_from_direction ?? 0) : 0,
      temp: mi >= 0 ? (ts[mi]?.data?.instant?.details?.air_temperature ?? 0) : 0,
      symbol: mi >= 0 ? (ts[mi]?.data?.next_1_hours?.summary?.symbol_code ?? ts[mi]?.data?.next_6_hours?.summary?.symbol_code ?? '') : '',
    }
  })

  const now = ts[0]
  const windNow = now?.data?.instant?.details?.wind_speed ?? 0
  const windDir = now?.data?.instant?.details?.wind_from_direction ?? 0
  const temp = now?.data?.instant?.details?.air_temperature ?? 0
  const maxWind = Math.max(...ts.slice(0, 24).map(t => t?.data?.instant?.details?.wind_speed ?? 0))

  const dayIdx = hours.map((t, i) => ({ t, i })).filter(({ t }) => {
    const h = new Date(t).getHours()
    return t.startsWith(today) && h >= 6 && h <= 20
  })

  const avgWave = dayIdx.reduce((s, { i }) => s + (wH[i] ?? 0), 0) / (dayIdx.length || 1)
  const maxWave = Math.max(0, ...dayIdx.map(({ i }) => wH[i] ?? 0))
  const avgPeriod = dayIdx.reduce((s, { i }) => s + (wP[i] ?? 0), 0) / (dayIdx.length || 1)
  const midI = dayIdx[Math.floor(dayIdx.length / 2)]?.i ?? 0
  const seaTemp = sst.current?.sea_surface_temperature ?? null
  const score = ratingScore(avgWave, maxWind)

  return { windNow, windDir, windMax: maxWind, temp, seaTemp, avgWave, maxWave, avgPeriod, waveDir: wD[midI] ?? 0, score, hourly }
}

function WaveAnimation() {
  return (
    <svg viewBox="0 0 400 50" preserveAspectRatio="none" style={{ width: '100%', height: 40, display: 'block', marginBottom: 12 }}>
      {[0, 1, 2].map(k => (
        <path key={k}
          d={`M ${k * -133} 28 Q ${k * -133 + 66} ${18 + k * 4} ${k * -133 + 133} 28 Q ${k * -133 + 200} ${38 - k * 3} ${k * -133 + 266} 28 Q ${k * -133 + 333} ${18 + k * 2} ${k * -133 + 400} 28 Q ${k * -133 + 466} ${38 - k * 4} ${k * -133 + 533} 28`}
          fill="none" stroke="#1a6080" strokeWidth={1.5 - k * 0.4} opacity={0.35 - k * 0.1}>
          <animateTransform attributeName="transform" type="translate" from="0 0" to={`${133 + k * 20} 0`} dur={`${3 + k * 1.5}s`} repeatCount="indefinite" />
        </path>
      ))}
      <path d="M 0 40 Q 100 20 200 35 Q 300 50 400 30 L 400 50 L 0 50 Z" fill="#1a6080" opacity="0.06" />
    </svg>
  )
}

function WeatherIcon({ symbol, size = 16 }: { symbol: string; size?: number }) {
  const s = symbol.replace('_night','').replace('_day','').replace('_polartwilight','')
  if (!s) return null
  // Solrik
  if (s === 'clearsky') return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" fill="#f59e0b"/>
      {[0,45,90,135,180,225,270,315].map((deg,i)=>(
        <line key={i} x1={8+Math.cos(deg*Math.PI/180)*4.2} y1={8+Math.sin(deg*Math.PI/180)*4.2}
          x2={8+Math.cos(deg*Math.PI/180)*5.5} y2={8+Math.sin(deg*Math.PI/180)*5.5}
          stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round"/>
      ))}
    </svg>
  )
  // Delvis skyet med sol
  if (s === 'fair' || s === 'partlycloudy') return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="6" r="2.5" fill="#f59e0b"/>
      {[0,60,120,180,240,300].map((deg,i)=>(
        <line key={i} x1={6+Math.cos(deg*Math.PI/180)*3.3} y1={6+Math.sin(deg*Math.PI/180)*3.3}
          x2={6+Math.cos(deg*Math.PI/180)*4.3} y2={6+Math.sin(deg*Math.PI/180)*4.3}
          stroke="#f59e0b" strokeWidth="1.1" strokeLinecap="round"/>
      ))}
      <ellipse cx="9.5" cy="10" rx="4" ry="2.5" fill="#94a3b8"/>
      <ellipse cx="7" cy="11" rx="3" ry="2" fill="#94a3b8"/>
    </svg>
  )
  // Skyet
  if (s === 'cloudy' || s === 'fog') return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <ellipse cx="9" cy="8" rx="5" ry="3.5" fill="#94a3b8"/>
      <ellipse cx="6" cy="9.5" rx="4" ry="3" fill="#94a3b8"/>
      <ellipse cx="11" cy="9.5" rx="3" ry="2.5" fill="#94a3b8"/>
    </svg>
  )
  // Lett regn
  if (s.includes('lightrain') || s === 'drizzle') return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="6.5" rx="5" ry="3.5" fill="#64748b"/>
      <path d="M5 11 L4.5 13" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M8 11 L7.5 13" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M11 11 L10.5 13" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
  // Regn / kraftig regn
  if (s.includes('rain') || s.includes('shower')) return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="6" rx="5.5" ry="3.5" fill="#475569"/>
      <path d="M4 10.5 L3 13.5" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M7.5 10.5 L6.5 13.5" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M11 10.5 L10 13.5" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
  // Torden
  if (s.includes('thunder')) return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="5.5" rx="5.5" ry="3" fill="#475569"/>
      <path d="M8.5 8.5 L6.5 12 L8 12 L7 15 L10 10.5 L8.5 10.5 Z" fill="#fbbf24"/>
    </svg>
  )
  // Snø / sludd
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

function HourlyBars({ hourly }: { hourly: HourlyPoint[] }) {
  const [hovered, setHovered] = React.useState<number | null>(null)
  const maxWave = Math.max(...hourly.map(h => h.wave), 0.1)
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: '#6b8fa3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bølgehøyde per time i dag</div>
        {hovered !== null && (
          <div style={{ fontSize: 11, fontWeight: 500, color: SCORE_COLORS[ratingScore(hourly[hovered].wave, hourly[hovered].wind)] }}>
            {hourly[hovered].time.slice(0,5)} · {hourly[hovered].wave.toFixed(1)}m · {hourly[hovered].wind.toFixed(1)} m/s
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 90 }}>
        {hourly.map((h, i) => {
          const s = ratingScore(h.wave, h.wind)
          const color = SCORE_COLORS[s]
          const pct = Math.max((h.wave / maxWave) * 100, 4)
          const isHov = hovered === i
          return (
            <div key={i}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{ opacity: hovered === null || isHov ? 1 : 0.45, transition: 'opacity 0.15s', marginBottom: 1 }}>
                <WeatherIcon symbol={h.symbol} size={14} />
              </div>
              <div style={{
                width: '100%', borderRadius: '3px 3px 0 0',
                background: color,
                height: `${pct.toFixed(0)}%`, minHeight: 4,
                opacity: hovered === null || isHov ? 1 : 0.45,
                transform: isHov ? 'scaleY(1.06)' : 'scaleY(1)',
                transformOrigin: 'bottom',
                transition: 'opacity 0.15s, transform 0.15s',
              }} />
              <div style={{ fontSize: 9, color: isHov ? '#0a2a3d' : '#6b8fa3', fontWeight: isHov ? 500 : 400, transition: 'color 0.15s' }}>
                {h.time.slice(0, 5)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export type LokasjonPanelClickPayload = {
  location: Loc
  weather: WeatherData | null
  summary: string | null
  scoreColor: string
  scoreLabel: string
}

export default function LokasjonPanel({
  locations,
  onLocationClick,
}: {
  locations: Loc[]
  onLocationClick?: (payload: LokasjonPanelClickPayload) => void
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  const [data, setData] = useState<Record<number, WeatherData | 'loading' | 'error'>>({})
  const [oppsummering, setOppsummering] = useState<Record<number, string>>({})

  const loaded = React.useRef<Set<number>>(new Set())

  const load = useCallback(async (i: number) => {
    if (loaded.current.has(i)) return
    loaded.current.add(i)
    setData(prev => ({ ...prev, [i]: 'loading' }))
    try {
      const d = await fetchWeather(locations[i].lat, locations[i].lon)
      setData(prev => ({ ...prev, [i]: d }))

      // Hent AI-oppsummering etter at væren er lastet
      try {
        const rapportRes = await fetch(`/api/min-side/rapport?lat=${locations[i].lat}&lon=${locations[i].lon}&profile=${locations[i].profile || ''}&days=1`)
        const rapportData = await rapportRes.json()
        const day = rapportData.days?.[0]
        if (day) {
          const oppRes = await fetch('/api/min-side/oppsummering', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lokasjon: locations[i].name, profile: locations[i].profile || null, day }),
          })
          const oppData = await oppRes.json()
          if (oppData.tekst) setOppsummering(prev => ({ ...prev, [i]: oppData.tekst }))
        }
      } catch (e) { console.warn('Oppsummering feilet', e) }

    } catch(e) {
      console.error('fetchWeather feil for', locations[i].name, e)
      setData(prev => ({ ...prev, [i]: 'error' }))
    }
  }, [locations])

  useEffect(() => {
    locations.forEach((_, i) => load(i))
  }, [locations, load])

  const toggle = (i: number) => {
    const loc = locations[i]
    const d = data[i]
    const weather = d && d !== 'loading' && d !== 'error' ? (d as WeatherData) : null
    const score = weather ? weather.score : -1
    const scoreColor = score >= 0 ? SCORE_COLORS[score] : '#94a3b8'
    const scoreLabel = score >= 0 ? SCORE_LABELS[score] : 'Laster...'

    // Hvis callback er satt, bruk den i stedet for inline-expand
    if (onLocationClick) {
      onLocationClick({
        location: loc,
        weather,
        summary: oppsummering[i] || null,
        scoreColor,
        scoreLabel,
      })
      load(i) // sørg for at data er lastet
      return
    }

    setActiveIdx(prev => prev === i ? null : i)
    load(i)
  }

  const S = {
    card: { background: 'white', border: '0.5px solid rgba(10,42,61,0.08)', borderRadius: 14, overflow: 'hidden' as const, marginBottom: 10 },
    row: (active: boolean): React.CSSProperties => ({
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.9rem 1.1rem', cursor: 'pointer',
      borderBottom: active ? '0.5px solid rgba(10,42,61,0.08)' : 'none',
      background: active ? '#f8fbfc' : 'white',
    }),
    panel: { padding: '1.1rem 1.2rem' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginBottom: '1rem' },
    stat: { background: '#f8fbfc', borderRadius: 8, padding: '9px 10px', textAlign: 'center' as const },
    detailRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '0.5px solid rgba(10,42,61,0.06)' } as React.CSSProperties,
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '0.8rem' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'bvPulse 1.5s ease-in-out infinite' }} />
        <span style={{ fontSize: 12, color: '#6b8fa3' }}>Live sjødata — klikk en lokasjon for detaljer</span>
      </div>
      <style>{`@keyframes bvPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

      {locations.map((loc, i) => {
        const d = data[i]
        const score = d && d !== 'loading' && d !== 'error' ? (d as WeatherData).score : -1
        const color = score >= 0 ? SCORE_COLORS[score] : '#e2e8f0'
        const label = score >= 0 ? SCORE_LABELS[score] : (d === 'loading' || d === undefined ? 'Laster...' : '—')
        const isActive = activeIdx === i
        const wd = isActive && d && d !== 'loading' && d !== 'error' ? d as WeatherData : null

        return (
          <div key={loc.id} style={S.card}>
            <div style={S.row(isActive)} onClick={() => toggle(i)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#e8f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.8 1 3 2.8 3 5C3 7.8 7 13 7 13C7 13 11 7.8 11 5C11 2.8 9.2 1 7 1Z" stroke="#1a6080" strokeWidth="1.2" fill="none"/><circle cx="7" cy="5" r="1.3" fill="#1a6080"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#0a2a3d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.name}</div>
                  <div style={{ fontSize: 11, color: '#6b8fa3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.lat.toFixed(4)}°N · {loc.lon.toFixed(4)}°E</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color, whiteSpace: 'nowrap' }}>{label}</span>
                </div>
                <svg style={{ color: '#94a3b8', transform: (onLocationClick ? 'none' : (isActive ? 'rotate(90deg)' : 'none')), transition: 'transform 0.2s', flexShrink: 0 }} width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>

            {isActive && (
              <div style={S.panel}>
                {d === 'loading' && <div style={{ textAlign: 'center', color: '#6b8fa3', fontSize: 13, padding: '1rem 0' }}>Henter data...</div>}
                {d === 'error' && <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 13, padding: '1rem 0' }}>Kunne ikke hente data</div>}
                {wd && (<>
                  {oppsummering[i] && (
                    <p style={{ margin: '0 0 1rem', fontSize: 13, color: '#334155', lineHeight: 1.65, background: '#f8fafc', borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${color}` }}>
                      {oppsummering[i]}
                    </p>
                  )}
                  <div style={S.statGrid}>
                    {[
                      { key:'wave', label:'Bølger snitt', main: `${wd.avgWave.toFixed(1)}`, unit:'m', sub:`maks ${wd.maxWave.toFixed(1)}m`, detail:`Periode ${wd.avgPeriod.toFixed(0)}s · fra ${dir(wd.waveDir)}` },
                      { key:'wind', label:'Vind nå', main: `${wd.windNow.toFixed(1)}`, unit:'m/s', sub:windDesc(wd.windNow), detail:`Maks ${wd.windMax.toFixed(1)} m/s · fra ${dir(wd.windDir)}` },
                      { key:'temp', label:'Luft / sjø', main: `${Math.round(wd.temp)}`, unit:'°', sub: wd.seaTemp !== null ? `Sjø ${wd.seaTemp.toFixed(1)}°` : '—', detail: wd.seaTemp !== null ? `Lufttemp ${Math.round(wd.temp)}° · sjøtemp ${wd.seaTemp.toFixed(1)}°` : `Lufttemperatur ${Math.round(wd.temp)}°` },
                    ].map(stat => (
                      <div key={stat.key}
                        style={{ ...S.stat, cursor:'default', transition:'background 0.15s, transform 0.15s',
                          background: hoveredStat===stat.key ? '#e8f4f8' : '#f8fbfc',
                          transform: hoveredStat===stat.key ? 'translateY(-2px)' : 'none',
                        }}
                        onMouseEnter={() => setHoveredStat(stat.key)}
                        onMouseLeave={() => setHoveredStat(null)}
                      >
                        <div style={{ fontSize: 10, color: hoveredStat===stat.key ? '#1a6080' : '#6b8fa3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3, transition:'color 0.15s' }}>{stat.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 300, color: '#0a2a3d', lineHeight: 1 }}>{stat.main}<span style={{ fontSize: 12, color: '#6b8fa3' }}>{stat.unit}</span></div>
                        <div style={{ fontSize: 11, color: hoveredStat===stat.key ? '#1a6080' : '#6b8fa3', marginTop: 2, transition:'all 0.15s' }}>
                          {hoveredStat===stat.key ? stat.detail : stat.sub}
                        </div>
                      </div>
                    ))}
                  </div>

                  <HourlyBars hourly={wd.hourly} />
                  <WaveAnimation />

                  <div>
                    {[
                      { icon: '~', label: 'Bølgeretning', val: `${dir(wd.waveDir)} · ${wd.avgPeriod.toFixed(0)}s periode` },
                      { icon: '→', label: 'Vind', val: `${dir(wd.windDir)} · maks ${wd.windMax.toFixed(1)} m/s` },
                      { icon: '◎', label: 'Best tidspunkt', val: bestTime(wd.hourly), green: true },
                    ].map((row, j) => (
                      <div key={j} style={{ ...S.detailRow, ...(j === 0 ? { borderTop: 'none' } : {}) }}>
                        <span style={{ fontSize: 13, color: '#6b8fa3' }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: row.green ? '#16a34a' : '#0a2a3d' }}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                </>)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
