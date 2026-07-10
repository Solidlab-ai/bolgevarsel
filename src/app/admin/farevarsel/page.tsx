export const dynamic = 'force-dynamic'

export default function FarevarselAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return (
    <div style={{minHeight:'100vh',background:'#0a2a3d',fontFamily:'DM Sans, sans-serif'}}>
      <nav style={{padding:'1.2rem 2rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',maxWidth:640,margin:'0 auto'}}>
          <a href="/" style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:'1.3rem',fontWeight:600,color:'white',textDecoration:'none'}}>
            <svg width="220" height="36" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="rgba(125,211,240,0.55)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
              <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="white" letterSpacing="-0.8">bølgevarsel<tspan fill="#7dd3fc" fontWeight="400">.no</tspan></text>
            </svg>
          </a>
          <span style={{marginLeft:'0.8rem',fontSize:'0.7rem',background:'#ef4444',color:'white',padding:'2px 8px',borderRadius:100,fontWeight:500}}>ADMIN</span>
        </div>
      </nav>

      <div style={{maxWidth:580,margin:'0 auto',padding:'3rem 1.5rem'}}>
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <span style={{fontSize:'3rem',display:'block',marginBottom:'0.8rem'}}>🚨</span>
          <h1 style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:'2.2rem',fontWeight:300,color:'white',marginBottom:'0.5rem'}}>Send farevarsel</h1>
          <p style={{color:'rgba(255,255,255,0.5)'}}>Sender SMS til alle aktive abonnenter</p>
        </div>

        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:20,padding:'1.8rem',border:'1px solid rgba(255,255,255,0.1)'}}>

          <div style={{marginBottom:'1.2rem'}}>
            <label style={{display:'block',fontSize:'0.78rem',color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'0.5rem'}}>Alvorlighetsgrad</label>
            <div style={{display:'flex',gap:'0.5rem'}} id="niva-group">
              <button data-niva="ekstrem" style={{flex:1,padding:'0.6rem',borderRadius:10,border:'1.5px solid #ef444440',color:'#ef4444',fontSize:'0.85rem',fontWeight:500,cursor:'pointer',background:'transparent'}}>🚨 Ekstrem</button>
              <button data-niva="hoy" style={{flex:1,padding:'0.6rem',borderRadius:10,border:'2px solid #f59e0b',color:'#f59e0b',fontSize:'0.85rem',fontWeight:500,cursor:'pointer',background:'rgba(245,158,11,0.1)'}}>⚠️ Høy</button>
              <button data-niva="moderat" style={{flex:1,padding:'0.6rem',borderRadius:10,border:'1.5px solid #4da8cc40',color:'#4da8cc',fontSize:'0.85rem',fontWeight:500,cursor:'pointer',background:'transparent'}}>⚡ Moderat</button>
            </div>
          </div>

          <div style={{marginBottom:'0.5rem'}}>
            <label style={{display:'block',fontSize:'0.78rem',color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'0.5rem'}}>Meldingstekst</label>
            <textarea id="melding" rows={4}
              placeholder="Eks: Ekstremvær i Rogaland og Vestland. Vindkast opp til 40 m/s. Unngå sjøen i dag."
              style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:12,padding:'0.9rem 1rem',color:'white',fontSize:'0.95rem',fontFamily:'DM Sans,sans-serif',resize:'vertical',outline:'none',boxSizing:'border-box'}}></textarea>
            <div id="teller" style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.3)',textAlign:'right',marginTop:'3px'}}>0/140 tegn</div>
          </div>

          <div id="preview" style={{display:'none',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:12,padding:'1rem',marginBottom:'1.2rem',marginTop:'1rem'}}>
            <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.06em'}}>SMS-forhåndsvisning</div>
            <div id="preview-tekst" style={{color:'rgba(255,255,255,0.85)',fontSize:'0.88rem',lineHeight:1.6,whiteSpace:'pre-line'}}></div>
          </div>

          <button id="sendBtn" style={{width:'100%',background:'#ef4444',color:'white',padding:'1rem',borderRadius:12,border:'none',cursor:'pointer',fontSize:'1rem',fontWeight:600,marginTop:'1rem'}}>
            🚨 Send farevarsel til alle abonnenter
          </button>
          <div id="resultat" style={{marginTop:'1rem'}}></div>
        </div>
        <p style={{textAlign:'center',color:'rgba(255,255,255,0.2)',fontSize:'0.78rem',marginTop:'1.5rem'}}>
          Denne siden sender SMS til alle betalende abonnenter.
        </p>
      </div>

      <script dangerouslySetInnerHTML={{__html:`
const SUPABASE_URL = '${supabaseUrl}'
let valgtNiva = 'hoy'

// Alvorlighetsgrad-knapper
document.getElementById('niva-group').addEventListener('click', e => {
  const btn = e.target.closest('[data-niva]')
  if (!btn) return
  valgtNiva = btn.dataset.niva
  const colors = { ekstrem:'#ef4444', hoy:'#f59e0b', moderat:'#4da8cc' }
  document.querySelectorAll('[data-niva]').forEach(b => {
    const c = colors[b.dataset.niva]
    b.style.border = '1.5px solid ' + c + '40'
    b.style.background = 'transparent'
  })
  btn.style.border = '2px solid ' + colors[valgtNiva]
  btn.style.background = 'rgba(' + (valgtNiva==='ekstrem'?'239,68,68':valgtNiva==='hoy'?'245,158,11':'77,168,204') + ',0.1)'
})

// Tegnteller + forhåndsvisning
document.getElementById('melding').addEventListener('input', function() {
  const emojis = { ekstrem:'🚨', hoy:'⚠️', moderat:'⚡' }
  const tekst = this.value
  document.getElementById('teller').textContent = tekst.length + '/140 tegn'
  if (tekst.length > 0) {
    const sms = emojis[valgtNiva] + ' FAREVARSEL fra Bolgevarsel.no:\\n' + tekst + '\\n\\nHold dere inne og ta vare paa dere!'
    document.getElementById('preview-tekst').textContent = sms
    document.getElementById('preview').style.display = 'block'
  } else {
    document.getElementById('preview').style.display = 'none'
  }
})

// Send
document.getElementById('sendBtn').addEventListener('click', async () => {
  const melding = document.getElementById('melding').value.trim()
  if (!melding) { alert('Skriv inn en melding først!'); return }
  const btn = document.getElementById('sendBtn')
  btn.disabled = true
  btn.textContent = '⏳ Sender...'
  const res = document.getElementById('resultat')
  try {
    const r = await fetch(SUPABASE_URL + '/functions/v1/farevarsel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ melding, alvorlighetsniva: valgtNiva })
    })
    const d = await r.json()
    if (d.sendt !== undefined) {
      res.innerHTML = '<div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:12px;padding:1rem;color:#4ade80;text-align:center"><strong>' + d.sendt + ' SMS sendt!</strong><br><span style="font-size:0.85rem;opacity:0.7">' + (d.mottakere||[]).map(m=>m.name||m.phone).join(', ') + '</span></div>'
    } else {
      res.innerHTML = '<div style="color:#ef4444;padding:0.8rem;text-align:center">Feil: ' + (d.error||'Ukjent feil') + '</div>'
    }
  } catch(e) {
    res.innerHTML = '<div style="color:#ef4444;padding:0.8rem;text-align:center">Nettverksfeil. Prøv igjen.</div>'
  }
  btn.disabled = false
  btn.textContent = '🚨 Send farevarsel til alle abonnenter'
})
      `}} />
    </div>
  )
}
