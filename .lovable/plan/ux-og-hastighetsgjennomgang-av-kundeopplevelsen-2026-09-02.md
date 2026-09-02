# UX- og hastighetsgjennomgang av kundeopplevelsen

Jeg har målt forsiden i nettleser og gått gjennom bilder, lasting og animasjoner. Forsiden er allerede godt optimalisert (lazy seksjoner, hero som ekte `<img>` med høy prioritet, ingen konsollfeil). De største gjenværende problemene ligger på tjenestesidene og i «tomme hull» mens innhold lastes.

## Funn (verifisert)

1. **Tjenestesidenes bakgrunnsbilder er enorme PNG-er** — 2,1–2,5 MB hver:
   - `hero-tjenester.png` (2,4 MB) på /tjenester
   - `hero-tomrer.png` (2,2 MB), `hero-takrennerens.png` (2,5 MB), `hero-blikkenslager.png` (2,2 MB)
   På mobilnett gir dette flere sekunder før hero vises. Forsidens hero er til sammenligning 157 KB WebP.
2. **Logoene er PNG på 40–79 KB** og lastes i header og footer på hver side.
3. **Google Fonts lastes som blokkerende `<link>`** i `<head>` — forsinker første tekstvisning litt.
4. **Lazy-lastede seksjoner har ingen visuell fallback** (`fallback = null`): når man scroller ned til prosjekter/anmeldelser står det et tomt felt i et øyeblikk før innholdet popper inn.
5. **Bilder i anmeldelser/blogg mangler `loading="lazy"`** enkelte steder (prosjektlistene har det allerede).

## Hva jeg gjør

**1. Komprimer tjeneste-heroene**
Konverter de fire PNG-ene til optimaliserte WebP (mål: under 200 KB hver, samme bildeutsnitt), og bytt importene i `Services.tsx`, `ServiceTomrer.tsx`, `ServiceTakrennerens.tsx`, `ServiceBlikk.tsx`. Gamle PNG-filer beholdes ikke i bundelen.

**2. Samme hero-teknikk som forsiden**
Gi tjenestesidene ekte `<img>` med `fetchpriority="high"`, `width/height` og `decoding="async"` i stedet for CSS-bakgrunn, slik forsiden allerede gjør. Det gir raskere og mer stabil visning.

**3. Optimaliser logo og fonter**
- Logoene komprimeres (WebP med PNG-fallback der nødvendig).
- Fontlenken lastes ikke-blokkerende (preload + swap) slik at teksten vises umiddelbart.

**4. Mykere lasteopplevelse**
- Legg lette skeleton-fallbacks på `LazySection` for prosjekter, anmeldelser og bunn-CTA, slik at man ser konturen av innholdet i stedet for tomrom.
- Kort, rolig fade-in når seksjonen faktisk kommer inn (respekterer `prefers-reduced-motion`).

**5. Bildeopprydding**
Legg `loading="lazy"` + `decoding="async"` på gjenstående innholdsbilder under folden (anmeldelser, blogg, prosjektdetalj).

**6. Verifisering**
Måler forsiden og en tjenesteside på nytt (mobil 390px og desktop), sammenligner overført datamengde og first-contentful-paint før/etter, og sjekker at ingen konsollfeil oppstår.

## Teknisk oppsummering

- Filer: `src/pages/Service*.tsx`, `src/pages/Services.tsx`, `src/components/LazySection.tsx`, `src/pages/Index.tsx`, `index.html`, nye WebP-assets i `src/assets/`.
- Ingen endringer i database, forretningslogikk eller skjemaer — kun presentasjon og ytelse.
- Forsidens marger og avstander røres ikke.
