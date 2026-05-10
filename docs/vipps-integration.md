# Vipps Recurring API — integrasjon i Bølgevarsel

**Status:** Fase 1 ferdig (kode på plass, venter på API-keys fra Vipps).
**Sist oppdatert:** 6. mai 2026

---

## Hva er bygget

### 1. Database-migrasjon

Lagt til kolonner på `bv_subscribers`:

| Kolonne | Type | Formål |
|---|---|---|
| `payment_provider` | text | `'stripe'` (default) eller `'vipps'` |
| `vipps_agreement_id` | text (UNIQUE) | Vipps' unike avtale-ID |
| `vipps_status` | text | `PENDING` / `ACTIVE` / `STOPPED` / `EXPIRED` |
| `next_charge_due_at` | timestamptz | Når neste månedlige trekk skal opprettes |
| `last_charge_id` | text | ID på siste forsøkte trekk |
| `last_charge_status` | text | `PENDING` / `CHARGED` / `FAILED` osv. |
| `last_charge_at` | timestamptz | Tidspunkt for siste trekk |

To indekser også:
- `idx_bv_subscribers_next_charge_due` — partial index for cron-jobben
- `idx_bv_subscribers_vipps_agreement` — for raskt webhook-oppslag

Migrasjonsnavn i Supabase: `add_vipps_columns_to_bv_subscribers`

---

### 2. Helper-modul: `/src/lib/vipps.ts`

Wrapper rundt Vipps Recurring API v3 + Access Token API.

**Kjernefunksjoner:**
- `getAccessToken()` — henter access token, cacher in-memory til ~1 min før utløp
- `createAgreement(params)` — oppretter draft agreement, returnerer `vippsConfirmationUrl` brukeren skal sendes til
- `fetchAgreement(agreementId)` — slår opp avtale-status
- `stopAgreement(agreementId)` — kansellerer avtale
- `createCharge(params)` — oppretter månedlig trekk (krever `due` minst 1 dag fram)
- `fetchCharge(agreementId, chargeId)` — slår opp trekk-status
- `refundCharge(agreementId, chargeId, amount, description)` — refunderer hele eller deler

**Utilities:**
- `nokToOre(nok)` — konverterer NOK til øre (Vipps krever øre)
- `dueDateInDays(daysFromNow)` — lager YYYY-MM-DD-streng

**Miljø-bytte:**
Bruker `VIPPS_ENV=test` → `https://apitest.vipps.no` (default)
Bruker `VIPPS_ENV=prod` → `https://api.vipps.no`

**System-headers** sendes med alle requester (krav i prod for support):
- `Vipps-System-Name: bolgevarsel`
- `Vipps-System-Version: 1.0.0`
- `Vipps-System-Plugin-Name: bolgevarsel-saas`
- `Vipps-System-Plugin-Version: 1.0.0`

---

### 3. API-routes

#### `POST /api/vipps/create-agreement`
Kalles når brukeren velger Vipps på `/registrer`.

Body: `{ email, plan: 'kyst'|'familie'|'pro', phoneNumber? }`

Flyt:
1. Upserter subscriber-rad med `payment_provider='vipps'`, `status='inactive'`
2. Kaller `createAgreement()` med `merchantRedirectUrl` pekende til `/api/vipps/callback`
3. Lagrer returnert `agreementId` på subscriberen med `vipps_status='PENDING'`
4. Returnerer `vippsConfirmationUrl` til frontend, som redirecter brukeren

#### `GET /api/vipps/callback?email=xxx`
Vipps redirecter brukeren hit etter at de har bekreftet (eller avslått) i appen.

Flyt:
1. Slår opp `vipps_agreement_id` fra DB via email
2. Spør Vipps om avtalens status
3. Hvis `ACTIVE`: setter `status='trialing'`, `trial_ends_at = nå + 7 dager`, `next_charge_due_at = trial_ends_at`. Redirecter til `/velkommen`.
4. Hvis `PENDING` / `STOPPED` / `EXPIRED`: redirecter til `/registrer?error=vipps_*`

**OBS:** Callback er ikke garantert å bli truffet (brukeren kan ha lukket appen). Webhook er den autoritative kilden.

#### `POST /api/vipps/webhook`
Vipps sender event-notifikasjoner hit. Vi registrerer URL-en hos Vipps via Webhooks API når vi går live.

Events vi håndterer:
- `recurring.agreement-activated.v1` → `vipps_status='ACTIVE'`
- `recurring.agreement-stopped.v1` → `status='cancelled'`, `vipps_status='STOPPED'`
- `recurring.agreement-expired.v1` → `status='inactive'`, `vipps_status='EXPIRED'`
- `recurring.charge-captured.v1` → `status='active'`, scheduler `next_charge_due_at` én måned fram
- `recurring.charge-failed.v1` → `status='past_due'`
- `recurring.charge-cancelled.v1` → `last_charge_status='CANCELLED'`

**TODO før prod:** Verifisere HMAC-signatur fra Vipps' webhook-headers. Vi må hente webhook-secret fra portal.vippsmobilepay.com når vi setter opp webhook der.

#### `GET /api/cron/vipps-charges`
Daglig cron-jobb. Beskyttet med `Bearer ${CRON_SECRET}`.

Flyt:
1. Henter alle Vipps-abonnementer der `next_charge_due_at <= nå + 2 dager`, `status IN ('trialing','active','past_due')`, `vipps_status='ACTIVE'`
2. For hver: oppretter charge via `createCharge()` med `due` = `next_charge_due_at` (eller i morgen hvis i fortiden), `retryDays: 2`, `transactionType: 'DIRECT_CAPTURE'`
3. Markerer `last_charge_status='PENDING'` — webhook vil oppdatere til `CHARGED` når penger er trukket

Schedule i `vercel.json`: `"0 2 * * *"` (02:00 UTC daglig)

---

### 4. Frontend: `/registrer`

Splittet `handleSubmit` i `handleStripe` og `handleVipps`.

**UI-endringer:**
- Nytt valgfritt felt: "Mobilnummer (valgfritt — for Vipps)" — pre-fyller landingssiden hvis oppgitt
- Ny orange "Betal med Vipps"-knapp (offisielle Vipps-farger #FF5B24 / #E54E1A på hover)
- Divider: `── eller ──`
- Eksisterende "Start 7 dager gratis…"-knapp bytter tekst til "Betal med kort — XX kr/mnd"
- Loading-state nå som union: `null | 'stripe' | 'vipps'` så vi ikke disable feil knapp

---

### 5. Cron i `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/vipps-charges",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## Hva som mangler før vi kan teste

### Env-vars (i Vercel + lokalt)
```bash
VIPPS_ENV=test
VIPPS_CLIENT_ID=<fra portal>
VIPPS_CLIENT_SECRET=<fra portal>
VIPPS_SUBSCRIPTION_KEY=<fra portal>
VIPPS_MSN=<merchant serial number>
NEXT_PUBLIC_BASE_URL=http://localhost:3000   # eller ngrok-URL
CRON_SECRET=<random string>
```

I prod: `VIPPS_ENV=prod` + `NEXT_PUBLIC_BASE_URL=https://bolgevarsel.no`

### Callback-URL kan ikke være localhost
Vipps må kunne nå `merchantRedirectUrl`. To måter å teste lokalt:
1. **ngrok**: `ngrok http 3000` og sett `NEXT_PUBLIC_BASE_URL` til ngrok-URL
2. **Vercel preview deploy**: pusher til en branch, tester på `<branch>-bolgevarsel-saas.vercel.app`

### Webhook-registrering
Når API-keys er på plass må vi via Vipps Webhooks API registrere `https://bolgevarsel.no/api/vipps/webhook` for events:
- `recurring.agreement-*`
- `recurring.charge-*`

Det gjøres med en `POST /webhooks/v1/webhooks` ved hjelp av access token.

### HMAC-signatur-verifisering
TODO i `/api/vipps/webhook` — verifiser `X-Ms-Content-Sha256`-header med webhook-secret før vi behandler payload. Foreløpig logger vi events uten verifisering.

---

## Test-flyt når API-keys er på plass

1. **Få test-bruker** fra Business Portal (under "For developers → Test users") — phone + NIN auto-genereres
2. **Installer MT-test-appen** (Vipps har egen test-app):
   - iOS: TestFlight-link på developer.vippsmobilepay.com
   - Android: Joine Google Group → installere fra Play Store
   - PIN i test-appen er alltid `1236`
3. **Sett env-vars** lokalt eller på Vercel preview
4. **Start ngrok eller deploy preview**
5. **Gå gjennom flow**: registrer → velg plan → klikk "Betal med Vipps" → bekreft i MT-app → kommer tilbake til `/velkommen`
6. **Verifiser i Supabase** at `vipps_agreement_id`, `vipps_status='ACTIVE'`, `trial_ends_at` er satt
7. **Test charge manuelt** ved å kalle `/api/cron/vipps-charges` med `Authorization: Bearer $CRON_SECRET`
8. **Test feilkoder** ved å bruke spesielle test-beløp (151 = insufficient funds, 186 = expired card osv.)

---

## Filer som er endret/lagt til

```
src/lib/vipps.ts                                  (ny — 303 linjer)
src/app/api/vipps/create-agreement/route.ts       (ny)
src/app/api/vipps/callback/route.ts               (ny)
src/app/api/vipps/webhook/route.ts                (ny)
src/app/api/cron/vipps-charges/route.ts           (ny)
src/app/registrer/RegistrerForm.tsx               (oppdatert — Vipps-knapp + telefon-felt)
src/app/registrer/page.module.css                 (oppdatert — .vippsBtn, .divider)
vercel.json                                       (oppdatert — crons)
docs/vipps-integration.md                         (denne fila)
```

---

## Referanser

- Vipps developer docs: https://developer.vippsmobilepay.com/
- Recurring API: https://developer.vippsmobilepay.com/docs/APIs/recurring-api/
- Test-miljø: https://developer.vippsmobilepay.com/docs/knowledge-base/test-environment/
- API-spec: https://developer.vippsmobilepay.com/api/recurring/






