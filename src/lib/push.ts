import webpush from 'web-push'

let configured = false

/**
 * Initialiserer web-push med VAPID-nøkler. Idempotent — trygt å kalle flere ganger.
 * Returnerer false hvis nøkler mangler (da hopper vi over push uten å krasje).
 */
export function ensureWebPush(): boolean {
  if (configured) return true
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:hei@bolgevarsel.no'
  if (!publicKey || !privateKey) {
    console.warn('[push] VAPID-nøkler mangler — push deaktivert')
    return false
  }
  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
  return true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
  icon?: string
}

/**
 * Sender et push-varsel til ett endpoint.
 * Returnerer { ok, gone } — gone=true betyr at subscription er utløpt (410/404)
 * og bør slettes fra databasen.
 */
export async function sendPushTo(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
): Promise<{ ok: boolean; gone: boolean }> {
  if (!ensureWebPush()) return { ok: false, gone: false }
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
    )
    return { ok: true, gone: false }
  } catch (err: any) {
    const status = err?.statusCode
    // 404/410 = subscription finnes ikke lenger (avinstallert/utløpt)
    const gone = status === 404 || status === 410
    if (!gone) console.error('[push] sendNotification feilet:', status, err?.body)
    return { ok: false, gone }
  }
}

export { webpush }
