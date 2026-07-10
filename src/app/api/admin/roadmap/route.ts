export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin as checkAdmin } from '@/lib/adminAuth'


// GET - hent alle items, sortert per kolonne (status) og posisjon
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('bv_roadmap')
    .select('*')
    .order('status', { ascending: true })
    .order('position', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data || [] })
}

// POST - opprett nytt item
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { title, description, status, priority, category, effort_hours, target_quarter, notes } = body
  if (!title || !title.trim()) return NextResponse.json({ error: 'Tittel er påkrevd' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  // Finn høyeste posisjon i den valgte kolonnen, så ny item går nederst
  const { data: existing } = await supabase
    .from('bv_roadmap')
    .select('position')
    .eq('status', status || 'idea')
    .order('position', { ascending: false })
    .limit(1)
  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from('bv_roadmap')
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      status: status || 'idea',
      priority: priority || 'medium',
      category: category || 'feature',
      effort_hours: effort_hours || null,
      target_quarter: target_quarter || null,
      notes: notes?.trim() || null,
      position: nextPosition,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}

// PATCH - oppdater eksisterende item
export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id mangler' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  // Hvis status endres OG caller ikke sender egen position, sett position til slutten av ny kolonne.
  // (Drag-drop sender egen eksplisitt position, og skal respekteres.)
  if (updates.status && updates.position === undefined) {
    const { data: existing } = await supabase
      .from('bv_roadmap')
      .select('position')
      .eq('status', updates.status)
      .order('position', { ascending: false })
      .limit(1)
    updates.position = existing && existing.length > 0 ? existing[0].position + 1 : 0
  }

  const { data, error } = await supabase
    .from('bv_roadmap')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}

// PUT - bulk-oppdater positions etter drag-drop reorder
// Body: { updates: [{ id, status, position }] }
export async function PUT(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { updates } = body
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: 'updates må være ikke-tom array' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  // Kjør alle update-er parallelt
  const results = await Promise.all(
    updates.map((u: { id: string; status?: string; position: number }) =>
      supabase
        .from('bv_roadmap')
        .update({ status: u.status, position: u.position })
        .eq('id', u.id)
    )
  )
  const errors = results.filter((r) => r.error).map((r) => r.error!.message)
  if (errors.length > 0) return NextResponse.json({ error: errors.join('; ') }, { status: 500 })
  return NextResponse.json({ ok: true, updated: updates.length })
}

// DELETE - slett item
export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id mangler' }, { status: 400 })
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('bv_roadmap').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
