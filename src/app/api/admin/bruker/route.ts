export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin as checkAdmin } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({error:'Unauthorized'},{status:401})
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({error:'Mangler email'},{status:400})
  const supabase = getSupabaseAdmin()
  const { data: subscriber } = await supabase.from('bv_subscribers').select('*').ilike('email', `%${email}%`).single()
  if (!subscriber) return NextResponse.json({ subscriber: null })
  const { data: locations } = await supabase.from('bv_locations').select('*').eq('subscriber_id', subscriber.id)
  const { data: recipients } = await supabase.from('bv_recipients').select('*').eq('subscriber_id', subscriber.id)
  return NextResponse.json({ subscriber, locations: locations||[], recipients: recipients||[] })
}

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({error:'Unauthorized'},{status:401})
  const { subscriber_id, field, value } = await req.json()
  const supabase = getSupabaseAdmin()
  const update: any = {}; update[field] = value
  const { data, error } = await supabase.from('bv_subscribers').update(update).eq('id', subscriber_id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ subscriber: data })
}
