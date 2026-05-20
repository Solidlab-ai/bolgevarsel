export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { getSupabaseAdmin } from '@/lib/supabase'
import { gaPurchaseEvent } from '@/lib/ga'
import { getPlanById, planNavn as planNavnFn, planPris as planPrisFn } from '@/lib/plans'
import { createInvoice, sendInvoiceEmail } from '@/lib/invoices'

const RESEND_KEY = process.env.RESEND_API_KEY!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bolgevarsel.no'

async function sendWelcomeEmail(email: string, plan: string, loginLink: string) {
  const navn = planNavnFn(plan)
  const pris = planPrisFn(plan)?.toString() ?? '–'

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Bølgevarsel <noreply@bolgevarsel.no>',
      to: [email],
      subject: '🌊 Velkommen til Bølgevarsel – logg inn her',
      html: `<!DOCTYPE html><html lang="nb"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px"><tr><td align="center">
<table width="560" style="max-width:560px;width:100%">

<tr><td style="background:linear-gradient(135deg,#0a2a3d,#1a6080);border-radius:16px 16px 0 0;padding:40px;text-align:center">
  <p style="margin:0 0 8px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.14em">Bølgevarsel</p>
  <h1 style="margin:0 0 6px;font-size:28px;font-weight:300;color:#fff">Velkommen om bord! 🌊</h1>
  <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.65)">Abonnementet ditt er nå aktivt</p>
</td></tr>

<tr><td style="background:#fff;padding:36px 40px">
  <p style="margin:0 0 20px;font-size:16px;color:#334155;line-height:1.6">
    Hei! Du er nå registrert med <strong>${navn}-abonnementet</strong> og har <strong style="color:#16a34a">7 dager gratis prøveperiode</strong>. Varsler starter fra i morgen — du belastes ikke før prøveperioden er over.
  </p>

  <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0">
    <p style="margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em">Din ordre</p>
    <table width="100%">
      <tr><td style="font-size:15px;color:#334155;padding:4px 0">Plan</td><td style="font-size:15px;font-weight:600;color:#0a2a3d;text-align:right">${navn}</td></tr>
      <tr><td style="font-size:15px;color:#334155;padding:4px 0;border-top:1px solid #f1f5f9">Pris</td><td style="font-size:15px;font-weight:600;color:#0a2a3d;text-align:right;border-top:1px solid #f1f5f9">${pris} kr/mnd</td></tr>
      <tr><td style="font-size:15px;color:#334155;padding:4px 0;border-top:1px solid #f1f5f9">Prøveperiode</td><td style="font-size:15px;font-weight:600;color:#16a34a;text-align:right;border-top:1px solid #f1f5f9">7 dager gratis</td></tr>
      <tr><td style="font-size:15px;color:#334155;padding:4px 0;border-top:1px solid #f1f5f9">Fakturering</td><td style="font-size:15px;font-weight:600;color:#0a2a3d;text-align:right;border-top:1px solid #f1f5f9">Månedlig etter trial</td></tr>
    </table>
  </div>

  <p style="margin:0 0 8px;font-size:15px;color:#334155">Neste steg — sett opp din kystlokasjon og mottakere ved å logge inn på Min side:</p>

  <div style="text-align:center;margin:24px 0">
    <a href="${loginLink}" style="display:inline-block;background:#0a2a3d;color:white;padding:16px 36px;border-radius:100px;text-decoration:none;font-size:16px;font-weight:600">
      Logg inn og sett opp varselet →
    </a>
  </div>

  <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center">
    Denne innloggingslenken er gyldig i 24 timer og kan kun brukes én gang.<br/>
    Spørsmål? Svar på denne e-posten eller kontakt oss på hei@bolgevarsel.no
  </p>
</td></tr>

<tr><td style="background:#0a2a3d;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center">
  <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4)">Bølgevarsel.no · Du mottar denne e-posten fordi du opprettet et abonnement</p>
</td></tr>

</table></td></tr></table></body></html>`,
    }),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: any
  try {
    event = await constructWebhookEvent(body, sig)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object
        const email = session.metadata?.email || session.customer_details?.email
        const plan = session.metadata?.plan || 'kyst'
        const customerId = session.customer
        const subscriptionId = session.subscription
        if (!email) break

        // Sjekk om trial er aktiv
        const hasTrial = session.subscription ? true : false
        const initialStatus = hasTrial ? 'trialing' : 'active'

        // Opprett eller oppdater subscriber
        const { data: existing } = await supabase.from('bv_subscribers').select('id').eq('email', email).maybeSingle()
        if (existing) {
          await supabase.from('bv_subscribers').update({
            status: initialStatus, plan, stripe_customer_id: customerId, stripe_subscription_id: subscriptionId,
          }).eq('email', email)
        } else {
          await supabase.from('bv_subscribers').insert({
            email, plan, status: initialStatus, stripe_customer_id: customerId, stripe_subscription_id: subscriptionId,
          })
        }

        // Hent subscriber id
        const { data: sub } = await supabase.from('bv_subscribers').select('id').eq('email', email).maybeSingle()
        if (!sub) break

        // Slett gamle tokens og generer magic link (24 timer)
        await supabase.from('bv_magic_tokens').delete().eq('subscriber_id', sub.id)
        const { data: tokenRow } = await supabase.from('bv_magic_tokens')
          .insert({ subscriber_id: sub.id, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
          .select().maybeSingle()

        if (tokenRow) {
          const loginLink = `${SITE_URL}/api/auth/verify?token=${tokenRow.token}`
          await sendWelcomeEmail(email, plan, loginLink)
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object
        let status: string
        if (sub.status === 'active') status = 'active'
        else if (sub.status === 'trialing') status = 'trialing'
        else if (sub.status === 'canceled' || sub.status === 'cancelled') status = 'cancelled'
        else status = 'inactive'
        await supabase.from('bv_subscribers').update({ status }).eq('stripe_subscription_id', sub.id)
        break
      }

      case 'customer.subscription.trial_will_end': {
        // Stripe sender dette 3 dager før trial utløper — kan brukes til å sende reminder
        // For nå bare logg det
        console.log('Trial utløper snart for subscription:', event.data.object.id)
        break
      }

      case 'customer.subscription.deleted': {
        await supabase.from('bv_subscribers').update({ status: 'cancelled' })
          .eq('stripe_subscription_id', event.data.object.id)
        break
      }

      case 'invoice.payment_failed': {
        await supabase.from('bv_subscribers').update({ status: 'inactive' })
          .eq('stripe_customer_id', event.data.object.customer)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        // Hent subscriberen for å få email + plan
        const { data: sub } = await supabase
          .from('bv_subscribers')
          .select('id, email, plan, phone_number')
          .eq('stripe_customer_id', invoice.customer)
          .maybeSingle()

        // Sett status active uansett (cycle = månedlig fornyelse, ny = første betaling)
        if (invoice.billing_reason === 'subscription_cycle') {
          await supabase.from('bv_subscribers').update({ status: 'active' })
            .eq('stripe_customer_id', invoice.customer)
        }

        // Generer salgsbilag (kvittering med MVA-spec) — alltid ved betaling
        if (sub?.id && sub.email && sub.plan) {
          try {
            const periodStart = new Date(invoice.period_start * 1000)
            const periodEnd = new Date(invoice.period_end * 1000)
            const created = await createInvoice({
              subscriberId: sub.id,
              customerEmail: sub.email,
              customerPhone: sub.phone_number,
              planId: sub.plan,
              paymentProvider: 'stripe',
              paymentReference: invoice.id || null,
              servicePeriodStart: periodStart,
              servicePeriodEnd: periodEnd,
              paidAt: new Date(),
            })
            await sendInvoiceEmail(created)
            console.log('[stripe-webhook] Salgsbilag opprettet:', created.invoice_number)
          } catch (invoiceErr) {
            console.error('[stripe-webhook] Feil ved bilag-generering:', invoiceErr)
          }
        }

        // Send GA4 purchase-event KUN ved første betaling (subscription_create)
        // — det er dette som er den ekte konverteringen for Google Ads ROAS
        if (invoice.billing_reason === 'subscription_create' && sub?.email && sub?.plan) {
          const plan = getPlanById(sub.plan)
          if (plan) {
            await gaPurchaseEvent({
              email: sub.email,
              transactionId: invoice.id || `stripe-${Date.now()}`,
              value: plan.price,
              planId: plan.id,
              planName: plan.name,
              paymentProvider: 'stripe',
            })
          }
        }
        break
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
