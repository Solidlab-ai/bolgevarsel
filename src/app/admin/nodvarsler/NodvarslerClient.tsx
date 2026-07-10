'use client'
import { useState } from 'react'

interface Props { alerts: any[]; contacts: any[] }

export default function NodvarslerClient({ alerts, contacts }: Props) {
  const [showSms, setShowSms] = useState(false)
  const [smsTo, setSmsTo] = useState('')
  const [smsText, setSmsText] = useState('')
  const [smsSending, setSmsSending] = useState(false)
  const [melding, setMelding] = useState('')

  function openSmsFor(alert: any) {
    // Finn telefonnummer: først fra kontaktene som ble varslet, ellers fra subscriber
    const kontakter = Array.isArray(alert.contacts_notified) ? alert.contacts_notified : []
    const firstPhone = kontakter[0]?.phone || alert.bv_subscribers?.phone || ''
    setSmsTo(firstPhone)
    setSmsText('')
    setShowSms(true)
  }

  async function sendSms() {
    if (!smsTo || !smsText) return
    setSmsSending(true)
    try {
      const res = await fetch('/api/admin/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: smsTo, message: smsText }),
      })
      const d = await res.json()
      if (d.success) {
        setMelding('SMS sendt til ' + smsTo)
        setShowSms(false); setSmsTo(''); setSmsText('')
      } else {
        setMelding('Feil: ' + (d.error || 'Ukjent'))
      }
    } catch (err: any) {
      setMelding('Feil: ' + err.message)
    }
    setSmsSending(false)
    setTimeout(() => setMelding(''), 5000)
  }

  return (
    <div style={{minHeight:'100vh',background:'#071622',fontFamily:'DM Sans, sans-serif',color:'white'}}>
      <nav style={{padding:'1rem 2rem',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
          <a href="/admin" style={{textDecoration:'none'}}>
            <svg width="220" height="36" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="rgba(125,211,240,0.55)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
              <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="white" letterSpacing="-0.8">{"bølgevarsel"}<tspan fill="#7dd3fc" fontWeight="400">.no</tspan></text>
            </svg>
          </a>
          <span style={{background:'#ef4444',color:'white',padding:'2px 8px',borderRadius:100,fontSize:'0.68rem',fontWeight:600}}>ADMIN</span>
          <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.85rem'}}>/ Nodvarsler</span>
        </div>
        <div style={{display:'flex',gap:'0.6rem',alignItems:'center'}}>
          {melding && <span style={{fontSize:'0.82rem',color:melding.startsWith('Feil') ? '#f87171' : '#4ade80'}}>{melding}</span>}
          <a href="/admin" style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.5)',padding:'0.5rem 1rem',borderRadius:100,textDecoration:'none',fontSize:'0.82rem'}}>← Dashboard</a>
        </div>
      </nav>

      {/* SMS MODAL */}
      {showSms && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={() => setShowSms(false)}>
          <div style={{background:'#0d2d42',borderRadius:20,padding:'2rem',border:'1px solid rgba(255,255,255,0.1)',width:420,maxWidth:'90vw'}} onClick={e => e.stopPropagation()}>
            <h3 style={{margin:'0 0 1.2rem',fontFamily:"'Fraunces', Georgia, serif",fontWeight:400,fontSize:'1.3rem',color:'white'}}>Send SMS</h3>
            <div style={{marginBottom:'0.8rem'}}>
              <label style={{display:'block',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.4rem'}}>Telefonnummer</label>
              <input value={smsTo} onChange={e => setSmsTo(e.target.value)} placeholder="+47XXXXXXXX"
                style={{width:'100%',padding:'0.7rem 1rem',borderRadius:10,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:'0.95rem',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}} />
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label style={{display:'block',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.4rem'}}>Melding</label>
              <textarea value={smsText} onChange={e => setSmsText(e.target.value)} rows={4} placeholder="Skriv meldingen her..."
                style={{width:'100%',padding:'0.7rem 1rem',borderRadius:10,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:'0.95rem',fontFamily:'inherit',outline:'none',resize:'vertical',boxSizing:'border-box'}} />
              <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.3)',marginTop:'0.3rem',textAlign:'right'}}>{smsText.length} tegn</div>
            </div>
            <div style={{display:'flex',gap:'0.6rem'}}>
              <button onClick={sendSms} disabled={smsSending || !smsTo || !smsText}
                style={{flex:1,padding:'0.7rem',borderRadius:10,border:'none',background:smsSending||!smsTo||!smsText?'rgba(77,168,204,0.2)':'#4da8cc',color:'white',cursor:smsSending||!smsTo||!smsText?'not-allowed':'pointer',fontSize:'0.9rem',fontWeight:500,fontFamily:'inherit'}}>
                {smsSending ? 'Sender...' : 'Send SMS'}
              </button>
              <button onClick={() => setShowSms(false)}
                style={{padding:'0.7rem 1.2rem',borderRadius:10,border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'0.9rem',fontFamily:'inherit'}}>
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{maxWidth:1100,margin:'0 auto',padding:'2rem 1.5rem'}}>
        {/* STATS */}
        <div style={{display:'flex',gap:'1rem',marginBottom:'1.5rem',flexWrap:'wrap'}}>
          {[
            { label: 'Totalt utloste', verdi: alerts.length, farge: '#f87171' },
            { label: 'Manuelle SOS', verdi: alerts.filter(a => a.alert_type === 'manual_sos').length, farge: '#ef4444' },
            { label: 'Tester', verdi: alerts.filter(a => a.alert_type === 'test').length, farge: '#fbbf24' },
            { label: 'Registrerte nodkontakter', verdi: contacts.length, farge: '#4da8cc' },
            { label: 'Brukere med sikkerhet-plan', verdi: [...new Set(contacts.map(c => c.subscriber_id))].length, farge: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{background:'rgba(255,255,255,0.05)',borderRadius:16,padding:'1.2rem 1.5rem',border:'1px solid rgba(255,255,255,0.08)',flex:1,minWidth:150}}>
              <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'0.4rem'}}>{s.label}</div>
              <div style={{fontSize:'1.8rem',fontWeight:300,color:s.farge}}>{s.verdi}</div>
            </div>
          ))}
        </div>

        {/* VARSELLOGG */}
        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:16,padding:'1.5rem',border:'1px solid rgba(255,255,255,0.08)',marginBottom:'1.5rem'}}>
          <h2 style={{margin:'0 0 1rem',fontFamily:"'Fraunces', Georgia, serif",fontWeight:400,fontSize:'1.2rem'}}>🚨 Varsellogg</h2>
          {alerts.length === 0 ? (
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.9rem'}}>Ingen nodvarsler utlost enda.</p>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.06em'}}>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Tidspunkt</th>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Bruker</th>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Type</th>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Posisjon</th>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Koordinater</th>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Varslet</th>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Status</th>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}></th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a: any) => {
                  const tid = new Date(a.created_at)
                  const dato = tid.toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' })
                  const kl = tid.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  const kontakter = Array.isArray(a.contacts_notified) ? a.contacts_notified : []
                  const typeBadge: Record<string, { bg: string; color: string; label: string }> = {
                    manual_sos: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: 'SOS' },
                    auto_danger: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', label: 'Auto' },
                    test: { bg: 'rgba(77,168,204,0.15)', color: '#4da8cc', label: 'Test' },
                  }
                  const tb = typeBadge[a.alert_type] || typeBadge.test
                  const statusBadge: Record<string, { bg: string; color: string }> = {
                    delivered: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
                    triggered: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
                    acknowledged: { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
                    cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
                  }
                  const sb = statusBadge[a.status] || statusBadge.triggered
                  return (
                    <tr key={a.id} style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                      <td style={{padding:'0.75rem 0.8rem',fontSize:'0.85rem'}}>
                        <div>{dato}</div>
                        <div style={{color:'rgba(255,255,255,0.4)',fontSize:'0.75rem'}}>{kl}</div>
                      </td>
                      <td style={{padding:'0.75rem 0.8rem',fontSize:'0.85rem'}}>{a.bv_subscribers?.email || '—'}</td>
                      <td style={{padding:'0.75rem 0.8rem'}}>
                        <span style={{background:tb.bg,color:tb.color,padding:'2px 8px',borderRadius:100,fontSize:'0.72rem',fontWeight:600}}>{tb.label}</span>
                      </td>
                      <td style={{padding:'0.75rem 0.8rem',fontSize:'0.85rem',color:'rgba(255,255,255,0.7)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.location_name || '—'}</td>
                      <td style={{padding:'0.75rem 0.8rem',fontSize:'0.8rem',color:'rgba(255,255,255,0.5)',fontFamily:'monospace'}}>
                        {a.location_lat && a.location_lng ? (
                          <a href={`https://www.google.com/maps?q=${a.location_lat},${a.location_lng}`} target="_blank" rel="noopener noreferrer"
                            style={{color:'#7dd3fc',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>
                            {`${a.location_lat}, ${a.location_lng}`}
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 1h6v6M11 1L4 8" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </a>
                        ) : '—'}
                      </td>
                      <td style={{padding:'0.75rem 0.8rem',fontSize:'0.85rem'}}>
                        {kontakter.map((k: any, i: number) => (
                          <div key={i} style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.6)',marginBottom:2}}>
                            {k.name} ({k.method === 'voice_call' ? '📞' : '💬'} {k.status})
                          </div>
                        ))}
                      </td>
                      <td style={{padding:'0.75rem 0.8rem'}}>
                        <span style={{background:sb.bg,color:sb.color,padding:'2px 8px',borderRadius:100,fontSize:'0.72rem',fontWeight:600}}>{a.status}</span>
                      </td>
                      <td style={{padding:'0.75rem 0.8rem'}}>
                        <button onClick={() => openSmsFor(a)} title="Send SMS"
                          style={{background:'rgba(77,168,204,0.15)',color:'#4da8cc',border:'1px solid rgba(77,168,204,0.25)',borderRadius:8,padding:'0.35rem 0.6rem',cursor:'pointer',fontSize:'0.72rem',fontWeight:500,fontFamily:'inherit',whiteSpace:'nowrap'}}>
                          💬 SMS
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* REGISTRERTE NODKONTAKTER */}
        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:16,padding:'1.5rem',border:'1px solid rgba(255,255,255,0.08)'}}>
          <h2 style={{margin:'0 0 1rem',fontFamily:"'Fraunces', Georgia, serif",fontWeight:400,fontSize:'1.2rem'}}>👥 Registrerte nodkontakter</h2>
          {contacts.length === 0 ? (
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.9rem'}}>Ingen nodkontakter registrert.</p>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.06em'}}>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Abonnent</th>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Kontaktnavn</th>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Telefon</th>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Relasjon</th>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Status</th>
                  <th style={{textAlign:'left',padding:'0.5rem 0.8rem',fontWeight:500}}>Registrert</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c: any) => (
                  <tr key={c.id} style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                    <td style={{padding:'0.75rem 0.8rem',fontSize:'0.85rem'}}>{c.bv_subscribers?.email || '—'}</td>
                    <td style={{padding:'0.75rem 0.8rem',fontSize:'0.85rem'}}>{c.name}</td>
                    <td style={{padding:'0.75rem 0.8rem',fontSize:'0.85rem',color:'rgba(255,255,255,0.6)',fontFamily:'monospace'}}>{c.phone}</td>
                    <td style={{padding:'0.75rem 0.8rem',fontSize:'0.85rem',color:'rgba(255,255,255,0.6)'}}>{c.relation || '—'}</td>
                    <td style={{padding:'0.75rem 0.8rem'}}>
                      <span style={{background:c.active?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',color:c.active?'#4ade80':'#f87171',padding:'2px 8px',borderRadius:100,fontSize:'0.72rem',fontWeight:600}}>{c.active?'Aktiv':'Inaktiv'}</span>
                    </td>
                    <td style={{padding:'0.75rem 0.8rem',fontSize:'0.8rem',color:'rgba(255,255,255,0.4)'}}>{new Date(c.created_at).toLocaleDateString('nb-NO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
