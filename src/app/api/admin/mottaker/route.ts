export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin as checkAdmin } from '@/lib/adminAuth'

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({error:'Unauthorized'},{status:401})
  const { id, phone, name } = await req.json()
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('bv_recipients').update({ phone, name }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ recipient: data })
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({error:'Unauthorized'},{status:401})
  const { id } = await req.json()
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('bv_recipients').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
