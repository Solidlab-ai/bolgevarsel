export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin as checkAdmin } from '@/lib/adminAuth'


export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, subscriber_email } = await req.json()
  if (!to) return NextResponse.json({ error: 'Mangler to' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bolgevarsel.no'
  const RESEND_KEY = process.env.RESEND_API_KEY!

  // Finn subscriber
  const lookupEmail = subscriber_email || to
  const { data: sub } = await supabase
    .from('bv_subscribers')
    .select('id, email, plan, send_time, bv_locations(id,name,lat,lon), bv_recipients(id,name,email,profile,active)')
    .eq('email', lookupEmail)
    .maybeSingle()

  if (!sub) return NextResponse.json({ error: `Finner ikke subscriber: ${lookupEmail}` }, { status: 404 })

  const locations = (sub.bv_locations as any[]) ?? []
  const recipients = ((sub.bv_recipients as any[]) ?? []).filter((r: any) => r.active)
  if (!locations.length) return NextResponse.json({ error: 'Ingen lokasjoner' }, { status: 400 })

  const profile = recipients[0]?.profile || null
  const recipientName = recipients[0]?.name || ''

  // Hent værmeldingen + AI-oppsummering for alle lokasjoner
  const lokasjoner = await Promise.all(locations.map(async (loc: any) => {
    const res = await fetch(`${siteUrl}/api/min-side/rapport?lat=${loc.lat}&lon=${loc.lon}&profile=${profile || ''}&days=1`)
    const data = await res.json()
    const day = data.days?.[0]

    // Hent AI-oppsummering
    let oppsummering: string | undefined
    try {
      const oppRes = await fetch(`${siteUrl}/api/min-side/oppsummering`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lokasjon: loc.name, profile, day }),
      })
      const oppData = await oppRes.json()
      if (oppData.tekst) oppsummering = oppData.tekst
    } catch (e) { console.warn('Oppsummering feilet', e) }

    return { navn: loc.name, day, oppsummering }
  }))

  // Generer magic token (24t)
  let loginUrl: string | undefined
  try {
    const { data: tokenRow } = await supabase
      .from('bv_magic_tokens')
      .insert({ subscriber_id: sub.id, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
      .select().maybeSingle()
    if (tokenRow?.token) loginUrl = `${siteUrl}/api/auth/verify?token=${tokenRow.token}`
  } catch (e) { console.warn('Token feilet', e) }

  // Bygg e-post
  const profileNames: Record<string, string> = {
    surfer: 'Surferapport', kitesurfer: 'Kiterapport', windsurfer: 'Windsurfrapport',
    fisker: 'Fiskerapport', familie: 'Barn/ungdom-rapport', baatforer: 'Navigasjonsrapport',
    kajakk: 'Padlerapport', seiler: 'Seilerapport', fridykker: 'Dykkerapport',
  }
  const reportType = (profile && profileNames[profile]) || 'Sjørapport'
  const dateStr = new Date().toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })
  const dateCapitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
  const sendTime = sub.send_time || '09:30'
  const greeting = recipientName ? `Hei ${recipientName}!` : 'Din daglige sjørapport'
  const intro = `Din daglige ${reportType.toLowerCase()}, levert kl. ${sendTime}.`
  const loginBtn = loginUrl
    ? `<a href="${loginUrl}" style="display:inline-block;background:#4da8cc;color:white;font-size:12px;font-weight:600;padding:7px 18px;border-radius:100px;text-decoration:none">Se full rapport &#8594;</a>`
    : `<a href="${siteUrl}/min-side" style="font-size:12px;color:rgba(255,255,255,0.5)">Administrer varsler &#8594;</a>`

  const seksjonHtml = lokasjoner.map(({ navn, day: d, oppsummering }: any) => {
    if (!d) return ''
    const farge = d.rating?.farge || '#1a6080'
    return `
    <div style="margin-bottom:24px">
      <h2 style="margin:0 0 12px;font-size:17px;font-weight:600;color:#0a2a3d;border-bottom:2px solid ${farge};padding-bottom:6px">${navn}</h2>
      <div style="background:${farge}18;border-left:4px solid ${farge};padding:12px 14px;border-radius:0 8px 8px 0;margin-bottom:16px">
        <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:${farge}">${d.rating?.tekst || '—'}</p>
        <p style="margin:0;font-size:12px;color:${farge};opacity:0.8">${d.avgWave?.toFixed(1)}m bølger · ${d.windNow?.toFixed(1)} m/s vind</p>
      </div>
      ${oppsummering ? `<p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.65;background:#f8fafc;border-radius:8px;padding:14px 16px">${oppsummering}</p>` : ''}
      <table width="100%" cellpadding="0" cellspacing="4" style="margin-bottom:14px">
        <tr>
          <td style="padding:10px;background:#f8fafc;border-radius:8px;text-align:center;width:30%">
            <p style="margin:0 0 2px;font-size:10px;color:#64748b;text-transform:uppercase">Lufttemp</p>
            <p style="margin:0;font-size:22px;font-weight:300;color:#0a2a3d">${Math.round(d.temp || 0)}°</p>
          </td>
          <td width="2%"></td>
          <td style="padding:10px;background:#f8fafc;border-radius:8px;text-align:center;width:34%">
            <p style="margin:0 0 2px;font-size:10px;color:#64748b;text-transform:uppercase">Vind nå / maks</p>
            <p style="margin:0;font-size:20px;font-weight:300;color:#0a2a3d">${d.windNow?.toFixed(1)}<span style="font-size:12px;color:#64748b"> / ${d.windMax?.toFixed(1)} m/s</span></p>
            <p style="margin:2px 0 0;font-size:11px;color:#64748b">${d.windDesc || ''} fra ${d.waveDir || ''}</p>
          </td>
          <td width="2%"></td>
          <td style="padding:10px;background:#f8fafc;border-radius:8px;text-align:center;width:32%">
            <p style="margin:0 0 2px;font-size:10px;color:#64748b;text-transform:uppercase">Bølger / periode</p>
            <p style="margin:0;font-size:20px;font-weight:300;color:#0a2a3d">${d.avgWave?.toFixed(1)}<span style="font-size:12px;color:#64748b">m</span></p>
          </td>
        </tr>
      </table>
      ${d.seaTemp != null ? `<p style="margin:0 0 4px;font-size:13px;color:#64748b">Sjøtemperatur: <strong>${d.seaTemp?.toFixed(1)}°C</strong></p>` : ''}
      ${d.bestTime ? `<p style="margin:0;font-size:13px;color:#64748b">Beste tidspunkt: <strong>${d.bestTime}</strong></p>` : ''}
    </div>`
  }).join('<hr style="border:none;border-top:2px solid #f0f4f8;margin:8px 0"/>')

  const worstRating = lokasjoner.reduce((w: any, l: any) =>
    (l.day?.rating?.score ?? 0) > (w?.day?.rating?.score ?? 0) ? l : w, lokasjoner[0])

  const html = `<!DOCTYPE html><html lang="nb"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:linear-gradient(135deg,#0a2a3d,#1a6080);border-radius:16px 16px 0 0;padding:36px 40px">
  <table width="100%"><tr>
    <td>
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.45)">Bølgevarsel · ${reportType}</p>
      <h1 style="margin:0 0 4px;font-size:26px;font-weight:300;color:#ffffff">${greeting}</h1>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.55)">${intro}</p>
    </td>
    <td style="text-align:right;vertical-align:top">
      <span style="display:inline-block;background:${worstRating?.day?.rating?.farge || '#16a34a'};color:white;font-size:11px;font-weight:600;padding:4px 12px;border-radius:100px">${worstRating?.day?.rating?.tekst || ''}</span>
    </td>
  </tr></table>
</td></tr>
<tr><td style="background:#ffffff;padding:28px 40px">${seksjonHtml}</td></tr>
<tr><td style="background:#0a2a3d;border-radius:0 0 16px 16px;padding:20px 40px">
  <table width="100%"><tr>
    <td><p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35)">Data fra MET Norge og Open-Meteo · Test-utsending</p></td>
    <td style="text-align:right">${loginBtn}</td>
  </tr></table>
</td></tr>
</table></td></tr></table></body></html>`

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Bølgevarsel <noreply@bolgevarsel.no>',
      to: [to],
      subject: `[TEST] ${dateCapitalized} — ${worstRating?.day?.rating?.tekst || reportType}`,
      html,
    }),
  })

  const resendData = await resendRes.json()
  if (!resendData.id) return NextResponse.json({ error: 'E-post feilet', detail: resendData }, { status: 500 })

  return NextResponse.json({
    ok: true,
    email_id: resendData.id,
    to,
    subscriber: sub.email,
    lokasjoner: locations.map((l: any) => l.name),
    profile,
    login_url: loginUrl || null,
  })
}
