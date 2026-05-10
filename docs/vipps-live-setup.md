# Vipps Recurring — Live setup

**Status:** 🟢 LIVE i produksjon på bolgevarsel.no fra 10. mai 2026

## Produksjonsoppsett

- **MSN:** 1095766 (Bolgevarsel-salgsstedet hos Vipps)
- **API base:** `https://api.vipps.no`
- **Webhook ID:** `cb6e9fb5-f7d7-4ebb-bf28-d298efe8c23e`
- **Webhook URL:** `https://bolgevarsel.no/api/vipps/webhook`

## Webhook events vi lytter på

- `recurring.agreement-activated.v1` → setter vipps_status=ACTIVE
- `recurring.agreement-rejected.v1`
- `recurring.agreement-stopped.v1` → setter status=cancelled
- `recurring.agreement-expired.v1` → setter status=inactive
- `recurring.charge-reserved.v1`
- `recurring.charge-captured.v1` → setter status=active, sender GA4 purchase-event ved første charge (trial→paid konvertering)
- `recurring.charge-canceled.v1`
- `recurring.charge-failed.v1` → setter status=past_due

## HMAC-signaturverifisering

Vipps signerer hver webhook med Azure-style HMAC-SHA256:

```
signatureText = "POST\n{pathAndQuery}\n{date};{authority};{contentHash}"
signature = base64(hmac_sha256(secret, signatureText))
```

**KRITISK:** Secret skal brukes som **UTF-8 string** direkte, IKKE base64-dekodet.
Implementasjonen er i `src/app/api/vipps/webhook/route.ts:verifyVippsSignature()`.

## Flyten (Vipps)

1. Bruker velger plan på `/registrer` → POST `/api/vipps/create-agreement`
2. Server oppretter agreement hos Vipps, lagrer i `bv_subscribers` med `vipps_status=PENDING`
3. Returnerer deeplink-URL → bruker bekrefter i Vipps-app med PIN
4. Vipps redirecter til `/api/vipps/callback?email=xxx`
5. Callback henter agreement-status fra Vipps API
6. Hvis ACTIVE: oppdaterer DB til `status=trialing`, `trial_ends_at` = +7 dager
7. **Genererer magic-token og sender velkomst-email med innloggingslenke** (kun hvis ny brukeren)
8. Redirect til `/velkommen?email=xxx`
9. Webhook bekrefter alt async + oppdaterer DB ved status-endringer

## Env vars i Vercel (production)

```
VIPPS_CLIENT_ID         (sensitive)
VIPPS_CLIENT_SECRET     (sensitive)
VIPPS_SUBSCRIPTION_KEY  (sensitive)
VIPPS_MSN               = 1095766
VIPPS_BASE_URL          = https://api.vipps.no
VIPPS_WEBHOOK_SECRET    (sensitive — fra webhook-registrering)
```

**NB:** `vercel env pull` viser sensitive env vars som tomme strenger — det er Vercel's
sikkerhetsfunksjon, IKKE et tegn på at variablene er tomme.

## Go-live-skript

`scripts/vipps-go-live.sh` automatiserer:
1. Bytter env vars fra test til prod
2. Henter prod access token
3. Sjekker eksisterende webhooks
4. Registrerer ny webhook (genererer ny secret)
5. Lagrer ny secret i Vercel
6. Trigger redeploy

Bruk:
```bash
export VIPPS_PROD_CLIENT_ID="..."
export VIPPS_PROD_CLIENT_SECRET="..."
export VIPPS_PROD_SUBSCRIPTION_KEY="..."
bash scripts/vipps-go-live.sh
```

## Test-miljø (MT)

- **MSN:** 485811
- **API base:** `https://apitest.vipps.no`
- **Test webhook ID:** `0f566f65-9268-4b6e-b134-6ceb3ba753c0`
- **Test-bruker:** Tlf `41007252`, NIN `05026127302`, MT-app PIN `1236`

## Ferdig prod-test

10. mai 2026: Ulrik registrerte abonnement med ekte Vipps fra `hello+vippser@ulrik.biz`,
plan Familie (179 kr/mnd, 7 dagers trial til 17. mai). Hele flyten fungerte —
agreement aktivert, DB oppdatert, velkomst-email mottatt med funksjonell magic link.

## Kjente forskjeller fra Stripe-flyten

- Vipps har 7-dagers trial via callback (ikke via betalingsleverandør) — vi setter `trial_ends_at` selv
- Vipps webhook krever HMAC-SHA256 — Stripe bruker `stripe-signature` header
- Vipps secret format: base64-encoded string, brukes som UTF-8
- Charge-events kommer fra Vipps **etter** trial — første captured event = konvertering
