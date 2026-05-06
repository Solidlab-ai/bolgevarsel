export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { gaPurchaseEvent } from '@/lib/ga'
import { getPlanById } from '@/lib/plans'

/**
 * POST /api/vipps/webhook
 *
 * Vipps Webhooks API sender oss events for charge-status-endringer og
 * agreement-status-endringer. Dette er den autoritative kilden for status.
 *
 * Vi registrerer denne URL-en hos Vipps via Webhooks API når vi går live.
 *
 * Events vi bryr oss om:
 *   - recurring.charge-created.v1
 *   - recurring.charge-captured.v1   (penger trukket — sett status=active)
 *   - recurring.charge-failed.v1     (mislyktes — sett status=past_due)
 *   - recurring.charge-cancelled.v1
 *   - recurring.agreement-activated.v1
 *   - recurring.agreement-stopped.v1 (brukeren kanselerte fra Vipps-appen)
 *   - recurring.agreement-expired.v1
 *
 * Sikkerhet: Vipps signerer webhook-payloads med en HMAC-signatur i headeren.
 * Vi MÅ verifisere denne i prod for å hindre at noen poster falske events til oss.
 * (TODO når vi får webhook-secret fra Vipps under setup)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // TODO: Verifiser HMAC-signatur fra header `X-Ms-Content-Sha256` el.l.
    // Se https://developer.vippsmobilepay.com/docs/APIs/webhooks-api/

    const eventType: string = body.eventType || body.event_type || ''
    console.log('[vipps-webhook]', eventType, JSON.stringify(body).slice(0, 500))

    const supabase = getSupabaseAdmin()
    const agreementId: string | undefined = body.agreementId || body.agreement_id

    if (!agreementId) {
      // Ingen agreement-kontekst — bare bekreft mottak
      return NextResponse.json({ ok: true })
    }

    const { data: sub } = await supabase
      .from('bv_subscribers')
      .select('id, email')
      .eq('vipps_agreement_id', agreementId)
      .maybeSingle()

    if (!sub) {
      console.warn('[vipps-webhook] Ukjent agreement_id:', agreementId)
      return NextResponse.json({ ok: true })
    }

    const updates: Record<string, unknown> = {}

    switch (eventType) {
      case 'recurring.agreement-activated.v1':
        updates.vipps_status = 'ACTIVE'
        // Ikke endre status hvis vi allerede er trialing — callback har satt trial_ends_at
        break

      case 'recurring.agreement-stopped.v1':
        updates.vipps_status = 'STOPPED'
        updates.status = 'cancelled'
        break

      case 'recurring.agreement-expired.v1':
        updates.vipps_status = 'EXPIRED'
        updates.status = 'inactive'
        break

      case 'recurring.charge-captured.v1':
        // Penger trukket — abonnementet er aktivt for inneværende periode
        updates.status = 'active'
        updates.last_charge_id = body.chargeId || body.charge_id
        updates.last_charge_status = 'CHARGED'
        updates.last_charge_at = new Date().toISOString()
        // Schedule neste charge én måned fram
        {
          const next = new Date()
          next.setUTCMonth(next.getUTCMonth() + 1)
          updates.next_charge_due_at = next.toISOString()
        }
        // Send GA4 purchase-event ved FØRSTE charge (konvertering fra trial til paid)
        // Vi sjekker om abonnementet allerede har 'active' status — i så fall er
        // dette en månedlig fornyelse, ikke en ny konvertering.
        {
          const { data: fullSub } = await supabase
            .from('bv_subscribers')
            .select('email, plan, status')
            .eq('id', sub.id)
            .single()

          // Status er fortsatt 'trialing' når dette er første charge
          if (fullSub?.status === 'trialing' && fullSub.email && fullSub.plan) {
            const plan = getPlanById(fullSub.plan)
            if (plan) {
              await gaPurchaseEvent({
                email: fullSub.email,
                transactionId: body.chargeId || body.charge_id || `vipps-${Date.now()}`,
                value: plan.price,
                planId: plan.id,
                planName: plan.name,
                paymentProvider: 'vipps',
              })
            }
          }
        }
        break

      case 'recurring.charge-failed.v1':
        updates.last_charge_status = 'FAILED'
        updates.status = 'past_due'
        break

      case 'recurring.charge-cancelled.v1':
        updates.last_charge_status = 'CANCELLED'
        break

      default:
        // Ukjent event — bare logg og bekreft
        console.log('[vipps-webhook] Uhåndtert event-type:', eventType)
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('bv_subscribers').update(updates).eq('id', sub.id)
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Ukjent feil'
    console.error('[vipps-webhook] error:', message)
    // Returner alltid 200 — Vipps prøver å resende ved 4xx/5xx, og vi vil ikke ha duplikater
    return NextResponse.json({ ok: true, error: message })
  }
}
