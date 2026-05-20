export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { subscriber_id, name, lat, lon } = await req.json()
  const supabase = getSupabaseAdmin()
  const { data: location, error } = await supabase.from('bv_locations').insert({ subscriber_id, name, lat, lon }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ location })
}

// Oppdaterer en eksisterende lokasjon — foreløpig kun aktivitetsprofil.
export async function PATCH(req: NextRequest) {
  const { id, subscriber_id, profile } = await req.json()
  if (!id || !subscriber_id) {
    return NextResponse.json({ error: 'Mangler id eller subscriber_id' }, { status: 400 })
  }
  const supabase = getSupabaseAdmin()
  // Verifiser eierskap før oppdatering
  const { data: location, error } = await supabase
    .from('bv_locations')
    .update({ profile: profile || null })
    .eq('id', id)
    .eq('subscriber_id', subscriber_id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ location })
}
