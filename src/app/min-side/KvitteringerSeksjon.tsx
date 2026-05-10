/**
 * KvitteringerSeksjon
 *
 * Liste over salgsbilag (kvitteringer) på Min side / Konto-fanen.
 * Henter fra /api/min-side/kvitteringer og lar bruker åpne hver kvittering
 * via /api/kvittering/[id] (ren HTML, kan lagres som PDF i nettleseren).
 */

'use client'

import { useEffect, useState } from 'react'

type Invoice = {
  id: string
  invoice_number: number
  issued_at: string
  plan_name: string
  amount_gross_ore: number
  payment_provider: 'stripe' | 'vipps'
  paid_at: string | null
  invoice_type: 'sale' | 'credit'
}

export function KvitteringerSeksjon({ email }: { email: string }) {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null)

  useEffect(() => {
    fetch(`/api/min-side/kvitteringer?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices || []))
      .catch(() => setInvoices([]))
  }, [email])

  if (invoices === null) {
    return (
      <div style={{ padding: '0.75rem 1rem', background: '#f8fbfc', borderRadius: 12 }}>
        <div style={{ fontSize: '0.75rem', color: '#6b8fa3', marginBottom: '8px' }}>Kvitteringer</div>
        <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Laster...</div>
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div style={{ padding: '0.75rem 1rem', background: '#f8fbfc', borderRadius: 12 }}>
        <div style={{ fontSize: '0.75rem', color: '#6b8fa3', marginBottom: '8px' }}>Kvitteringer</div>
        <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
          Ingen kvitteringer enda. Du får første kvittering når prøveperioden er over og første betaling går gjennom.
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '0.75rem 1rem', background: '#f8fbfc', borderRadius: 12 }}>
      <div style={{ fontSize: '0.75rem', color: '#6b8fa3', marginBottom: '8px' }}>Kvitteringer</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {invoices.map((inv) => {
          const issued = new Date(inv.issued_at).toLocaleDateString('nb-NO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
          const number = String(inv.invoice_number).padStart(6, '0')
          const sum = (inv.amount_gross_ore / 100).toLocaleString('nb-NO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          return (
            <a
              key={inv.id}
              href={`/api/kvittering/${inv.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                padding: '10px 12px',
                background: '#fff',
                border: '1px solid rgba(10,42,61,0.08)',
                borderRadius: 8,
                textDecoration: 'none',
                color: '#0a2a3d',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(10,42,61,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(10,42,61,0.08)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 500 }}>
                  Kvittering #{number}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#6b8fa3' }}>
                  {issued} · {inv.plan_name} · {sum} kr
                </span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#6b8fa3', flexShrink: 0 }}>
                <path d="M3 8h10M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )
        })}
      </div>
    </div>
  )
}
