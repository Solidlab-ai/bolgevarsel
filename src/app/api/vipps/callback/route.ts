export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { fetchAgreement } from '@/lib/vipps'
import { getSupabaseAdmin } from '@/lib/supabase'

const RESEND_KEY = process.env.RESEND_API_KEY!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bolgevarsel.no'

async function sendWelcomeEmail(email: string, plan: string, loginLink: string) {
  const planNavn: Record<string, string> = { kyst: 'Kyst', familie: 'Familie', pro: 'Pro' }
  const planPris: Record<string, string> = { kyst: '49', familie: '179', pro: '299' }
  const navn = planNavn[plan] || plan
  const pris = planPris[plan] || '–'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Bølgevarsel <noreply@bolgevarsel.no>',
      to: [email],
      subject: '🌊 Velkommen til Bølgevarsel – logg inn her',
      html: `<!DOCTYPE html><html lang="nb"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px"><tr><td align="center">
<table width="560" style="max-width:560px;width:100%">

<tr><td style="background:linear-gradient(135deg,#0a2a3d,#1a6080);border-radius:16px 16px 0 0;padding:40px;text-align:center">
  <p style="margin:0 0 8px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.14em">Bølgevarsel</p>
  <h1 style="margin:0 0 6px;font-size:28px;font-weight:300;color:#fff">Velkommen om bord! 🌊</h1>
  <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.65)">Abonnementet ditt er nå aktivt</p>
</td></tr>

<tr><td style="background:#fff;padding:36px 40px">
  <p style="margin:0 0 20px;font-size:16px;color:#334155;line-height:1.6">
    Hei! Du er nå registrert med <strong>${navn}-abonnementet</strong> og har <strong style="color:#16a34a">7 dager gratis prøveperiode</strong>. Varsler starter fra i morgen — du belastes ikke før prøveperioden er over.
  </p>

  <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0">
    <p style="margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em">Din ordre</p>
    <table width="100%">
      <tr><td style="font-size:15px;color:#334155;padding:4px 0">Plan</td><td style="font-size:15px;font-weight:600;color:#0a2a3d;text-align:right">${navn}</td></tr>
      <tr><td style="font-size:15px;color:#334155;padding:4px 0;border-top:1px solid #f1f5f9">Pris</td><td style="font-size:15px;font-weight:600;color:#0a2a3d;text-align:right;border-top:1px solid #f1f5f9">${pris} kr/mnd</td></tr>
      <tr><td style="font-size:15px;color:#334155;padding:4px 0;border-top:1px solid #f1f5f9">Prøveperiode</td><td style="font-size:15px;font-weight:600;color:#16a34a;text-align:right;border-top:1px solid #f1f5f9">7 dager gratis</td></tr>
      <tr><td style="font-size:15px;color:#334155;padding:4px 0;border-top:1px solid #f1f5f9">Fakturering</td><td style="font-size:15px;font-weight:600;color:#0a2a3d;text-align:right;border-top:1px solid #f1f5f9">Månedlig via Vipps</td></tr>
    </table>
  </div>

  <p style="margin:0 0 8px;font-size:15px;color:#334155">Neste steg — sett opp din kystlokasjon og mottakere ved å logge inn på Min side:</p>

  <div style="text-align:center;margin:24px 0">
    <a href="${loginLink}" style="display:inline-block;background:#0a2a3d;color:white;padding:16px 36px;border-radius:100px;text-decoration:none;font-size:16px;font-weight:600">
      Logg inn og sett opp varselet →
    </a>
  </div>

  <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center">
    Denne innloggingslenken er gyldig i 24 timer og kan kun brukes én gang.<br/>
    Spørsmål? Svar på denne e-posten eller kontakt oss på hei@bolgevarsel.no
  </p>
</td></tr>

<tr><td style="background:#0a2a3d;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center">
  <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4)">Bølgevarsel.no · Du mottar denne e-posten fordi du opprettet et abonnement</p>
</td></tr>

</table></td></tr></table></body></html>`,
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error('[vipps-callback] Resend error', res.status, errText)
  }
}

/**
 * GET /api/vipps/callback?email=xxx
 *
 * Vipps redirecter brukeren hit etter bekreftelse i appen.
 * Vi henter agreement-status, oppdaterer DB, og redirecter brukeren videre
 * til /velkommen (suksess) eller /registrer?error=vipps (feil).
 *
 * Merk: Vipps garanterer ikke at brukeren faktisk havner her — appen kan ha blitt lukket.
 * Webhook-en (/api/vipps/webhook) er den autoritative kilden for status-endringer.
 * Denne callbacken er for at brukeren skal ende opp riktig sted i flow-en.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const email = url.searchParams.get('email')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bolgevarsel.no'

  if (!email) {
    return NextResponse.redirect(`${baseUrl}/registrer?error=missing_email`)
  }

  try {
    const supabase = getSupabaseAdmin()

    // Hent agreement_id + plan + id fra DB
    const { data: sub } = await supabase
      .from('bv_subscribers')
      .select('id, vipps_agreement_id, plan, status')
      .eq('email', email)
      .maybeSingle()

    if (!sub?.vipps_agreement_id) {
      return NextResponse.redirect(`${baseUrl}/registrer?error=no_agreement`)
    }

    // Spør Vipps om status
    const agreement = await fetchAgreement(sub.vipps_agreement_id)

    if (agreement.status === 'ACTIVE') {
      // Sett trial-slutt 7 dager fram, og scheduler første charge etter trial
      const trialEnd = new Date()
      trialEnd.setUTCDate(trialEnd.getUTCDate() + 7)

      await supabase
        .from('bv_subscribers')
        .update({
          status: 'trialing',
          vipps_status: 'ACTIVE',
          trial_ends_at: trialEnd.toISOString(),
          next_charge_due_at: trialEnd.toISOString(),
        })
        .eq('email', email)

      // Send velkomst-email med magic link — kun hvis dette er FØRSTE gang vi aktiveres
      // (status var 'inactive' før, ikke allerede 'trialing' eller 'active')
      if (sub.status === 'inactive' || sub.status === null) {
        try {
          // Slett eventuelle gamle tokens og lag ny magic link (gyldig 24t)
          await supabase.from('bv_magic_tokens').delete().eq('subscriber_id', sub.id)
          const { data: tokenRow } = await supabase
            .from('bv_magic_tokens')
            .insert({ subscriber_id: sub.id })
            .select()
            .single()

          if (tokenRow?.token) {
            const loginLink = `${SITE_URL}/api/auth/verify?token=${tokenRow.token}`
            await sendWelcomeEmail(email, sub.plan || 'kyst', loginLink)
            console.log('[vipps-callback] Velkomst-email sendt til', email)
          } else {
            console.error('[vipps-callback] Kunne ikke generere magic-token for', email)
          }
        } catch (emailErr) {
          // Ikke fail callback hvis email-sending feiler — brukeren kan re-sende fra /velkommen-siden
          console.error('[vipps-callback] Email-feil:', emailErr)
        }
      }

      return NextResponse.redirect(`${baseUrl}/velkommen?email=${encodeURIComponent(email)}`)
    }

    if (agreement.status === 'PENDING') {
      // Brukeren har ennå ikke bekreftet — kan skje hvis appen ble lukket midt i
      return NextResponse.redirect(`${baseUrl}/registrer?error=vipps_pending`)
    }

    // STOPPED eller EXPIRED
    await supabase
      .from('bv_subscribers')
      .update({ vipps_status: agreement.status, status: 'inactive' })
      .eq('email', email)

    return NextResponse.redirect(`${baseUrl}/registrer?error=vipps_${agreement.status.toLowerCase()}`)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Ukjent feil'
    console.error('Vipps callback error:', message)
    return NextResponse.redirect(`${baseUrl}/registrer?error=vipps_callback`)
  }
}
