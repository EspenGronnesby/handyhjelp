# Design-system — HandyHjelp marketing

Mål: visuell konsistens på alle marketing-sider. Brukes som sjekkliste når man legger til nye seksjoner eller sider.

## Kanoniske byggeklosser

### 1. Seksjons-overskrift — `<SectionHeading>`

Brukes for **alle** seksjons-h2 på marketing-sider. Aldri rene `<h2>` lenger.

Komponent: `src/components/ui/SectionHeading.tsx`

**To moduser:**
- `align="left"` (default): vertikal gradient-bar til venstre for h2. Brukes i lese-flyt og inne i `max-w-*` containere.
- `align="center"`: horisontal gradient-pille (16-20w × 1-1.5h) over sentrert h2. Brukes for hero-style sentrerte seksjons-titler.

**Props:**
- `icon?: LucideIcon` — valgfri, lite ikon ved siden av h2-teksten
- `gradient: string` — Tailwind-gradient-klasse (f.eks. `from-cyan-500 via-blue-500 to-indigo-600`)
- `title: string`
- `subtitle?: string`

**Gradient-palett som brukes:**
- cyan → blue → indigo (kald)
- emerald → teal → cyan (grønn)
- amber → orange → rose (varm)
- fuchsia → purple → indigo (lilla)
- slate → zinc → gray (nøytral)

### 2. Kort — to varianter, brukes etter regel

**Marketing-info-kort:** `glass-card` (CSS-klasse). Brukes for CTA, garantier, info-paneler, tjeneste-kort, fordel-kort.

**Bilde-fokuserte kort:** shadcn `<Card>` med standard styling. Brukes for blog-posts, prosjekt-kort med før/etter-bilder, team-avatarer med profilbilder.

**Skjemaer / utility:** shadcn `<Card>`. Brukes for skjema-bokser (QuoteForm, Feedback, ReviewSubmit), error-boundaries, skeleton-loaders.

### 3. Gradient-header-kort — `<GradientHeaderCard>`

Komponent: `src/components/ui/GradientHeaderCard.tsx`

Stor 5:3 gradient-header med ikon + content under. Brukes på `/tjenester` for info-kort (WhyChoose, Pricing, Comparison) og tjeneste-detalj-kort.

### 4. Trust-stripe — `<TrustStripe>`

Komponent: `src/components/TrustStripe.tsx`

Tynn band rett under hero med 4 trust-budskap. Plasseres på alle hovedsider:
- Index `/`
- About `/om-oss`
- Contact `/kontakt`
- FAQ `/faq`
- Projects `/prosjekter`
- Blog `/raad`

**Ikke på:** skjemaer (QuotePage, ServiceAgreement), bekreftelser (ThankYou), juridiske sider, Auth.

### 5. Bunn-CTA — `<EditableBottomCTA>`

Komponent: `src/components/EditableBottomCTA.tsx`

Full-bredde mørk gradient med trust-stripe-stjerner øverst, ren h2 (ingen ikon), 2 hoved-CTA + sekundær link til fast avtale. Brukes på alle marketing-sider som har egnet plassering for konvertering.

### 6. Animasjon

Kun **én-gangs reveal** via IntersectionObserver — aldri kontinuerlig scroll-basert.

**Tilgjengelige hooks** (`src/hooks/useScrollAnimation.tsx`):
- `useFadeInUp` — enkel fade + glide opp for ett element
- `useStaggeredGridReveal` — sekvensiell reveal for grid med flere children
- `useSequentialReveal` — fade-in sekvensielt (ikke wrappet rundt komponenter med interne reveal-hooks!)

**Forbudt:**
- `useScroll` + `useTransform` for parallax basert på scroll-posisjon
- Kontinuerlige scroll-bevegelser på bakgrunner
- Animasjon som spiller om-og-om hver gang seksjonen kommer i view

### 7. Footer

Komponent: `src/components/Footer.tsx`

- Tynn gradient-stripe (2px) på toppen
- Små gradient-accent-linjer under kolonne-overskrifter
- Sosial-knapper med gradient-hover

## Sjekkliste — visuell konsistens

Kjør gjennom denne på alle marketing-sider før du committer:

- [ ] Hver seksjon på siden bruker `SectionHeading` (ikke rene `<h2>`-er)
- [ ] Hovedsider har `TrustStripe` rett under hero
- [ ] Info-kort bruker `glass-card`, ikke shadcn `<Card>` (med unntak for bilde-fokuserte og skjemaer)
- [ ] Bunn-CTA er `EditableBottomCTA` (ikke en custom CTA)
- [ ] Animasjoner er én-gangs (`useFadeInUp` eller `useStaggeredGridReveal`)
- [ ] Ingen kontinuerlig scroll-bevegelse på bakgrunner
- [ ] Footer har gradient-stripe på toppen
- [ ] Bytte mellom lys/dark/blue tema beholder visuell hierarki

## Automatiserte sjekker

```bash
npm run build       # må passere
npx tsc --noEmit    # ingen typefeil
npm run lint        # ingen nye errors
```

## Filer som definerer kanon

| Komponent | Fil |
|---|---|
| SectionHeading | `src/components/ui/SectionHeading.tsx` |
| GradientHeaderCard | `src/components/ui/GradientHeaderCard.tsx` |
| TrustStripe | `src/components/TrustStripe.tsx` |
| GuaranteeSection | `src/components/GuaranteeSection.tsx` |
| EditableBottomCTA | `src/components/EditableBottomCTA.tsx` |
| QuickCallbackForm | `src/components/QuickCallbackForm.tsx` |
| Footer | `src/components/Footer.tsx` |
| useFadeInUp / useStaggeredGridReveal | `src/hooks/useScrollAnimation.tsx` |
| getServiceGradient | `src/lib/serviceIcons.tsx` |

## Når du legger til nye seksjoner

1. Bruk `SectionHeading` for tittelen — velg ikon + gradient som passer innholdet og ikke kolliderer med naboseksjoner
2. Pakk innhold i `glass-card` hvis det er info, eller shadcn `<Card>` hvis det er bilde-/skjema-fokusert
3. Hvis seksjonen har en liste av elementer, vurder å bruke `useStaggeredGridReveal` for fade-in
4. Test bytte mellom temaer
5. Kjør automatiserte sjekker
