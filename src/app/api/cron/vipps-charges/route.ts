export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createCharge, nokToOre, dueDateInDays } from '@/lib/vipps'
import { getPlanById } from '@/lib/plans'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/cron/vipps-charges
 *
 * Daglig cron-jobb (Vercel Cron, 02:00 UTC).
 * Finner abonnementer der next_charge_due_at er innen 2 dager fram, og oppretter charges.
 *
 * Vipps krever at charge er satt MINST 1 dag i forveien — derfor planlegger vi
 * dagen før forfall, med dueDate = forfallsdatoen.
 *
 * Sikkerhet: Beskyttet av Bearer-token via CRON_SECRET (samme mønster som andre cron-jobber).
 */
export async function GET(req: NextRequest) {
  // Auth: Vercel Cron sender Authorization-header automatisk
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const now = new Date()
  const horizon = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 dager fram

  // Hent alle Vipps-abonnementer som skal trekkes innen horisonten
  const { data: subs, error } = await supabase
    .from('bv_subscribers')
    .select('id, email, plan, vipps_agreement_id, next_charge_due_at, vipps_status')
    .eq('payment_provider', 'vipps')
    .in('status', ['trialing', 'active', 'past_due'])
    .eq('vipps_status', 'ACTIVE')
    .lte('next_charge_due_at', horizon.toISOString())

  if (error) {
    console.error('[vipps-cron] DB-feil:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results: Array<{ email: string; status: 'ok' | 'skip' | 'fail'; detail?: string }> = []

  for (const sub of subs ?? []) {
    if (!sub.vipps_agreement_id || !sub.next_charge_due_at) {
      results.push({ email: sub.email, status: 'skip', detail: 'mangler felter' })
      continue
    }

    const plan = getPlanById(sub.plan)
    if (!plan) {
      results.push({ email: sub.email, status: 'skip', detail: 'ukjent plan' })
      continue
    }

    try {
      // dueDate må være minst 1 dag fram. Hvis next_charge_due_at er i dag eller bakover
      // setter vi i morgen som forfall. Hvis det er om 1-2 dager, bruker vi den datoen.
      const dueDate = sub.next_charge_due_at.slice(0, 10)
      const todayStr = now.toISOString().slice(0, 10)
      const safeDueDate = dueDate <= todayStr ? dueDateInDays(1) : dueDate

      const orderId = `bv-${sub.id.slice(0, 8)}-${Date.now()}`

      await createCharge({
        agreementId: sub.vipps_agreement_id,
        amountInOre: nokToOre(plan.price),
        description: `Bølgevarsel ${plan.name} — månedsabonnement`,
        dueDate: safeDueDate,
        orderId,
        idempotencyKey: randomUUID(),
        retryDays: 2, // Vipps får 2 dager på å forsøke igjen ved feil
        transactionType: 'DIRECT_CAPTURE',
      })

      // Marker som "in flight" — webhook vil oppdatere til CHARGED når penger er trukket
      await supabase
        .from('bv_subscribers')
        .update({
          last_charge_id: orderId,
          last_charge_status: 'PENDING',
        })
        .eq('id', sub.id)

      results.push({ email: sub.email, status: 'ok', detail: orderId })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ukjent feil'
      console.error(`[vipps-cron] Feilet for ${sub.email}:`, message)
      results.push({ email: sub.email, status: 'fail', detail: message })
    }
  }

  return NextResponse.json({
    ran_at: now.toISOString(),
    count: results.length,
    results,
  })
}
