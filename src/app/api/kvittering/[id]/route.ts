export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { renderInvoiceHtml, type Invoice } from '@/lib/invoices'

/**
 * GET /api/kvittering/[id]
 *
 * Public kvitteringsside som returnerer ren HTML — ideell for
 * print/lagre-som-PDF og for regnskapsfører som ikke skal logge inn.
 *
 * ID-en er en uuid (ikke gjettbart). Innholdet er ikke sensitivt utover
 * det kunden allerede har fått på e-post.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const supabase = getSupabaseAdmin()
  const { data: invoice } = await supabase
    .from('bv_invoices')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!invoice) {
    return new Response(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;text-align:center"><h1>Kvitteringen finnes ikke</h1><p>Sjekk at lenken er riktig, eller kontakt hei@bolgevarsel.no</p></body></html>`,
      {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      },
    )
  }

  return new Response(renderInvoiceHtml(invoice as Invoice), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, max-age=300',
    },
  })
}
