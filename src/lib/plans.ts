// ============================================
// SINGLE SOURCE OF TRUTH FOR ALLE ABONNEMENTER
// Oppdater her — resten av appen følger med
// ============================================

export type Plan = {
  id: string
  name: string
  price: number
  priceId: string
  featured: boolean
  lokasjoner: number
  mottakere: number
  smsEnabled: boolean
  hidden?: boolean
  features: string[]
}

export const PLANS: Plan[] = [
  {
    id: 'kyst',
    name: 'Basis',
    price: 49,
    priceId: 'price_1TIn0GDF2t9Ys3TQxchu6W2q',
    featured: false,
    lokasjoner: 1,
    mottakere: 0,
    smsEnabled: false,
    features: [
      'Tilgang til Min side — full kontroll over varsler og profil',
      'Rapportgenerator — generer rapport på forespørsel',
      'Daglig e-postrapport til deg — kl. du bestemmer',
      'Bølgehøyde, vind, periode og sjøtemperatur',
      'AI-oppsummering tilpasset din aktivitet',
      'Surfer, fisker, seiler, kajakk og mer',
      'Soloppgang og solnedgang per dag',
    ],
  },
  {
    id: 'kyst-pluss',
    name: 'Standard',
    price: 99,
    priceId: 'price_1TVUsSDF2t9Ys3TQJr8tCGts',
    featured: false,
    lokasjoner: 1,
    mottakere: 1,
    smsEnabled: true,
    features: [
      'Tilgang til Min side — full kontroll over varsler og profil',
      'Alt i Basis-pakken',
      'Kritisk farevarsel via SMS — ved kuling og storm',
      'Trygghet på sjøen for deg og din familie',
      'SMS sendes umiddelbart når farevarsel utstedes',
      'Kan ikke skrus av — sikkerhet først',
      'Perfekt for hyttefolk og hobby-fiskere',
    ],
  },
  {
    id: 'familie',
    name: 'Familie',
    price: 199,
    priceId: 'price_1TInAnDF2t9Ys3TQJLe4tkWR',
    featured: true,
    lokasjoner: 3,
    mottakere: 5,
    smsEnabled: true,
    features: [
      'Tilgang til Min side — full kontroll over varsler og profil',
      'Rapportgenerator — sjekk opptil 7 dager frem',
      'SMS-varsel til hele familien — opptil 5 personer',
      'Opptil 3 kyststeder (hytta, hjemsted, favorittspot)',
      'Egen aktivitetsprofil per mottaker',
      'Daglig e-post + SMS — velg tidspunkt per person',
      'AI-oppsummering tilpasset hver aktivitet',
      'Kritisk farevarsel til alle — kan ikke skrus av',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    priceId: 'price_1TIn6ZDF2t9Ys3TQNGP7Rmce',
    featured: false,
    hidden: true,
    lokasjoner: 5,
    mottakere: 5,
    smsEnabled: true,
    features: [
      'Tilgang til Min side — full kontroll over varsler og profil',
      'Rapportgenerator — flerdag AI-analyse opptil 7 dager',
      'Opptil 5 kyststeder langs hele norskekysten',
      'SMS til opptil 5 mottakere med ulike profiler',
      'Finn beste dag i uken for din aktivitet',
      'Nedbør, vindkast og bølgeperiode inkludert',
      'Daglig e-post + SMS — individuelt tidspunkt',
      'Kritisk farevarsel til alle — kan ikke skrus av',
    ],
  },
]

// Hjelpefunksjoner
export const getPlanById = (id: string) => PLANS.find(p => p.id === id)
export const getPlanByPriceId = (priceId: string) => PLANS.find(p => p.priceId === priceId)

// Legacy/utgåtte planer som fortsatt finnes i databasen, men ikke selges lenger.
// Brukes kun for å vise riktig navn/pris til eksisterende abonnenter.
const LEGACY_PLANS: Record<string, { name: string; price: number }> = {
  sikkerhet: { name: 'Sikkerhet', price: 499 },
}

// Visningsnavn for en plan-id (både aktive og legacy). Faller tilbake til id-en selv.
export const planNavn = (id: string): string =>
  getPlanById(id)?.name ?? LEGACY_PLANS[id]?.name ?? id

// Pris for en plan-id som tall (både aktive og legacy). Returnerer null hvis ukjent.
export const planPris = (id: string): number | null =>
  getPlanById(id)?.price ?? LEGACY_PLANS[id]?.price ?? null
