export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createAgreement, nokToOre } from '@/lib/vipps'
import { getPlanById } from '@/lib/plans'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/vipps/create-agreement
 * Body: { email: string, plan: 'kyst'|'familie'|'pro', phoneNumber?: string }
 *
 * Oppretter draft agreement hos Vipps og returnerer URL brukeren skal redirectes til.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, plan, phoneNumber } = await req.json()

    if (!email || !plan) {
      return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
    }

    const selectedPlan = getPlanById(plan)
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Ukjent pakke' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Pre-create eller oppdater subscriber-rad slik at vi har et sted å henge agreementId fra callback
    await supabase.from('bv_subscribers').upsert(
      {
        email,
        plan,
        payment_provider: 'vipps',
        status: 'inactive',
      },
      { onConflict: 'email' },
    )

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bolgevarsel.no'
    const idempotencyKey = randomUUID()

    const agreement = await createAgreement({
      amountInOre: nokToOre(selectedPlan.price),
      productName: `Bølgevarsel ${selectedPlan.name}`,
      productDescription: `${selectedPlan.name} — månedsabonnement`,
      phoneNumber: phoneNumber?.replace(/\D/g, '').slice(-8),
      merchantRedirectUrl: `${baseUrl}/api/vipps/callback?email=${encodeURIComponent(email)}`,
      merchantAgreementUrl: `${baseUrl}/min-side`,
      idempotencyKey,
    })

    // Lagre agreementId så vi kan slå opp ved callback
    await supabase
      .from('bv_subscribers')
      .update({
        vipps_agreement_id: agreement.agreementId,
        vipps_status: 'PENDING',
      })
      .eq('email', email)

    return NextResponse.json({
      url: agreement.vippsConfirmationUrl,
      agreementId: agreement.agreementId,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Ukjent feil'
    console.error('Vipps create-agreement error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
