# Mobile-First Frontend — Lessons & Patterns

Lærdom fra mobil-optimaliseringen av HandyHjelp. Generelle prinsipper og
konkrete kodebiter du kan ta med til neste React/Tailwind-prosjekt.

---

## Designprinsipper

### Mobil skal være tett, ikke "én seksjon per skjerm"

Native apper (App Store, Spotify, Pinterest, Airbnb) føles produktive
fordi de mikser tre layout-primitiver per skjerm:

1. **2-kol grid** for ikon/bilde-kort
2. **Horisontale swim lanes** for samlinger av 4+ like elementer
3. **Tette vertikale stacks** for tekst-tunge blokker

Vanlig "mobile-first" web prøver bare det tredje — én bred kolonne med
mye luft. Det føles sløsete fordi mobil-skjermer har lite real estate.

### Når 2-kolonner på mobil vinner

`grid grid-cols-2 gap-3` (uten breakpoint-prefix) når kortene er:
- Skannbare, parallelle, og image-/ikon-ledet
- ~160–180px brede ved 320–428px viewport (sweet spot)
- Kvadratiske eller 4:5 portrait

Eksempler: service-kort, kategori-tiles, prosjekt-thumbnails,
team-medlemmer, blog-previews, feature-tiles.

### Når `grid-cols-1` faktisk vinner

- Tekst-tunge kort (testimonials, lange beskrivelser, pricing med
  feature-lister)
- Skjemaer, FAQ-accordions, sammenligningsrader
- Alt der leserekkefølge > skanning

### Swim lanes — App Store-mønster

Bytt fra vertikal stack til horisontal scroll når:
- 4+ like elementer (prosjekter, prosess-steg, reviews, kategorier)
- Du ellers ville vist 4 kort under hverandre i 1-kol
- Hovedinteraksjon er "vis meg det neste"

**Hjørnesteinsdetaljer:**
- Kortbredde `w-[78%]` så neste kort *peeker* fra høyre kant
- `snap-x snap-mandatory` for snap-scroll
- `-mx-4 px-4` for å nå viewport-kantene uten å bryte container
- Skjul scrollbar med `scrollbar-hide`-utility
- Legg til "Se alle →"-fallback som tradisjonell lenke

## Konkrete tall

| Element | Mobil | Desktop |
|---|---|---|
| Seksjons-padding | `py-10 md:py-12` | `py-20 md:py-24` |
| Hero-høyde | `min-h-[75svh]` | `md:min-h-screen` |
| Card-grid gap | `gap-3` | `md:gap-6` |
| Card-internal padding | `p-3 md:p-4` | `md:p-6` |
| Section spacing inside | `space-y-6 md:space-y-8` | `space-y-12` |
| Touch targets | `min-h-11` (44px) | uendret |

Bruk `svh` (small viewport height), ikke `vh` eller `100vh` — `svh`
hopper ikke når mobil-nettleser viser/skjuler addressbaren. `75svh`
lar neste seksjon peeke seg fram og signaliserer "scroll for mer".

## Tailwind-utilities som er verdt å lage én gang

### `.scrollbar-hide`

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

### `.swim-lane`

```css
.swim-lane {
  @apply flex gap-3 overflow-x-auto snap-x snap-mandatory
         -mx-4 px-4 pb-4 scrollbar-hide;
}
.swim-lane > * {
  @apply snap-start shrink-0 w-[78%];
}
```

Bruk: `<div className="swim-lane md:grid md:grid-cols-3 md:gap-8
md:overflow-visible md:px-0 md:pb-0 md:[&>*]:w-auto">` — base klassen
gir mobil swim lane, `md:`-overrides gjenoppretter desktop grid.

### `.marquee`

For kontinuerlig scroll (trust-stripes, partner-logoer, ticker):

```css
.marquee {
  @apply overflow-hidden relative;
}
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-scroll var(--marquee-duration, 30s) linear infinite;
}
.marquee:hover .marquee-track { animation-play-state: paused; }
@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; transform: translateX(0); }
}
```

**Krav for bruk:**
- Dupliser children 2× for sømløs loop
- Sett `--marquee-duration` per instans for fart-kontroll
- Legg `aria-hidden="true"` på den animerte track-en + en separat
  `<ul className="sr-only">` med items én gang for skjermlesere

## Komponentmønstre

### iOS-stil theme-switch

Mer affordance enn et lite ikon-knapp som muteres mellom temaer:

```tsx
<button
  role="switch"
  aria-checked={isAlt}
  onClick={() => setTheme(isAlt ? 'light' : 'alt')}
  className="relative inline-flex h-9 w-16 items-center rounded-full
             bg-muted border border-border/60 hover:bg-muted/80 active:scale-95"
>
  <InactiveIcon className={cn('absolute h-4 w-4 text-muted-foreground/60',
                              isAlt ? 'left-2.5' : 'right-2.5')} />
  <span className={cn('absolute top-1 flex h-6 w-6 items-center
                       justify-center rounded-full bg-background shadow-md
                       transition-transform',
                      isAlt ? 'translate-x-9' : 'translate-x-1')}>
    <ActiveIcon className="h-3.5 w-3.5" />
  </span>
</button>
```

Aktivt ikon sitter *inni* thumb; inaktivt ikon på motsatt side
fungerer som hint om hva toggle-klikk fører til.

### Modal-via-CTA-knapp

Når du har en form (callback, kontakt, search) som synlig på desktop
men ikke har plass på mobil:

```tsx
// 1. Form-komponenten er uendret
<QuickCallbackForm />

// 2. Lag en thin dialog-wrapper
export const QuickCallbackDialog = ({ children }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="max-w-md p-0 bg-transparent border-0 shadow-none">
      <DialogTitle className="sr-only">La oss ringe deg</DialogTitle>
      <QuickCallbackForm />
    </DialogContent>
  </Dialog>
);

// 3. På desktop: vis form synlig + behold knapp som åpner samme modal
<div className="grid lg:grid-cols-2">
  <div>
    <h1>Hero heading</h1>
    <QuickCallbackDialog>
      <Button>Vi ringer deg →</Button>
    </QuickCallbackDialog>
  </div>
  <div className="hidden lg:block">
    <QuickCallbackForm />
  </div>
</div>
```

Knapp-tekst med konkret action ("Vi ringer deg →") konverterer bedre
enn generisk "Få tilbud" — sier hva som skjer.

## Anti-patterns å unngå

| Mønster | Hvorfor det er dårlig | Fix |
|---|---|---|
| `min-h-screen` / `100vh` på hero | Mobil-browser addressbar hopper, hero ser klippet ut | `min-h-[75svh]` |
| `grid-cols-1` overalt på mobil | Føles sløsete, brukeren scroller mer enn nødvendig | 2-kol for ikon-kort |
| `typeof window !== 'undefined' && window.innerWidth < 768` | SSR-uegnet, kjører ikke på server, kan flashe feil layout | Bruk responsive CSS-klasser (`md:hidden`/`hidden md:block`) |
| `transition-all duration-700` på mount-wrapper | Forsinker first paint, alle properties animerer | `transition-opacity` eller `transition-transform` spesifikt |
| Inline `style={{ scrollbarWidth: 'none' }}` + klasse som dekker det | Redundant, vanskelig å vedlikeholde | Definer én utility, bruk overalt |
| `dark:`-klasser på 100+ komponenter når du bytter til custom tema | Manuell refactor av alle filer | Sett `darkMode: ["selector", ".your-theme"]` i tailwind.config så `dark:` aktiveres for ditt tema |
| Lange inline Tailwind-strenger (10+ klasser) | Vanskelig å lese og repetere | Flytt til `@apply`-utility i index.css |

## Prosess-lessons

### Spør om scope FØR du implementerer

Bruk `AskUserQuestion` med flere konkrete alternativer (ikke åpne
spørsmål). Inkluder ASCII-previews av layout-valg:

```
MOBIL — TETT       MOBIL — STACK
┌────┬────┐         ┌────────┐
│ A  │ B  │         │   A    │
├────┼────┤         ├────────┤
│ C  │ D  │         │   B    │
└────┴────┘         └────────┘
```

Brukeren kan velge visuelt. Spar deg for å bygge feil ting.

### Verifiser med screenshots, ikke bare build

Build + typecheck sier "koden kompilerer" — ikke "UI ser bra ut".
Bruk headless Chrome for å bekrefte visuelt:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=393,2400 --virtual-time-budget=10000 \
  --screenshot=mobile.png http://localhost:8080/
```

Verifiser på minst 3 bredder: 393px (iPhone), 820px (iPad), 1280px (desktop).

### Minst invasiv endring først

Når en endring kunne gjøres på 3 nivåer (kosmetisk, strukturelt,
arkitektonisk), start kosmetisk og opp. F.eks. for å fikse en hardkodet
DB-verdi som overstyrer din default:

1. Kosmetisk: Bare hardkod default i React (lavest risiko)
2. Strukturelt: Endre DB-rad via SQL
3. Arkitektonisk: Endre `useEditableContent`-hook til å ha en allowlist

Velg #1 hvis du ikke trenger admin-redigering av det feltet senere.

### Erkjenne pre-existing tech debt vs ny tech debt

Når du støter på copy-paste-mønstre (4 service-undersider med
identisk hero-markup): bekreft at det var sånn FØR du rørte koden,
nevn det i PR-en, men ikke krever opprydding hvis det er ut av
scope. Klargjør hva som er DITT ansvar.

### Kjør "simplify"-pass etter implementering

Etter funksjonen virker, lanser parallel review-agenter for:
- Kode-gjenbruk (er det utilities jeg burde brukt?)
- Kvalitet (dead code, lange inline-strenger, redundans?)
- Effektivitet (N+1 queries, transition-thrashing, unødvendig render?)

Konkrete eksempler fra denne runden:
- Definerte `.scrollbar-hide` i index.css, men hadde fortsatt inline
  `style={{scrollbarWidth: 'none'}}` på samme element → fjern duplikat
- Definerte `.swim-lane` men brukte ikke i komponenter → enten bruk
  den eller fjern den (ikke ha dead code)

## A11y-sjekkliste for mobil

- [ ] Touch targets ≥ 44×44px (`min-h-11`)
- [ ] 8px minimum gap mellom interaktive elementer
- [ ] Marquee-content er aria-hidden, og separat `<ul className="sr-only">`
      gir innholdet til skjermlesere
- [ ] Theme-switch har `role="switch"` + `aria-checked`
- [ ] Dialog/modal har `DialogTitle` (med `sr-only` hvis bare visuell)
- [ ] `prefers-reduced-motion: reduce` respekteres for animasjoner
- [ ] Focus-trap fungerer i modaler (shadcn/ui Dialog gjør dette
      automatisk via Radix)
- [ ] `whitespace-nowrap` på marquee-items unngår uventet linjebryting

## Beslutningsflyt

Når du vurderer en layout-endring på mobil:

```
       Tekst-tungt innhold?
        /              \
      ja                nei
      ↓                 ↓
   1-kol stack       Antall items?
   (full bredde)        /    |    \
                      1-3    4-6    7+
                       ↓      ↓      ↓
                     1-kol  2-kol  Swim lane
                     stack  grid   (peek next)
```

Sjekk alltid: er kortet ≥ 160px bredt på 320px-viewport? Hvis ikke,
gå opp til 1-kol.

## Filer som er verdt å arve

Fra denne repo, ta med disse til neste prosjekt:

- `src/index.css` (utilities-blokken) — `.scrollbar-hide`, `.swim-lane`,
  `.marquee`, `.marquee-fade`, `.touch-target`
- `src/components/QuickCallbackDialog.tsx` — pattern for modal-via-CTA
- `src/components/ThemeToggle.tsx` — iOS-switch implementering
- `tailwind.config.ts` — `darkMode: ["selector", ".your-theme"]`-mønsteret
