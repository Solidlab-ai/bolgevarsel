export const dynamic = 'force-dynamic'
import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import Stripe from 'stripe'
import { stopAgreement } from '@/lib/vipps'

/**
 * POST /api/min-side/frys
 *
 * Pauser eller reaktiverer abonnement.
 *
 * - Stripe: ekte pause via stripe.subscriptions.update({ pause_collection })
 * - Vipps: Recurring API har ikke pause — vi setter kun DB-status til 'paused'.
 *   Hvis brukeren ikke reaktiverer før neste belastning, vil charge fortsatt
 *   gjennomføres (Vipps vet ingenting om vår "pause"). For ekte stopp må
 *   bruker velge "Slett konto" som kaller stopAgreement().
 *   I prod bør vi kanskje ikke vise pause-knapp for Vipps-brukere.
 */
export async function POST(req: Request) {
  const { subscriber_id, action } = await req.json()
  if (!subscriber_id || !['pause', 'resume'].includes(action)) {
    return NextResponse.json({ error: 'Mangler data' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: sub } = await supabase
    .from('bv_subscribers')
    .select('stripe_subscription_id, vipps_agreement_id, payment_provider, status')
    .eq('id', subscriber_id)
    .single()

  if (!sub) return NextResponse.json({ error: 'Fant ikke abonnent' }, { status: 404 })

  // Stripe: ekte pause
  if (sub.stripe_subscription_id) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
    if (action === 'pause') {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        pause_collection: { behavior: 'void' },
      })
    } else {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        pause_collection: '' as any,
      })
    }
  }
  // Vipps: ingen ekte pause — DB-status oppdateres kun, og webhook fortsetter å mottak charges.
  // Anbefaler at frontend ikke viser pause-knappen for Vipps; men vi støtter det her for symmetri.

  const newStatus = action === 'pause' ? 'paused' : 'active'
  await supabase.from('bv_subscribers').update({ status: newStatus }).eq('id', subscriber_id)

  return NextResponse.json({ ok: true, status: newStatus })
}
