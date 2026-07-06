# Aktiver Agent Integrations (MCP-server)

Eksponer HandyHjelp som en MCP-server via `@lovable.dev/mcp-js` slik at ChatGPT, Claude, Cursor osv. kan koble seg til appen og bruke verktøy på vegne av innloggede brukere.

## Hva som bygges

**1. Installer avhengigheter**
- `@lovable.dev/mcp-js` + `zod`

**2. Vite-plugin**
- Legg til `mcpPlugin()` fra `@lovable.dev/mcp-js/stacks/supabase/vite` i `vite.config.ts`. Genererer `supabase/functions/mcp/index.ts` automatisk ved build.

**3. MCP-entry** (`src/lib/mcp/index.ts`)
- `defineMcp` med navn `handyhjelp-mcp`, tittel "HandyHjelp", instruksjoner på norsk.
- OAuth via Supabase (`auth.oauth.issuer`) med issuer bygget fra `VITE_SUPABASE_PROJECT_ID`, audience `authenticated`.

**4. Verktøy** (`src/lib/mcp/tools/`) — rollebasert, kjører som innlogget bruker mot RLS:
- `list_my_quotes` — hent egne tilbud (alle roller)
- `list_my_agreements` — hent egne serviceavtaler (alle roller)
- `list_my_jobs` — hent egne jobber (alle roller)
- `get_analytics_summary` — 7d oppsummering (kun admin/owner via `has_role`-sjekk i handler)
- `list_pending_quotes` — ubehandlede tilbud (kun admin/worker)

Hvert verktøy oppretter en Supabase-klient som forwarder `ctx.getToken()` slik at RLS gjelder.

**5. OAuth-flyt (Supabase authorization server)**
- Kjør `configure_oauth_server` for å aktivere OAuth 2.1 + dynamic client registration.
- Ny rute `/.lovable/oauth/consent` (`src/pages/OAuthConsent.tsx`) registrert i `App.tsx`. Bruker `supabase.auth.oauth.getAuthorizationDetails/approve/deny`. Redirect ubekreftede brukere til `/auth?next=<full consent URL>` — og `Auth.tsx` må konsumere `next` etter innlogging (også i `emailRedirectTo` og evt. Google `redirect_uri`).

**6. Deploy + manifest**
- Kjør manifest-extractor for å oppdatere `.lovable/mcp/manifest.json`.
- Deploy `mcp` edge function.

**7. `supabase/config.toml`**
- Legg til `[functions.mcp]` med `verify_jwt = false` (mcp-js validerer OAuth-token selv).

## Teknisk detaljer

- Issuer: `https://${VITE_SUPABASE_PROJECT_ID}.supabase.co/auth/v1` (direkte host, ikke `.lovable.cloud`-proxy).
- Verktøy sjekker `ctx.isAuthenticated()`, henter user via `ctx.getUserId()`, og bruker `has_role`-funksjonen for admin-only tools.
- Consent-siden må håndtere: manglende session → redirect til `/auth?next=...`; approve/deny → følg returnert `redirect_url`.
- `Auth.tsx` oppdateres til å lese `?next=` og navigere dit etter vellykket sign-in/signup/OAuth.
- Ingen top-level env-reads i `src/lib/mcp/index.ts` eller tool-filer (kun inne i handlers).

## Filer

**Nye:**
- `src/lib/mcp/index.ts`
- `src/lib/mcp/tools/list-my-quotes.ts`
- `src/lib/mcp/tools/list-my-agreements.ts`
- `src/lib/mcp/tools/list-my-jobs.ts`
- `src/lib/mcp/tools/get-analytics-summary.ts`
- `src/lib/mcp/tools/list-pending-quotes.ts`
- `src/pages/OAuthConsent.tsx`

**Endret:**
- `vite.config.ts` (mcpPlugin)
- `src/App.tsx` (consent-rute)
- `src/pages/Auth.tsx` (håndter `next`-param)
- `supabase/config.toml` (`[functions.mcp]`)

## Utenfor scope
- Skrivende verktøy (opprette tilbud/avtaler via MCP) — kan legges til senere hvis ønsket.
- Endring av logo/favicon (finnes allerede).

Vil du at jeg skal legge til skrivende verktøy også (f.eks. `create_quote`, `update_job_status`), eller starte med read-only settet over?
