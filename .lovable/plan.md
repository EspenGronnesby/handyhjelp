Tre fokuserte fikser uten å endre design eller forretningslogikk.

## 1) Hero — ingen animasjon, instant visning

`src/components/HeroSection.tsx`
- Fjern `transition-opacity duration-700` + `opacity-0/opacity-100` som styres av `loading`. Bakgrunnen rendres umiddelbart med default-bildet (allerede importert som `heroDefaultImage` og preloaded i `index.html`).
- Fjern `<Spotlight />` (light-effekt-komponent som gjør egen animasjon/render-arbeid på mobil).
- `useHeroImage` beholdes uendret — den returnerer default-bildet synkront, så DB-overstyring kan fortsatt brukes av admin uten å trigge fade.

Resultat: hero-bildet vises på første frame, ingen fade-in, ingen ekstra effekt-lag.

## 2) Admin E-post — scrollbar på mobil

Problem: På `/owner?category=mail` er hele `EmailComposer` + `EmailHistory` lang nok til å gå under skjermkanten. På mobil låses scroll fordi indre `ScrollArea`-komponenter (mottakere, logg-tabell) fanger touch-events og hindrer side-scroll.

Endringer:
- `src/components/admin/EmailComposer.tsx`: bytt `ScrollArea` rundt valgte mottakere til en vanlig `<div>` med `max-h-[200px] overflow-y-auto` på desktop og `max-h-none` på mobil (`md:max-h-[200px]`), slik at mobil scroller med sidens scroll.
- `src/components/admin/EmailConfirmModal.tsx`: legg til `max-h-[90vh] overflow-y-auto` på `DialogContent` slik at bekreftelsesdialogen kan scrolles på små skjermer, og bytt indre `ScrollArea` til vanlig `overflow-y-auto`-div.
- `src/components/admin/EmailHistory.tsx`: pakk tabellen i `overflow-x-auto` (ikke `ScrollArea`) slik at vertikal sidescroll fortsatt fungerer; statusrad (sendt/feilet badges) blir alltid synlig fordi siden kan scrolles normalt.
- `src/pages/AdminDashboard.tsx`: legg til `pb-24` på containeren slik at innholdet ikke ligger bak mobil-bunnen.

Ingen endringer i e-post-sending, maler eller datastruktur.

## 3) Admin-navigasjon — ingen "laster" ved tab-bytte

Problem: Hver gang man bytter mellom kategori-faner (Oppdrag / Økonomi / Innhold / E-post) eller underfaner, vises full-screen `Loader2` et øyeblikk. Årsak: i `AdminDashboard.tsx` linje 184:
```
if (adminLoading || loading) return <FullPageLoader />
```
`loading`-flagget kommer fra `useAdminData` og settes til `true` igjen hver gang `fetchData()` kjøres på nytt (refresh etter handlinger, fokus-events, osv.). I tillegg unmountes/remountes hvert `TabsContent`-tre, så barn som `EmailHistory`, `EmailTemplateManager`, `InvoiceManagement`, `ProjectManagement` re-fetcher fra null hver gang.

Endringer:
- `src/hooks/useAdminData.tsx`: ikke sett `setLoading(true)` ved refetch. Behold initial `loading=true`, men etter første vellykkede `fetchData` skal påfølgende kall kun oppdatere data uten å flippe loading-flagget. Innfør egen `refreshing`-flagg hvis nødvendig (brukes ikke til full-screen loader).
- `src/pages/AdminDashboard.tsx`: bytt full-screen loader-betingelsen til `adminLoading || (loading && profiles.length === 0)` slik at den kun vises på allerførste innlasting.
- Behold `TabsContent` mounted: legg til `forceMount` på de tunge fanene (`mail/history`, `mail/templates`, `okonomi/invoices`, `innhold/projects`, `innhold/blog`, `innhold/reviews`) og bruk `hidden={activeTab !== tabKey}` for å skjule visuelt. Da kjører deres interne data-hooks bare én gang og fane-bytter blir umiddelbare.

Ingen endringer i hvilken data som hentes eller hvordan handlinger fungerer.

## Filer som endres
- `src/components/HeroSection.tsx`
- `src/components/admin/EmailComposer.tsx`
- `src/components/admin/EmailConfirmModal.tsx`
- `src/components/admin/EmailHistory.tsx`
- `src/pages/AdminDashboard.tsx`
- `src/hooks/useAdminData.tsx`

## Det som IKKE røres
- Forretningslogikk, e-post-sending, database-skjema, RLS
- Design, farger, layout, spacing på forsiden
- Eksisterende ruter, edit-mode, admin-tilganger
- Andre sider enn admin og hero
