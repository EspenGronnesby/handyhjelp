## Mål

Fikse de to gjenværende tekniske SEO-funnene som faktisk kan rettes i koden:

1. **Ytelse (LCP — hero-bilde lastes for sent)**
2. **Tilgjengelighet (lav tekstkontrast)**

De to mid-funnene i listen er allerede håndtert eller krever deg:
- *Sitemap*: allerede markert som fikset (private ruter er korrekt utelatt og blokkert i `robots.txt`).
- *Google Search Console*: krever at **du** logger inn med Google — kan ikke fikses i kode. Jeg kan trigge tilkoblingsdialogen som et separat steg når du sier ifra.

---

## Hva som er galt

### 1. Hero-bildet (LCP)

`index.html` preloader hero-bildet fra `/src/assets/hero-building-maintenance-*.webp`. Den stien fungerer kun i dev — i produksjon hasher Vite filnavnene til `/assets/hero-building-maintenance-[hash].webp`, så preloadene **404-er på live-siden**. Bildet lastes derfor sent via CSS `background-image`, og Lighthouse måler dårlig LCP.

### 2. Lav kontrast

Glassmorf-boksen i hero bruker `text-white/80` for "24/7 Service"-etiketten på en delvis transparent bakgrunn. På lyse partier av hero-bildet faller kontrasten under 4.5:1.

---

## Endringer

### `index.html`
- Fjern de tre `<link rel="preload" ...>`-linjene som peker på `/src/assets/...` (de virker bare i dev og 404-er i prod).

### `src/components/HeroSection.tsx`
- Erstatt CSS `background-image`-divet med et faktisk `<img>`-element:
  - `src={heroImage}` (samme hook som i dag, faller tilbake til `heroDefaultImage` importert via Vite → hashet URL i prod)
  - `alt=""` (dekorativt, h1 forteller historien)
  - `fetchpriority="high"`, `decoding="async"`, eksplisitt `width`/`height` for å unngå CLS
  - `className="absolute inset-0 w-full h-full object-cover"` med `object-position: center 30%`
- Behold gradient-overlay-divet oppå.
- Bump `text-white/80` → `text-white/95` på "24/7 Service"-etiketten for å løfte kontrasten.

### Etter fiks
- Marker `lighthouse:lighthouse_performance` og `lighthouse:lighthouse_accessibility` som fikset i SEO-panelet.
- Påminn deg om at fiksene først slår inn på live-siden **etter publisering** — Lighthouse-funn måles på publisert versjon.

---

## Det jeg ikke gjør (uten din OK)

- **Semrush-forslag (borettslag-side)**: ny landingsside er en innholdsbeslutning, ikke en bug.
- **Google Search Console-tilkobling**: krever din Google-innlogging.
- **Større refaktor** av hero-komponenten eller bytte av bildeformat.

Si fra om jeg også skal trigge GSC-tilkoblingen eller bygge borettslag-siden etter dette.