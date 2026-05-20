export const dynamic = 'force-dynamic'

export default function AdminBrukere() {
  return (
    <div style={{minHeight:'100vh',background:'#071622',fontFamily:'DM Sans, sans-serif'}}>
      <nav style={{padding:'1rem 2rem',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',gap:'0.8rem'}}>
        <a href="/" style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:'1.3rem',fontWeight:600,color:'white',textDecoration:'none'}}><svg width="220" height="36" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="rgba(125,211,240,0.55)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
              <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="white" letterSpacing="-0.8">bølgevarsel<tspan fill="#7dd3fc" fontWeight="400">.no</tspan></text>
            </svg></a>
        <span style={{background:'#ef4444',color:'white',padding:'2px 8px',borderRadius:100,fontSize:'0.68rem',fontWeight:600}}>ADMIN</span>
        <a href="/admin" style={{color:'rgba(255,255,255,0.4)',fontSize:'0.85rem',textDecoration:'none',marginLeft:'0.5rem'}}>← Tilbake</a>
      </nav>

      <div style={{maxWidth:700,margin:'0 auto',padding:'2.5rem 1.5rem'}}>
        <h1 style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:'1.8rem',fontWeight:300,color:'white',marginBottom:'1.5rem'}}>👥 Brukere</h1>
        <div id="søk" style={{display:'flex',gap:'0.6rem',marginBottom:'1.5rem'}}>
          <input id="sokInput" placeholder="Søk på e-postadresse..." autoComplete="off"
            style={{flex:1,padding:'0.85rem 1.2rem',borderRadius:100,border:'1px solid rgba(255,255,255,0.12)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:'0.95rem',fontFamily:'inherit',outline:'none'}} />
          <button id="sokBtn" style={{background:'#4da8cc',color:'white',padding:'0.85rem 1.4rem',borderRadius:100,border:'none',cursor:'pointer',fontSize:'0.95rem',fontWeight:500}}>Søk</button>
        </div>
        <div id="resultat"></div>
      </div>

      <script dangerouslySetInnerHTML={{__html:`
const ADMIN_KEY = sessionStorage.getItem('adminKey') || 'ulrik-admin-2026'
const h = (k,v) => ({[k]:v})

document.getElementById('sokBtn').addEventListener('click', søk)
document.getElementById('sokInput').addEventListener('keydown', e => e.key==='Enter' && søk())

async function søk() {
  const q = document.getElementById('sokInput').value.trim()
  if (!q) return
  const res = document.getElementById('resultat')
  res.innerHTML = '<p style="color:rgba(255,255,255,0.4)">Søker...</p>'
  const r = await fetch('/api/admin/bruker?email='+encodeURIComponent(q), { headers:{'x-admin-key': ADMIN_KEY} })
  const d = await r.json()
  if (!d.subscriber) { res.innerHTML = '<p style="color:#ef4444">Ingen bruker funnet.</p>'; return }
  const s = d.subscriber
  const plan = {kyst:'Basis 49kr','kyst-pluss':'Standard 99kr',familie:'Familie 199kr',pro:'Pro 299kr',sikkerhet:'Sikkerhet 499kr'}[s.plan]||s.plan
  res.innerHTML = \`
    <div id="brukerKort" style="background:rgba(255,255,255,0.05);border-radius:20px;padding:1.5rem;border:1px solid rgba(255,255,255,0.08)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem">
        <div>
          <div style="font-weight:500;color:white;font-size:1.05rem">\${s.email}</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.4);margin-top:3px">\${plan} · \${s.status} · ID: \${s.id.slice(0,8)}...</div>
        </div>
        <span style="background:\${s.status==='active'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)'};color:\${s.status==='active'?'#4ade80':'#f87171'};padding:4px 10px;border-radius:100px;font-size:0.75rem;font-weight:500">\${s.status==='active'?'✅ Aktiv':'❌ Inaktiv'}</span>
      </div>

      <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:1rem;margin-bottom:1rem">
        <div style="font-size:0.72rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Endre e-postadresse</div>
        <div style="display:flex;gap:0.5rem">
          <input id="nyEmail" value="\${s.email}" style="flex:1;padding:0.6rem 0.9rem;border-radius:100px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:white;font-size:0.88rem;font-family:inherit;outline:none" />
          <button onclick="oppdater('${s.id}','email',document.getElementById('nyEmail').value)" style="background:#4da8cc;color:white;padding:0.6rem 1rem;border-radius:100px;border:none;cursor:pointer;font-size:0.85rem;font-weight:500">Lagre</button>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:1rem;margin-bottom:1rem">
        <div style="font-size:0.72rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Endre status</div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button onclick="oppdater('${s.id}','status','active')" style="background:rgba(34,197,94,0.15);color:#4ade80;padding:0.5rem 1rem;border-radius:100px;border:1px solid rgba(34,197,94,0.3);cursor:pointer;font-size:0.85rem">✅ Aktiver</button>
          <button onclick="oppdater('${s.id}','status','inactive')" style="background:rgba(239,68,68,0.15);color:#f87171;padding:0.5rem 1rem;border-radius:100px;border:1px solid rgba(239,68,68,0.3);cursor:pointer;font-size:0.85rem">❌ Deaktiver</button>
          <button onclick="oppdater('${s.id}','status','cancelled')" style="background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.4);padding:0.5rem 1rem;border-radius:100px;border:1px solid rgba(255,255,255,0.1);cursor:pointer;font-size:0.85rem">🚫 Kanseller</button>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:1rem;margin-bottom:1rem">
        <div style="font-size:0.72rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Mottakere (\${d.recipients.length})</div>
        \${d.recipients.map(r=>\`
          <div id="rec-\${r.id}" style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
            <div><span style="color:white;font-weight:500">\${r.name||r.phone}</span><span style="color:rgba(255,255,255,0.4);font-size:0.8rem"> · \${r.phone} · \${r.active?'Aktiv':'Pauset'}</span></div>
            <div style="display:flex;gap:0.4rem">
              <input id="rPhone-\${r.id}" value="\${r.phone}" placeholder="Telefon" style="width:130px;padding:4px 8px;border-radius:100px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:white;font-size:0.8rem;font-family:inherit;outline:none" />
              <button onclick="oppdaterMottaker('\${r.id}',document.getElementById('rPhone-\${r.id}').value,'\${r.name||''}')" style="background:#4da8cc;color:white;padding:4px 10px;border-radius:100px;border:none;cursor:pointer;font-size:0.78rem">💾</button>
              <button onclick="slettMottaker('\${r.id}')" style="background:rgba(239,68,68,0.15);color:#f87171;padding:4px 10px;border-radius:100px;border:none;cursor:pointer;font-size:0.78rem">🗑</button>
            </div>
          </div>
        \`).join('')}
      </div>

      <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:1rem">
        <div style="font-size:0.72rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">Lokasjoner (\${d.locations.length})</div>
        \${d.locations.map(l=>\`<div style="color:rgba(255,255,255,0.7);font-size:0.85rem;padding:4px 0">📍 \${l.name} (\${parseFloat(l.lat).toFixed(3)}, \${parseFloat(l.lon).toFixed(3)})</div>\`).join('')}
      </div>

      <div id="melding" style="margin-top:1rem;min-height:20px;text-align:center"></div>
    </div>\`
  window.__subId = s.id
}

async function oppdater(id, felt, verdi) {
  const r = await fetch('/api/admin/bruker', { method:'PATCH', headers:{'Content-Type':'application/json','x-admin-key':ADMIN_KEY},
    body: JSON.stringify({ subscriber_id:id, field:felt, value:verdi }) })
  const d = await r.json()
  const msg = document.getElementById('melding')
  if (d.subscriber) { msg.innerHTML='<span style="color:#4ade80">✓ Lagret!</span>'; setTimeout(()=>msg.innerHTML='',2000) }
  else msg.innerHTML='<span style="color:#f87171">Feil: '+d.error+'</span>'
}

async function oppdaterMottaker(id, phone, name) {
  const r = await fetch('/api/admin/mottaker', { method:'PATCH', headers:{'Content-Type':'application/json','x-admin-key':ADMIN_KEY},
    body: JSON.stringify({ id, phone, name }) })
  const d = await r.json()
  const msg = document.getElementById('melding')
  if (d.recipient) { msg.innerHTML='<span style="color:#4ade80">✓ Mottaker oppdatert!</span>'; setTimeout(()=>msg.innerHTML='',2000) }
}

async function slettMottaker(id) {
  if (!confirm('Slett mottaker?')) return
  await fetch('/api/admin/mottaker', { method:'DELETE', headers:{'Content-Type':'application/json','x-admin-key':ADMIN_KEY},
    body: JSON.stringify({ id }) })
  const el = document.getElementById('rec-'+id)
  if (el) el.remove()
}

// Sjekk admin-nøkkel
if (!sessionStorage.getItem('adminKey')) {
  const k = prompt('Admin-nøkkel:')
  if (k) sessionStorage.setItem('adminKey', k)
  else window.location.href = '/'
}
      `}} />
    </div>
  )
}
