# Design — HandyHjelp

> **Formål:** Fasit over UI/UX-valgene i dette prosjektet — hva som er valgt og HVORFOR.
> **Oppdateringsregel:** Ved enhver UI-endring: oppdater relevant seksjon + legg linje i endringsloggen nederst. Ved designtilbakemelding fra Espen: spør om den også skal inn i den felles designprofilen (claude-felles).

## Identitet

Offentlig markedsføringsside + jobbplattform for håndverkstjenester i Kristiansand.
Skal utstråle **tillit, profesjonalitet og handlekraft** — kunden skal tørre å bestille.

## Farger (HSL-tokens i src/index.css)

| Rolle | Verdi | Hvorfor |
|---|---|---|
| Primary (CTA) | cyan/teal `188 94% 37%` | Frisk og tillitsvekkende; skiller seg fra konkurrenters blå |
| Hero-bakgrunn | mørk navy `213 51% 24%` (+ gradient) | Soliditet og profesjonalitet «over folden» |
| Accent | oransje `24 95% 53%` | Energi/handling — brukes sparsomt for oppmerksomhet |
| Bakgrunn | nesten hvit `210 40% 98%` | Lys og åpen — dette er en lys-modus-side |
| Status | destructive rød, warning gul, success = primary | Standard semantikk; success gjenbruker primær for helhet |

Gradienter (hero/kort/CTA) og 3 skyggenivåer (card → elevated → hero) gir dybde.

## Typografi

- Brødtekst: **Inter** — nøytral, moderne, lettlest
- Overskrifter: **Roboto Slab** (serif) — håndverksfølelse, soliditet, skiller seg ut
- Norsk språk i hele UI

## Form og bevegelse

- Radius: `0.75rem` (12px) — myke, vennlige hjørner
- Skygger: myke, aldri harde kanter
- **Bevegelse styres av tokens.** Bindende regler med tabeller: `.claude/rules/bevegelse.md`.
  Verdiene finnes **to** steder som ALLTID skal si det samme:
  `src/index.css` (`--ease-*`, `--duration-*`) og `tailwind.config.ts`
  (`ease-enter/move/press`, `duration-micro…reveal`).
  (`src/lib/motionTokens.ts` ble slettet 2026-09-09 sammen med framer-motion —
  ingenting importerte den lenger.)
- Faktisk motor for scroll-animasjon: egne IntersectionObserver-hooks i
  `src/hooks/useScrollAnimation.tsx` — ikke Framer Motion.
- **Framer Motion er ute av markedsføringsdelen** (2026-09-09). Det lå i
  hoved-chunken og kostet 39,5 kB gzip for hver besøkende, til to effekter som
  CSS gjør gratis. `MotionButton` er erstattet av `<Button>` (som allerede har
  trykk- og hover-feedback i CSS), og `PageTransition` av `.page-enter` i
  `index.css`. Biblioteket brukes nå kun av `RoadmapTimeline`, `AnalyticsPanel`
  og `AnimatedNumber` — alle admin og lazy-lastet.
  Merk: exit-animasjonen ved ruteskifte er borte. CSS kan ikke animere et element
  som allerede er fjernet fra DOM-en.
- Hero har statisk `<img fetchpriority="high">`, ikke parallax.

## Mønstre

- shadcn/ui (Radix) + Tailwind med semantiske CSS-variabler — aldri hardkodede farger i komponenter
- **Dekorative gradienter bor i `src/lib/gradients.ts`** (`GRADIENT.hav`, `.skog`, …).
  Endre farge der, aldri i en komponent. Retningen (`bg-gradient-to-r/-br/-b`)
  bestemmes fortsatt på kallstedet.
- Multi-rolle-dashboards (admin/worker/kunde) gjenbruker samme komponentbibliotek
- Skjemaer: React Hook Form + Zod, norsk validering (8-sifret telefon, æøå)
- Mobil-først: kundene finner siden på mobil

## Endringslogg

- 2026-09-09 (runde 5): **Størrelses-/bildeblink ved lasting fjernet.**
  Begge hadde samme rotårsak: verdien hentes fra databasen, men siden tegner
  først med en standardverdi og retter seg når svaret kommer.
  (1) **Logoen** hoppet 64 → 80 px på desktop (48 → 100 på nettbrett, 40 → 72 på
  mobil). `useLogoSettings` bufrer nå siste kjente verdi i `localStorage` og
  bruker den som `initialData` (med `initialDataUpdatedAt: 0`, så ferske verdier
  hentes fortsatt i bakgrunnen). `defaultSettings` er dessuten satt til et
  øyeblikksbilde av databasen, så også førstegangsbesøkende treffer riktig.
  Verifisert: stabil høyde fra første frame på alle tre skjermstørrelser.
  (2) **Hero-bildet** var verre: `<img>` byttet `src` til DB-bildet FØR det var
  lastet, så heroen sto **tom i ~400 ms**, og det innebygde bildet (154 kB) ble
  lastet ned og kastet. `useHeroImage` bufrer nå URL + opacity, og forhåndslaster
  det nye bildet i minnet før `src` byttes. Resultat: 0 tomme frames både ved
  første besøk og refresh, og kun ÉTT bilde lastes ned ved refresh.
  `onError` på `<img>` faller tilbake til det innebygde hvis en bufret URL svikter.
  **Sammenheng med runde 1:** logoblinket ble synlig fordi jeg da fjernet
  `transition-all duration-200` (den animerte `width`/`height`, som står på
  forbudslisten). Overgangen maskerte hoppet. Riktig rekkefølge var å fjerne
  årsaken, ikke gjeninnføre sminken.

- 2026-09-09 (runde 4, korreksjoner etter kritiker):
  Kommentaren i `useScrollGridReveal` forklarte feil årsak — `rect.bottom <= 0`-
  grenen retter scroll-HOPP (End-tast, ankerlenker), ikke 80 %-feilen på fjerde
  kort. Den var det `itemCount` som løste. Kommentaren er omskrevet.
  `MAKS_KORT` innført i `ProjectsSection`, så tallet 4 ikke lenger står duplisert
  i hook-kallet og tre `slice()`-kall — endres ett sted uten det andre, kom
  nøyaktig samme feil tilbake uten varsel.
  To rettelser i mine egne påstander: det var **to** touch-blokkere, ikke én
  (`TeamMemberEditor.tsx:269` OG `toast.tsx:70` — begge ble fikset), og bygget
  inneholder **2** `@media (hover: none)`-regler, ikke 3 (Tailwind slår sammen
  identiske utility-klasser til én regel; den andre er en eldre, urelatert regel
  i `index.css:752`).

- 2026-09-09 (runde 4): **Tre feil funnet av Playwright-funksjonstest, alle
  pre-eksisterende (finnes også i `main`).**
  (1) 🔴 **Sticky mobil-CTA dukket nesten aldri opp.** Komponenten har riktig
  logikk (`scrollY > 400`), men lå i `<LazySection minHeight="0px">` nederst i
  `Index.tsx` — en 0 px høy div som først treffer IntersectionObserveren når du
  er helt nederst. Scroll-lytteren rakk aldri å bli aktiv. Byttet til
  `<Suspense>`; `lazy()` beholdt, så JS-en er fortsatt kodesplittet.
  Verifisert: usynlig på topp, synlig ved 500 px, skjult på desktop.
  (2) 🟡 **Fjerde prosjektkort ble aldri helt synlig** (opasitet 0,8).
  `ProjectsSection` kalte `useScrollGridReveal(3, 3)`, men rendrer
  `projects.slice(0, 4)` — fire kort. Med `itemCount = 3` fikk kort nr. 4
  terskel 3/4, og `(1 − 0,75) × 4 × 0,8 = 0,8`: matematisk umulig å nå 1.
  Rettet til `(4, 3)`. La også til den manglende `rect.bottom <= 0`-grenen i
  hooken, så progresjonen ikke fryser når man ruller helt forbi.
  (3) 🟡 **Hover-effekter hang igjen på touch.** Skrudd på
  `future: { hoverOnlyWhenSupported: true }` — alle `hover:`-utilities pakkes nå
  i `@media (hover: hover)`, i tråd med forbudslisten i `bevegelse.md`.
  En Explore-agent kartla 327 hover-forekomster i 82 filer og fant **én ekte
  blokker**: rediger-knappen for teammedlemmer (`TeamMemberEditor.tsx:269`) var
  `opacity-0 group-hover:opacity-100` uten touch-alternativ — admin ville mistet
  redigering på nettbrett. Fikset med `[@media(hover:none)]:opacity-100` +
  `focus-visible:` + `active:scale-95`. Samme fiks på toastens lukkeknapp.

- 2026-09-09 (runde 3): **Rettet egen regresjon + fjernet framer-motion fra forsiden.**
  (1) 🔴 Sletteskriptet i runde 2 søkte etter klassenavn som tekst og kuttet midt
  inne i `:is(.dark, .blue) .card-enhanced:hover`. Prefikset ble stående alene og
  limte seg til neste regel, slik at `.form-professional` (tilbudsskjemaet,
  `QuoteForm.tsx:374`) mistet ALL styling i lys modus — standardtemaet for kundene.
  To tilsvarende ga døde tema-overstyringer på `.glass-card`. Alle tre rettet;
  en parser bekrefter 0 sammensmeltede selektorer og 0 tomme regler igjen.
  Funnet av `kritiker`. **Lærdom: aldri slett CSS-regler med tekstsøk på
  klassenavn — navnet kan forekomme inne i en lengre selektor.**
  (2) `requestAnimationFrame` avbrytes nå ved unmount i `useScrollGridReveal`.
  (3) Fjernet framer-motion fra markedsføringsbundelen: **132,71 → 93,21 kB gzip
  (−39,5 kB, −30 %)** på hoved-chunken. `MotionButton` slettet, `PageTransition`
  skrevet om i CSS, `AnimatePresence` ute av `App.tsx`. Hover-løftet fra
  `MotionButton` er bevart som `hover:-translate-y-0.5` på cta-variantene, og
  dobbeltskaleringen (1,02 × 1,02) er dermed borte.
  (4) Fjernet den uendelige `animate-subtle-pulse` fra dashbordets varselbobler,
  og de ubrukte tokenene `--shadow-hero` og `--warning`.
  (5) Slettet `src/lib/motionTokens.ts` (130 linjer) — alle konsumentene forsvant
  med framer-motion, så fila var død og dokumentasjonen som kalte den «én av tre
  kilder» var blitt misvisende. Bevegelsesverdiene bor nå to steder: `index.css`
  og `tailwind.config.ts`. Funnet av ultrareview.
  **Lærdom: `git add` nye filer med én gang.** Tre nye filer (`gradients.ts`,
  `og-image.jpg`, `bevegelse.md`) lå usporet, og en `git commit -am` ville
  utelatt dem — bygget hadde brukket i 37 filer. Lokalt «fungerer» er ikke
  det samme som «er med i commiten».

- 2026-09-09 (runde 2): **Opprydding.** (1) `og-image` 1,7 MB PNG → 153 kB JPEG,
  beskåret 1536×1024 → 1200×630 slik at bildet endelig stemmer med dimensjonene
  `index.html` alltid har oppgitt. Rettet samtidig at `QuotePage.tsx` og
  `Services.tsx` pekte på en `og-image.jpg` som ikke fantes — de to sidene hadde
  altså et delingsbilde som ga 404. (2) Slettet ~510 linjer ubrukt kode
  (`App.css`, `ScrollProgress`, `Spotlight`, `useScrollProgress`, `MotionCard`,
  `MotionLink`, `ParallaxBackground`) + 3 ubrukte scroll-hooks + 56 ubrukte
  CSS-regler (index.css 1125 → 970 linjer). `MotionCard`/`MotionLink` lå faktisk
  i bygget, fordi `X.displayName = "..."` er en sideeffekt Rollup ikke fjerner.
  (3) Registrerte `@tailwindcss/typography` — `prose` på Personvern, Cookies og
  Vilkår hadde aldri virket. (4) `useScrollGridReveal` tegnet om hele
  ProjectsSection per scroll-event; nå rAF-dempet med 0,5 %-terskel.
  (5) 126 hardkodede gradienter i 37 filer → `src/lib/gradients.ts`.
  Fargene er identiske — kun kodeopprydding.

- 2026-09-09: **Bevegelsespolering.** Prosjektet hadde to bevegelsessystemer som
  ikke var enige: `motionTokens.ts` sa 180 ms, `index.css` sa 500 ms. Samlet til
  ett token-sett (`--ease-*`, `--duration-*` i `:root`, speilet i tailwind.config
  og motionTokens). Konkret: alle `transition: all` fjernet (11 i index.css, 12 i
  forsidens komponenter), hover 500 ms → 180 ms, stagger 200 ms → 60 ms per kort
  (fire tjenestekort ventet før 600 ms, nå 180 ms), knapp `active:scale-95` @300 ms
  → `scale(0.97)` @120 ms, hover-løft gated bak `(hover: hover) and (pointer: fine)`
  så effekten ikke henger igjen etter trykk på mobil, permanent `will-change`
  fjernet, hero-h1 fikk `letter-spacing: -0.02em`.
  Tre reelle bugs rettet på veien: `.animate-fade-in` var brukt 4 steder uten å
  være definert (bl.a. Header-mobilmenyen), `.hover-scale` likeså i ProjectsSection,
  og `prefers-reduced-motion` frøs alle lastespinnere.
  Farger, layout og innhold er uendret — dette var polering, ikke redesign.
  Kilde: Emil Kowalskis animasjons-skills + impeccable.style.
  Merk: fordi `index.css` er delt globalt, gjelder de nye hover-tidene også
  admin-dashbordet (`.interactive-card`), FAQ (`.card-professional`) og
  bloggen (`.image-hover`) — ikke bare forsiden.
  Bevisst unntak: før/etter-krysningen i `ProjectsSection.tsx:153,162` beholder
  `duration-500`. Det er en innholds-overgang (selve poenget med kortet), ikke
  en dekorativ hover-effekt, og tåler derfor å være rolig.
  Felle dokumentert i bevegelse.md: `cn()`/tailwind-merge fjerner knappens egen
  `transition-[...]` hvis en komponent sender inn `transition-all` (traff
  `ScrollToTop.tsx`).

- 2026-07-20: Trust-badge nederst i TestimonialsSection gjort kildenøytral — «Google»-logo/tekst fjernet siden anmeldelser nå kommer fra flere plattformer (var misvisende). Viser nå kun BadgeCheck-ikon + antall fornøyde kunder. Kort-boblen øverst på hvert anmeldelseskort viser fortsatt riktig plattformlogo (Google/Facebook) automatisk per anmeldelse — uendret, fungerte allerede korrekt.
- 2026-07-18: Facebook som anmeldelseskilde — Facebook-logo i CreateReviewModal (kildevalg), sitat-boblen i TestimonialsSection (hvit bakgrunn, som Google) og blå «Facebook»-badge i admin-listen (ReviewManagement). Merkevare-ikoner (Google/Facebook) samlet i delt fil `src/components/icons/brand-icons.tsx` — brukes ved nye kilder senere. I tillegg: «Synk fra Facebook»-knapp (outline, med Facebook-logo) ved siden av «Legg til anmeldelse» i admin — henter anmeldelser automatisk via Edge Function `sync-facebook-reviews`.
- 2026-07-15: Dokument opprettet (analyse av eksisterende kodebase)
