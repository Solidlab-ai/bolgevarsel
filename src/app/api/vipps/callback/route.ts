export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { fetchAgreement } from '@/lib/vipps'
import { getSupabaseAdmin } from '@/lib/supabase'

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

    // Hent agreement_id fra DB
    const { data: sub } = await supabase
      .from('bv_subscribers')
      .select('vipps_agreement_id, plan')
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
