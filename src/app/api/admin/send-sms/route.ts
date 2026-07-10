export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin as checkAdmin } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, message } = await req.json()
  if (!to || !message) {
    return NextResponse.json({ error: 'Mangler telefonnummer eller melding' }, { status: 400 })
  }

  const cleanTo = to.replace(/\s+/g, '')
  const elksAuth = Buffer.from(
    `${process.env.ELKS_API_USER}:${process.env.ELKS_API_SECRET}`
  ).toString('base64')

  try {
    const res = await fetch('https://api.46elks.com/a1/sms', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${elksAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        from: 'Bolgevarsel',
        to: cleanTo,
        message: message,
      }),
    })
    const data = await res.json()

    if (data.id) {
      return NextResponse.json({
        success: true,
        sms_id: data.id,
        to: cleanTo,
        status: data.status || 'sent',
      })
    } else {
      return NextResponse.json({
        error: data.message || data.missing || JSON.stringify(data),
      }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
