export const dynamic = 'force-dynamic'
import { getSupabaseAdmin } from '@/lib/supabase'
import { PLANS, planPris } from '@/lib/plans'
import AdminDashboard from './AdminDashboard'

// Kjenner igjen interne testkontoer som ikke skal telle i KPIer
function erTest(email: string): boolean {
  if (!email) return false
  const e = email.toLowerCase()
  return (
    e.includes('+test') || e.includes('+tester') || e.includes('+vippser') ||
    e.endsWith('@ulrik.biz') || e.startsWith('prod-smoke') || e.endsWith('@bolgevarsel.no')
  )
}

export default async function AdminPage() {
  const supabase = getSupabaseAdmin()

  const { data: subscribersRaw } = await supabase
    .from('bv_subscribers')
    .select('*, bv_locations(*), bv_recipients(*)')
    .order('created_at', { ascending: false })

  const alleInkludertTest = subscribersRaw ?? []
  // KPIer regnes KUN på ekte kunder — testkontoer holdes utenfor
  const alle = alleInkludertTest.filter(s => !erTest(s.email))
  const antallTest = alleInkludertTest.length - alle.length

  const aktive = alle.filter(s => s.status === 'active')
  const trialing = alle.filter(s => s.status === 'trialing')
  const paused = alle.filter(s => s.status === 'paused')
  const cancelled = alle.filter(s => s.status === 'cancelled')
  const inaktive = alle.filter(s => s.status === 'inactive')
  // Betalende = aktive + frosne (har en levende betalingsavtale). Trial/inactive/cancelled ekskl.
  const betalende = aktive.length + paused.length
  // Churn = både cancelled og inactive (deaktivert manuelt)
  const churned = cancelled.length + inaktive.length

  // Nye denne måneden (ekte kunder)
  const startMnd = new Date()
  startMnd.setDate(1); startMnd.setHours(0, 0, 0, 0)
  const nyeDenneMnd = alle.filter(s => s.created_at && new Date(s.created_at) >= startMnd).length

  // Betalingsmiks (kun aktive)
  const viaVipps = aktive.filter(s => s.payment_provider === 'vipps').length
  const viaKort = aktive.filter(s => s.payment_provider !== 'vipps').length

  // SMS-kostnad: KUN daglig SMS koster hver dag (sms_daily). Farevarsel (sms_enabled) sendes sjelden.
  const dagligSmsMottakere = aktive.reduce(
    (sum, s) => sum + (s.bv_recipients?.filter((r: any) => r.active && r.sms_daily === true).length ?? 0), 0)
  // Mottakere som i det hele tatt kan få SMS (farevarsel + evt daglig) — vises som info
  const smsMottakere = aktive.reduce(
    (sum, s) => sum + (s.bv_recipients?.filter((r: any) => r.active && r.sms_enabled !== false).length ?? 0), 0)

  // MRR via planPris() (håndterer også legacy-planer som "sikkerhet")
  // NB: dette er LISTEPRIS — rabattkoder (BETATESTER osv.) ligger i Stripe og er ikke trukket fra her.
  const inntektPerMnd = aktive.reduce((sum, s) => sum + (planPris(s.plan) ?? 0), 0)
  const snittPerKunde = aktive.length ? Math.round(inntektPerMnd / aktive.length) : 0

  const smsPrMnd = dagligSmsMottakere * 30
  const smskostnad = smsPrMnd * 1.43
  const netto = inntektPerMnd - smskostnad

  // Push-abonnenter (PWA-installasjons-proxy) + lokasjoner (kun ekte kunder)
  const { count: pushSubs } = await supabase.from('bv_push_subscriptions').select('*', { count: 'exact', head: true })
  const totalLokasjoner = alle.reduce((sum, s) => sum + (s.bv_locations?.length ?? 0), 0)

  const planTelling = PLANS.filter(p => !p.hidden).map(p => ({
    ...p,
    antall: aktive.filter(s => s.plan === p.id).length,
  }))

  return (
    <AdminDashboard
      subscribers={alleInkludertTest}
      stats={{
        aktive: aktive.length, inntekt: inntektPerMnd, smskostnad, netto, smsPrMnd, totalMottakere: smsMottakere,
        trialing: trialing.length, betalende, paused: paused.length, cancelled: cancelled.length,
        inaktive: inaktive.length, churned, dagligSmsMottakere,
        nyeDenneMnd, viaVipps, viaKort, snittPerKunde,
        pushSubs: pushSubs ?? 0, totalLokasjoner, antallTest,
      }}
      planTelling={planTelling}
    />
  )
}
