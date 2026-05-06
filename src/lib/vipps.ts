/**
 * Vipps Recurring API helper
 *
 * Wrapper rundt Vipps Recurring API v3 + Access Token API.
 * Bruker test-miljø som default (apitest.vipps.no), bytter til prod via VIPPS_ENV=prod.
 *
 * Docs:
 * - Recurring: https://developer.vippsmobilepay.com/api/recurring
 * - Access Token: https://developer.vippsmobilepay.com/api/access-token
 */

const VIPPS_BASE = process.env.VIPPS_ENV === 'prod' ? 'https://api.vipps.no' : 'https://apitest.vipps.no'

// System headers — sendt med alle requester for debugging hos Vipps support
const SYSTEM_HEADERS = {
  'Vipps-System-Name': 'bolgevarsel',
  'Vipps-System-Version': '1.0.0',
  'Vipps-System-Plugin-Name': 'bolgevarsel-saas',
  'Vipps-System-Plugin-Version': '1.0.0',
}

function requireEnv(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`Manglende env-var: ${key}`)
  return v
}

function authHeaders(): Record<string, string> {
  return {
    'client_id': requireEnv('VIPPS_CLIENT_ID'),
    'client_secret': requireEnv('VIPPS_CLIENT_SECRET'),
    'Ocp-Apim-Subscription-Key': requireEnv('VIPPS_SUBSCRIPTION_KEY'),
    'Merchant-Serial-Number': requireEnv('VIPPS_MSN'),
  }
}

function bearerHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Ocp-Apim-Subscription-Key': requireEnv('VIPPS_SUBSCRIPTION_KEY'),
    'Merchant-Serial-Number': requireEnv('VIPPS_MSN'),
    'Content-Type': 'application/json',
    ...SYSTEM_HEADERS,
  }
}

/**
 * Henter access token. Tokens varer ~1 time, så vi cacher in-memory per lambda-kall.
 * I serverless-miljø som Vercel betyr det at vi henter fersk token nesten hver gang,
 * men kostnaden er minimal (~50ms) og det forenkler livet.
 */
let cachedToken: { token: string; expiresAt: number } | null = null

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token
  }

  const res = await fetch(`${VIPPS_BASE}/accesstoken/get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Vipps access token feilet (${res.status}): ${text}`)
  }

  const data = await res.json()
  // expires_on er Unix timestamp som string
  const expiresAt = Number(data.expires_on) * 1000
  cachedToken = { token: data.access_token, expiresAt }
  return data.access_token
}

/* ============================================================
 * AGREEMENTS
 * ============================================================ */

export interface CreateAgreementParams {
  /** Pris i øre (179 NOK = 17900) */
  amountInOre: number
  /** Pakkenavn ("Familie", "Pro", osv.) */
  productName: string
  /** Kort beskrivelse til brukeren */
  productDescription?: string
  /** Telefonnummer uten +47 (8 siffer) — pre-fyller landingssiden */
  phoneNumber?: string
  /** URL Vipps redirecter til etter at brukeren har bekreftet i appen */
  merchantRedirectUrl: string
  /** URL hvor brukeren kan se og administrere avtalen */
  merchantAgreementUrl: string
  /** Idempotency-key — UUID per agreement-forsøk */
  idempotencyKey: string
}

export interface AgreementResponse {
  agreementId: string
  vippsConfirmationUrl: string
  uuid?: string
}

/**
 * Oppretter en månedlig recurring agreement.
 * Returnerer URL som brukeren skal redirectes til for å bekrefte.
 */
export async function createAgreement(p: CreateAgreementParams): Promise<AgreementResponse> {
  const token = await getAccessToken()

  const body: Record<string, unknown> = {
    interval: { unit: 'MONTH', count: 1 },
    pricing: {
      type: 'LEGACY',
      amount: p.amountInOre,
      currency: 'NOK',
    },
    productName: p.productName,
    merchantRedirectUrl: p.merchantRedirectUrl,
    merchantAgreementUrl: p.merchantAgreementUrl,
  }
  if (p.productDescription) body.productDescription = p.productDescription
  if (p.phoneNumber) body.phoneNumber = p.phoneNumber

  const res = await fetch(`${VIPPS_BASE}/recurring/v3/agreements`, {
    method: 'POST',
    headers: {
      ...bearerHeaders(token),
      'Idempotency-Key': p.idempotencyKey,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Vipps createAgreement feilet (${res.status}): ${text}`)
  }
  return res.json()
}

export interface FetchedAgreement {
  id: string
  status: 'PENDING' | 'ACTIVE' | 'STOPPED' | 'EXPIRED'
  productName: string
  pricing: { amount: number; currency: string }
  start?: string
  stop?: string
  userinfoUrl?: string
}

export async function fetchAgreement(agreementId: string): Promise<FetchedAgreement> {
  const token = await getAccessToken()
  const res = await fetch(`${VIPPS_BASE}/recurring/v3/agreements/${agreementId}`, {
    headers: bearerHeaders(token),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Vipps fetchAgreement feilet (${res.status}): ${text}`)
  }
  return res.json()
}

/**
 * Stopper en avtale (tilsvarer "kanseller abonnement" på Stripe).
 */
export async function stopAgreement(agreementId: string, idempotencyKey: string): Promise<void> {
  const token = await getAccessToken()
  const res = await fetch(`${VIPPS_BASE}/recurring/v3/agreements/${agreementId}`, {
    method: 'PATCH',
    headers: {
      ...bearerHeaders(token),
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ status: 'STOPPED' }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Vipps stopAgreement feilet (${res.status}): ${text}`)
  }
}

/* ============================================================
 * CHARGES
 * ============================================================ */

export interface CreateChargeParams {
  agreementId: string
  /** Pris i øre */
  amountInOre: number
  /** Vises til brukeren i kvittering / app */
  description: string
  /** YYYY-MM-DD — minst én dag i forveien (test-miljø også) */
  dueDate: string
  /** Unik orderId per charge (vi bruker UUID) */
  orderId: string
  /** Idempotency-key */
  idempotencyKey: string
  /** Antall dager Vipps får forsøke å trekke om første mislykkes (default 0) */
  retryDays?: number
  /** RECURRING for vanlige månedstrekk */
  transactionType?: 'DIRECT_CAPTURE' | 'RESERVE_CAPTURE'
}

export interface ChargeResponse {
  chargeId: string
}

export async function createCharge(p: CreateChargeParams): Promise<ChargeResponse> {
  const token = await getAccessToken()

  const body = {
    amount: p.amountInOre,
    description: p.description,
    due: p.dueDate,
    retryDays: p.retryDays ?? 0,
    transactionType: p.transactionType ?? 'DIRECT_CAPTURE',
    orderId: p.orderId,
  }

  const res = await fetch(`${VIPPS_BASE}/recurring/v3/agreements/${p.agreementId}/charges`, {
    method: 'POST',
    headers: {
      ...bearerHeaders(token),
      'Idempotency-Key': p.idempotencyKey,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Vipps createCharge feilet (${res.status}): ${text}`)
  }
  return res.json()
}

export interface FetchedCharge {
  id: string
  amount: number
  status: 'PENDING' | 'DUE' | 'CHARGED' | 'FAILED' | 'CANCELLED' | 'PROCESSING' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'RESERVED'
  due: string
  description: string
}

export async function fetchCharge(agreementId: string, chargeId: string): Promise<FetchedCharge> {
  const token = await getAccessToken()
  const res = await fetch(
    `${VIPPS_BASE}/recurring/v3/agreements/${agreementId}/charges/${chargeId}`,
    { headers: bearerHeaders(token) },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Vipps fetchCharge feilet (${res.status}): ${text}`)
  }
  return res.json()
}

/**
 * Refunder en charge (helt eller delvis).
 */
export async function refundCharge(
  agreementId: string,
  chargeId: string,
  amountInOre: number,
  description: string,
  idempotencyKey: string,
): Promise<void> {
  const token = await getAccessToken()
  const res = await fetch(
    `${VIPPS_BASE}/recurring/v3/agreements/${agreementId}/charges/${chargeId}/refund`,
    {
      method: 'POST',
      headers: {
        ...bearerHeaders(token),
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({ amount: amountInOre, description }),
    },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Vipps refundCharge feilet (${res.status}): ${text}`)
  }
}

/* ============================================================
 * UTILITIES
 * ============================================================ */

/**
 * Konverter NOK til øre for Vipps.
 */
export function nokToOre(nok: number): number {
  return Math.round(nok * 100)
}

/**
 * Lager en YYYY-MM-DD-streng for `daysFromNow` dager fram i tid (UTC).
 */
export function dueDateInDays(daysFromNow: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}
