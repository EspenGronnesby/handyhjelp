
## Hvorfor hjemmesiden er treg i dag

Performance-profil viser:
- **FCP 7.1s**, DOMContentLoaded 6.7s, full load 7.7s
- **8089 DOM-noder**, 656 event listeners, 236 nettverksforespørsler
- **86 fetch-kall** ved oppstart — fordi hver lille tekstbit (overskrift, knapp, footer-lenke) gjør sitt eget Supabase-kall via `useEditableContent`. Jeg telte 30+ slike kall på forsiden alene (Hero, TrustStripe, ClientLogos, Process, Guarantee, Projects, Testimonials, Services, BottomCTA, Footer)
- **Hero-bildet er 154KB** og preloades i full størrelse selv på mobil (768-varianten finnes allerede)
- **ProjectsSection laster Supabase-bilder** umiddelbart selv om de er langt nede på siden (2,4s nedlastingstid)

## Plan

### 1. Batch all redigerbart innhold i ett enkelt kall (største vinst)
- Ny hook `useSiteContent()` som henter **hele `site_content`-tabellen i ett spørring**, cacher i React Query (staleTime 5 min — tabellen er liten)
- `useEditableContent(section, key)` blir en lookup i den cachen istedenfor et nytt DB-kall
- Forventet effekt: **86 → ~5 fetch-kall**, fjerner mesteparten av script/network-ventetiden

### 2. Lazy-load alt under hero
Bruk `React.lazy` + en `<LazySection>` wrapper (IntersectionObserver) for:
- `ProjectsSection`, `TestimonialsSection`, `ClientLogosSection`, `GuaranteeSection`, services-grid, `EditableBottomCTA`, `Footer`
- Hero + TrustStripe forblir eager (above the fold)
- Forventet effekt: initial JS-bundle krymper kraftig, FCP < 2s

### 3. Hero-bilde
- Preload `hero-building-maintenance-768.webp` (32KB) på mobil og 1280-varianten på desktop via `<link rel="preload" media="...">` istedenfor full 154KB
- Sørg for `fetchpriority="high"` kun på LCP-elementet

### 4. Last bare admin/edit-kode når brukeren er admin OG edit-mode er på
- `EditButton`, edit-modaler, `EditableWrapper` rendres bare når `isAdmin && editMode` — i dag mountes mange skjulte komponenter som teller mot DOM-noder og listeners
- Bytt fra alltid-mounted modal til `{isOpen && <Modal/>}` der det ikke allerede er gjort

### 5. Avlast prosjektbildene
- `loading="lazy"` + `decoding="async"` på alle bilder i `ProjectsSection` (sammen med lazy-mounting fra punkt 2)
- Behold antallet prosjekter, men ikke last før seksjonen er i viewport

## Tekniske detaljer

**Filer som endres:**
- `src/hooks/useEditableContent.tsx` — refaktoreres til å lese fra én delt cache
- Ny: `src/hooks/useSiteContent.tsx` — én `select * from site_content`-kall
- Ny: `src/components/LazySection.tsx` — IntersectionObserver-wrapper rundt `React.lazy` chunks
- `src/pages/Index.tsx` — bytt direkteimport til `lazy()` for seksjoner under hero
- `src/components/HeroSection.tsx` — `<picture>` med responsive `srcset` + tilpasset preload i `index.html`
- `index.html` — oppdater preload-tag for hero
- `src/components/ProjectsSection.tsx` — `loading="lazy"` på `<img>`
- Admin/edit-komponenter på forsiden — wrap render i `isAdmin && editMode`-guard

**Det jeg IKKE rører:**
- Forretningslogikk, skjemainnsending, database-skjema
- Design, farger, layout, animasjoner (forblir identisk visuelt)
- Eksisterende routes, edit-mode-funksjonalitet for admin
