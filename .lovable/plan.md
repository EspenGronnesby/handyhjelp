# Vis bunnmenyen overalt i dashbordet

## Problem
Bunnmenyen (Oversikt / Profil / Varsler / Eier / Admin / Innleveringer) finnes bare i `src/pages/Dashboard.tsx`. Når du trykker «Eier» går du til `/owner` og «Innleveringer» går til `/worker` — disse sidene har sin egen layout uten bunnmenyen, så den «forsvinner».

## Løsning
Flytt `/owner` og `/worker` inn under Dashboard-layouten som child routes, slik at `Outlet` rendrer dem og bunnmenyen alltid er synlig.

### Endringer

1. **`src/App.tsx`**
   - Legg til `<Route path="owner" element={<OwnerDashboard />} />` og `<Route path="worker" element={<WorkerDashboard />} />` inne i `/dashboard`-routen.
   - Behold gamle `/owner` og `/worker` som redirects til `/dashboard/owner` og `/dashboard/worker` (så ingen lenker brekker).
   - Oppdater `isAppRoute`/`isKnownRoute` deretter.

2. **`src/pages/Dashboard.tsx`**
   - Oppdater nav-items: `/owner` → `/dashboard/owner`, `/worker` → `/dashboard/worker`.

3. **`src/pages/OwnerDashboard.tsx` og `src/pages/WorkerDashboard.tsx`**
   - Fjern deres egen `<header>` med logo + Hjem-knapp og den ytre `min-h-screen` wrapperen, siden Dashboard-layouten allerede leverer header og container. Behold alt innhold (tabs, paneler, skjemaer).
   - Behold auth/role-guards, men endre redirect ved manglende rolle til `/dashboard` (uendret).

### Resultat
Bunnmenyen og toppheaderen er identisk på alle dashbord-sider, inkludert Eier og Innleveringer. Ingen funksjonalitet endres.
