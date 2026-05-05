export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET: Hent nødkontakter for innlogget bruker
export async function GET(req: NextRequest) {
  const sessionEmail = req.cookies.get('bv_session')?.value
  if (!sessionEmail) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const { data: sub } = await supabase.from('bv_subscribers').select('id, plan').eq('email', sessionEmail).maybeSingle()
  if (!sub || sub.plan !== 'sikkerhet') return NextResponse.json({ error: 'Krever sikkerhet-plan' }, { status: 403 })

  const { data: contacts } = await supabase
    .from('bv_emergency_contacts')
    .select('*')
    .eq('subscriber_id', sub.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ contacts: contacts || [] })
}

// POST: Legg til ny nødkontakt
export async function POST(req: NextRequest) {
  const sessionEmail = req.cookies.get('bv_session')?.value
  if (!sessionEmail) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const { data: sub } = await supabase.from('bv_subscribers').select('id, plan').eq('email', sessionEmail).maybeSingle()
  if (!sub || sub.plan !== 'sikkerhet') return NextResponse.json({ error: 'Krever sikkerhet-plan' }, { status: 403 })

  const body = await req.json()
  const { name, phone, relation } = body

  if (!name || !phone) return NextResponse.json({ error: 'Navn og telefonnummer er påkrevd' }, { status: 400 })

  // Normaliser og valider telefonnummer
  // Tillat input som: +47 400 93 494, 40093494, 0047 40093494, +47-400-93-494
  let cleanPhone = String(phone).replace(/[\s\-()]/g, '') // fjern mellomrom, bindestrek, parenteser
  if (cleanPhone.startsWith('00')) cleanPhone = '+' + cleanPhone.slice(2) // 00 -> +
  // Hvis bare 8 sifre (norsk mobilnummer uten landkode), legg til +47
  if (/^[0-9]{8}$/.test(cleanPhone)) cleanPhone = '+47' + cleanPhone

  // Norsk mobilnummer: +47 etterfulgt av 8 sifre, første sifferet er 4 eller 9
  const isNorwegianMobile = /^\+47[49][0-9]{7}$/.test(cleanPhone)
  // Generelt internasjonalt format som fallback (8-15 sifre etter +, ikke +47)
  const isOtherInternational = /^\+(?!47)[1-9][0-9]{7,14}$/.test(cleanPhone)

  if (!isNorwegianMobile && !isOtherInternational) {
    if (cleanPhone.startsWith('+47')) {
      return NextResponse.json({
        error: 'Ugyldig norsk mobilnummer. Norske mobilnummer er 8 sifre og starter med 4 eller 9 (f.eks. +4740093494).'
      }, { status: 400 })
    }
    return NextResponse.json({
      error: 'Ugyldig telefonnummer. Bruk format +47XXXXXXXX (norsk) eller +landkode etterfulgt av nummer.'
    }, { status: 400 })
  }

  // Sjekk maks 3 aktive kontakter (trigger i DB gjør dette også, men gi bedre feilmelding)
  const { count } = await supabase
    .from('bv_emergency_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('subscriber_id', sub.id)
    .eq('active', true)

  if ((count || 0) >= 3) {
    return NextResponse.json({ error: 'Maks 3 nødkontakter. Fjern en eksisterende kontakt først.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('bv_emergency_contacts')
    .insert({ subscriber_id: sub.id, name, phone: cleanPhone, relation: relation || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ contact: data })
}

// DELETE: Fjern nødkontakt
export async function DELETE(req: NextRequest) {
  const sessionEmail = req.cookies.get('bv_session')?.value
  if (!sessionEmail) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const { data: sub } = await supabase.from('bv_subscribers').select('id, plan').eq('email', sessionEmail).maybeSingle()
  if (!sub) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Mangler kontakt-ID' }, { status: 400 })

  const { error } = await supabase
    .from('bv_emergency_contacts')
    .delete()
    .eq('id', id)
    .eq('subscriber_id', sub.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
