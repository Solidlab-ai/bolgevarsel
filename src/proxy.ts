import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) {
    // Login-siden er alltid tilgjengelig
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    const auth = req.cookies.get('bv_admin')?.value
    const secret = process.env.ADMIN_SECRET || ''

    // Hvis ADMIN_SECRET ikke er satt, vis en feilmelding
    if (!secret) {
      return new NextResponse('ADMIN_SECRET ikke konfigurert i Vercel', { status: 500 })
    }

    if (auth !== secret) {
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }

    // Aldri indekser admin-sider
    const res = NextResponse.next()
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
