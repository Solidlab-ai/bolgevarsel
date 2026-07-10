export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin as checkAdmin } from '@/lib/adminAuth'


export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subscriber_id, email } = await req.json()
  const supabase = getSupabaseAdmin()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bolgevarsel.no'

  // Slett gamle tokens for denne brukeren
  await supabase.from('bv_magic_tokens').delete().eq('subscriber_id', subscriber_id)

  // Generer nytt token
  const { data: tokenRow, error } = await supabase
    .from('bv_magic_tokens')
    .insert({ subscriber_id })
    .select()
    .single()

  if (error || !tokenRow) return NextResponse.json({ error: 'Kunne ikke generere token' }, { status: 500 })

  const link = `${siteUrl}/logg-inn?token=${tokenRow.token}`

  // Send e-post via Resend
  const resendKey = process.env.RESEND_API_KEY
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Bølgevarsel <noreply@bolgevarsel.no>',
      to: [email],
      subject: 'Din innloggingslenke til Bølgevarsel',
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px"><tr><td align="center">
<table width="520" style="max-width:520px;width:100%">
<tr><td style="background:linear-gradient(135deg,#0a2a3d,#1a6080);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center">
  <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.12em">Bølgevarsel</p>
  <h1 style="margin:0;font-size:22px;font-weight:300;color:white">Din innloggingslenke</h1>
</td></tr>
<tr><td style="background:white;padding:36px 40px;text-align:center">
  <p style="margin:0 0 8px;font-size:16px;color:#334155">Klikk på knappen under for å logge inn på Min side</p>
  <p style="margin:0 0 28px;font-size:13px;color:#94a3b8">Lenken er gyldig i 1 time og kan kun brukes én gang</p>
  <a href="${link}" style="display:inline-block;background:#0a2a3d;color:white;padding:14px 32px;border-radius:100px;text-decoration:none;font-size:15px;font-weight:600">Logg inn på Min side →</a>
  <p style="margin:24px 0 0;font-size:12px;color:#cbd5e1">Eller kopier denne lenken:<br/><span style="color:#4da8cc;word-break:break-all">${link}</span></p>
</td></tr>
<tr><td style="background:#0a2a3d;border-radius:0 0 16px 16px;padding:16px 40px;text-align:center">
  <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3)">Hvis du ikke ba om denne lenken kan du ignorere e-posten</p>
</td></tr>
</table></td></tr></table></body></html>`,
    }),
  })

  const emailJson = await emailRes.json()
  if (emailJson.id) return NextResponse.json({ ok: true, email_id: emailJson.id })
  return NextResponse.json({ error: 'E-post feilet', details: emailJson }, { status: 500 })
}
