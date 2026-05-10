#!/bin/bash
# Vipps Go-Live Script
# Bytter fra test-API til prod-API på bolgevarsel.no
#
# Bruk:
#   1. Hent prod-keys fra https://portal.vippsmobilepay.com → Utvikler → Produksjon
#   2. Sett dem i miljøvariabler eller endre verdiene under
#   3. Kjør: bash scripts/vipps-go-live.sh
#
# NB: VIPPS_WEBHOOK_SECRET hentes automatisk fra registrering hos Vipps i steg 4.

set -euo pipefail

source ~/.nvm/nvm.sh

# === FYLL INN PROD-KEYS HER (eller via env vars) ===
PROD_CLIENT_ID="${VIPPS_PROD_CLIENT_ID:?Sett VIPPS_PROD_CLIENT_ID}"
PROD_CLIENT_SECRET="${VIPPS_PROD_CLIENT_SECRET:?Sett VIPPS_PROD_CLIENT_SECRET}"
PROD_SUBSCRIPTION_KEY="${VIPPS_PROD_SUBSCRIPTION_KEY:?Sett VIPPS_PROD_SUBSCRIPTION_KEY}"
PROD_MSN="${VIPPS_PROD_MSN:-1095766}"

cd "$(dirname "$0")/.."

echo "============================================"
echo "Vipps Go-Live for bolgevarsel.no"
echo "============================================"
echo "MSN: $PROD_MSN"
echo "Client ID: ${PROD_CLIENT_ID:0:8}..."
echo ""

# === Steg 1: Bytt env vars ===
echo "[1/5] Bytter env vars i Vercel..."

for var in VIPPS_CLIENT_ID VIPPS_CLIENT_SECRET VIPPS_SUBSCRIPTION_KEY VIPPS_MSN VIPPS_BASE_URL; do
  vercel env rm "$var" production --yes 2>&1 | tail -1
done

{ printf '%s\n' "$PROD_CLIENT_ID"; sleep 1; } | vercel env add VIPPS_CLIENT_ID production --sensitive
{ printf '%s\n' "$PROD_CLIENT_SECRET"; sleep 1; } | vercel env add VIPPS_CLIENT_SECRET production --sensitive
{ printf '%s\n' "$PROD_SUBSCRIPTION_KEY"; sleep 1; } | vercel env add VIPPS_SUBSCRIPTION_KEY production --sensitive
{ printf '%s\n' "$PROD_MSN"; sleep 1; } | vercel env add VIPPS_MSN production
{ printf '%s\n' "https://api.vipps.no"; sleep 1; } | vercel env add VIPPS_BASE_URL production

echo ""

# === Steg 2: Hent prod access token ===
echo "[2/5] Henter prod access token..."
TOKEN=$(curl -s -X POST "https://api.vipps.no/accesstoken/get" \
  -H "client_id: $PROD_CLIENT_ID" \
  -H "client_secret: $PROD_CLIENT_SECRET" \
  -H "Ocp-Apim-Subscription-Key: $PROD_SUBSCRIPTION_KEY" \
  -H "Merchant-Serial-Number: $PROD_MSN" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Kunne ikke hente access token. Sjekk keys."
  exit 1
fi
echo "✅ Token hentet (${TOKEN:0:30}...)"
echo ""

# === Steg 3: Slett gamle webhooks (hvis noen) ===
echo "[3/5] Sjekker eksisterende prod-webhooks..."
EXISTING=$(curl -s "https://api.vipps.no/webhooks/v1/webhooks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Ocp-Apim-Subscription-Key: $PROD_SUBSCRIPTION_KEY" \
  -H "Merchant-Serial-Number: $PROD_MSN")
echo "$EXISTING"
echo ""

# === Steg 4: Registrer ny webhook ===
echo "[4/5] Registrerer prod-webhook..."
WEBHOOK_RESP=$(curl -s -X POST "https://api.vipps.no/webhooks/v1/webhooks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Ocp-Apim-Subscription-Key: $PROD_SUBSCRIPTION_KEY" \
  -H "Merchant-Serial-Number: $PROD_MSN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://bolgevarsel.no/api/vipps/webhook",
    "events": [
      "recurring.agreement-activated.v1",
      "recurring.agreement-rejected.v1",
      "recurring.agreement-stopped.v1",
      "recurring.agreement-expired.v1",
      "recurring.charge-reserved.v1",
      "recurring.charge-captured.v1",
      "recurring.charge-canceled.v1",
      "recurring.charge-failed.v1"
    ]
  }')
echo "$WEBHOOK_RESP"
WEBHOOK_SECRET=$(echo "$WEBHOOK_RESP" | grep -o '"secret":"[^"]*"' | cut -d'"' -f4)

if [ -z "$WEBHOOK_SECRET" ]; then
  echo "❌ Kunne ikke hente webhook secret"
  exit 1
fi
echo "✅ Webhook registrert med secret: ${WEBHOOK_SECRET:0:20}..."
echo ""

# === Steg 5: Oppdater webhook secret env var ===
echo "[5/5] Oppdaterer VIPPS_WEBHOOK_SECRET..."
vercel env rm VIPPS_WEBHOOK_SECRET production --yes 2>&1 | tail -1
{ printf '%s\n' "$WEBHOOK_SECRET"; sleep 1; } | vercel env add VIPPS_WEBHOOK_SECRET production --sensitive
echo ""

# === Trigger redeploy ===
echo "Trigger redeploy..."
echo "" >> docs/vipps-integration.md
git add docs/vipps-integration.md
git commit -m "Vipps GO LIVE: bytter til prod-API"
git push

echo ""
echo "============================================"
echo "🚀 VIPPS ER LIVE!"
echo "============================================"
echo "Vent ca 90s på deploy, så test med en ekte Vipps-betaling på bolgevarsel.no"
