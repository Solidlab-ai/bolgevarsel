export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Enkel validering
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, company } = await req.json()

    // Honeypot: ekte brukere fyller aldri ut "company"-feltet (skjult i UI).
    // Bots gjør det ofte — vi later som alt gikk bra, men gjør ingenting.
    if (company) {
      return NextResponse.json({ ok: true })
    }

    // Validering
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Skriv inn navnet ditt.' }, { status: 400 })
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Skriv inn en gyldig e-postadresse.' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Meldingen må være på minst 10 tegn.' }, { status: 400 })
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Meldingen er for lang (maks 5000 tegn).' }, { status: 400 })
    }

    const cleanName = name.trim().slice(0, 120)
    const cleanSubject = (subject || '').toString().trim().slice(0, 200) || 'Henvendelse fra kontaktskjema'
    const cleanMessage = message.trim()
    const userAgent = req.headers.get('user-agent')?.slice(0, 300) || null

    // Lagre i Supabase (backup uansett om e-post går gjennom)
    const supabase = getSupabaseAdmin()
    const { data: saved } = await supabase
      .from('bv_contact_messages')
      .insert({
        name: cleanName,
        email: email.trim(),
        subject: cleanSubject,
        message: cleanMessage,
        user_agent: userAgent,
      })
      .select('id')
      .maybeSingle()

    // Send e-post til hei@bolgevarsel.no via Resend
    const RESEND_KEY = process.env.RESEND_API_KEY
    let emailSent = false
    if (RESEND_KEY) {
      const escapeHtml = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#0a2a3d">
          <h2 style="font-weight:500">Ny henvendelse fra kontaktskjemaet</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#6b8fa3;width:90px">Navn</td><td style="padding:8px 0">${escapeHtml(cleanName)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b8fa3">E-post</td><td style="padding:8px 0"><a href="mailto:${escapeHtml(email.trim())}" style="color:#1a6080">${escapeHtml(email.trim())}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b8fa3">Emne</td><td style="padding:8px 0">${escapeHtml(cleanSubject)}</td></tr>
          </table>
          <div style="margin-top:1.2rem;padding:1.2rem;background:#f0f8fc;border-radius:12px;white-space:pre-wrap;line-height:1.6;font-size:14px">${escapeHtml(cleanMessage)}</div>
          <p style="margin-top:1.2rem;font-size:12px;color:#6b8fa3">Svar direkte på denne e-posten for å nå avsenderen.</p>
        </div>`

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Bølgevarsel <noreply@bolgevarsel.no>',
          to: ['hei@bolgevarsel.no'],
          reply_to: email.trim(),
          subject: `[Kontakt] ${cleanSubject}`,
          html,
        }),
      })
      const resendData = await resendRes.json()
      emailSent = !!resendData.id

      if (emailSent && saved?.id) {
        await supabase.from('bv_contact_messages').update({ email_sent: true }).eq('id', saved.id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Noe gikk galt. Prøv igjen senere.' }, { status: 500 })
  }
}
