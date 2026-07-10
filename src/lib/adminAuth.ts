import { NextRequest } from 'next/server'

/**
 * Sjekker om forespørselen kommer fra en innlogget admin.
 *
 * Primær: httpOnly-cookien `bv_admin` som settes av /api/admin/login.
 * Sekundær: `x-admin-key`-header mot FAREVARSEL_ADMIN_KEY — kun for
 * server-til-server (skript, cron). Ingen fallback-verdi: er ikke
 * variabelen satt, godtas ikke headeren i det hele tatt.
 */
export function isAdmin(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (secret && req.cookies.get('bv_admin')?.value === secret) return true

  const apiKey = process.env.FAREVARSEL_ADMIN_KEY
  if (apiKey && req.headers.get('x-admin-key') === apiKey) return true

  return false
}
