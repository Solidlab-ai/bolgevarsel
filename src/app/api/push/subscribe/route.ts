export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Lagrer (eller oppdaterer) et push-abonnement for en innlogget bruker.
export async function POST(req: NextRequest) {
  try {
    const { email, subscription, userAgent } = await req.json()
    if (!email || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
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

    // Upsert på endpoint (unik per enhet) — slår på igjen hvis tidligere avslått
    const { error } = await supabase
      .from('bv_push_subscriptions')
      .upsert(
        {
          subscriber_id: subscriber.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: (userAgent || '').slice(0, 300),
          enabled: true,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' },
      )

    if (error) {
      console.error('[push/subscribe]', error)
      return NextResponse.json({ error: 'Kunne ikke lagre' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Noe gikk galt' }, { status: 500 })
  }
}
