export const dynamic = 'force-dynamic'
import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import Stripe from 'stripe'
import { stopAgreement } from '@/lib/vipps'

/**
 * POST /api/min-side/slett-konto
 *
 * Avslutter abonnement umiddelbart hos betalingsleverandør,
 * og merker DB-rad for sletting om 30 dager.
 *
 * Støtter både Stripe og Vipps.
 */
export async function POST(req: Request) {
  const { subscriber_id } = await req.json()
  if (!subscriber_id) return NextResponse.json({ error: 'Mangler data' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { data: sub } = await supabase
    .from('bv_subscribers')
    .select('stripe_subscription_id, vipps_agreement_id, vipps_status, payment_provider')
    .eq('id', subscriber_id)
    .single()

  if (!sub) return NextResponse.json({ error: 'Fant ikke abonnent' }, { status: 404 })

  // Kanseller Stripe-abonnementet umiddelbart
  if (sub.stripe_subscription_id) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
      await stripe.subscriptions.cancel(sub.stripe_subscription_id)
    } catch (e) {
      console.warn('[slett-konto] Stripe cancel feilet (kan være allerede kansellert):', e)
    }
  }

  // Stopp Vipps-agreement umiddelbart (hvis fortsatt ACTIVE)
  if (sub.vipps_agreement_id && sub.vipps_status === 'ACTIVE') {
    try {
      await stopAgreement(sub.vipps_agreement_id, randomUUID())
    } catch (e) {
      console.warn('[slett-konto] Vipps stopAgreement feilet:', e)
    }
  }

  // Merk for sletting om 30 dager
  const deleteAt = new Date()
  deleteAt.setDate(deleteAt.getDate() + 30)

  await supabase.from('bv_subscribers').update({
    status: 'cancelled',
    delete_at: deleteAt.toISOString(),
  }).eq('id', subscriber_id)

  return NextResponse.json({ ok: true })
}
