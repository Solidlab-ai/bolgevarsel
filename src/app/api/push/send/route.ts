export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendPushTo, type PushPayload } from '@/lib/push'

/**
 * Sender push til alle aktive enheter for en bruker.
 * Body: { email, title, body, url? }  (intern bruk / testing via Min side)
 */
export async function POST(req: NextRequest) {
  try {
    const { email, title, body, url } = await req.json()
    if (!email || !title || !body) {
      return NextResponse.json({ error: 'Mangler email, title eller body' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: subscriber } = await supabase
      .from('bv_subscribers')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (!subscriber) {
      return NextResponse.json({ error: 'Fant ikke bruker' }, { status: 404 })
    }

    const { data: subs } = await supabase
      .from('bv_push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('subscriber_id', subscriber.id)
      .eq('enabled', true)

    if (!subs || subs.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: 'Ingen aktive enheter' })
    }

    const payload: PushPayload = { title, body, url: url || '/min-side', tag: 'bolgevarsel-test' }

    let sent = 0
    const goneEndpoints: string[] = []
    for (const sub of subs) {
      const { ok, gone } = await sendPushTo(sub, payload)
      if (ok) sent++
      if (gone) goneEndpoints.push(sub.endpoint)
    }

    // Rydd bort utløpte/avinstallerte abonnementer
    if (goneEndpoints.length > 0) {
      await supabase.from('bv_push_subscriptions').delete().in('endpoint', goneEndpoints)
    }

    return NextResponse.json({ ok: true, sent, cleaned: goneEndpoints.length })
  } catch (err) {
    console.error('[push/send]', err)
    return NextResponse.json({ error: 'Noe gikk galt' }, { status: 500 })
  }
}
