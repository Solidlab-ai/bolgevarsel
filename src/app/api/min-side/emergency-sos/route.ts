export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const sessionEmail = req.cookies.get('bv_session')?.value
  if (!sessionEmail) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const { data: sub } = await supabase.from('bv_subscribers').select('id, email, plan').eq('email', sessionEmail).maybeSingle()
  if (!sub || sub.plan !== 'sikkerhet') return NextResponse.json({ error: 'Krever sikkerhet-plan' }, { status: 403 })

  const body = await req.json()
  const { lat, lng, location_name, alert_type = 'manual_sos' } = body

  const { data: contacts } = await supabase
    .from('bv_emergency_contacts')
    .select('*')
    .eq('subscriber_id', sub.id)
    .eq('active', true)

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ error: 'Ingen nodkontakter registrert' }, { status: 400 })
  }

  const contactsNotified: any[] = []
  const callIds: string[] = []
  const elksAuth = Buffer.from(`${process.env.ELKS_API_USER}:${process.env.ELKS_API_SECRET}`).toString('base64')

  // Pre-generate TTS audio once
  let audioUrl = ''
  const voiceMsg = `Hei ${contacts[0].name}. Dette er et nødvarsel fra Bølgevarsel. Brukeren ${sub.email} har utløst et nødsignal via posisjon.${location_name ? ` Sist kjente posisjon er ${location_name}.` : ''} Husk å lagre koordinatene fra SMS-en. Trykk 1 for å bli koblet direkte til et menneske hos operasjonssentralen hos Bølgevarsel. Merk: dette er kun en test av nødvarsel-funksjonen.`.replace(/["\\\n\r\t]/g, ' ').replace(/\s+/g, ' ')

  try {
    const ttsRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/s2xtA7B2CTXPPlJzch1v', {
      method: 'POST',
      headers: { 'xi-api-key': 'sk_b9d92350f9d2b18004984778b9cb6929887da6e49e7d068b', 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: voiceMsg, model_id: 'eleven_flash_v2_5', voice_settings: { stability: 0.75, similarity_boost: 0.75, speed: 1.1 }, apply_text_normalization: 'on' }),
    })
    if (ttsRes.ok) {
      const audioBuffer = Buffer.from(await ttsRes.arrayBuffer())
      const formData = new FormData()
      formData.append('files[]', new Blob([audioBuffer], { type: 'audio/mpeg' }), 'sos.mp3')
      const uploadRes = await fetch('https://uguu.se/upload', { method: 'POST', body: formData })
      const uploadData = await uploadRes.json() as any
      audioUrl = uploadData?.files?.[0]?.url || ''
    }
  } catch {}

  // Send SMS + Voice for all contacts in parallel
  const promises = contacts.map(async (contact) => {
    const smsMessage = `NODVARSEL fra Bolgevarsel: ${sub.email} har utlost et nodsignal.${location_name ? ` Posisjon: ${location_name}` : ''}${lat && lng ? ` (${lat}, ${lng})` : ''}. Ta kontakt umiddelbart, husk a lagre koordinatene! Ring Bolgevarsel: +4740093494. (OBS: Dette er kun en test av nodvarsel-funksjonen)`

    try {
      const smsRes = await fetch('https://api.46elks.com/a1/sms', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${elksAuth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ from: 'Bolgevarsel', to: contact.phone, message: smsMessage }),
      })
      const smsData = await smsRes.json()
      contactsNotified.push({ name: contact.name, phone: contact.phone, method: 'sms', status: smsData.status || 'created' })
      if (smsData.id) callIds.push(smsData.id)
    } catch {}

    try {
      const voiceRes = await fetch('https://api.46elks.com/a1/calls', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${elksAuth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          from: process.env.ELKS_FROM_NUMBER || '+4600700072',
          to: contact.phone,
          voice_start: audioUrl
            ? JSON.stringify({ ivr: audioUrl, digits: 1, timeout: 30, '1': { connect: '+4740093494' } })
            : `{"say":"${voiceMsg}","lang":"no"}`,
        }),
      })
      const voiceText = await voiceRes.text()
      let voiceData: any = {}
      try { voiceData = JSON.parse(voiceText) } catch { voiceData = { error: voiceText } }
      contactsNotified.push({ name: contact.name, phone: contact.phone, method: 'voice_call', status: voiceData.state || voiceData.error || 'unknown' })
      if (voiceData.id) callIds.push(voiceData.id)
    } catch (voiceErr: any) {
      contactsNotified.push({ name: contact.name, phone: contact.phone, method: 'voice_call', status: 'failed', error: voiceErr.message })
    }
  })

  await Promise.all(promises)

  // Logg alert i databasen
  const { data: alert, error } = await supabase
    .from('bv_emergency_alerts')
    .insert({
      subscriber_id: sub.id,
      alert_type,
      location_lat: lat || null,
      location_lng: lng || null,
      location_name: location_name || null,
      contacts_notified: contactsNotified,
      call_ids: callIds,
      status: 'delivered',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message, contacts_notified: contactsNotified }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    alert_id: alert.id,
    contacts_notified: contacts.length,
    notifications_sent: contactsNotified.length,
    details: contactsNotified,
  })
}
