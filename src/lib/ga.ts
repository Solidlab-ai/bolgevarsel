/**
 * Google Analytics 4 — server-side events via Measurement Protocol
 *
 * Brukes for å sende konverteringer som ikke kan tracke pålitelig fra klient
 * (f.eks. trial→paid som skjer på dag 7, eller via Stripe/Vipps webhook).
 *
 * Docs: https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-5FT8K97G4J'
const GA_API_SECRET = process.env.GA_API_SECRET

const ENDPOINT = 'https://www.google-analytics.com/mp/collect'

export interface GaEventParams {
  /** Standard GA4 event name (purchase, begin_checkout, etc.) */
  name: string
  /** Event-spesifikke parametere (value, currency, items, etc.) */
  params?: Record<string, unknown>
}

export interface GaEventOptions {
  /**
   * Stabil unik identifikator for brukeren.
   * Vi bruker email hashed med en simpel HMAC-aktig prefix for å gjøre det vanskeligere
   * å reverse-engineere, men det er primært bare en stabil ID.
   */
  clientId: string
  /** Optional: GA4 user_id for cross-device tracking */
  userId?: string
}

/**
 * Lager en stabil 'client_id' fra en email.
 * GA4 forventer format som "1234567890.1234567890" — vi lager noe deterministisk
 * fra email så samme bruker får samme client_id på tvers av server-events.
 */
export function clientIdFromEmail(email: string): string {
  // Simpel deterministic hash — vi trenger ikke kryptografisk styrke her
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    const ch = email.charCodeAt(i)
    hash = (hash << 5) - hash + ch
    hash |= 0
  }
  const positive = Math.abs(hash)
  // Format som GA4 client_id: "<random>.<timestamp>"
  return `${positive}.${Math.floor(Date.now() / 1000)}`
}

/**
 * Send et event til GA4 via Measurement Protocol.
 * Returns true ved suksess, false ved feil (men kaster aldri — vi vil ikke at
 * en GA-feil skal blokkere en betalingswebhook).
 */
export async function gaServerEvent(
  event: GaEventParams,
  options: GaEventOptions,
): Promise<boolean> {
  if (!GA_API_SECRET) {
    console.warn('[ga] GA_API_SECRET mangler — hopper over event:', event.name)
    return false
  }

  try {
    const body = {
      client_id: options.clientId,
      ...(options.userId && { user_id: options.userId }),
      events: [
        {
          name: event.name,
          params: {
            // GA4 anbefaler engagement_time_msec for at events skal regnes med
            engagement_time_msec: 100,
            ...event.params,
          },
        },
      ],
    }

    const url = `${ENDPOINT}?measurement_id=${GA_ID}&api_secret=${GA_API_SECRET}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[ga] Event '${event.name}' feilet (${res.status}):`, text)
      return false
    }
    return true
  } catch (err) {
    console.error('[ga] Event feilet:', err)
    return false
  }
}

/**
 * Convenience: send 'purchase'-event ved fullført betaling.
 * Bruker GA4 sin standard ecommerce schema.
 */
export async function gaPurchaseEvent(args: {
  email: string
  transactionId: string
  /** Pris i NOK (ikke øre) */
  value: number
  /** 'kyst' | 'familie' | 'pro' */
  planId: string
  planName: string
  paymentProvider: 'stripe' | 'vipps'
}): Promise<boolean> {
  return gaServerEvent(
    {
      name: 'purchase',
      params: {
        transaction_id: args.transactionId,
        value: args.value,
        currency: 'NOK',
        payment_type: args.paymentProvider,
        items: [
          {
            item_id: args.planId,
            item_name: args.planName,
            item_category: 'subscription',
            price: args.value,
            quantity: 1,
          },
        ],
      },
    },
    {
      clientId: clientIdFromEmail(args.email),
      userId: args.email, // bruker email som user_id for cross-device
    },
  )
}

/**
 * Convenience: send 'begin_checkout' når noen starter betaling
 */
export async function gaBeginCheckoutEvent(args: {
  email: string
  planId: string
  planName: string
  value: number
  paymentProvider: 'stripe' | 'vipps'
}): Promise<boolean> {
  return gaServerEvent(
    {
      name: 'begin_checkout',
      params: {
        value: args.value,
        currency: 'NOK',
        payment_type: args.paymentProvider,
        items: [
          {
            item_id: args.planId,
            item_name: args.planName,
            item_category: 'subscription',
            price: args.value,
            quantity: 1,
          },
        ],
      },
    },
    {
      clientId: clientIdFromEmail(args.email),
      userId: args.email,
    },
  )
}
