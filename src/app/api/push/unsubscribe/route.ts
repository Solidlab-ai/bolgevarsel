export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Fjerner et push-abonnement (bruker slo av varsler).
export async function POST(req: NextRequest) {
  try {
    const { endpoint } = await req.json()
    if (!endpoint) {
      return NextResponse.json({ error: 'Mangler endpoint' }, { status: 400 })
    }
    const supabase = getSupabaseAdmin()
    await supabase.from('bv_push_subscriptions').delete().eq('endpoint', endpoint)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Noe gikk galt' }, { status: 500 })
  }
}
