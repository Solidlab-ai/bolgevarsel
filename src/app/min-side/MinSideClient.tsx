'use client'
import React, { useState, useEffect, useRef } from 'react'
import LokasjonPanel from '@/components/LokasjonPanel'
import LeggTilLokasjon from '@/components/LeggTilLokasjon'
import RapportTab from '@/components/RapportTab'
import SosButton from '@/components/SosButton'
import SosCountdownModal from '@/components/SosCountdownModal'
import BvSelect from '@/components/BvSelect'
import BvSheet from '@/components/BvSheet'
import { KvitteringerSeksjon } from './KvitteringerSeksjon'
import { planNavn, planPris } from '@/lib/plans'

const S = {
  page: { minHeight:'100vh', background:'#e8f4f8', fontFamily:'DM Sans, sans-serif' } as React.CSSProperties,
  nav: { padding:'1.2rem 2rem', borderBottom:'1px solid rgba(10,42,61,0.08)', background:'rgba(232,244,248,0.95)', position:'sticky' as const, top:0, zIndex:100 },
  logo: { fontFamily:"'Fraunces', Georgia, serif", fontSize:'1.3rem', fontWeight:600, color:'#0a2a3d', textDecoration:'none' } as React.CSSProperties,
  wrap: { maxWidth:1160, margin:'0 auto', padding:'2.5rem 2rem' },
  card: { background:'white', borderRadius:20, padding:'2rem', border:'1px solid rgba(10,42,61,0.07)', marginBottom:'1.2rem', boxShadow:'0 2px 12px rgba(10,42,61,0.06)' } as React.CSSProperties,
  sTitle: { fontFamily:"'Fraunces', Georgia, serif", fontSize:'1.3rem', fontWeight:400, color:'#0a2a3d', marginBottom:'1rem', paddingBottom:'0.6rem', borderBottom:'1px solid rgba(10,42,61,0.07)' } as React.CSSProperties,
  inp: { width:'100%', padding:'0.8rem 1.1rem', borderRadius:100, border:'1.5px solid rgba(10,42,61,0.12)', background:'#f8fbfc', fontSize:'0.95rem', color:'#0a2a3d', outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const },
  btnPrimary: { background:'#0a2a3d', color:'white', padding:'0.75rem 1.3rem', borderRadius:100, border:'none', cursor:'pointer', fontSize:'0.92rem', fontWeight:500 } as React.CSSProperties,
  btnDanger: { background:'#fee2e2', color:'#ef4444', padding:'0.55rem 1rem', borderRadius:100, border:'none', cursor:'pointer', fontSize:'0.85rem', fontWeight:500 } as React.CSSProperties,
  btnGhost: { background:'#f0f8fc', color:'#0a2a3d', padding:'0.55rem 1rem', borderRadius:100, border:'none', cursor:'pointer', fontSize:'0.85rem', fontWeight:500 } as React.CSSProperties,
  badge: (plan: string) => ({ background: plan==='sikkerhet'?'#fce7f3':plan==='pro'?'#fef3c7':plan==='familie'?'#dbeafe':'#e8f4f8', color: plan==='sikkerhet'?'#9d174d':plan==='pro'?'#92400e':plan==='familie'?'#1d4ed8':'#0a2a3d', padding:'7px 18px', borderRadius:100, fontSize:'0.85rem', fontWeight:500 }) as React.CSSProperties,
  tag: (active: boolean) => ({ background: active?'#dcfce7':'#f1f5f9', color: active?'#16a34a':'#64748b', padding:'2px 8px', borderRadius:100, fontSize:'0.75rem', fontWeight:500 }) as React.CSSProperties,
}

function BrandIllustration() {
  return (
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="loginSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8e8f5"/><stop offset="60%" stopColor="#e8f4f8"/><stop offset="100%" stopColor="#0a2a3d"/></linearGradient>
        <linearGradient id="loginSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a6080"/><stop offset="100%" stopColor="#071622"/></linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#loginSky)"/>
      <circle cx="520" cy="70" r="35" fill="#fff4e0" opacity="0.5"/>
      <circle cx="520" cy="70" r="22" fill="#ffd580" opacity="0.6"/>
      <circle cx="520" cy="70" r="13" fill="#ffbc40" opacity="0.8"/>
      <g opacity="0.6"><ellipse cx="80" cy="55" rx="55" ry="16" fill="white"/><ellipse cx="105" cy="42" rx="38" ry="14" fill="white"/><ellipse cx="58" cy="48" rx="32" ry="13" fill="white"/></g>
      <g opacity="0.4"><ellipse cx="320" cy="40" rx="45" ry="13" fill="white"/><ellipse cx="350" cy="30" rx="30" ry="11" fill="white"/></g>
      <path d="M0 160 L80 100 L160 140 L240 90 L320 130 L400 85 L480 125 L560 95 L600 115 L600 220 L0 220 Z" fill="#2a6a8a" opacity="0.2"/>
      <path d="M0 185 L100 130 L200 165 L300 115 L400 155 L500 120 L600 145 L600 230 L0 230 Z" fill="#1e5a7a" opacity="0.25"/>
      <ellipse cx="140" cy="210" rx="60" ry="16" fill="#2a5a3a" opacity="0.85"/>
      <path d="M90 210 Q120 194 140 190 Q160 194 190 210 Z" fill="#3a6a4a" opacity="0.9"/>
      <rect x="137" y="170" width="6" height="24" fill="#e8e0d0" rx="1"/>
      <rect x="134" y="168" width="11" height="5" fill="#cc3333" rx="1"/>
      <circle cx="140" cy="168" r="3" fill="#ffcc00" opacity="0.9"/>
      <g><line x1="440" y1="210" x2="440" y2="192" stroke="#8a7a6a" strokeWidth="1.4"/><path d="M440 210 L422 204 L440 194 Z" fill="rgba(255,255,255,0.9)"/><path d="M440 210 L456 204 L440 200 Z" fill="rgba(255,255,255,0.65)"/><path d="M426 213 Q440 217 454 213" fill="#5a4a3a"/></g>
      <path d="M0 220 Q75 210 150 220 Q225 230 300 218 Q375 206 450 220 Q525 234 600 218 L600 400 L0 400 Z" fill="url(#loginSea)"/>
      <g opacity="0.3">
        <path d="M-50 250 Q50 242 150 250 Q250 258 350 250 Q450 242 550 250 Q580 252 650 250" fill="none" stroke="white" strokeWidth="1.5"><animateTransform attributeName="transform" type="translate" from="0 0" to="100 0" dur="4s" repeatCount="indefinite"/></path>
        <path d="M-50 275 Q60 267 160 275 Q260 283 360 273 Q460 263 560 273 Q590 275 650 273" fill="none" stroke="white" strokeWidth="1"><animateTransform attributeName="transform" type="translate" from="0 0" to="-80 0" dur="5.5s" repeatCount="indefinite"/></path>
        <path d="M-50 310 Q70 302 170 310 Q270 318 370 308 Q470 298 570 308 Q595 310 650 308" fill="none" stroke="white" strokeWidth="0.8" opacity="0.6"><animateTransform attributeName="transform" type="translate" from="0 0" to="60 0" dur="7s" repeatCount="indefinite"/></path>
      </g>
    </svg>
  )
}

type Sub = {
  id: string
  email: string
  plan: string
  status: string
  send_time?: string
  payment_provider?: 'stripe' | 'vipps' | null
  phone_number?: string | null
  vipps_status?: string | null
  vipps_agreement_id?: string | null
  stripe_subscription_id?: string | null
  trial_ends_at?: string | null
  next_charge_due_at?: string | null
}
type Loc = { id:string; name:string; lat:number; lon:number }

// Tids-options grupperte etter tid på døgnet for raskere navigering
const SEND_TIME_OPTIONS = [
  // Morgen: 06:00 - 11:30
  { value: '06:00', label: '06:00', group: 'Morgen' },
  { value: '06:30', label: '06:30', group: 'Morgen' },
  { value: '07:00', label: '07:00', group: 'Morgen' },
  { value: '07:30', label: '07:30', group: 'Morgen' },
  { value: '08:00', label: '08:00', group: 'Morgen' },
  { value: '08:30', label: '08:30', group: 'Morgen' },
  { value: '09:00', label: '09:00', group: 'Morgen' },
  { value: '09:30', label: '09:30', group: 'Morgen' },
  { value: '10:00', label: '10:00', group: 'Morgen' },
  { value: '10:30', label: '10:30', group: 'Morgen' },
  { value: '11:00', label: '11:00', group: 'Morgen' },
  { value: '11:30', label: '11:30', group: 'Morgen' },
  // Dag: 12:00 - 17:30
  { value: '12:00', label: '12:00', group: 'Dag' },
  { value: '12:30', label: '12:30', group: 'Dag' },
  { value: '13:00', label: '13:00', group: 'Dag' },
  { value: '13:30', label: '13:30', group: 'Dag' },
  { value: '14:00', label: '14:00', group: 'Dag' },
  { value: '14:30', label: '14:30', group: 'Dag' },
  { value: '15:00', label: '15:00', group: 'Dag' },
  { value: '15:30', label: '15:30', group: 'Dag' },
  { value: '16:00', label: '16:00', group: 'Dag' },
  { value: '16:30', label: '16:30', group: 'Dag' },
  { value: '17:00', label: '17:00', group: 'Dag' },
  { value: '17:30', label: '17:30', group: 'Dag' },
  // Kveld: 18:00 - 23:30
  { value: '18:00', label: '18:00', group: 'Kveld' },
  { value: '18:30', label: '18:30', group: 'Kveld' },
  { value: '19:00', label: '19:00', group: 'Kveld' },
  { value: '19:30', label: '19:30', group: 'Kveld' },
  { value: '20:00', label: '20:00', group: 'Kveld' },
  { value: '20:30', label: '20:30', group: 'Kveld' },
  { value: '21:00', label: '21:00', group: 'Kveld' },
  { value: '21:30', label: '21:30', group: 'Kveld' },
  { value: '22:00', label: '22:00', group: 'Kveld' },
  { value: '22:30', label: '22:30', group: 'Kveld' },
  { value: '23:00', label: '23:00', group: 'Kveld' },
  { value: '23:30', label: '23:30', group: 'Kveld' },
  // Natt: 00:00 - 05:30
  { value: '00:00', label: '00:00', group: 'Natt' },
  { value: '00:30', label: '00:30', group: 'Natt' },
  { value: '01:00', label: '01:00', group: 'Natt' },
  { value: '01:30', label: '01:30', group: 'Natt' },
  { value: '02:00', label: '02:00', group: 'Natt' },
  { value: '02:30', label: '02:30', group: 'Natt' },
  { value: '03:00', label: '03:00', group: 'Natt' },
  { value: '03:30', label: '03:30', group: 'Natt' },
  { value: '04:00', label: '04:00', group: 'Natt' },
  { value: '04:30', label: '04:30', group: 'Natt' },
  { value: '05:00', label: '05:00', group: 'Natt' },
  { value: '05:30', label: '05:30', group: 'Natt' },
]
type Rec = { id:string; location_id:string; phone:string; name:string; email?:string; active:boolean; sms_enabled:boolean; sms_daily:boolean; send_time?:string; profile?:string }
type EmergencyContact = { id:string; name:string; phone:string; relation?:string; active:boolean; created_at:string }

export default function MinSideClient() {
  const [email, setEmail] = useState('')
  const [sub, setSub] = useState<Sub|null>(null)
  const [sendTime, setSendTime] = useState('07:30')
  const [sendTimeSaving, setSendTimeSaving] = useState(false)
  const [sendTimeSaved, setSendTimeSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAddLoc, setShowAddLoc] = useState(false)
  const [selectedLoc, setSelectedLoc] = useState<Loc | null>(null)
  const [selectedLocWeather, setSelectedLocWeather] = useState<any | null>(null)
  const [selectedLocSummary, setSelectedLocSummary] = useState<string | null>(null)
  const [selectedLocScoreColor, setSelectedLocScoreColor] = useState<string>('#94a3b8')
  const [selectedLocScoreLabel, setSelectedLocScoreLabel] = useState<string>('Laster...')
  const [activeTab, setActiveTab] = useState<'lokasjoner'|'mottakere'|'rapport'|'konto'|'nodkontakt'>('lokasjoner')
  const [accountLoading, setAccountLoading] = useState<string|null>(null)
  const [showAddRec, setShowAddRec] = useState(false)
  // Nødkontakt-state
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [showAddEmergency, setShowAddEmergency] = useState(false)
  const [ecName, setEcName] = useState('')
  const [ecPhone, setEcPhone] = useState('')
  const [ecRelation, setEcRelation] = useState('')
  const [ecSaving, setEcSaving] = useState(false)
  const [ecError, setEcError] = useState('')
  const [sosConfirm, setSosConfirm] = useState(false)
  const [sosSending, setSosSending] = useState(false)
  const [sosResult, setSosResult] = useState<{success:boolean;contacts_notified:number}|null>(null)
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [csvRows, setCsvRows] = useState<any[]>([])
  const [csvFileName, setCsvFileName] = useState('')
  const [csvImporting, setCsvImporting] = useState(false)
  const [csvResult, setCsvResult] = useState<{imported:number;total:number;results:any[]}|null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [newEmailEnabled, setNewEmailEnabled] = useState(true)
  const [newSmsEnabled, setNewSmsEnabled] = useState(false)
  const [newSendTime, setNewSendTime] = useState('')
  const [newProfile, setNewProfile] = useState('')
  const [locs, setLocs] = useState<Loc[]>([])
  const [recs, setRecs] = useState<Rec[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'login'|'dash'>('login')
  const [magicSendt, setMagicSendt] = useState(false)
  const [feil, setFeil] = useState('')
  const [sosCountdownOpen, setSosCountdownOpen] = useState(false)

  // URL-flagg-håndtering: ?dev_login=... og ?sos=trigger
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)

    // Dev-login: sett localStorage (kun lokalt)
    const devEmail = params.get('dev_login')
    if (devEmail && process.env.NODE_ENV !== 'production') {
      localStorage.setItem('bv_email', devEmail)
    }

    // SOS-trigger: åpne countdown-modal + sett tab til Nodkontakt
    if (params.get('sos') === 'trigger') {
      setActiveTab('nodkontakt')
      setSosCountdownOpen(true)
    }

    // Rens URL hvis vi gjorde noe
    if (devEmail || params.get('sos')) {
      window.history.replaceState({}, '', '/min-side')
    }
  }, [])

  // Lytt på SOS-trigger event fra SosButton når vi allerede er på /min-side
  useEffect(() => {
    const handler = () => {
      setActiveTab('nodkontakt')
      setSosCountdownOpen(true)
    }
    window.addEventListener('bv-sos-trigger', handler)
    return () => window.removeEventListener('bv-sos-trigger', handler)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    fetch('/api/min-side/session', { signal: controller.signal })
      .then(r => r.json())
      .then(async d => {
        clearTimeout(timeout)
        if (d.subscriber) {
          setSub(d.subscriber); setLocs(d.locations||[]); setRecs(d.recipients||[])
          if (d.emergency_contacts) setEmergencyContacts(d.emergency_contacts)
          setEmail(d.subscriber.email); setSendTime(d.subscriber.send_time||'07:30'); setView('dash')
          // Lagre i localStorage så SosButton + andre komponenter kan lese plan/email på tvers av sider
          if (typeof window !== 'undefined') {
            localStorage.setItem('bv_email', d.subscriber.email)
            localStorage.setItem('bv_plan', d.subscriber.plan)
            localStorage.setItem('bv_plan_cached_at', String(Date.now()))
          }
        } else {
          const saved = localStorage.getItem('bv_email')
          if (saved) {
            setEmail(saved)
            const r2 = await fetch(`/api/min-side?email=${encodeURIComponent(saved)}`)
            const d2 = await r2.json()
            if (d2.subscriber) {
              setSub(d2.subscriber); setLocs(d2.locations||[]); setRecs(d2.recipients||[])
              if (d2.emergency_contacts) setEmergencyContacts(d2.emergency_contacts)
              setView('dash')
            } else localStorage.removeItem('bv_email')
          }
        }
      })
      .catch(() => clearTimeout(timeout))
  }, [])

  const [locQ, setLocQ] = useState('')
  const [locSugg, setLocSugg] = useState<any[]>([])
  const [locOpen, setLocOpen] = useState(false)
  const [locValgt, setLocValgt] = useState<{name:string;lat:number;lon:number}|null>(null)
  const locTimer = useRef<any>(null)
  const [editRec, setEditRec] = useState<Rec|null>(null)
  const [editPhone, setEditPhone] = useState('')
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editProfile, setEditProfile] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newName, setNewName] = useState('')
  const [newLocId, setNewLocId] = useState('')

  useEffect(() => {
    if (locQ.length < 2) { setLocSugg([]); setLocOpen(false); return }
    clearTimeout(locTimer.current)
    locTimer.current = setTimeout(async () => {
      const r = await fetch(`/api/steder?q=${encodeURIComponent(locQ)}`)
      const hits = await r.json()
      // Mapper til samme format som resten av koden forventer
      const mapped = hits.map((h: any) => ({
        name: h.name, latitude: h.lat, longitude: h.lon,
        country_code: 'NO', type: h.type,
      }))
      setLocSugg(mapped); setLocOpen(mapped.length>0)
    }, 300)
  }, [locQ])

  async function login(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setFeil('')
    const r = await fetch('/api/auth/send-magic-link', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email }),
    })
    const d = await r.json()
    if (d.ok) setMagicSendt(true)
    else setFeil(d.error || 'Ingen konto funnet for denne e-postadressen.')
    setLoading(false)
  }

  function pickLoc(s: any) {
    const name = s.name
    setLocQ(name); setLocValgt({name, lat:s.latitude, lon:s.longitude}); setLocOpen(false); setLocSugg([])
  }

  async function addLoc(e: React.FormEvent) {
    e.preventDefault(); if (!locValgt) return
    const r = await fetch('/api/min-side/location', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ subscriber_id:sub!.id, name:locValgt.name, lat:locValgt.lat, lon:locValgt.lon }) })
    const d = await r.json()
    if (d.location) { setLocs([...locs, d.location]); setLocQ(''); setLocValgt(null) }
  }

  async function deleteLoc(id: string) {
    if (!confirm('Slett lokasjon og alle tilknyttede mottakere?')) return
    await fetch('/api/min-side/location/delete', { method:'DELETE', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id, subscriber_id:sub!.id }) })
    setLocs(locs.filter(l=>l.id!==id)); setRecs(recs.filter(r=>r.location_id!==id))
  }

  async function addRec(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/min-side/recipient', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ subscriber_id:sub!.id, location_id:newLocId, phone:newPhone, name:newName, email:(newEmailEnabled&&newEmail)?newEmail:null, sms_enabled:true, sms_daily:newSmsEnabled, send_time:newSendTime||null, profile:newProfile||null }) })
    const d = await r.json()
    if (d.recipient) { setRecs([...recs, d.recipient]); setNewPhone(''); setNewName(''); setNewLocId(''); setNewEmail(''); setNewEmailEnabled(true); setNewSmsEnabled(false); setNewSendTime(''); setNewProfile(''); setShowAddRec(false) }
  }
  function parseCsv(text: string) {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim())
      const obj: any = {}
      headers.forEach((h, i) => { obj[h] = vals[i] || '' })
      return obj
    }).filter(r => Object.values(r).some(v => v))
  }
  function handleCsvFile(file: File) {
    setCsvFileName(file.name); setCsvResult(null)
    const reader = new FileReader()
    reader.onload = e => { setCsvRows(parseCsv(e.target?.result as string)) }
    reader.readAsText(file)
  }
  async function importCsv() {
    if (!csvRows.length || !newLocId) return
    setCsvImporting(true)
    const r = await fetch('/api/min-side/import-csv', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ subscriber_id: sub!.id, location_id: newLocId, rows: csvRows }) })
    const d = await r.json()
    setCsvResult(d)
    setCsvImporting(false)
    if (d.ok) {
      const updated = await fetch(`/api/min-side?email=${encodeURIComponent(sub!.email)}`)
      const ud = await updated.json()
      if (ud.recipients) setRecs(ud.recipients)
    }
  }

  async function deleteRec(id: string) {
    if (!confirm('Slett mottaker?')) return
    await fetch('/api/min-side/recipient/delete', { method:'DELETE', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id, subscriber_id:sub!.id }) })
    setRecs(recs.filter(r=>r.id!==id))
  }

  async function toggleRec(rec: Rec) {
    const r = await fetch('/api/min-side/recipient/update', { method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id:rec.id, subscriber_id:sub!.id, active:!rec.active }) })
    const d = await r.json()
    if (d.recipient) setRecs(recs.map(r=>r.id===rec.id ? d.recipient : r))
  }

  async function toggleSms(rec: Rec) {
    const r = await fetch('/api/min-side/recipient/update', { method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id:rec.id, subscriber_id:sub!.id, sms_enabled:!rec.sms_enabled }) })
    const d = await r.json()
    if (d.recipient) setRecs(recs.map(r=>r.id===rec.id ? d.recipient : r))
  }

  async function toggleSmsDaily(rec: Rec) {
    const r = await fetch('/api/min-side/recipient/update', { method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id:rec.id, subscriber_id:sub!.id, sms_daily:!rec.sms_daily }) })
    const d = await r.json()
    if (d.recipient) setRecs(recs.map(r=>r.id===rec.id ? d.recipient : r))
  }

  async function saveEditRec(e: React.FormEvent) {
    e.preventDefault(); if (!editRec) return
    const r = await fetch('/api/min-side/recipient/update', { method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id:editRec.id, subscriber_id:sub!.id, phone:editPhone, name:editName, email:editEmail||null, profile:editProfile||null }) })
    const d = await r.json()
    if (d.recipient) { setRecs(recs.map(r=>r.id===editRec.id ? d.recipient : r)); setEditRec(null) }
  }

  const planLabel: Record<string,string> = { kyst:planNavn('kyst'), 'kyst-pluss':planNavn('kyst-pluss'), familie:planNavn('familie'), pro:planNavn('pro'), sikkerhet:planNavn('sikkerhet') }

  // LOGIN VIEW
  if (view==='login') return (
    <div style={{ minHeight:'100vh', fontFamily:'DM Sans, sans-serif', position:'relative' }}>
      {/* Full-side illustrasjon */}
      <div style={{ position:'fixed', inset:0, zIndex:0 }}>
        <BrandIllustration />
        {/* Fyller resten under SVG med havfarge */}
        <div style={{ background:'#0a2a3d', flex:1, minHeight:'100vh' }}/>
      </div>

      {/* Nav over illustrasjonen */}
      <nav style={{ position:'relative', zIndex:10, padding:'1.2rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem' }}>
        <a href="/" aria-label="Tilbake til forsiden" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#6b8fa3', fontSize:'0.88rem', fontWeight:500, textDecoration:'none', padding:'8px 14px 8px 10px', borderRadius:100, transition:'background 0.2s, color 0.2s' }}
           onMouseEnter={(e)=>{e.currentTarget.style.background='rgba(10,42,61,0.06)';e.currentTarget.style.color='#0a2a3d'}}
           onMouseLeave={(e)=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6b8fa3'}}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Tilbake til forsiden</span>
        </a>
        <a href="/" style={{ textDecoration:'none' }}>
          <svg width="200" height="32" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="#0a2a3d" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="#1a6080" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
            <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="#0a2a3d" letterSpacing="-0.8">bølgevarsel<tspan fill="#1a6080" fontWeight="400">.no</tspan></text>
          </svg>
        </a>
      </nav>

      {/* Innhold over illustrasjonen */}
      <div style={{ position:'relative', zIndex:10, maxWidth:420, margin:'0 auto', padding:'1rem 1.5rem 3rem', textAlign:'center' }}>
        {magicSendt ? (
          <div style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)', borderRadius:24, padding:'2.5rem 2rem', boxShadow:'0 8px 40px rgba(10,42,61,0.15)' }}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:'1rem'}}>
              <div style={{width:52,height:52,borderRadius:13,background:'#e8f4f8',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M2 6h20l-10 8L2 6z" stroke="#1a6080" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                  <path d="M2 6v14a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V6" stroke="#1a6080" strokeWidth="1.4" fill="none"/>
                </svg>
              </div>
            </div>
            <h1 style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:'1.8rem',fontWeight:300,color:'#0a2a3d',marginBottom:'0.5rem'}}>Sjekk innboksen!</h1>
            <p style={{color:'#6b8fa3',marginBottom:'0.3rem'}}>Vi har sendt en innloggingslenke til</p>
            <p style={{color:'#0a2a3d',fontWeight:600,marginBottom:'1.5rem'}}>{email}</p>
            <p style={{color:'#6b8fa3',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Lenken er gyldig i 1 time. Sjekk eventuelt søppelpost.</p>
            <button onClick={()=>{setMagicSendt(false);setFeil('')}} style={{...S.btnGhost,fontSize:'0.85rem'}}>← Prøv en annen e-post</button>
          </div>
        ) : (
          <>
            {/* Hovedkort — glassmorphism */}
            <div style={{ background:'rgba(255,255,255,0.82)', backdropFilter:'blur(16px)', borderRadius:24, padding:'2.5rem 2rem', boxShadow:'0 8px 40px rgba(10,42,61,0.15)', marginBottom:'1rem' }}>
              <h1 style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:'2rem',fontWeight:300,color:'#0a2a3d',marginBottom:'0.4rem'}}>Min side</h1>
              <p style={{color:'#6b8fa3',marginBottom:'1.5rem',fontSize:'0.95rem'}}>Skriv inn e-posten din — vi sender deg en innloggingslenke</p>
              <form onSubmit={login} style={{display:'flex',flexDirection:'column',gap:'0.7rem'}}>
                <label htmlFor="login-epost" style={{position:'absolute',width:1,height:1,padding:0,margin:-1,overflow:'hidden',clip:'rect(0,0,0,0)',whiteSpace:'nowrap',border:0}}>E-postadresse</label>
                <input id="login-epost" name="email" style={{...S.inp, background:'rgba(248,251,252,0.9)'}} type="email" inputMode="email" autoComplete="email" placeholder="din@epost.no" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus />
                {feil && <p style={{color:'#ef4444',fontSize:'0.85rem',margin:0}}>{feil}</p>}
                <button style={{...S.btnPrimary,width:'100%',padding:'0.9rem',fontSize:'0.95rem'}} disabled={loading}>
                  {loading ? 'Sender...' : 'Send innloggingslenke →'}
                </button>
              </form>
            </div>

            {/* Hjelpekort — lett transparent */}
            <div style={{ background:'rgba(255,255,255,0.65)', backdropFilter:'blur(12px)', borderRadius:16, padding:'1.2rem 1.4rem', textAlign:'left', boxShadow:'0 4px 20px rgba(10,42,61,0.1)' }}>
              <p style={{margin:'0 0 0.7rem',fontSize:'0.78rem',fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em'}}>Hjelp</p>
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                <div style={{fontSize:'0.88rem',color:'#334155'}}>
                  <strong>Trenger du hjelp?</strong>{' '}
                  <a href="/hjelp" style={{color:'#1a6080',textDecoration:'none',fontWeight:500}}>Se hjelpesenter →</a>
                </div>
                <div style={{fontSize:'0.88rem',color:'#334155'}}>
                  <strong>Ny kunde?</strong>{' '}
                  <a href="/registrer" style={{color:'#1a6080',textDecoration:'none',fontWeight:500}}>Kom i gang — fra 49 kr/mnd →</a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  // DASHBOARD VIEW
  const tabs = [
    { key: 'lokasjoner', label: 'Lokasjoner', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C4.8 1.5 3 3.3 3 5.5C3 8.2 7 12.5 7 12.5C7 12.5 11 8.2 11 5.5C11 3.3 9.2 1.5 7 1.5Z" stroke="currentColor" strokeWidth="1.2" fill="none"/><circle cx="7" cy="5.5" r="1.3" fill="currentColor"/></svg>, count: locs.length },
    { key: 'mottakere', label: 'Mottakere', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="1" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M5.5 10h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/></svg>, count: recs.length },
    ...(sub?.plan === 'sikkerhet' ? [{ key: 'nodkontakt' as const, label: 'Nodkontakt', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>, count: emergencyContacts.length }] : []),
    { key: 'rapport', label: 'Rapport', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>, count: null },
    { key: 'konto', label: 'Konto', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M2 12.5c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/></svg>, count: null },
  ]

  return (
    <div style={S.page}>
      <div style={{background:'#c8e8f5', overflow:'hidden', position:'relative'}}>
        <div style={{padding:'1.1rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:1100, margin:'0 auto', position:'relative', zIndex:2}}>
          <a href="/min-side" onClick={(e)=>{e.preventDefault();setActiveTab('lokasjoner');window.scrollTo({top:0,behavior:'smooth'})}} style={{textDecoration:'none',display:'flex',alignItems:'center',cursor:'pointer'}} aria-label="Til hovedoversikt">
            <svg width="220" height="36" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="#0a2a3d" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="#1a6080" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
              <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="#0a2a3d" letterSpacing="-0.8">bølgevarsel<tspan fill="#1a6080" fontWeight="400">.no</tspan></text>
            </svg>
          </a>
          <div className="bv-header-actions" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <SosButton variant="header-inline" />
            <div className="bv-header-secondary" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <span style={{...S.badge(sub!.plan)}}>{planLabel[sub!.plan]}</span>
              <button onClick={async()=>{await fetch('/api/auth/logout',{method:'POST'});localStorage.removeItem('bv_email');localStorage.removeItem('bv_plan');localStorage.removeItem('bv_plan_cached_at');setView('login');setSub(null)}}
                style={{background:'transparent',border:'1px solid rgba(10,42,61,0.2)',color:'rgba(10,42,61,0.5)',cursor:'pointer',fontSize:'0.85rem',padding:'7px 18px',borderRadius:100,fontFamily:'inherit'}}>Logg ut</button>
            </div>
          </div>
        </div>
        <svg viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',display:'block',marginTop:'-6px'}}>
          <style>{`
            .bv-sun  { animation: bv-bob  8s ease-in-out infinite; }
            .bv-boat { animation: bv-sail 7s ease-in-out infinite; }
            .bv-f1   { animation: bv-swim  5s ease-in-out infinite; }
            .bv-f2   { animation: bv-swim2 7s ease-in-out 1.5s infinite; }
            .bv-f3   { animation: bv-swim  9s ease-in-out 3s infinite reverse; }
          `}</style>
          <defs>
            <linearGradient id="sky8" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8e8f5"/><stop offset="100%" stopColor="#a8d4e8"/></linearGradient>
            <linearGradient id="sea8" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a6080"/><stop offset="100%" stopColor="#0a2a3d"/></linearGradient>
            <linearGradient id="sea8b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e5a7a"/><stop offset="100%" stopColor="#0d3350"/></linearGradient>
          </defs>
          <rect width="1440" height="180" fill="url(#sky8)"/>
          <g className="bv-sun"><circle cx="1340" cy="42" r="26" fill="#fff4e0" opacity="0.4"/><circle cx="1340" cy="42" r="17" fill="#ffd580" opacity="0.5"/><circle cx="1340" cy="42" r="10" fill="#ffbc40" opacity="0.72"/></g>
          <ellipse cx="200" cy="32" rx="55" ry="12" fill="white" opacity="0.2"/>
          <ellipse cx="235" cy="22" rx="38" ry="10" fill="white" opacity="0.15"/>
          <path d="M0 125 L180 72 L320 108 L500 58 L660 95 L820 55 L980 90 L1140 60 L1300 95 L1440 68 L1440 180 L0 180 Z" fill="#6a9ab8" opacity="0.28"/>
          <ellipse cx="380" cy="118" rx="95" ry="16" fill="#2a5a3a" opacity="0.9"/>
          <path d="M295 118 Q338 102 380 97 Q422 102 465 118 Z" fill="#3a6a4a" opacity="0.95"/>
          <rect x="377" y="76" width="9" height="26" fill="#e8e0d0" rx="1.5"/>
          <rect x="373" y="72" width="17" height="6" fill="#cc3333" rx="1.5"/>
          <circle cx="381" cy="72" r="3.5" fill="#ffdd44" opacity="0.9"/>
          <g className="bv-boat"><path d="M820 98 Q855 108 890 98 L886 107 Q855 116 824 107 Z" fill="#0a2a3d" opacity="0.75"/>
          <line x1="855" y1="98" x2="855" y2="60" stroke="#0a2a3d" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
          <path d="M855 62 L884 94 L855 98 Z" fill="rgba(235,228,212,0.88)"/>
          <path d="M855 65 L829 92 L855 98 Z" fill="rgba(235,228,212,0.55)"/></g>
          <path d="M0 126 Q180 112 360 126 Q540 140 720 122 Q900 104 1080 122 Q1260 140 1440 124 L1440 180 L0 180 Z" fill="url(#sea8)"/>
          <path d="M0 138 Q200 128 400 138 Q600 148 800 136 Q1000 124 1200 136 Q1350 144 1440 138 L1440 180 L0 180 Z" fill="url(#sea8b)" opacity="0.55"/>
          <g className="bv-f1"><ellipse cx="240" cy="141" rx="16" ry="6" fill="none" stroke="rgba(77,168,204,0.52)" strokeWidth="1.2"/><path d="M224 141 L215 135 M224 141 L215 147" stroke="rgba(77,168,204,0.52)" strokeWidth="1.2" strokeLinecap="round"/></g>
          <rect x="0" y="172" width="1440" height="8" fill="#e8f4f8"/>
        </svg>
      </div>

      <div className="bv-wrap" style={S.wrap}>
        <style>{`
          @media (min-width: 800px) {
            .bv-dashboard { display: grid; grid-template-columns: 300px 1fr; gap: 2rem; align-items: start; }
            .bv-sidebar { position: sticky; top: 80px; }
            /* Inline rapport vises kun på mobil - skjul på desktop (har egen Rapport-tab) */
            .bv-mobile-rapport { display: none !important; }
          }
          @media (max-width: 799px) {
            /* Mobile: tab-content øverst, sidebar (profil/plan + hurtigvalg) under */
            .bv-dashboard { display: flex !important; flex-direction: column; gap: 1rem; }
            .bv-sidebar { order: 2; margin-bottom: 0; }
            .bv-tab-content { order: 1; }
            /* Smalere padding på mobil så innholdet får plass */
            .bv-wrap { padding: 1.2rem 0.9rem !important; }
            /* Tab-bar skjules på mobil - hurtigvalg i sidebar håndterer navigasjon */
            .bv-tabbar { display: none !important; }
            .bv-tab-content { padding: 1.2rem !important; }
            /* Plan-badge + logg-ut skjules på mobil - vises i sidebar/Konto-tab. SOS forblir synlig. */
            .bv-header-secondary { display: none !important; }
            /* Hurtigvalg: skjul Lokasjoner (default-tab) og Rapport (inline) */
            .bv-quicknav-btn[data-key="lokasjoner"],
            .bv-quicknav-btn[data-key="rapport"] { display: none !important; }
            /* Mottakere-header: knapper full bredde under tekst */
            .bv-mottakere-actions { width: 100% !important; }
            .bv-mottakere-actions button { flex: 1 1 0 !important; justify-content: center !important; }
            /* CSV-import er en desktop-feature - skjul på mobil */
            .bv-csv-only-desktop { display: none !important; }
          }
          .bv-tabbar::-webkit-scrollbar { display: none; }
        `}</style>

        <div className="bv-dashboard">
          {/* Sidebar: profil + stat-kort */}
          <div className="bv-sidebar">
            <div style={{background:'white',borderRadius:16,border:'1px solid rgba(10,42,61,0.07)',padding:'1.5rem',marginBottom:'1rem',boxShadow:'0 2px 12px rgba(10,42,61,0.06)'}}>
              {/* Profil-header */}
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:'#e8f4f8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:500,color:'#1a6080',flexShrink:0}}>
                  {sub!.email.slice(0,2).toUpperCase()}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:500,color:'#0a2a3d'}}>Hei!</div>
                  <div style={{fontSize:12,color:'#6b8fa3',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sub!.email}</div>
                </div>
              </div>

              {/* Plan-kort med progress-bars */}
              <div style={{background:'#f8fbfc',borderRadius:10,padding:'10px 12px',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:'#0a2a3d'}}>{planNavn(sub!.plan)}-plan</div>
                    <div style={{fontSize:11,color:'#6b8fa3'}}>{planPris(sub!.plan) ?? '—'} kr/mnd</div>
                  </div>
                  <span style={{fontSize:12,fontWeight:500,padding:'4px 10px',borderRadius:100,background:'#e8f5ed',color:'#16a34a'}}>{sub!.status==='active'?'Aktivt':'Pauset'}</span>
                </div>
                {/* Mottakere progress */}
                <div style={{marginBottom:6}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#6b8fa3',marginBottom:4}}>
                    <span>Mottakere brukt</span>
                    <span style={{fontWeight:500,color:'#0a2a3d'}}>{recs.length} / {({'kyst':0,'kyst-pluss':1,'familie':5,'pro':5,'sikkerhet':5} as any)[sub!.plan] ?? 20}</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:'rgba(10,42,61,0.08)'}}>
                    <div style={{height:4,borderRadius:2,background:'#1a6080',width:`${Math.min((recs.length/(({'kyst':0.001,'kyst-pluss':1,'familie':5,'pro':5,'sikkerhet':5} as any)[sub!.plan] ?? 20))*100,100)}%`,transition:'width 0.4s'}}/>
                  </div>
                </div>
                {/* Lokasjoner progress */}
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#6b8fa3',marginBottom:3}}>
                    <span>Lokasjoner brukt</span>
                    <span style={{fontWeight:500,color:'#0a2a3d'}}>{locs.length} / {({'kyst':1,'kyst-pluss':1,'familie':3,'pro':5,'sikkerhet':5} as any)[sub!.plan] ?? 20}</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:'rgba(10,42,61,0.08)'}}>
                    <div style={{height:4,borderRadius:2,background:'#1a6080',width:`${Math.min((locs.length/(({'kyst':1,'kyst-pluss':1,'familie':3,'pro':5,'sikkerhet':5} as any)[sub!.plan] ?? 20))*100,100)}%`,transition:'width 0.4s'}}/>
                  </div>
                </div>
              </div>

              {/* Stat-grid */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10}}>
                <div onClick={()=>setActiveTab('konto')} style={{background:'#f8fbfc',borderRadius:8,padding:'8px 10px',textAlign:'center',cursor:'pointer',transition:'background 0.15s'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='#e8f4f8')}
                  onMouseLeave={e=>(e.currentTarget.style.background='#f8fbfc')}>
                  <div style={{fontSize:11,color:'#6b8fa3',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>Rapporttidspunkt</div>
                  <div style={{fontSize:22,fontWeight:300,color:'#0a2a3d'}}>{sendTime}</div>
                  <div style={{fontSize:11,color:'#6b8fa3',marginTop:2}}>daglig</div>
                </div>
                <div onClick={()=>setActiveTab('mottakere')} style={{background:'#f8fbfc',borderRadius:8,padding:'8px 10px',textAlign:'center',cursor:'pointer',transition:'background 0.15s'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='#e8f4f8')}
                  onMouseLeave={e=>(e.currentTarget.style.background='#f8fbfc')}>
                  <div style={{fontSize:11,color:'#6b8fa3',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>Mottakere</div>
                  <div style={{fontSize:22,fontWeight:300,color:'#0a2a3d'}}>{recs.length}</div>
                  <div style={{fontSize:11,color:'#6b8fa3',marginTop:2}}>{recs.filter(r=>r.active).length} aktive</div>
                </div>
              </div>

              {/* Kontakt for plan-endring */}
              <div style={{borderTop:'0.5px solid rgba(10,42,61,0.07)',paddingTop:10,marginTop:4}}>
                <p style={{fontSize:11,color:'#6b8fa3',lineHeight:1.5,marginBottom:8}}>
                  Ønsker du å endre plan eller legge til flere mottakere?
                </p>
                <a href="mailto:hei@bolgevarsel.no?subject=Plan-endring"
                  style={{display:'flex',alignItems:'center',gap:7,fontSize:12,fontWeight:500,
                    color:'#1a6080',textDecoration:'none',padding:'8px 10px',borderRadius:8,
                    background:'#e8f4f8',transition:'background 0.15s'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='#d4ecf7')}
                  onMouseLeave={e=>(e.currentTarget.style.background='#e8f4f8')}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1.5 3h11l-5.5 5L1.5 3z" stroke="#1a6080" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
                    <path d="M1.5 3v8.5a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V3" stroke="#1a6080" strokeWidth="1.2" fill="none"/>
                  </svg>
                  hei@bolgevarsel.no
                </a>
              </div>
            </div>

            {/* Hurtiglenker */}
            <div style={{background:'white',borderRadius:16,border:'1px solid rgba(10,42,61,0.07)',padding:'1rem',boxShadow:'0 2px 12px rgba(10,42,61,0.06)'}}>
              <div style={{fontSize:11,color:'#6b8fa3',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Hurtigvalg</div>
              {tabs.map(tab => (
                <button key={tab.key} onClick={()=>setActiveTab(tab.key as any)}
                  className="bv-quicknav-btn"
                  data-key={tab.key}
                  style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,
                    background:activeTab===tab.key?'#e8f4f8':'transparent',border:'none',cursor:'pointer',
                    color:activeTab===tab.key?'#1a6080':'#6b8fa3',fontSize:14,fontWeight:activeTab===tab.key?500:400,
                    fontFamily:'inherit',textAlign:'left',marginBottom:2,transition:'all 0.15s'
                  }}>
                  {tab.icon}
                  {tab.label}
                  {tab.count !== null && tab.count > 0 && (
                    <span style={{marginLeft:'auto',background:activeTab===tab.key?'#1a6080':'rgba(10,42,61,0.1)',
                      color:activeTab===tab.key?'white':'#6b8fa3',fontSize:10,padding:'1px 6px',borderRadius:100}}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
              <div style={{borderTop:'0.5px solid rgba(10,42,61,0.07)',marginTop:6,paddingTop:8}}>
                <a href="/hjelp"
                  style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,
                    color:'#6b8fa3',fontSize:14,textDecoration:'none',transition:'all 0.15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='#f8fbfc';e.currentTarget.style.color='#1a6080'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6b8fa3'}}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <path d="M5.5 5.5a1.5 1.5 0 0 1 3 0c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="7" cy="10" r="0.6" fill="currentColor"/>
                  </svg>
                  Hjelpesenter
                </a>
                <a href="/hjelp/varsler/tegnforklaring"
                  style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,
                    color:'#6b8fa3',fontSize:14,textDecoration:'none',transition:'all 0.15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='#f8fbfc';e.currentTarget.style.color='#1a6080'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6b8fa3'}}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 4h10M2 7h7M2 10h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Tegnforklaring
                </a>
              </div>
            </div>
          </div>

          {/* Hoveddel: Tab-innhold */}
          <div className="bv-tab-content" style={S.card as React.CSSProperties}>
          {/* Tab-bar */}
          <div className="bv-tabbar" style={{display:'flex',borderBottom:'1px solid rgba(10,42,61,0.07)',marginBottom:'1.2rem',gap:0,overflowX:'auto',scrollbarWidth:'none',msOverflowStyle:'none'}}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={()=>setActiveTab(tab.key as any)}
                className="bv-tab"
                data-active={activeTab===tab.key}
                style={{flex:'1 1 0',display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'10px 8px',
                  background:'none',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:500,
                  color:activeTab===tab.key?'#1a6080':'#6b8fa3',
                  borderBottom:activeTab===tab.key?'2px solid #1a6080':'2px solid transparent',
                  transition:'all 0.15s',fontFamily:'inherit',whiteSpace:'nowrap',
                }}>
                {tab.icon}
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span style={{background:activeTab===tab.key?'#1a6080':'rgba(10,42,61,0.1)',color:activeTab===tab.key?'white':'#6b8fa3',fontSize:'10px',fontWeight:600,padding:'1px 6px',borderRadius:100,minWidth:16,textAlign:'center',transition:'all 0.15s'}}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ===== TAB: LOKASJONER ===== */}
          {activeTab === 'lokasjoner' && (
            <div>
              <div style={{marginBottom:'1.2rem'}}>
                <h2 style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:'1.25rem',fontWeight:400,color:'#0a2a3d',margin:'0 0 4px'}}>Lokasjoner</h2>
                <p style={{fontSize:'0.88rem',color:'#6b8fa3',lineHeight:1.5,margin:0}}>
                  Velg hvilke steder du vil hente sjødata fra.
                </p>
              </div>
              {locs.length === 0 && <p style={{color:'#6b8fa3',fontSize:'0.85rem',marginBottom:'1rem',fontStyle:'italic'}}>Ingen lokasjoner lagt til enda. Trykk «+ Legg til lokasjon» nedenfor.</p>}
              {locs.length > 0 && (
                <LokasjonPanel
                  locations={locs}
                  onLocationClick={(payload) => {
                    setSelectedLoc(payload.location)
                    setSelectedLocWeather(payload.weather)
                    setSelectedLocSummary(payload.summary)
                    setSelectedLocScoreColor(payload.scoreColor)
                    setSelectedLocScoreLabel(payload.scoreLabel)
                  }}
                />
              )}
              <button style={{...S.btnPrimary,width:'100%',padding:'0.8rem',marginTop:locs.length?'0.5rem':0}} onClick={()=>setShowAddLoc(true)}>
                + Legg til lokasjon
              </button>
              <BvSheet
                open={showAddLoc}
                onClose={() => setShowAddLoc(false)}
                title="Ny lokasjon"
              >
                <LeggTilLokasjon
                  onAdd={async (loc) => {
                    const r = await fetch('/api/min-side/location', { method:'POST', headers:{'Content-Type':'application/json'},
                      body: JSON.stringify({ subscriber_id: sub!.id, name: loc.name, lat: loc.lat, lon: loc.lon }) })
                    const d = await r.json()
                    if (d.location) setLocs([...locs, d.location])
                    setShowAddLoc(false)
                  }}
                  onCancel={() => setShowAddLoc(false)}
                />
              </BvSheet>
            </div>
          )}

          {/* Mobil-bonus: Rapport vises også inline under Lokasjoner-tab */}
          {activeTab === 'lokasjoner' && locs.length > 0 && (
            <div className="bv-mobile-rapport" style={{marginTop:'1.5rem',paddingTop:'1.5rem',borderTop:'1px solid rgba(10,42,61,0.07)'}}>
              <RapportTab locs={locs} subEmail={sub!.email} />
            </div>
          )}

          {/* ===== TAB: MOTTAKERE ===== */}
          {activeTab === 'mottakere' && (
            <div>
              <button onClick={()=>{setActiveTab('lokasjoner');window.scrollTo({top:0,behavior:'smooth'})}} style={{display:'inline-flex',alignItems:'center',gap:6,background:'none',border:'none',color:'#6b8fa3',fontSize:13,cursor:'pointer',padding:'4px 0',marginBottom:'1rem',fontFamily:'inherit'}}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L3 6l4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Tilbake til oversikt
              </button>

              {/* Intro-tekst + handlingsknapper */}
              <div className="bv-mottakere-header" style={{display:'flex',alignItems:'flex-start',gap:'1rem',marginBottom:'1.2rem',flexWrap:'wrap'}}>
                <div style={{flex:'1 1 240px',minWidth:0}}>
                  <h2 style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:'1.25rem',fontWeight:400,color:'#0a2a3d',margin:'0 0 4px'}}>Mottakere</h2>
                  <p style={{fontSize:'0.88rem',color:'#6b8fa3',lineHeight:1.5,margin:0}}>
                    Her legger du inn hvem som skal få tilsendt daglig sjørapport fra Bølgevarsel — på SMS, e-post eller begge.
                  </p>
                </div>
                {locs.length > 0 && (
                  <div className="bv-mottakere-actions" style={{display:'flex',gap:'8px',flexShrink:0}}>
                    <button className="bv-csv-only-desktop" style={{...S.btnGhost,fontSize:'0.85rem',padding:'7px 13px',display:'flex',alignItems:'center',gap:'5px'}} onClick={()=>{setShowCsvImport(!showCsvImport);setShowAddRec(false)}}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3.5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 10h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/></svg>
                      Importer CSV
                    </button>
                    <button style={{...S.btnPrimary,fontSize:'0.85rem',padding:'7px 13px',display:'flex',alignItems:'center',gap:'5px'}} onClick={()=>{setShowAddRec(!showAddRec);setShowCsvImport(false)}}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      Legg til
                    </button>
                  </div>
                )}
              </div>

              {recs.length === 0 && !showAddRec && !showCsvImport && locs.length > 0 && (
                <p style={{color:'#6b8fa3',fontSize:'0.85rem',marginBottom:'1rem',fontStyle:'italic'}}>Ingen mottakere lagt til enda.</p>
              )}
              {locs.length === 0 && <p style={{color:'#6b8fa3',fontSize:'0.85rem'}}>Legg til en lokasjon i «Lokasjoner»-fanen først.</p>}

              {recs.length > 0 && (
                <div style={{overflowX:'auto',marginBottom:'1rem'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'}}>
                    <thead>
                      <tr>
                        {['Navn','Telefon','E-post','SMS','Tidspunkt','Profil',''].map(h=>(
                          <th key={h} style={{textAlign:'left',color:'#6b8fa3',fontWeight:500,fontSize:'0.72rem',letterSpacing:'0.06em',textTransform:'uppercase',padding:'0 10px 8px'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recs.map(rec=>(
                        <tr key={rec.id} style={{borderTop:'1px solid rgba(10,42,61,0.06)'}}>
                          {editRec?.id===rec.id ? (
                            <td colSpan={7} style={{padding:'10px 0'}}>
                              <form onSubmit={saveEditRec} style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                                  <div>
                                    <div style={{fontSize:11,color:'#6b8fa3',marginBottom:3}}>Navn</div>
                                    <input style={{...S.inp}} placeholder="Navn" value={editName} onChange={e=>setEditName(e.target.value)} />
                                  </div>
                                  <div>
                                    <div style={{fontSize:11,color:'#6b8fa3',marginBottom:3}}>Telefon</div>
                                    <input style={{...S.inp}} placeholder="Telefon" value={editPhone} onChange={e=>setEditPhone(e.target.value)} required />
                                  </div>
                                  <div>
                                    <div style={{fontSize:11,color:'#6b8fa3',marginBottom:3}}>E-postadresse</div>
                                    <input style={{...S.inp}} placeholder="epost@eksempel.no" type="email" value={editEmail} onChange={e=>setEditEmail(e.target.value)} />
                                  </div>
                                  <div>
                                    <div style={{fontSize:11,color:'#6b8fa3',marginBottom:3}}>Aktivitetsprofil</div>
                                    <BvSelect
                                      value={editProfile}
                                      onChange={setEditProfile}
                                      ariaLabel="Aktivitetsprofil"
                                      options={[
                                        { value: '', label: 'Generell sjørapport' },
                                        { value: 'surfer', label: 'Surfer' },
                                        { value: 'kitesurfer', label: 'Kitesurfer' },
                                        { value: 'windsurfer', label: 'Windsurfer' },
                                        { value: 'fisker', label: 'Fisker' },
                                        { value: 'familie', label: 'Barn/ungdom med båt' },
                                        { value: 'baatforer', label: 'Båtfører' },
                                        { value: 'kajakk', label: 'Padler / kajakk' },
                                        { value: 'seiler', label: 'Seiler' },
                                        { value: 'fridykker', label: 'Fridykker / snorkling' },
                                      ]}
                                    />
                                  </div>
                                </div>
                                <div style={{display:'flex',gap:'8px'}}>
                                  <button style={{...S.btnPrimary,padding:'7px 16px'}} type="submit">Lagre</button>
                                  <button style={{...S.btnGhost,padding:'7px 16px'}} type="button" onClick={()=>setEditRec(null)}>Avbryt</button>
                                </div>
                              </form>
                            </td>
                          ) : (<>
                            <td style={{padding:'10px'}}>
                              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                <div style={{width:28,height:28,borderRadius:'50%',background:'#e8f4f8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:500,color:'#1a6080',flexShrink:0}}>
                                  {(rec.name||rec.phone).slice(0,2).toUpperCase()}
                                </div>
                                <span style={{fontWeight:500,color:'#0a2a3d'}}>{rec.name||'—'}</span>
                              </div>
                            </td>
                            <td style={{padding:'11px',color:'#6b8fa3',fontSize:'0.87rem'}}>{rec.phone}</td>
                            <td style={{padding:'11px',color:'#6b8fa3',fontSize:'0.87rem'}}>{(rec as any).email||'—'}</td>
                            <td style={{padding:'10px'}}>
                              <div style={{display:'flex',flexDirection:'column',gap:3}}>
                                <span style={{fontSize:'10px',fontWeight:500,padding:'2px 7px',borderRadius:100,background:'#fef2f2',color:'#991b1b',whiteSpace:'nowrap'}}>
                                  Fare: alltid
                                </span>
                                <span style={{fontSize:'10px',fontWeight:500,padding:'2px 7px',borderRadius:100,
                                  background:rec.sms_daily?'#e8f5ed':'#f1f5f9',
                                  color:rec.sms_daily?'#1a7a50':'#6b8fa3',whiteSpace:'nowrap'}}>
                                  Daglig: {rec.sms_daily?'på':'av'}
                                </span>
                              </div>
                            </td>
                            <td style={{padding:'10px',color:'#6b8fa3',fontSize:'12px'}}>{rec.send_time||'Standard'}</td>
                            <td style={{padding:'10px'}}>
                              {rec.profile ? (
                                <span style={{fontSize:'11px',fontWeight:500,padding:'2px 8px',borderRadius:100,background:'#e8f4f8',color:'#1a6080'}}>
                                  {({'surfer':'Surfer','fisker':'Fisker','familie':'Barn/ungdom m/båt','baatforer':'Båtfører','kajakk':'Padler','kitesurfer':'Kiting','windsurfer':'Windsurfer','seiler':'Seiler','fridykker':'Fridykker'}[rec.profile]||rec.profile)}
                                </span>
                              ) : <span style={{fontSize:'12px',color:'#6b8fa3'}}>Standard</span>}
                            </td>
                            <td style={{padding:'10px',textAlign:'right',whiteSpace:'nowrap'}}>
                              <button style={S.btnGhost} onClick={()=>toggleSmsDaily(rec)} title="Skru daglig SMS av/på">
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M3 5h7M3 7.5h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/></svg>
                              </button>
                              <button style={S.btnGhost} onClick={()=>{setEditRec(rec);setEditPhone(rec.phone);setEditName(rec.name||'');setEditEmail((rec as any).email||'');setEditProfile(rec.profile||'')}} title="Rediger">
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L5 11H3v-2l6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </button>
                              <button style={S.btnDanger} onClick={()=>deleteRec(rec.id)} title="Slett">
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 7h3l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </button>
                            </td>
                          </>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {locs.length > 0 && (
                <BvSheet
                  open={showAddRec}
                  onClose={() => setShowAddRec(false)}
                  title="Ny mottaker"
                  footer={
                    <button
                      type="button"
                      onClick={(e) => {
                        // Trigger form submit via vanlig path
                        const form = document.getElementById('bv-add-rec-form') as HTMLFormElement | null
                        if (form) form.requestSubmit()
                      }}
                      style={{...S.btnPrimary, width:'100%', padding:'12px 16px'}}
                    >
                      + Legg til mottaker
                    </button>
                  }
                >
                <form id="bv-add-rec-form" onSubmit={addRec} style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>

                  {/* ── Seksjon 1: Mottakerinformasjon ── */}
                  <div style={{fontSize:11,fontWeight:500,color:'#6b8fa3',textTransform:'uppercase',letterSpacing:'0.06em',display:'flex',alignItems:'center',gap:6}}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4.5" r="2.3" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M1.5 11.5c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/></svg>
                    Mottakerinformasjon
                  </div>
                  <div style={{background:'white',borderRadius:10,border:'0.5px solid rgba(10,42,61,0.1)',overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}}>
                      <div style={{padding:'10px 12px',borderRight:'0.5px solid rgba(10,42,61,0.07)'}}>
                        <div style={{fontSize:11,color:'#6b8fa3',marginBottom:3}}>Navn</div>
                        <input style={{...S.inp,borderRadius:6}} placeholder="Ola Nordmann" value={newName} onChange={e=>setNewName(e.target.value)} />
                      </div>
                      <div style={{padding:'10px 12px'}}>
                        <div style={{fontSize:11,color:'#6b8fa3',marginBottom:3}}>Telefonnummer</div>
                        <input style={{...S.inp,borderRadius:6}} placeholder="+47 000 00 000" value={newPhone} onChange={e=>setNewPhone(e.target.value)} required />
                      </div>
                    </div>
                    <div style={{padding:'10px 12px',borderTop:'0.5px solid rgba(10,42,61,0.07)'}}>
                      <div style={{fontSize:11,color:'#6b8fa3',marginBottom:3}}>Lokasjon</div>
                      <BvSelect
                        value={newLocId}
                        onChange={setNewLocId}
                        ariaLabel="Lokasjon"
                        placeholder="Velg lokasjon"
                        options={locs.map(l => ({ value: l.id, label: l.name }))}
                      />
                    </div>
                  </div>

                  {/* ── Seksjon 2: SMS-varsling ── */}
                  <div style={{fontSize:11,fontWeight:500,color:'#1a6080',textTransform:'uppercase',letterSpacing:'0.06em',display:'flex',alignItems:'center',gap:6}}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="9" rx="1.5" stroke="#1a6080" strokeWidth="1.2" fill="none"/><path d="M3 5.5h7M3 7.5h4" stroke="#1a6080" strokeWidth="1" strokeLinecap="round"/></svg>
                    SMS-varsling
                  </div>
                  <div style={{background:'white',borderRadius:10,border:'1px solid rgba(26,96,128,0.18)',overflow:'hidden'}}>
                    {/* Kritisk farevarsel */}
                    <div style={{padding:'10px 12px',background:'#fef9f9',borderBottom:'0.5px solid rgba(220,38,38,0.1)'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                        <div style={{display:'flex',alignItems:'center',gap:7}}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2.5v3M6.5 9h.01" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round"/></svg>
                          <span style={{fontSize:14,fontWeight:500,color:'#0a2a3d'}}>Kritisk farevarsel</span>
                        </div>
                        <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:100,background:'#fef2f2',color:'#991b1b'}}>Alltid på</span>
                      </div>
                      <div style={{fontSize:11,color:'#9ca3af'}}>Sendes automatisk ved farlige forhold — kan ikke skrus av.</div>
                    </div>
                    {/* Daglig SMS */}
                    <div style={{padding:'10px 12px',borderBottom:'0.5px solid rgba(10,42,61,0.07)'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                        <div style={{display:'flex',alignItems:'center',gap:7}}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="8" rx="1.5" stroke="#1a6080" strokeWidth="1.1" fill="none"/><path d="M3 5h7M3 7h4" stroke="#1a6080" strokeWidth="1" strokeLinecap="round"/></svg>
                          <span style={{fontSize:14,fontWeight:500,color:'#0a2a3d'}}>Daglig rapport på SMS</span>
                        </div>
                        <div style={{position:'relative',width:36,height:20,cursor:'pointer'}} onClick={()=>setNewSmsEnabled(!newSmsEnabled)}>
                          <div style={{position:'absolute',inset:0,borderRadius:100,background:newSmsEnabled?'#1a6080':'rgba(10,42,61,0.15)',transition:'0.2s'}}/>
                          <div style={{position:'absolute',width:14,height:14,top:3,left:newSmsEnabled?19:3,borderRadius:'50%',background:'white',transition:'0.2s'}}/>
                        </div>
                      </div>
                      <div style={{fontSize:11,color:'#6b8fa3'}}>Daglig sjøoppsummering. Av som standard — skru på om ønskelig.</div>
                    </div>
                  </div>

                  {/* ── Seksjon 3: E-postrapport ── */}
                  <div style={{fontSize:11,fontWeight:500,color:'#6b8fa3',textTransform:'uppercase',letterSpacing:'0.06em',display:'flex',alignItems:'center',gap:6}}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3h10l-5 4.5L1.5 3z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/><path d="M1.5 3v7.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V3" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
                    E-postrapport
                  </div>
                  <div style={{background:'white',borderRadius:10,border:'0.5px solid rgba(10,42,61,0.1)',overflow:'hidden'}}>
                    {/* E-post toggle */}
                    <div style={{padding:'10px 12px',borderBottom:'0.5px solid rgba(10,42,61,0.07)'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                        <div style={{display:'flex',alignItems:'center',gap:7}}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3h10l-5 4.5L1.5 3z" stroke="#1a6080" strokeWidth="1.1" fill="none" strokeLinejoin="round"/><path d="M1.5 3v7.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V3" stroke="#1a6080" strokeWidth="1.1" fill="none"/></svg>
                          <span style={{fontSize:14,fontWeight:500,color:'#0a2a3d'}}>Detaljert e-postrapport</span>
                        </div>
                        <div style={{position:'relative',width:36,height:20,cursor:'pointer'}} onClick={()=>setNewEmailEnabled(!newEmailEnabled)}>
                          <div style={{position:'absolute',inset:0,borderRadius:100,background:newEmailEnabled?'#1a6080':'rgba(10,42,61,0.15)',transition:'0.2s'}}/>
                          <div style={{position:'absolute',width:14,height:14,top:3,left:newEmailEnabled?19:3,borderRadius:'50%',background:'white',transition:'0.2s'}}/>
                        </div>
                      </div>
                      <div style={{fontSize:11,color:'#6b8fa3'}}>Full HTML-rapport med timesvarsel og tips. På som standard.</div>
                    </div>
                    {/* E-postadresse — vises alltid */}
                    <div style={{padding:'10px 12px',borderBottom:'0.5px solid rgba(10,42,61,0.07)'}}>
                      <div style={{fontSize:11,color:'#6b8fa3',marginBottom:3}}>E-postadresse</div>
                      <input style={{...S.inp,borderRadius:6}} placeholder="ola@eksempel.no" type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} />
                    </div>
                    {/* Leveringstidspunkt e-post */}
                    <div style={{padding:'10px 12px',borderBottom:'0.5px solid rgba(10,42,61,0.07)'}}>
                      <div style={{fontSize:11,color:'#6b8fa3',marginBottom:3}}>Leveringstidspunkt for e-post</div>
                      <BvSelect
                        value={newSendTime}
                        onChange={setNewSendTime}
                        ariaLabel="Leveringstidspunkt"
                        options={[
                          { value: '', label: `Samme som abonnementet (${sendTime})` },
                          ...SEND_TIME_OPTIONS
                        ]}
                      />
                      <div style={{fontSize:10,color:'#94a3b8',marginTop:3}}>Gjelder både SMS og e-post. Overstyrer abonnementets standard — nyttig for skift- og nattarbeidere.</div>
                    </div>
                    {/* Aktivitetsprofil */}
                    <div style={{padding:'10px 12px'}}>
                      <div style={{fontSize:11,color:'#6b8fa3',marginBottom:3}}>Aktivitetsprofil</div>
                      <BvSelect
                        value={newProfile}
                        onChange={setNewProfile}
                        ariaLabel="Aktivitetsprofil"
                        options={[
                          { value: '', label: 'Generell sjørapport (ingen spesialprofil)' },
                          { value: 'surfer', label: 'Surfer' },
                          { value: 'kitesurfer', label: 'Kitesurfer' },
                          { value: 'windsurfer', label: 'Windsurfer' },
                          { value: 'fisker', label: 'Fisker' },
                          { value: 'familie', label: 'Barn/ungdom med båt' },
                          { value: 'baatforer', label: 'Båtfører' },
                          { value: 'kajakk', label: 'Padler / kajakk' },
                          { value: 'seiler', label: 'Seiler' },
                          { value: 'fridykker', label: 'Fridykker / snorkling' },
                        ]}
                      />
                      <div style={{fontSize:10,color:'#94a3b8',marginTop:3}}>Tilpasser både SMS og e-postrapporten til aktiviteten.</div>
                    </div>
                  </div>

                </form>
                </BvSheet>
              )}

              {showCsvImport && locs.length > 0 && (
                <div style={{background:'#f8fbfc',borderRadius:12,padding:'1rem',marginBottom:'1rem',border:'1px solid rgba(10,42,61,0.07)'}}>
                  <div style={{fontSize:'0.9rem',fontWeight:500,color:'#0a2a3d',marginBottom:'0.75rem'}}>Importer fra CSV</div>
                  <div style={{marginBottom:'0.75rem'}}>
                    <div style={{fontSize:'11px',color:'#6b8fa3',marginBottom:3}}>Velg lokasjon for alle importerte mottakere</div>
                    <BvSelect
                      value={newLocId}
                      onChange={setNewLocId}
                      ariaLabel="Lokasjon"
                      placeholder="Velg lokasjon"
                      options={locs.map(l => ({ value: l.id, label: l.name }))}
                    />
                  </div>
                  <label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px',border:'1px dashed rgba(10,42,61,0.2)',borderRadius:10,padding:'1.5rem',cursor:'pointer',background:'white',textAlign:'center'}}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4v16M8 14l6 6 6-6" stroke="#1a6080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 22h20" stroke="#1a6080" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/></svg>
                    <span style={{fontSize:'0.85rem',fontWeight:500,color:'#0a2a3d'}}>{csvFileName || 'Velg CSV-fil'}</span>
                    <span style={{fontSize:'0.78rem',color:'#6b8fa3'}}>Kolonner: navn, telefon, epost, sms</span>
                    <a href="/bolgevarsel-mottakere-eksempel.csv" download style={{fontSize:'0.75rem',color:'#1a6080'}}>Last ned eksempelfil →</a>
                    <input type="file" accept=".csv" style={{display:'none'}} onChange={e=>{if(e.target.files?.[0]) handleCsvFile(e.target.files[0])}} />
                  </label>
                  {csvRows.length > 0 && !csvResult && (
                    <div style={{marginTop:'0.75rem',background:'white',borderRadius:8,padding:'0.75rem',border:'1px solid rgba(10,42,61,0.07)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                        <span style={{fontSize:'12px',fontWeight:500,color:'#0a2a3d'}}>{csvFileName}</span>
                        <span style={{fontSize:'11px',color:'#6b8fa3'}}>{csvRows.length} rader funnet</span>
                      </div>
                    </div>
                  )}
                  {csvResult && (
                    <div style={{marginTop:'0.75rem',background:csvResult.imported>0?'#f0fdf4':'#fef2f2',borderRadius:8,padding:'0.75rem',border:`1px solid ${csvResult.imported>0?'#bbf7d0':'#fecaca'}`}}>
                      <div style={{fontSize:'13px',fontWeight:500,color:csvResult.imported>0?'#1a7a50':'#dc2626'}}>
                        {csvResult.imported} av {csvResult.total} importert
                      </div>
                    </div>
                  )}
                  <div style={{display:'flex',gap:'8px',marginTop:'0.75rem'}}>
                    <button style={{...S.btnPrimary,flex:1,opacity:(!csvRows.length||!newLocId)?0.4:1}} onClick={importCsv} disabled={!csvRows.length||!newLocId||csvImporting}>
                      {csvImporting?'Importerer...':`Importer ${csvRows.length} mottakere`}
                    </button>
                    <button style={S.btnGhost} onClick={()=>{setShowCsvImport(false);setCsvRows([]);setCsvFileName('');setCsvResult(null)}}>Avbryt</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== TAB: NØDKONTAKT ===== */}
          {activeTab === 'nodkontakt' && sub?.plan === 'sikkerhet' && (
            <div>
              <button onClick={()=>{setActiveTab('lokasjoner');window.scrollTo({top:0,behavior:'smooth'})}} style={{display:'inline-flex',alignItems:'center',gap:6,background:'none',border:'none',color:'#6b8fa3',fontSize:13,cursor:'pointer',padding:'4px 0',marginBottom:'1rem',fontFamily:'inherit'}}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L3 6l4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Tilbake til oversikt
              </button>
              {/* SOS-knapp */}
              <div style={{background:'linear-gradient(135deg, #fef2f2, #fff1f2)',border:'1px solid #fecaca',borderRadius:16,padding:'1.5rem',marginBottom:'1.2rem',textAlign:'center'}}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{marginBottom:8}}>
                  <circle cx="16" cy="16" r="14" stroke="#ef4444" strokeWidth="2" fill="none"/>
                  <path d="M16 8v10M16 22v2" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <div style={{fontSize:15,fontWeight:600,color:'#991b1b',marginBottom:4}}>SOS Nodvarsel</div>
                <p style={{fontSize:12,color:'#b91c1c',marginBottom:12,lineHeight:1.5}}>
                  Sender SMS og ringer alle nodkontaktene dine umiddelbart med din GPS-posisjon.
                </p>
                {!sosConfirm ? (
                  <button onClick={()=>setSosConfirm(true)} disabled={emergencyContacts.length===0}
                    style={{background:emergencyContacts.length===0?'#d1d5db':'#ef4444',color:'white',padding:'0.7rem 2rem',borderRadius:100,border:'none',cursor:emergencyContacts.length===0?'not-allowed':'pointer',fontSize:'0.95rem',fontWeight:600,letterSpacing:'0.02em'}}>
                    {emergencyContacts.length===0?'Legg til nodkontakt forst':'Send SOS-varsel'}
                  </button>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'center'}}>
                    <p style={{fontSize:13,fontWeight:600,color:'#991b1b'}}>Er du sikker? Dette varsler {emergencyContacts.length} kontakt{emergencyContacts.length>1?'er':''}.</p>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={async()=>{
                        setSosSending(true); setSosResult(null)
                        try {
                          // Hent GPS-posisjon i sanntid
                          let lat: number|null = null, lng: number|null = null, locName = ''
                          try {
                            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                              navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
                            })
                            lat = Math.round(pos.coords.latitude * 10000) / 10000
                            lng = Math.round(pos.coords.longitude * 10000) / 10000
                            locName = `GPS: ${lat}, ${lng}`
                            // Prov reverse geocoding for lesbart stedsnavn
                            try {
                              const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=12&accept-language=no`)
                              const geoData = await geo.json()
                              if (geoData.display_name) locName = geoData.display_name.split(',').slice(0,3).join(',').trim()
                            } catch {}
                          } catch {
                            // GPS feilet — fall tilbake til forste registrerte lokasjon
                            const fallback = locs[0]
                            if (fallback) { lat = fallback.lat; lng = fallback.lon; locName = fallback.name + ' (registrert lokasjon)' }
                          }
                          const res = await fetch('/api/min-side/emergency-sos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lat,lng,location_name:locName,alert_type:'manual_sos'})})
                          const d = await res.json()
                          setSosResult({success:d.success,contacts_notified:d.contacts_notified||0})
                        } catch (err) {
                          console.error('SOS feil:', err)
                          setSosResult({success:false,contacts_notified:0})
                        }
                        setSosSending(false); setSosConfirm(false)
                        setTimeout(()=>setSosResult(null),8000)
                      }} disabled={sosSending}
                        style={{background:'#ef4444',color:'white',padding:'0.55rem 1.5rem',borderRadius:100,border:'none',cursor:'pointer',fontSize:'0.9rem',fontWeight:600}}>
                        {sosSending?'Sender varsel...':'Ja, send SOS'}
                      </button>
                      <button onClick={()=>setSosConfirm(false)}
                        style={{background:'white',color:'#991b1b',padding:'0.55rem 1.5rem',borderRadius:100,border:'1px solid #fecaca',cursor:'pointer',fontSize:'0.9rem'}}>
                        Avbryt
                      </button>
                    </div>
                  </div>
                )}
                {sosResult && (
                  <div style={{marginTop:12,padding:'8px 14px',borderRadius:10,background:sosResult.success?'#dcfce7':'#fef2f2',color:sosResult.success?'#16a34a':'#ef4444',fontSize:13,fontWeight:500}}>
                    {sosResult.success ? `Varsel sendt til ${sosResult.contacts_notified} kontakt${sosResult.contacts_notified>1?'er':''}` : 'Noe gikk galt. Prov igjen.'}
                  </div>
                )}
              </div>

              {/* Kontakt-liste */}
              <div style={{marginBottom:'1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.8rem'}}>
                  <div style={{fontSize:13,fontWeight:500,color:'#0a2a3d'}}>Dine nodkontakter ({emergencyContacts.length}/3)</div>
                </div>
                {emergencyContacts.length === 0 && (
                  <p style={{color:'#6b8fa3',fontSize:'0.88rem',marginBottom:'0.8rem'}}>Ingen nodkontakter lagt til enda.</p>
                )}
                {emergencyContacts.map(ec => (
                  <div key={ec.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.75rem 1rem',background:'#f8fbfc',borderRadius:12,marginBottom:6}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:36,height:36,borderRadius:'50%',background:'#e8f4f8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:500,color:'#1a6080',flexShrink:0}}>
                        {ec.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize:14,fontWeight:500,color:'#0a2a3d'}}>{ec.name}</div>
                        <div style={{fontSize:12,color:'#6b8fa3'}}>{ec.phone}{ec.relation ? ` · ${ec.relation}` : ''}</div>
                      </div>
                    </div>
                    <button onClick={async()=>{
                      await fetch('/api/min-side/emergency-contacts',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:ec.id})})
                      setEmergencyContacts(emergencyContacts.filter(c=>c.id!==ec.id))
                    }} style={{...S.btnDanger,padding:'0.4rem 0.8rem',fontSize:'0.78rem'}}>Fjern</button>
                  </div>
                ))}
              </div>

              {/* Legg til kontakt */}
              {emergencyContacts.length < 3 && (
                <>
                  <button onClick={()=>setShowAddEmergency(true)} style={{...S.btnPrimary,width:'100%',textAlign:'center'}}>
                    + Legg til nodkontakt
                  </button>
                  <BvSheet
                    open={showAddEmergency}
                    onClose={() => { setShowAddEmergency(false); setEcError('') }}
                    title="Ny nødkontakt"
                    footer={
                      <button onClick={async()=>{
                        setEcSaving(true); setEcError('')
                        const res = await fetch('/api/min-side/emergency-contacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:ecName,phone:ecPhone,relation:ecRelation||undefined})})
                        const d = await res.json()
                        setEcSaving(false)
                        if (d.contact) {
                          setEmergencyContacts([...emergencyContacts, d.contact])
                          setEcName(''); setEcPhone(''); setEcRelation(''); setShowAddEmergency(false)
                        } else setEcError(d.error||'Noe gikk galt')
                      }} disabled={ecSaving||!ecName||!ecPhone}
                        style={{...S.btnPrimary,width:'100%',padding:'12px 16px',opacity:(!ecName||!ecPhone)?0.5:1}}>
                        {ecSaving?'Lagrer...':'Legg til'}
                      </button>
                    }
                  >
                    {ecError && <div style={{background:'#fef2f2',color:'#ef4444',padding:'8px 12px',borderRadius:8,fontSize:13,marginBottom:12}}>{ecError}</div>}
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      <div>
                        <div style={{fontSize:11,color:'#6b8fa3',marginBottom:4}}>Navn</div>
                        <input placeholder="Navn" value={ecName} onChange={e=>setEcName(e.target.value)}
                          style={{...S.inp,padding:'0.65rem 1rem'}}/>
                      </div>
                      <div>
                        <div style={{fontSize:11,color:'#6b8fa3',marginBottom:4}}>Telefonnummer</div>
                        <input placeholder="+47XXXXXXXX" value={ecPhone} onChange={e=>setEcPhone(e.target.value)}
                          style={{...S.inp,padding:'0.65rem 1rem'}}/>
                      </div>
                      <div>
                        <div style={{fontSize:11,color:'#6b8fa3',marginBottom:4}}>Relasjon (valgfritt)</div>
                        <BvSelect
                          value={ecRelation}
                          onChange={setEcRelation}
                          ariaLabel="Relasjon"
                          placeholder="Velg relasjon"
                          options={[
                            { value: '', label: 'Ingen' },
                            { value: 'familie', label: 'Familie' },
                            { value: 'venn', label: 'Venn' },
                            { value: 'kollega', label: 'Kollega' },
                            { value: 'partner', label: 'Partner' },
                            { value: 'nabo', label: 'Nabo' },
                          ]}
                        />
                      </div>
                    </div>
                  </BvSheet>
                </>
              )}

              {/* Info-boks */}
              <div style={{marginTop:'1rem',padding:'0.85rem 1rem',background:'#f0f8fc',borderRadius:10,border:'1px solid rgba(26,96,128,0.1)'}}>
                <div style={{fontSize:12,fontWeight:500,color:'#1a6080',marginBottom:4}}>Hvordan fungerer nodvarsling?</div>
                <ul style={{margin:0,paddingLeft:16,fontSize:12,color:'#6b8fa3',lineHeight:1.8}}>
                  <li>Trykk SOS-knappen for a varsle alle kontaktene dine</li>
                  <li>Kontaktene mottar bade SMS og telefonoppringning</li>
                  <li>Din GPS-posisjon sendes med i sanntid</li>
                  <li>Maks 3 nodkontakter per abonnement</li>
                </ul>
              </div>
            </div>
          )}

          {/* ===== TAB: RAPPORT ===== */}
          {activeTab === 'rapport' && (
            <div>
              <button onClick={()=>{setActiveTab('lokasjoner');window.scrollTo({top:0,behavior:'smooth'})}} style={{display:'inline-flex',alignItems:'center',gap:6,background:'none',border:'none',color:'#6b8fa3',fontSize:13,cursor:'pointer',padding:'4px 0',marginBottom:'1rem',fontFamily:'inherit'}}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L3 6l4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Tilbake til oversikt
              </button>
              <RapportTab locs={locs} subEmail={sub!.email} />
            </div>
          )}

          {/* ===== TAB: KONTO ===== */}
          {activeTab === 'konto' && (
            <div style={{display:'flex',flexDirection:'column',gap:'0.6rem'}}>
              <button onClick={()=>{setActiveTab('lokasjoner');window.scrollTo({top:0,behavior:'smooth'})}} style={{alignSelf:'flex-start',display:'inline-flex',alignItems:'center',gap:6,background:'none',border:'none',color:'#6b8fa3',fontSize:13,cursor:'pointer',padding:'4px 0',marginBottom:'0.5rem',fontFamily:'inherit'}}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L3 6l4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Tilbake til oversikt
              </button>
              <div style={{padding:'0.75rem 1rem',background:'#f8fbfc',borderRadius:12}}>
                <div style={{fontSize:'0.75rem',color:'#6b8fa3',marginBottom:'2px'}}>E-postadresse</div>
                <div style={{fontWeight:500,color:'#0a2a3d'}}>{sub!.email}</div>
              </div>
              <div style={{padding:'0.75rem 1rem',background:'#f8fbfc',borderRadius:12}}>
                <div style={{fontSize:'0.75rem',color:'#6b8fa3',marginBottom:'2px'}}>Abonnement</div>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'}}>
                  <span style={{fontWeight:500,color:'#0a2a3d'}}>{planLabel[sub!.plan]}</span>
                  {(() => {
                    const s = sub!.status
                    if (s === 'trialing') {
                      const trialEnd = sub!.trial_ends_at ? new Date(sub!.trial_ends_at) : null
                      const trialLabel = trialEnd ? `Prøveperiode til ${trialEnd.getDate()}.${trialEnd.getMonth()+1}` : 'Prøveperiode'
                      return <span style={{fontSize:12,fontWeight:500,padding:'4px 10px',borderRadius:100,background:'#dbeafe',color:'#1e40af'}}>{trialLabel}</span>
                    }
                    if (s === 'active') return <span style={{fontSize:12,fontWeight:500,padding:'4px 10px',borderRadius:100,background:'#e8f5ed',color:'#16a34a'}}>Aktivt</span>
                    if (s === 'paused') return <span style={{fontSize:12,fontWeight:500,padding:'4px 10px',borderRadius:100,background:'#fef3c7',color:'#92400e'}}>Pauset</span>
                    if (s === 'past_due') return <span style={{fontSize:12,fontWeight:500,padding:'4px 10px',borderRadius:100,background:'#fee2e2',color:'#991b1b'}}>Betaling feilet</span>
                    if (s === 'cancelled') return <span style={{fontSize:12,fontWeight:500,padding:'4px 10px',borderRadius:100,background:'#f1f5f9',color:'#475569'}}>Avsluttet</span>
                    return <span style={{fontSize:12,fontWeight:500,padding:'4px 10px',borderRadius:100,background:'#f1f5f9',color:'#64748b'}}>Inaktivt</span>
                  })()}
                </div>
                {sub!.status === 'trialing' && sub!.next_charge_due_at && (
                  <div style={{fontSize:'0.75rem',color:'#6b8fa3',marginTop:'6px'}}>
                    Første belastning {new Date(sub!.next_charge_due_at).toLocaleDateString('nb-NO',{day:'numeric',month:'long'})}
                  </div>
                )}
              </div>

              {/* Betalingsmetode */}
              {sub!.payment_provider && (
                <div style={{padding:'0.75rem 1rem',background:'#f8fbfc',borderRadius:12}}>
                  <div style={{fontSize:'0.75rem',color:'#6b8fa3',marginBottom:'4px'}}>Betalingsmetode</div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    {sub!.payment_provider === 'vipps' ? (
                      <>
                        <span style={{display:'inline-flex',alignItems:'center',gap:6,fontWeight:600,color:'#ff5b24',fontSize:14}}>
                          <span style={{display:'inline-block',padding:'2px 8px',background:'#ff5b24',color:'#fff',borderRadius:4,fontSize:11,letterSpacing:'0.04em'}}>VIPPS</span>
                          {sub!.phone_number && (
                            <span style={{color:'#0a2a3d',fontWeight:500}}>
                              {sub!.phone_number.length === 8 ? `${sub!.phone_number.slice(0,3)} ${sub!.phone_number.slice(3,5)} ${sub!.phone_number.slice(5)}` : sub!.phone_number}
                            </span>
                          )}
                        </span>
                      </>
                    ) : (
                      <span style={{display:'inline-flex',alignItems:'center',gap:6,color:'#0a2a3d',fontSize:14,fontWeight:500}}>
                        <span style={{display:'inline-block',padding:'2px 8px',background:'#635bff',color:'#fff',borderRadius:4,fontSize:11,letterSpacing:'0.04em'}}>KORT</span>
                        Betaling via Stripe
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Kvitteringer */}
              <KvitteringerSeksjon email={sub!.email} />

              <div style={{padding:'0.75rem 1rem',background:'#f8fbfc',borderRadius:12}}>
                <div style={{fontSize:'0.75rem',color:'#6b8fa3',marginBottom:'8px'}}>Abonnementsstatus</div>
                {(sub!.status === 'active' || sub!.status === 'trialing') && sub!.payment_provider !== 'vipps' ? (
                  <button onClick={async()=>{setAccountLoading('pause');await fetch('/api/min-side/frys',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscriber_id:sub!.id,action:'pause'})});setSub({...sub!,status:'paused'});setAccountLoading(null)}}
                    style={{padding:'0.5rem 1rem',borderRadius:8,background:'#fff',border:'1px solid rgba(10,42,61,0.15)',color:'#0a2a3d',cursor:'pointer',fontSize:'0.82rem',fontWeight:500,display:'inline-flex',alignItems:'center',gap:'6px'}}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="2" width="3.5" height="9" rx="0.5" fill="currentColor"/><rect x="7.5" y="2" width="3.5" height="9" rx="0.5" fill="currentColor"/></svg>
                    {accountLoading==='pause'?'Fryser...':'Frys abonnement'}
                  </button>
                ) : (sub!.status === 'active' || sub!.status === 'trialing') && sub!.payment_provider === 'vipps' ? (
                  <p style={{fontSize:'0.82rem',color:'#0a2a3d',margin:0}}>
                    Vipps-abonnement kan ikke fryses. Bruk «Slett konto» nederst hvis du vil avslutte.
                  </p>
                ) : sub!.status === 'paused' ? (
                  <button onClick={async()=>{setAccountLoading('resume');await fetch('/api/min-side/frys',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscriber_id:sub!.id,action:'resume'})});setSub({...sub!,status:'active'});setAccountLoading(null)}}
                    style={{padding:'0.5rem 1rem',borderRadius:8,background:'#1a6080',border:'none',color:'white',cursor:'pointer',fontSize:'0.82rem',fontWeight:500,display:'inline-flex',alignItems:'center',gap:'6px'}}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 2l8 4.5-8 4.5V2z" fill="currentColor"/></svg>
                    {accountLoading==='resume'?'Aktiverer...':'Reaktiver abonnement'}
                  </button>
                ) : null}
                {sub!.status === 'paused' && <p style={{fontSize:'0.75rem',color:'#6b8fa3',margin:'6px 0 0'}}>Abonnementet er frosset. Reaktiver når du er klar.</p>}
              </div>
              <div style={{padding:'0.75rem 1rem',background:'#f8fbfc',borderRadius:12}}>
                <div style={{fontSize:'0.75rem',color:'#6b8fa3',marginBottom:'8px'}}>Leveringstidspunkt for daglig rapport</div>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                  <div style={{flex:'1 1 auto',maxWidth:160}}>
                    <BvSelect
                      value={sendTime}
                      onChange={setSendTime}
                      options={SEND_TIME_OPTIONS}
                      ariaLabel="Leveringstidspunkt"
                    />
                  </div>
                  <button onClick={async()=>{setSendTimeSaving(true);setSendTimeSaved(false);await fetch('/api/min-side/send-time',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscriber_id:sub!.id,send_time:sendTime})});setSendTimeSaving(false);setSendTimeSaved(true);setTimeout(()=>setSendTimeSaved(false),2500)}}
                    style={{padding:'0.4rem 1rem',borderRadius:8,background:'#0a2a3d',color:'white',border:'none',cursor:'pointer',fontSize:'0.85rem',fontWeight:500}}>
                    {sendTimeSaving?'Lagrer...':sendTimeSaved?'Lagret!':'Lagre'}
                  </button>
                </div>
                <p style={{fontSize:'0.75rem',color:'#6b8fa3',margin:'6px 0 0'}}>Velg når du vil motta rapporten — perfekt for tidlig morgenfiske</p>
              </div>
              <p style={{fontSize:'0.8rem',color:'#6b8fa3',padding:'0 0.5rem'}}>
                Spørsmål? Besøk <a href="/hjelp" style={{color:'#4da8cc'}}>hjelpesenteret</a> eller kontakt oss på <a href="mailto:hei@bolgevarsel.no" style={{color:'#4da8cc'}}>hei@bolgevarsel.no</a>
              </p>
              <div style={{borderTop:'1px solid rgba(10,42,61,0.07)',paddingTop:'0.75rem',marginTop:'0.25rem'}}>
                {!showDeleteConfirm ? (
                  <button onClick={()=>setShowDeleteConfirm(true)} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:'0.8rem',padding:'0 0.5rem',textDecoration:'underline',textUnderlineOffset:'2px'}}>Slett konto</button>
                ) : (
                  <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'0.85rem 1rem'}}>
                    <p style={{fontSize:'0.85rem',color:'#991b1b',fontWeight:500,margin:'0 0 0.3rem'}}>Er du sikker?</p>
                    <p style={{fontSize:'0.78rem',color:'#b91c1c',margin:'0 0 0.75rem',lineHeight:1.5}}>Data slettes permanent etter 30 dager.</p>
                    <div style={{display:'flex',gap:'0.5rem'}}>
                      <button onClick={async()=>{setAccountLoading('delete');await fetch('/api/min-side/slett-konto',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscriber_id:sub!.id})});await fetch('/api/auth/logout',{method:'POST'});localStorage.removeItem('bv_email');setView('login');setSub(null)}}
                        style={{padding:'0.45rem 1rem',borderRadius:8,background:'#ef4444',border:'none',color:'white',cursor:'pointer',fontSize:'0.82rem',fontWeight:500}}>
                        {accountLoading==='delete'?'Sletter...':'Ja, slett kontoen'}
                      </button>
                      <button onClick={()=>setShowDeleteConfirm(false)} style={{padding:'0.45rem 1rem',borderRadius:8,background:'white',border:'1px solid #fecaca',color:'#991b1b',cursor:'pointer',fontSize:'0.82rem'}}>Avbryt</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>{/* end hoveddel + S.card */}
        </div>{/* end bv-dashboard */}

        <div style={{textAlign:'center',padding:'1rem 0'}}>
        </div>
      </div>

      {/* SOS countdown-modal - åpnes via ?sos=trigger eller header SOS-knapp */}
      <SosCountdownModal
        open={sosCountdownOpen}
        emergencyContactCount={emergencyContacts.length}
        fallbackLocation={locs[0] ? { name: locs[0].name, lat: locs[0].lat, lon: locs[0].lon } : null}
        onClose={() => setSosCountdownOpen(false)}
      />

      {/* Lokasjons-detalj sheet */}
      <BvSheet
        open={!!selectedLoc}
        onClose={() => setSelectedLoc(null)}
        title={selectedLoc?.name || 'Lokasjon'}
      >
        {selectedLoc && (() => {
          const recCount = recs.filter(r=>r.location_id===selectedLoc.id).length
          const locRecs = recs.filter(r=>r.location_id===selectedLoc.id)
          const wd = selectedLocWeather
          return (
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {/* Status-pille */}
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'#f8fbfc',borderRadius:100,alignSelf:'flex-start'}}>
                <div style={{width:9,height:9,borderRadius:'50%',background:selectedLocScoreColor}}/>
                <span style={{fontSize:13,fontWeight:500,color:selectedLocScoreColor}}>{selectedLocScoreLabel}</span>
              </div>

              {/* AI-oppsummering */}
              {selectedLocSummary && (
                <p style={{margin:0,fontSize:13.5,color:'#334155',lineHeight:1.65,background:'#f8fafc',borderRadius:8,padding:'12px 14px',borderLeft:`3px solid ${selectedLocScoreColor}`}}>
                  {selectedLocSummary}
                </p>
              )}

              {/* Live sjødata stats */}
              {wd ? (
                <div style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(0, 1fr))',gap:8}}>
                  <div style={{background:'#f8fbfc',borderRadius:8,padding:'10px',textAlign:'center'}}>
                    <div style={{fontSize:10,color:'#6b8fa3',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>Bølger</div>
                    <div style={{fontSize:22,fontWeight:300,color:'#0a2a3d',lineHeight:1}}>{wd.avgWave.toFixed(1)}<span style={{fontSize:12,color:'#6b8fa3'}}>m</span></div>
                    <div style={{fontSize:11,color:'#6b8fa3',marginTop:2}}>maks {wd.maxWave.toFixed(1)}m</div>
                  </div>
                  <div style={{background:'#f8fbfc',borderRadius:8,padding:'10px',textAlign:'center'}}>
                    <div style={{fontSize:10,color:'#6b8fa3',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>Vind</div>
                    <div style={{fontSize:22,fontWeight:300,color:'#0a2a3d',lineHeight:1}}>{wd.windNow.toFixed(1)}<span style={{fontSize:12,color:'#6b8fa3'}}>m/s</span></div>
                    <div style={{fontSize:11,color:'#6b8fa3',marginTop:2}}>maks {wd.windMax.toFixed(1)}</div>
                  </div>
                  <div style={{background:'#f8fbfc',borderRadius:8,padding:'10px',textAlign:'center'}}>
                    <div style={{fontSize:10,color:'#6b8fa3',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>Luft / sjø</div>
                    <div style={{fontSize:22,fontWeight:300,color:'#0a2a3d',lineHeight:1}}>{Math.round(wd.temp)}<span style={{fontSize:12,color:'#6b8fa3'}}>°</span></div>
                    <div style={{fontSize:11,color:'#6b8fa3',marginTop:2}}>{wd.seaTemp !== null ? `sjø ${wd.seaTemp.toFixed(1)}°` : '—'}</div>
                  </div>
                </div>
              ) : (
                <div style={{background:'#f8fbfc',borderRadius:8,padding:'1rem',textAlign:'center',fontSize:13,color:'#6b8fa3'}}>
                  Henter sjødata...
                </div>
              )}

              {/* Posisjon */}
              <div style={{background:'#f8fbfc',borderRadius:12,padding:'12px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:10,color:'#6b8fa3',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3}}>Posisjon</div>
                  <div style={{fontSize:13,color:'#0a2a3d',fontFamily:'monospace'}}>
                    {selectedLoc.lat.toFixed(4)}°N · {selectedLoc.lon.toFixed(4)}°E
                  </div>
                </div>
                <a href={`https://www.google.com/maps?q=${selectedLoc.lat},${selectedLoc.lon}`} target="_blank" rel="noopener noreferrer"
                  style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:12,color:'#1a6080',textDecoration:'none',padding:'6px 10px',background:'white',borderRadius:6,border:'1px solid rgba(10,42,61,0.1)'}}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6c0-2.2 1.8-4 4-4s4 1.8 4 4c0 3-4 5-4 5S2 9 2 6z" stroke="currentColor" strokeWidth="1.2" fill="none"/><circle cx="6" cy="6" r="1.3" fill="currentColor"/></svg>
                  Maps
                </a>
              </div>

              {/* Mottakere på denne lokasjonen */}
              <div style={{background:'#f8fbfc',borderRadius:12,padding:'14px 16px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <div style={{fontSize:11,color:'#6b8fa3',textTransform:'uppercase',letterSpacing:'0.06em'}}>Mottakere på denne lokasjonen</div>
                  <span style={{fontSize:12,fontWeight:500,color:'#1a6080',background:'#e8f4f8',padding:'2px 8px',borderRadius:100}}>{recCount}</span>
                </div>
                {recCount === 0 ? (
                  <p style={{fontSize:13,color:'#6b8fa3',fontStyle:'italic',margin:'4px 0 8px'}}>Ingen mottakere lagt til for denne lokasjonen ennå.</p>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {locRecs.map(r => (
                      <div key={r.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0'}}>
                        <div style={{width:28,height:28,borderRadius:'50%',background:'#e8f4f8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500,color:'#1a6080',flexShrink:0}}>
                          {(r.name||r.phone).slice(0,2).toUpperCase()}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,color:'#0a2a3d',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.name||'Uten navn'}</div>
                          <div style={{fontSize:11,color:'#6b8fa3'}}>{r.phone}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={()=>{setSelectedLoc(null);setActiveTab('mottakere');setShowAddRec(true)}}
                  style={{...S.btnGhost,width:'100%',marginTop:10,fontSize:13,padding:'8px 12px'}}>
                  + Legg til mottaker for denne lokasjonen
                </button>
              </div>

              {/* Slett-knapp */}
              <button onClick={()=>{
                if (confirm(`Slett "${selectedLoc.name}"? Alle mottakere knyttet til denne lokasjonen blir også slettet.`)) {
                  deleteLoc(selectedLoc.id)
                  setSelectedLoc(null)
                }
              }} style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 7h3l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Slett lokasjon
              </button>
            </div>
          )
        })()}
      </BvSheet>
    </div>
  )
}
