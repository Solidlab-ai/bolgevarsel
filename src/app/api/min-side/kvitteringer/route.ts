export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/min-side/kvitteringer?email=xxx
 * Returnerer alle salgsbilag for innlogget bruker, sortert nyeste først.
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Mangler email' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  // Finn subscriber via email
  const { data: sub } = await supabase
    .from('bv_subscribers')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (!sub) return NextResponse.json({ invoices: [] })

  const { data: invoices } = await supabase
    .from('bv_invoices')
    .select('id, invoice_number, issued_at, plan_name, amount_gross_ore, payment_provider, paid_at, invoice_type')
    .eq('subscriber_id', sub.id)
    .order('issued_at', { ascending: false })

  return NextResponse.json({ invoices: invoices || [] })
}
