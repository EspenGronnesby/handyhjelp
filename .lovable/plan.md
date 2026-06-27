
# Plan: Analytics-KPI i Oversikt + egen Analyse-side

## 1. KPI-kort i Oversikt (admin/eier)
I `src/pages/DashboardActivity.tsx`, under det eksisterende 4-kortgridet (Kunder / Forespørsler / Aktive / Fullførte), legges en ny rad med to klikkbare kort, kun synlig når `isAdmin || isOwner`:

- **Besøk (siste 7 dager)** — sum av `pageview`-events
- **Konverteringsrate** — `conversions / besøk` i prosent, siste 7 dager

Kortene følger samme stil som dagens stat-grid (gradient + ikon + tall + undertekst), bruker `card-hover-lift`, og er `<button>` som åpner et nytt modalvindu i stedet for å navigere.

Til høyre i kort-raden: en mindre lenke-knapp **«Se mer data →»** som navigerer til `/dashboard/analytics`.

Data hentes via en ny hook `useAnalyticsOverview()` som kaller eksisterende `analytics-summary` edge function med `from = nå - 7d`, og cacher 5 min (React Query, per prosjektregel). Hooken er rolle-gated: kalles ikke for arbeider/kunde.

## 2. Klikkbar detalj-modal
Ny komponent `src/components/admin/AnalyticsStatDetailModal.tsx` etter samme mønster som `AdminStatDetailModal`:

- Bruker shadcn `Dialog` med samme gradient-header.
- To typer: `'visits'` og `'conversionRate'`.
- For **visits**: 7-dagers linje-/area-graf (recharts) + topp 5 sider + topp 3 kilder.
- For **conversionRate**: KPI øverst, 7-dagers trend-linje, og bryt ned hvilke skjemaer som ga konverteringer (Tilbud / Avtale / Tilbakeringing).
- Henter samme `analytics-summary`-svar; gjenbruker eksisterende felt slik at det ikke trengs ny edge function.

Modal-tilstanden styres i `DashboardActivity.tsx` med `selectedAnalytics: 'visits' | 'conversionRate' | null`.

## 3. Egen Analyse-side `/dashboard/analytics`
- Ny rute lagt til i `src/App.tsx` under `/dashboard`-skallet: `analytics` → ny side `src/pages/DashboardAnalytics.tsx`.
- Siden gate-er på rolle: kun `admin` eller `platform_owner` (redirect til `/dashboard` ellers), via `useRole()`.
- Innhold: gjenbruker `AnalyticsPanel` (allerede bygget), men pakkes inn i en header med:
  - Tittel «Analyse» + undertekst
  - **Periodevelger** (7d / 30d / 90d) — løftes opp som prop til panelet
  - **Oppdater-knapp** med refresh-ikon som invaliderer alle React Query-nøkler under `['analytics', …]` og kaller `refetch()` for live oppdatering
  - Sist oppdatert-tidsstempel
- `AnalyticsPanel` justeres lett: tar imot `period` og `onRefreshRef` som valgfrie props slik at den fungerer både selvstendig og fra siden.

## 4. Fjerne Analyse-fanen fra Eier-panelet
- `src/pages/OwnerDashboard.tsx`: fjern `analytics` TabsTrigger/TabsContent og `BarChart3`-importen.
- Endre `TabsList` fra `grid-cols-5` til `grid-cols-4`.
- Brukere når Analyse via «Se mer data» eller direkte URL.

## 5. Navigasjon
`Dashboard.tsx`-shellets venstre/topp-nav får ikke ny permanent lenke (oversikt-knappen + «Se mer data» fra oversikten dekker behovet) — i tråd med eksisterende minimalistisk nav. Vurderes senere om Eier ber om det.

## Tekniske detaljer
- **Ingen DB-endringer** trengs. `analytics_events`, `log-event` og `analytics-summary` er allerede på plass.
- **React Query-nøkler**:
  - `['analytics', 'overview', '7d']` — oversiktshooken
  - `['analytics', 'panel', period]` — full Analyse-side
- **Refresh** bruker `queryClient.invalidateQueries({ queryKey: ['analytics'] })`.
- **Filer**:
  - Ny: `src/hooks/useAnalyticsOverview.tsx`
  - Ny: `src/components/admin/AnalyticsStatDetailModal.tsx`
  - Ny: `src/pages/DashboardAnalytics.tsx`
  - Endret: `src/pages/DashboardActivity.tsx` (KPI-rad + modal-state)
  - Endret: `src/pages/OwnerDashboard.tsx` (fjern Analyse-fane)
  - Endret: `src/App.tsx` (ny rute + known-route-liste)
  - Endret: `src/components/admin/analytics/AnalyticsPanel.tsx` (valgfri `period`/`onRefetchReady`-prop)

## Ikke inkludert
- Endringer i `analytics-summary` edge function (eksisterende felt dekker det vi viser)
- GA4 Data API-integrasjon (egen fase senere)
- Eksport / CSV
