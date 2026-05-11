import type { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase'
import TrackereKlient from './TrackereKlient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mine GPS-trackere | Bølgevarsel',
  description: 'Oversikt over dine Bølgevarsel KYST GPS-trackere — live posisjon, batteristatus og SOS-historikk.',
  robots: { index: false, follow: false },
}

export default async function TrackerePage() {
  const supabase = getSupabaseAdmin()

  // Hent alle enheter (admin-visning for nå - viser alle)
  // I produksjon: filter på customer_id basert på innlogget bruker
  const { data: devices } = await supabase
    .from('bolgevarsel_devices')
    .select('*')
    .order('last_seen_at', { ascending: false, nullsFirst: false })

  // Hent siste 50 events for hver enhet
  const deviceImeis = (devices || []).map((d) => d.imei)
  const { data: events } = deviceImeis.length
    ? await supabase
        .from('bolgevarsel_tracker_events')
        .select('*')
        .in('imei', deviceImeis)
        .order('received_at', { ascending: false })
        .limit(200)
    : { data: [] }

  return <TrackereKlient devices={devices || []} events={events || []} />
}
