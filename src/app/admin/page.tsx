export const dynamic = 'force-dynamic'
import { getSupabaseAdmin } from '@/lib/supabase'
import { PLANS } from '@/lib/plans'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const supabase = getSupabaseAdmin()

  const { data: subscribers } = await supabase
    .from('bv_subscribers')
    .select('*, bv_locations(*), bv_recipients(*)')
    .order('created_at', { ascending: false })

  const alle = subscribers ?? []
  const aktive = alle.filter(s => s.status === 'active')
  const trialing = alle.filter(s => s.status === 'trialing')
  const paused = alle.filter(s => s.status === 'paused')
  const cancelled = alle.filter(s => s.status === 'cancelled')
  // Betalende = aktive + frosne (har betalt / vil betale igjen), ekskl. trial og cancelled
  const betalende = aktive.length + paused.length

  // Nye denne måneden
  const startMnd = new Date()
  startMnd.setDate(1); startMnd.setHours(0, 0, 0, 0)
  const nyeDenneMnd = alle.filter(s => s.created_at && new Date(s.created_at) >= startMnd).length

  // Betalingsmiks (kun aktive)
  const viaVipps = aktive.filter(s => s.payment_provider === 'vipps').length
  const viaKort = aktive.filter(s => s.payment_provider !== 'vipps').length

  const totalMottakere = aktive.reduce((sum, s) => sum + (s.bv_recipients?.filter((r: any) => r.active && r.sms_enabled !== false).length ?? 0), 0)

  const inntektPerMnd = aktive.reduce((sum, s) => {
    const plan = PLANS.find(p => p.id === s.plan)
    return sum + (plan?.price ?? 0)
  }, 0)
  const snittPerKunde = aktive.length ? Math.round(inntektPerMnd / aktive.length) : 0

  const smsPrMnd = totalMottakere * 30
  const smskostnad = smsPrMnd * 1.43
  const netto = inntektPerMnd - smskostnad

  // Push-abonnenter (PWA-installasjons-proxy) + totalt antall lokasjoner
  const { count: pushSubs } = await supabase.from('bv_push_subscriptions').select('*', { count: 'exact', head: true })
  const totalLokasjoner = alle.reduce((sum, s) => sum + (s.bv_locations?.length ?? 0), 0)

  const planTelling = PLANS.map(p => ({
    ...p,
    antall: aktive.filter(s => s.plan === p.id).length,
  }))

  return (
    <AdminDashboard
      subscribers={subscribers ?? []}
      stats={{
        aktive: aktive.length, inntekt: inntektPerMnd, smskostnad, netto, smsPrMnd, totalMottakere,
        trialing: trialing.length, betalende, paused: paused.length, cancelled: cancelled.length,
        nyeDenneMnd, viaVipps, viaKort, snittPerKunde,
        pushSubs: pushSubs ?? 0, totalLokasjoner,
      }}
      planTelling={planTelling}
    />
  )
}
