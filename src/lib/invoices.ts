/**
 * Salgsbilag-modul (fakturering) for Bølgevarsel
 *
 * Oppfyller krav i bokføringsforskriften kap. 5:
 * - Maskinelt fortløpende fakturanummer (bigserial i DB)
 * - Selgers org.nr + MVA + Foretaksregisteret
 * - MVA-spesifikasjon (sats, grunnlag, beløp)
 * - Tjeneste-/leveringsperiode
 * - Lagres i 5 år (DB-rad er primærdokumentasjon, HTML/PDF er presentasjonsformat)
 */

import { getSupabaseAdmin } from '@/lib/supabase'
import { getPlanById } from '@/lib/plans'

// ============================================================================
// Selger-info (Stå på Pinne AS)
// ============================================================================
export const SELGER = {
  name: 'Stå på Pinne AS',
  orgNr: '935 233 488',
  orgNrFlat: '935233488',
  vat: 'MVA',
  registry: 'Foretaksregisteret',
  address: 'Tunveien 13',
  postCode: '4016',
  city: 'Stavanger',
  country: 'Norge',
  email: 'hei@bolgevarsel.no',
  phone: '+47 400 93 494',
  website: 'bolgevarsel.no',
  bankAccount: '', // Ikke nødvendig for kort/Vipps-betalinger
} as const

const VAT_RATE_PERCENT = 25 // Standardsats for SaaS-tjenester til norske kunder

// ============================================================================
// Beløpsberegning (alt i øre — heltall, ingen flytetallsfeil)
// ============================================================================

/**
 * Splitter brutto-beløp (inkl. MVA) til netto + MVA.
 * For 49 kr inkl. MVA = 4900 øre:
 *   netto = 4900 / 1.25 = 3920 øre
 *   mva = 4900 - 3920 = 980 øre
 */
export function splitVat(grossOre: number, vatRate: number = VAT_RATE_PERCENT) {
  const netOre = Math.round(grossOre / (1 + vatRate / 100))
  const vatOre = grossOre - netOre
  return { netOre, vatOre, grossOre, vatRate }
}

export function formatNok(ore: number): string {
  return (ore / 100).toLocaleString('nb-NO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ============================================================================
// Opprette salgsbilag
// ============================================================================

export type CreateInvoiceInput = {
  subscriberId: string
  customerEmail: string
  customerPhone?: string | null
  customerName?: string | null
  planId: string
  paymentProvider: 'stripe' | 'vipps'
  paymentReference?: string | null
  servicePeriodStart: Date
  servicePeriodEnd: Date
  paidAt?: Date | null
}

export type Invoice = {
  id: string
  invoice_number: number
  issued_at: string
  service_period_start: string
  service_period_end: string
  customer_email: string
  customer_phone: string | null
  customer_name: string | null
  plan_id: string
  plan_name: string
  amount_gross_ore: number
  amount_net_ore: number
  vat_amount_ore: number
  vat_rate_percent: number
  payment_provider: 'stripe' | 'vipps'
  payment_reference: string | null
  paid_at: string | null
  invoice_type: 'sale' | 'credit'
  credits_invoice_id: string | null
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const plan = getPlanById(input.planId)
  if (!plan) throw new Error(`Ukjent plan: ${input.planId}`)

  const grossOre = plan.price * 100
  const { netOre, vatOre } = splitVat(grossOre)

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('bv_invoices')
    .insert({
      subscriber_id: input.subscriberId,
      service_period_start: input.servicePeriodStart.toISOString().split('T')[0],
      service_period_end: input.servicePeriodEnd.toISOString().split('T')[0],
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone ?? null,
      customer_name: input.customerName ?? null,
      plan_id: plan.id,
      plan_name: plan.name,
      amount_gross_ore: grossOre,
      amount_net_ore: netOre,
      vat_amount_ore: vatOre,
      vat_rate_percent: VAT_RATE_PERCENT,
      payment_provider: input.paymentProvider,
      payment_reference: input.paymentReference ?? null,
      paid_at: input.paidAt?.toISOString() ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(`Kunne ikke opprette salgsbilag: ${error.message}`)
  return data as Invoice
}

// ============================================================================
// HTML-mal for salgsbilag
// (Brukes både til e-post og print/PDF via nettleserens "Lagre som PDF")
// ============================================================================

export function renderInvoiceHtml(invoice: Invoice): string {
  const issuedDate = new Date(invoice.issued_at).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const periodStart = new Date(invoice.service_period_start).toLocaleDateString('nb-NO')
  const periodEnd = new Date(invoice.service_period_end).toLocaleDateString('nb-NO')
  const paidDate = invoice.paid_at
    ? new Date(invoice.paid_at).toLocaleDateString('nb-NO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const invoiceNumberPadded = String(invoice.invoice_number).padStart(6, '0')
  const isCredit = invoice.invoice_type === 'credit'
  const docTitle = isCredit ? 'Kreditnota' : 'Salgsbilag'

  const paymentLabel =
    invoice.payment_provider === 'vipps' ? 'Vipps' : 'Bankkort (Stripe)'

  const formattedPhone =
    invoice.customer_phone && invoice.customer_phone.length === 8
      ? `${invoice.customer_phone.slice(0, 3)} ${invoice.customer_phone.slice(3, 5)} ${invoice.customer_phone.slice(5)}`
      : invoice.customer_phone || ''

  return `<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="UTF-8">
<title>${docTitle} #${invoiceNumberPadded} – Bølgevarsel</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;background:#f5f7f9;color:#0a2a3d;line-height:1.5;padding:40px 20px}
  .doc{max-width:780px;margin:0 auto;background:#fff;padding:48px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.04)}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #0a2a3d}
  .brand{display:flex;align-items:center;gap:12px}
  .brand-mark{width:48px;height:48px;background:linear-gradient(135deg,#0a2a3d,#1a6080);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px}
  .brand-name{font-size:22px;font-weight:300;letter-spacing:-0.02em}
  .doc-title{text-align:right}
  .doc-title h1{font-size:24px;font-weight:300;color:#0a2a3d;letter-spacing:-0.01em}
  .doc-title .nr{font-size:13px;color:#64748b;margin-top:4px;letter-spacing:0.02em}
  .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px}
  .meta-block h3{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:8px}
  .meta-block p{font-size:14px;line-height:1.6}
  .meta-block .strong{font-weight:600}
  .dates{display:flex;gap:24px;margin-bottom:32px;padding:16px 20px;background:#f8fafc;border-radius:8px;font-size:13px}
  .dates div span{display:block;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:32px}
  thead th{text-align:left;padding:12px 16px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;background:#f8fafc;border-bottom:1px solid #e2e8f0}
  thead th.right{text-align:right}
  tbody td{padding:16px;font-size:14px;border-bottom:1px solid #f1f5f9}
  tbody td.right{text-align:right;font-variant-numeric:tabular-nums}
  tbody .desc{color:#0a2a3d}
  tbody .desc small{display:block;color:#64748b;font-size:12px;margin-top:2px}
  .totals{margin-left:auto;width:300px;font-size:14px}
  .totals tr td{padding:6px 0;border:none}
  .totals tr td.right{text-align:right;font-variant-numeric:tabular-nums}
  .totals .total td{font-size:18px;font-weight:600;padding-top:12px;border-top:2px solid #0a2a3d;margin-top:8px}
  .paid-stamp{display:inline-block;border:2px solid #16a34a;color:#16a34a;padding:4px 12px;border-radius:4px;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;margin-top:8px}
  .footer{margin-top:48px;padding-top:24px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;line-height:1.6}
  .footer p{margin-bottom:4px}
  @media print{
    body{padding:0;background:#fff}
    .doc{box-shadow:none;border-radius:0;padding:32px}
  }
</style>
</head>
<body>
<div class="doc">
  <div class="header">
    <div class="brand">
      <div class="brand-mark">🌊</div>
      <div>
        <div class="brand-name">Bølgevarsel</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">Sjøvarsel rett i lomma</div>
      </div>
    </div>
    <div class="doc-title">
      <h1>${docTitle}</h1>
      <div class="nr">Nr. ${invoiceNumberPadded}</div>
      ${paidDate ? `<div class="paid-stamp">Betalt</div>` : ''}
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-block">
      <h3>Selger</h3>
      <p class="strong">${SELGER.name}</p>
      <p>${SELGER.address}</p>
      <p>${SELGER.postCode} ${SELGER.city}</p>
      <p>Org.nr ${SELGER.orgNr} ${SELGER.vat}</p>
      <p>${SELGER.registry}</p>
      <p style="margin-top:8px">${SELGER.email}</p>
    </div>
    <div class="meta-block">
      <h3>Kjøper</h3>
      <p class="strong">${invoice.customer_email}</p>
      ${formattedPhone ? `<p>Tlf: ${formattedPhone}</p>` : ''}
      ${invoice.customer_name ? `<p>${invoice.customer_name}</p>` : ''}
    </div>
  </div>

  <div class="dates">
    <div>
      <span>Utstedelsesdato</span>
      ${issuedDate}
    </div>
    <div>
      <span>Leveringsperiode</span>
      ${periodStart} – ${periodEnd}
    </div>
    <div>
      <span>Betalingsmåte</span>
      ${paymentLabel}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Beskrivelse</th>
        <th class="right">MVA-sats</th>
        <th class="right">Eks. MVA</th>
        <th class="right">MVA</th>
        <th class="right">Sum</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="desc">
          Bølgevarsel ${invoice.plan_name}-abonnement
          <small>Månedlig digital sjøvarseltjeneste</small>
        </td>
        <td class="right">${invoice.vat_rate_percent} %</td>
        <td class="right">${formatNok(invoice.amount_net_ore)}</td>
        <td class="right">${formatNok(invoice.vat_amount_ore)}</td>
        <td class="right">${formatNok(invoice.amount_gross_ore)}</td>
      </tr>
    </tbody>
  </table>

  <table class="totals">
    <tr>
      <td>Sum eks. MVA</td>
      <td class="right">${formatNok(invoice.amount_net_ore)} kr</td>
    </tr>
    <tr>
      <td>MVA ${invoice.vat_rate_percent} %</td>
      <td class="right">${formatNok(invoice.vat_amount_ore)} kr</td>
    </tr>
    <tr class="total">
      <td>Totalt å betale</td>
      <td class="right">${formatNok(invoice.amount_gross_ore)} kr</td>
    </tr>
  </table>

  <div class="footer">
    <p><strong>${SELGER.name}</strong> • ${SELGER.address}, ${SELGER.postCode} ${SELGER.city} • Org.nr ${SELGER.orgNr} ${SELGER.vat} • ${SELGER.registry}</p>
    <p>Dokumentet er en kvittering for fullført betaling. Spørsmål? Kontakt ${SELGER.email}</p>
    ${invoice.payment_reference ? `<p style="margin-top:8px;color:#94a3b8">Transaksjons-ID: ${invoice.payment_reference}</p>` : ''}
  </div>
</div>
</body>
</html>`
}

// ============================================================================
// Send salgsbilag på e-post via Resend
// ============================================================================

export async function sendInvoiceEmail(invoice: Invoice) {
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) {
    console.error('[invoices] RESEND_API_KEY ikke satt')
    return
  }

  const html = renderInvoiceHtml(invoice)
  const invoiceNumberPadded = String(invoice.invoice_number).padStart(6, '0')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Bølgevarsel <noreply@bolgevarsel.no>',
      to: [invoice.customer_email],
      subject: `Kvittering #${invoiceNumberPadded} – Bølgevarsel ${invoice.plan_name}`,
      html,
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error('[invoices] Resend feilet', res.status, errText)
  }
}
