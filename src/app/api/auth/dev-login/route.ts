// DEV-ONLY route for å logge inn lokalt uten magic link.
// Returnerer 404 i production - kan ikke brukes på prod uansett.
//
// Bruk: GET /api/auth/dev-login?email=din@epost.no
// Setter bv_session-cookie + redirecter til /min-side
// Klienten setter localStorage.bv_email der.

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  // Hard sperre i production
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 })
  }

  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Dev login</title>
      <style>
        body{font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;padding:0 24px;background:#e8f4f8;color:#0a2a3d}
        h1{font-weight:400;font-size:24px;margin-bottom:8px}
        p{color:#6b8fa3;font-size:14px;line-height:1.6}
        form{margin-top:24px;display:flex;gap:8px}
        input{flex:1;padding:12px 16px;border:1.5px solid rgba(10,42,61,0.15);border-radius:100px;font-size:15px;font-family:inherit;background:white;outline:none}
        button{padding:12px 24px;background:#0a2a3d;color:white;border:none;border-radius:100px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit}
        .badge{display:inline-block;background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:500;margin-bottom:16px}
        code{background:rgba(10,42,61,0.06);padding:2px 8px;border-radius:6px;font-size:13px}
      </style></head><body>
      <span class="badge">DEV ONLY</span>
      <h1>Lokal innlogging</h1>
      <p>Logg inn lokalt uten å vente på magic link. Bruker eksisterende abonnent fra Supabase.</p>
      <p>Eksempel: <code>igoa@hotmail.com</code></p>
      <form method="GET">
        <input name="email" type="email" placeholder="din@epost.no" required autofocus />
        <button type="submit">Logg inn</button>
      </form>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  // Verifiser at brukeren faktisk finnes
  const supabase = getSupabaseAdmin()
  const { data: sub } = await supabase
    .from('bv_subscribers')
    .select('id, email, status')
    .eq('email', email)
    .maybeSingle()

  if (!sub) {
    return new NextResponse(
      `Ingen abonnent funnet for ${email}. Opprett en først via /registrer.`,
      { status: 404 }
    )
  }

  // Sett cookie + redirect til min-side med flagg som lar klienten sette localStorage
  const res = NextResponse.redirect(new URL(`/min-side?dev_login=${encodeURIComponent(email)}`, req.url))
  res.cookies.set('bv_session', email, {
    httpOnly: true,
    secure: false, // localhost = http
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
