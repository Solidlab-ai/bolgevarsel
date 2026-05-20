// Henter faktisk SMS-forbruk fra 46elks (ekte tall, ikke estimat).
// Brukes på admin-dashbordet for SMS-kostnad denne måneden.

type ElksSms = { direction?: string; cost?: number; created?: string }

export type ElksUsage = {
  ok: boolean
  smsSendt: number          // antall utgående SMS-deler denne måneden
  kostnadKr: number         // faktisk kostnad i kr
  feil?: string
}

// 46elks vil ha format "2006-01-02T15:04:05.00" (uten Z/tidssone)
function fmtElks(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T00:00:00.00`
}

export async function hentElksForbruk(): Promise<ElksUsage> {
  const user = process.env.ELKS_API_USER
  const secret = process.env.ELKS_API_SECRET
  if (!user || !secret) {
    return { ok: false, smsSendt: 0, kostnadKr: 0, feil: 'Mangler 46elks-credentials' }
  }

  const auth = Buffer.from(`${user}:${secret}`).toString('base64')
  const start = new Date()
  start.setDate(1) // 1. i inneværende måned
  const startStr = fmtElks(start)

  try {
    let url: string | null = `https://api.46elks.com/a1/sms?start=${startStr}&limit=100`
    let smsSendt = 0
    let kostnadOre = 0
    let kall = 0

    // Paginerer via "next"-markøren, maks 10 sider (1000 SMS) for å være trygg
    while (url && kall < 10) {
      kall++
      const res: Response = await fetch(url, { headers: { Authorization: `Basic ${auth}` } })
      if (!res.ok) {
        return { ok: false, smsSendt: 0, kostnadKr: 0, feil: `46elks HTTP ${res.status}` }
      }
      const data: { data?: ElksSms[]; next?: string } = await res.json()
      const meldinger = data.data ?? []
      const utgaaende = meldinger.filter(m => m.direction?.startsWith('outgoing'))
      smsSendt += utgaaende.length
      kostnadOre += utgaaende.reduce((sum, m) => sum + (m.cost ?? 0), 0)

      url = data.next
        ? `https://api.46elks.com/a1/sms?start=${startStr}&end=${encodeURIComponent(data.next)}&limit=100`
        : null
    }

    // 46elks oppgir cost i 1/10000 av valutaenheten
    return { ok: true, smsSendt, kostnadKr: Math.round(kostnadOre / 10000) }
  } catch (e: any) {
    return { ok: false, smsSendt: 0, kostnadKr: 0, feil: e?.message ?? 'Ukjent feil' }
  }
}
