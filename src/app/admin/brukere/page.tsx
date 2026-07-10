export const dynamic = 'force-dynamic'
import { getSupabaseAdmin } from '@/lib/supabase'
import BrukerListe from './BrukerListe'

export default async function AdminBrukere() {
  const supabase = getSupabaseAdmin()

  const [subs, locs, recs, push, tokens] = await Promise.all([
    supabase.from('bv_subscribers').select('*').order('created_at', { ascending: false }),
    supabase.from('bv_locations').select('subscriber_id'),
    supabase.from('bv_recipients').select('subscriber_id, active, sms_enabled'),
    supabase.from('bv_push_subscriptions').select('subscriber_id, enabled'),
    supabase.from('bv_magic_tokens').select('subscriber_id, used_at'),
  ])

  const tell = (rows: any[] | null, id: string, filter: (r: any) => boolean = () => true) =>
    (rows ?? []).filter(r => r.subscriber_id === id && filter(r)).length

  const rader = (subs.data ?? []).map(s => {
    const brukte = (tokens.data ?? []).filter(t => t.subscriber_id === s.id && t.used_at)
    return {
      ...s,
      antLokasjoner: tell(locs.data, s.id),
      antMottakere: tell(recs.data, s.id, r => r.active !== false && r.sms_enabled !== false),
      antPush: tell(push.data, s.id, p => p.enabled !== false),
      antInnlogginger: brukte.length,
      sisteInnlogging: brukte.map(t => t.used_at).sort().reverse()[0] ?? null,
      forfalt: !!(s.next_charge_due_at && new Date(s.next_charge_due_at) < new Date() && !s.last_charge_id),
    }
  })

  return <BrukerListe rader={rader} />
}
