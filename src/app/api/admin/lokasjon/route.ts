export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin as checkAdmin } from '@/lib/adminAuth'


export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, name, lat, lon } = await req.json()
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('bv_locations')
    .update({ name, lat, lon })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ location: data })
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  const supabase = getSupabaseAdmin()
  // Slett mottakere koblet til lokasjonen først
  await supabase.from('bv_recipients').delete().eq('location_id', id)
  const { error } = await supabase.from('bv_locations').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
