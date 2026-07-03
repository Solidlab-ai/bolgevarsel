# AGENTS.md — Solidlab arbeidsregler for AI-økter

Denne filen leses av alle Claude-/AI-økter som jobber i dette repoet. Følg reglene.

## Jens-regelen (OBLIGATORISK — Solidlab-flyt)

Når du gjør arbeid på et Solidlab-prosjekt, skal du **FØR du avslutter økten**:

1. **Logg en hendelse** i Supabase-tabellen `solidlab_venture_log`:
   - `venture_id` (hent fra `solidlab_ventures` via domenet)
   - `event_type` (fritekst, f.eks. `infrastructure`, `feature`, `launch`, `fix`)
   - `summary` (kort setning)
   - `details` (jsonb — bruk `jsonb_build_object(...)`)
   - `actor` (f.eks. `'Jens'` eller navn på økten)

2. **Oppdater `solidlab_roadmap`** for prosjektet:
   - Marker utført arbeid som `status='shipped'` (sett `shipped_at=now()`)
   - Legg nytt/planlagt arbeid inn som `status='planned'`
   - Kategorier: `admin, feature, improvement, infrastructure, marketing, sales`
   - Prioritet: `critical, high, medium, low`

3. **Sørg for at prosjektkortet i `domains.solidlab.ai` speiler virkeligheten**:
   `github_repo_url`, `status`, `deploy_url`, roadmap og logg skal stemme.

## Kjernen i Solidlab

```
Domeneshop (kilde) ──daglig cron──▶ solidlab_ventures (prosjektkort)
                                          │
                     arbeid gjort ────────┤  ← LUKK DENNE LOOPEN
                                          ▼
                     roadmap + logg oppdateres, kortet speiler virkeligheten
```

Supabase-prosjekt: `zqodoekmswibvjzhtixf`

## Andre regler

- **IKKE** bruk `openclaw`-workspace.
- Hold hemmeligheter i `.env` / Vercel env — aldri commit `.env`-filer eller hardkodede nøkler.
- Repoene ligger i GitHub-org-en `Solidlab-ai`. Vercel autodeployer fra `main`.
- Rediger lokalt → `git add . && git commit` → `git push` → autodeploy.

<!-- autodeploy-test 12:51:07 -->
