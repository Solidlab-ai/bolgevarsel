export const dynamic = 'force-dynamic'
export const maxDuration = 10
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * SOS-mottaker for Mictrack MT710 GPS-trackere.
 *
 * Triggers fra bolgevarsel-tracker-server (egen TCP-server på Railway).
 *
 * Payload format:
 * {
 *   source: 'tracker',
 *   imei: '862407068396955',
 *   latitude: 22.648667,
 *   longitude: 114.034833,
 *   gpsValid: true,
 *   voltage: 3.805,
 *   receivedAt: '2026-05-11T13:46:43Z',
 *   raw: '#imei#MT710#0000#SOS#1...##'
 * }
 *
 * Header: X-Bolgevarsel-Secret: <env BOLGEVARSEL_TRACKER_SECRET>
 */
export async function POST(req: NextRequest) {
  // 1. Verifiser shared secret
  const secret = req.headers.get('x-bolgevarsel-secret')
  const expected = process.env.BOLGEVARSEL_TRACKER_SECRET
  if (!expected) {
    console.error('BOLGEVARSEL_TRACKER_SECRET ikke satt i env')
    return NextResponse.json({ error: 'Server ikke konfigurert' }, { status: 500 })
  }
  if (secret !== expected) {
    return NextResponse.json({ error: 'Ugyldig secret' }, { status: 401 })
  }

  // 2. Parse payload
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ugyldig JSON' }, { status: 400 })
  }

  const { imei, latitude, longitude, gpsValid, voltage, receivedAt, dryRun } = payload

  if (!imei) {
    return NextResponse.json({ error: 'Mangler imei' }, { status: 400 })
  }

  // dryRun=true: validerer og logger, men sender ingen SMS/anrop
  const isDryRun = dryRun === true || dryRun === 'true'

  const supabase = getSupabaseAdmin()

  // 3. Slå opp enheten og tilknyttet kunde
  const { data: device, error: deviceError } = await supabase
    .from('bolgevarsel_devices')
    .select('imei, name, customer_id')
    .eq('imei', imei)
    .maybeSingle()

  if (deviceError || !device) {
    console.error('Ukjent IMEI:', imei, deviceError)
    return NextResponse.json({ error: 'Ukjent enhet' }, { status: 404 })
  }

  // 4. Hvis enheten ikke er tilknyttet en kunde, logg bare og avslutt
  // (Dette skjer under testing før enheter er solgt)
  if (!device.customer_id) {
    console.log(`⚠️ SOS fra unassigned device ${imei} - kun loggført`)
    return NextResponse.json({
      success: true,
      mode: 'unassigned',
      message: `SOS mottatt fra ${device.name || imei}, men ingen kunde er tilknyttet enheten enda. Event er loggført i database.`,
      device,
    })
  }

  // 5. Finn subscriber via customer_id
  const { data: sub } = await supabase
    .from('bv_subscribers')
    .select('id, email, plan')
    .eq('id', device.customer_id)
    .maybeSingle()

  if (!sub) {
    return NextResponse.json({ error: 'Tilknyttet kunde ikke funnet' }, { status: 404 })
  }

  // 6. Hent aktive nødkontakter
  const { data: contacts } = await supabase
    .from('bv_emergency_contacts')
    .select('*')
    .eq('subscriber_id', sub.id)
    .eq('active', true)

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ error: 'Ingen nodkontakter registrert' }, { status: 400 })
  }

  // dryRun: returner uten å sende noe
  if (isDryRun) {
    await supabase.from('bv_emergency_alerts').insert({
      subscriber_id: sub.id,
      alert_type: 'tracker_sos',
      location_lat: latitude ? parseFloat(String(latitude)) : null,
      location_lng: longitude ? parseFloat(String(longitude)) : null,
      location_name: gpsValid && latitude && longitude
        ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
        : 'GPS-fix manglet (dryRun)',
      contacts_notified: [],
      call_ids: [],
      status: 'dry_run',
      metadata: {
        source: 'tracker',
        imei,
        device_name: device.name,
        voltage,
        gps_valid: gpsValid,
        dry_run: true,
        tracker_received_at: receivedAt,
      },
    })
    return NextResponse.json({
      success: true,
      mode: 'dry_run',
      imei,
      customer: sub.email,
      would_notify: contacts.length,
      message: `DRY RUN: Ville varslet ${contacts.length} kontakt(er) for ${sub.email}.`,
    })
  }

  // 7. Bygg lokasjons-streng
  const locationName = gpsValid && latitude && longitude
    ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
    : 'Posisjon ikke tilgjengelig (GPS-fix manglet)'

  const lat = latitude ? String(latitude) : null
  const lng = longitude ? String(longitude) : null

  // 8. Varsling-flow (samme mønster som /api/sos)
  const contactsNotified: any[] = []
  const callIds: string[] = []
  const elksAuth = Buffer.from(`${process.env.ELKS_API_USER}:${process.env.ELKS_API_SECRET}`).toString('base64')

  // Pre-generate TTS for ringing
  let audioUrl = ''
  const voiceMessageTemplate = (name: string) =>
    `Hei ${name}. Dette er et nodvarsel fra Bolgevarsel. Brukeren ${sub.email} har trykket SOS-knappen pa sin GPS-tracker.${gpsValid ? ` Posisjon: ${locationName}.` : ' GPS hadde ikke fix, men siste kjente posisjon er logget.'} Trykk 1 for a bli koblet direkte til operasjonssentralen. Merk: dette er kun en test av nodvarsel-funksjonen.`

  const firstVoiceMsg = voiceMessageTemplate(contacts[0].name)
    .replace(/["\\\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')

  try {
    const ttsRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/s2xtA7B2CTXPPlJzch1v', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: firstVoiceMsg,
        model_id: 'eleven_flash_v2_5',
        voice_settings: { stability: 0.75, similarity_boost: 0.75, speed: 1.1 },
        apply_text_normalization: 'on',
      }),
    })
    if (ttsRes.ok) {
      const audioBuffer = Buffer.from(await ttsRes.arrayBuffer())
      const formData = new FormData()
      formData.append('files[]', new Blob([audioBuffer], { type: 'audio/mpeg' }), 'sos.mp3')
      const uploadRes = await fetch('https://uguu.se/upload', { method: 'POST', body: formData })
      const uploadData = (await uploadRes.json()) as any
      audioUrl = uploadData?.files?.[0]?.url || ''
    }
  } catch {}

  // Send SMS + Voice til hver kontakt i parallell
  const promises = contacts.map(async (contact) => {
    const smsMessage = `NODVARSEL fra Bolgevarsel: ${sub.email} har trykket SOS pa GPS-tracker.${gpsValid ? ` Posisjon: ${lat}, ${lng}` : ' GPS-fix manglet.'} Ring 40093494 for kobling til operasjonssentral. (OBS: Dette er kun en test av nodvarsel-funksjonen)`

    // SMS
    try {
      const smsRes = await fetch('https://api.46elks.com/a1/sms', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${elksAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          from: 'Bolgevarsel',
          to: contact.phone,
          message: smsMessage,
        }),
      })
      const smsData = await smsRes.json()
      contactsNotified.push({
        name: contact.name,
        phone: contact.phone,
        method: 'sms',
        status: smsData.status || 'created',
      })
      if (smsData.id) callIds.push(smsData.id)
    } catch {}

    // Voice
    try {
      const voiceRes = await fetch('https://api.46elks.com/a1/calls', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${elksAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          from: process.env.ELKS_FROM_NUMBER || '+4600700072',
          to: contact.phone,
          voice_start: audioUrl
            ? JSON.stringify({
                ivr: audioUrl,
                digits: 1,
                timeout: 30,
                '1': { connect: '+4740093494' },
              })
            : `{"say":"${firstVoiceMsg}","lang":"no"}`,
        }),
      })
      const voiceText = await voiceRes.text()
      let voiceData: any = {}
      try {
        voiceData = JSON.parse(voiceText)
      } catch {
        voiceData = { error: voiceText }
      }
      contactsNotified.push({
        name: contact.name,
        phone: contact.phone,
        method: 'voice_call',
        status: voiceData.state || voiceData.error || 'unknown',
      })
      if (voiceData.id) callIds.push(voiceData.id)
    } catch (voiceErr: any) {
      contactsNotified.push({
        name: contact.name,
        phone: contact.phone,
        method: 'voice_call',
        status: 'failed',
        error: voiceErr.message,
      })
    }
  })

  await Promise.all(promises)

  // 9. Logg i bv_emergency_alerts
  await supabase.from('bv_emergency_alerts').insert({
    subscriber_id: sub.id,
    alert_type: 'tracker_sos',
    location_lat: lat ? parseFloat(lat) : null,
    location_lng: lng ? parseFloat(lng) : null,
    location_name: locationName,
    contacts_notified: contactsNotified,
    call_ids: callIds,
    status: 'delivered',
    metadata: {
      source: 'tracker',
      imei,
      device_name: device.name,
      voltage,
      gps_valid: gpsValid,
      tracker_received_at: receivedAt,
    },
  })

  return NextResponse.json({
    success: true,
    mode: 'tracker_sos',
    imei,
    customer: sub.email,
    contacts_notified: contactsNotified.length,
    message: `Tracker-SOS utlost for ${sub.email}. ${contacts.length} kontakter varslet.`,
  })
}
