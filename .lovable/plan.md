Plan:

1. Gjør adminnavigasjon rolig uten full refresh
- Endre `AdminDashboard` slik at fullskjerm-loader kun vises på aller første lasting, ikke når data/hooker oppdateres etter at man trykker på Mail, Økonomi, Innhold eller underfaner.
- La URL-oppdatering for kategori/fane skje uten at brukeropplevelsen føles som reload.
- Behold innholdet montert der det allerede er `forceMount`, men unngå at skjulte faner skaper unødvendige synlige loading-states.

2. Stabiliser admin-data
- Oppdatere `useAdminData` slik at `loading` ikke slår tilbake til full loading ved senere refresh.
- Eventuelle manuelle oppdateringer etter handlinger skal oppdatere data i bakgrunnen uten å blanke dashboardet.

3. Fiks mailhistorikk på telefon
- Bytte tabellen i `EmailHistory` til en mobiltilpasset horisontal scroll-container med fast minimumsbredde på tabellen, slik at man faktisk kan dra sideveis og se Status/handlinger.
- Fjerne vertikal scroll-lås på mobil slik at siden fortsatt scroller naturlig opp/ned.
- Gjøre status og visningsknapp tilgjengelig på mobil uten at de havner utenfor en låst Radix/ScrollArea-container.

4. Fiks detaljmodal for mailhistorikk
- Bytte innvendig `ScrollArea` i e-postdetaljer til vanlig `overflow-y-auto`, så modal og innhold scroller bedre på telefon.

5. Verifisering
- Sjekke dashboard-tabber og mailhistorikk i mobil viewport etter endringene: Mail/andre valg skal ikke gi full spinner/refresh, og mailhistorikk skal kunne scrolles horisontalt.