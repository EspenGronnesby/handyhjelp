
# Plan: Konverteringssporing + Analytics-dashbord

## Mål
1. Spore alle "kontakt-/henvendelses"-handlinger på siden (skjema, telefon, e-post, tilbakeringing, CTA-klikk).
2. Sende disse til GA4 (gtag) **og** logge dem til vår egen tabell i Lovable Cloud — slik at hver konvertering kan kobles til konkret quote/agreement.
3. Bygge et PostHog-aktig dashbord under `Eier-panel → ny "Analytics"-fane` med trafikk, kilder, land, enheter, topp-sider og konverteringstrakt — i samme stil som resten av nettsiden.

GTM utelates: GA4 direkte (gtag.js) er enkleste og raskeste vei for dette omfanget — GTM gir liten gevinst når sporingen styres fra koden.

## Hva som spores som "konvertering"
Alt som betyr at en besøkende vil ha kontakt eller venter på svar fra oss:
- Tilbudsskjema sendt (QuoteForm)
- Serviceavtale sendt (ServiceAgreementForm)
- Tilbakeringing sendt (QuickCallbackForm / QuickCallbackDialog)
- Telefon-klikk (header + sticky CTA + kontaktseksjon)
- E-post-klikk (header + kontakt)
- Hero/primær-CTA "Be om tilbud" / "Kontakt oss" klikk
- (Mikro) Åpning av tilbakeringings-dialog

## Brukeropplevelse i admin
Ny fane **"Analytics"** i `OwnerDashboard` (også synlig for `admin`-rolle) med PostHog-aktig layout:
- Toppstripe: KPI-kort (Besøk, Unike besøkende, Konverteringer, Konverteringsrate, Snitt-tid) med trend mot forrige periode.
- Periodevelger (7d / 30d / 90d / egendefinert) + sammenligning forrige periode.
- Rad 1: Trafikk over tid (area chart) + Konverteringer over tid (linje).
- Rad 2: Kilder/medium (tabell m/ søylegraf), Land (tabell m/ flagg-emoji + bar), Enheter (donut).
- Rad 3: Topp-sider (tabell), Topp-konverteringspunkter (hvilke CTA/skjema som genererte henvendelser), Konverteringstrakt (Besøk → CTA-klikk → Skjema åpnet → Skjema sendt).
- Live-feed nederst: siste 20 konverteringer med navn/e-post (fra koblet quote/agreement) + kilde.

Stil: bruker eksisterende design-tokens (Card, GradientHeaderCard, SectionHeading, recharts som allerede ligger i shadcn), ingen hardkodede farger — matcher nåværende mørke/lyse tema.

## Datakilder
**GA4 (Measurement ID nå, Data API senere):**
- Fase 1: Vi sender events til GA4 via `gtag` — alt synlig i GA4-grensesnittet ditt umiddelbart.
- Fase 2 (når du oppretter service account): edge function `ga4-report` henter trafikk, land, kilder fra GA4 Data API og mater toppdelen av dashbordet. Inntil da viser dashbordet "Koble GA4 Data API for trafikkdata" og kjører på egne tall der mulig.

**Egen tabell `analytics_events` (Lovable Cloud):**
- Logger pageviews + alle konverteringshendelser med: type, path, referrer, utm_source/medium/campaign, country (fra Accept-Language/edge), user_agent-derived device, session_id (localStorage), user_id (hvis innlogget), metadata (quote_id/agreement_id).
- Driver konverteringsmodulene, trakt og live-feed — virker fra dag én uten GA-kobling.

## Tekniske detaljer

### 1. Sporing-lag
- Oppdatere `src/components/SEO/GoogleAnalytics.tsx`:
  - Lese Measurement ID fra `import.meta.env.VITE_GA4_MEASUREMENT_ID`.
  - Eksportere `trackConversion(type, metadata)` som både kaller `gtag('event', ...)` og POSTer til edge function `log-event`.
- Ny hook `useAnalytics()` med `trackPageView`, `trackConversion`, `trackCTAClick`.
- `App.tsx`: route-change-listener kaller `trackPageView`.
- Plug-ins i:
  - `QuoteForm.tsx`, `ServiceAgreementForm.tsx`, `QuickCallbackForm.tsx` — kall på vellykket submit (etter at DB-insert er OK, før Web3Forms-pipelinen — bryter ikke skjemalogikk).
  - `Header.tsx`, `StickyMobileCTA.tsx`, `Footer.tsx`, `EditableContactInfo.tsx` — telefon/e-post-klikk.
  - `EditableHero.tsx`, `EditableBottomCTA.tsx`, `EditableCTABox.tsx` — primær-CTA-klikk.

### 2. Database (`analytics_events`)
Kolonner: `id, occurred_at, event_type ('pageview'|'conversion'|'cta_click'), event_name, path, referrer, utm_source, utm_medium, utm_campaign, country, device ('mobile'|'tablet'|'desktop'), session_id, user_id (nullable), related_quote_id, related_agreement_id, metadata jsonb`.
RLS:
- `INSERT`: åpent for `anon` + `authenticated` (kun event-logging, ingen PII utover det vi selv sender).
- `SELECT`: kun `platform_owner` og `admin` via `has_role`.
GRANTs settes eksplisitt i samme migrasjon (per prosjektregel).
Indekser på `occurred_at`, `event_type`, `path`, `session_id`.

### 3. Edge functions
- `log-event` (verify_jwt=false): validerer payload (zod), beriker med country fra `cf-ipcountry`/`x-vercel-ip-country`/headers-fallback, skriver til `analytics_events`. CORS åpen.
- `analytics-summary` (verify_jwt=true): tar `from`, `to`; sjekker at innlogget bruker har `admin` eller `platform_owner` via service role; returnerer aggregater (KPI, tidsserier, topp-sider, kilder, land, enheter, trakt, siste konverteringer).
- `ga4-report` (verify_jwt=true, fase 2): proxy til GA4 Data API når service account er konfigurert. Plassholder i fase 1.

### 4. Frontend-dashbord
- Ny rute `Analytics`-fane i `OwnerDashboard.tsx` (5. tab, ikon `BarChart3`).
- Nye komponenter under `src/components/admin/analytics/`:
  - `AnalyticsPanel.tsx` (hovedside m/ periode-state)
  - `KpiCards.tsx`, `TrafficChart.tsx`, `ConversionsChart.tsx`
  - `SourcesTable.tsx`, `CountriesTable.tsx`, `DevicesDonut.tsx`
  - `TopPagesTable.tsx`, `ConversionFunnel.tsx`, `LiveConversionFeed.tsx`
- React Query med `staleTime: 5m` (per prosjektregel).
- Bruker `recharts` som allerede er installert.

### 5. Secrets/konfigurasjon
- Be om `VITE_GA4_MEASUREMENT_ID` (publishable — legges i `.env`/Lovable env, ikke runtime secret).
- Fase 2: `GA4_PROPERTY_ID` + `GA4_SERVICE_ACCOUNT_JSON` som runtime secrets når du er klar.

## Sikkerhet
- Ingen PII logges i `analytics_events` utover allerede-koblet quote/agreement-ID. E-post/telefon ligger i de tabellene bak RLS.
- `log-event` rate-limit-vennlig: ingen tunge spørringer, kun insert.
- Admin-dashbord bruker kun aggregerte tall fra `analytics-summary`; live-feed joiner mot quotes/agreements server-side og returnerer kun navn + kilde.

## Leveranser
1. Migrasjon: `analytics_events` + RLS + GRANTs + indekser.
2. Edge functions: `log-event`, `analytics-summary` (+ stub for `ga4-report`).
3. Sporings-hook + GA4-oppdatering + plug-ins i skjemaer/CTA-er.
4. Analytics-fane i `OwnerDashboard` med alle moduler.
5. Kort dokumentasjonsnotat i chat om hvordan du ser dataene i GA4 + dashbordet.

## Ikke inkludert (kan komme senere)
- GTM-container
- GA4 Data API-grafer (venter på service account)
- Eksport til CSV
- Egendefinerte segmenter
