export const dynamic = 'force-dynamic'
import { getSupabaseAdmin } from '@/lib/supabase'
import RoadmapClient from './RoadmapClient'

export default async function RoadmapPage() {
  const supabase = getSupabaseAdmin()
  const { data: items } = await supabase
    .from('bv_roadmap')
    .select('*')
    .order('status', { ascending: true })
    .order('position', { ascending: true })

  return <RoadmapClient initialItems={items || []} />
}
