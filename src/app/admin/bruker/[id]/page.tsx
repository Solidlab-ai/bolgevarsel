export const dynamic = 'force-dynamic'
import { getSupabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import BrukerAdmin from './BrukerAdmin'

export default async function BrukerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseAdmin()

  const { data: sub } = await supabase
    .from('bv_subscribers')
    .select('*, bv_locations(*), bv_recipients(*)')
    .eq('id', id)
    .single()
  if (!sub) notFound()

  const [push, tokens, invoices, contacts, alerts] = await Promise.all([
    supabase.from('bv_push_subscriptions').select('*').eq('subscriber_id', id).order('created_at'),
    supabase.from('bv_magic_tokens').select('created_at, used_at, expires_at').eq('subscriber_id', id).order('created_at', { ascending: false }).limit(50),
    supabase.from('bv_invoices').select('*').eq('subscriber_id', id).order('issued_at', { ascending: false }),
    supabase.from('bv_emergency_contacts').select('*').eq('subscriber_id', id),
    supabase.from('bv_emergency_alerts').select('*').eq('subscriber_id', id).order('created_at', { ascending: false }).limit(10),
  ])

  const innlogginger = (tokens.data ?? []).filter(t => t.used_at)
  const insight = {
    pushCount: (push.data ?? []).filter(p => p.enabled !== false).length,
    pushRaw: push.data ?? [],
    innloggingerCount: innlogginger.length,
    sisteInnlogging: innlogginger[0]?.used_at ?? null,
    lenkerSendt: (tokens.data ?? []).length,
    invoices: invoices.data ?? [],
    emergencyContacts: (contacts.data ?? []).length,
    alerts: alerts.data ?? [],
  }

  return <BrukerAdmin sub={sub} insight={insight} />
}
