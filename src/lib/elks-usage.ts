// Henter faktisk SMS-forbruk fra 46elks (ekte tall, ikke estimat).
// Brukes på admin-dashbordet for SMS-kostnad denne måneden.
//
// VIKTIG om 46elks-paginering (lett å ta feil av):
//   - "end"   = hent SMS ETTER denne datoen  (gulvet vårt: 1. i måneden)
//   - "start" = hent SMS FØR denne datoen    (brukes til å bla bakover)
//   - "next"  = tidsstempel for neste side; settes som "start" på neste kall
// Altså: end er fast (månedsstart), og vi flytter start bakover via next til next mangler.

type ElksSms = { id: string; direction?: string; cost?: number }

export type ElksUsage = {
  ok: boolean
  smsSendt: number          // antall utgående SMS denne måneden
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
  const manedStart = new Date()
  manedStart.setDate(1)
  const end = fmtElks(manedStart) // gulv: ikke eldre enn 1. i måneden

  try {
    const sett = new Set<string>()
    let kostnadOre = 0
    let utgaaende = 0
    let start: string | null = null
    let kall = 0

    while (kall < 12) {
      kall++
      let url = `https://api.46elks.com/a1/sms?end=${end}&limit=100`
      if (start) url += `&start=${encodeURIComponent(start)}`

      const res: Response = await fetch(url, { headers: { Authorization: `Basic ${auth}` } })
      if (!res.ok) {
        return { ok: false, smsSendt: 0, kostnadKr: 0, feil: `46elks HTTP ${res.status}` }
      }
      const data: { data?: ElksSms[]; next?: string } = await res.json()
      const rader = data.data ?? []

      let nye = 0
      for (const m of rader) {
        if (sett.has(m.id)) continue
        sett.add(m.id)
        nye++
        if (m.direction?.startsWith('outgoing')) {
          utgaaende++
          kostnadOre += m.cost ?? 0
        }
      }

      // Stopp når det ikke er flere sider, eller siden ikke ga noe nytt (sikring mot evig loop)
      if (!data.next || nye === 0) break
      start = data.next
    }

    // 46elks oppgir cost i 1/10000 av valutaenheten
    return { ok: true, smsSendt: utgaaende, kostnadKr: Math.round(kostnadOre / 10000) }
  } catch (e: any) {
    return { ok: false, smsSendt: 0, kostnadKr: 0, feil: e?.message ?? 'Ukjent feil' }
  }
}
