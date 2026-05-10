export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createHash, createHmac, timingSafeEqual } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { gaPurchaseEvent } from '@/lib/ga'
import { getPlanById } from '@/lib/plans'

/**
 * Verifiserer HMAC-signatur fra Vipps Webhooks API.
 *
 * Vipps signerer hver webhook med Azure-style HMAC-SHA256 over:
 *   POST\n{pathAndQuery}\n{date};{authority};{contentHash}
 *
 * Headers vi får:
 *   x-ms-date              — request timestamp
 *   x-ms-content-sha256    — base64(sha256(rawBody))
 *   authorization          — HMAC-SHA256 SignedHeaders=...&Signature=base64(hmac)
 *
 * Returns true hvis signaturen er gyldig, false ellers.
 *
 * Docs: https://developer.vippsmobilepay.com/docs/APIs/webhooks-api/request-authentication/
 */
function verifyVippsSignature(
  rawBody: string,
  pathAndQuery: string,
  host: string,
  date: string,
  contentSha256Header: string,
  authorizationHeader: string,
  secret: string,
): boolean {
  // 1. Hash av rawBody
  const computedContentHash = createHash('sha256').update(rawBody, 'utf8').digest('base64')
  if (computedContentHash !== contentSha256Header) {
    console.error('[vipps-webhook] content-sha256 mismatch')
    return false
  }

  // 2. Bygg signature-tekst
  const signatureText = `POST\n${pathAndQuery}\n${date};${host};${computedContentHash}`

  // 3. HMAC-SHA256 med secret (secret er base64-encoded fra Vipps)
  const secretBytes = Buffer.from(secret, 'base64')
  const computedSig = createHmac('sha256', secretBytes).update(signatureText, 'utf8').digest('base64')

  // 4. Parse Authorization-header → "HMAC-SHA256 SignedHeaders=...&Signature=<sig>"
  const sigMatch = authorizationHeader.match(/Signature=([A-Za-z0-9+/=]+)/)
  if (!sigMatch) {
    console.error('[vipps-webhook] Authorization header mangler Signature=')
    return false
  }
  const providedSig = sigMatch[1]

  // 5. Constant-time comparison
  const computedBuf = Buffer.from(computedSig)
  const providedBuf = Buffer.from(providedSig)
  if (computedBuf.length !== providedBuf.length) return false
  return timingSafeEqual(computedBuf, providedBuf)
}

/**
 * POST /api/vipps/webhook
 *
 * Vipps Webhooks API sender oss events for charge-status-endringer og
 * agreement-status-endringer. Dette er den autoritative kilden for status.
 *
 * Events vi bryr oss om:
 *   - recurring.charge-captured.v1   (penger trukket — sett status=active)
 *   - recurring.charge-failed.v1     (mislyktes — sett status=past_due)
 *   - recurring.charge-canceled.v1
 *   - recurring.agreement-activated.v1
 *   - recurring.agreement-stopped.v1 (brukeren kanselerte fra Vipps-appen)
 *   - recurring.agreement-expired.v1
 *
 * Sikkerhet: HMAC-SHA256-signaturverifisering via headers fra Vipps.
 */
export async function POST(req: NextRequest) {
  try {
    // Hent rå body for HMAC-verifisering FØR JSON-parsing
    const rawBody = await req.text()

    // Verifiser HMAC-signatur (kun hvis secret er satt — ellers logg advarsel)
    const webhookSecret = process.env.VIPPS_WEBHOOK_SECRET
    if (webhookSecret) {
      const url = new URL(req.url)
      const pathAndQuery = url.pathname + (url.search || '')
      const host = req.headers.get('host') || url.host
      const date = req.headers.get('x-ms-date') || ''
      const contentSha256 = req.headers.get('x-ms-content-sha256') || ''
      const authorization = req.headers.get('authorization') || ''

      if (!date || !contentSha256 || !authorization) {
        console.error('[vipps-webhook] Mangler signatur-headers')
        return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
      }

      const valid = verifyVippsSignature(
        rawBody,
        pathAndQuery,
        host,
        date,
        contentSha256,
        authorization,
        webhookSecret,
      )

      if (!valid) {
        console.error('[vipps-webhook] Ugyldig HMAC-signatur')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } else {
      console.warn('[vipps-webhook] VIPPS_WEBHOOK_SECRET ikke satt — hopper over signaturverifisering')
    }

    const body = JSON.parse(rawBody)

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
