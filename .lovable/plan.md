# Fiks PWA-utseende og loading-skjerm

## Problemer i skjermbildene

1. **Hjemskjerm-ikon** ("HandyH..."): logoen vises i en liten hvit sirkel med altfor mye luft, og navnet kuttes av — fordi `site.webmanifest` har én icon-entry markert `"purpose": "any maskable"`. Android bruker da samme bilde til både ikon og maskable, og maskable krever ~20% safe zone som logoen ikke har.
2. **Splash/loading-skjerm**: Android genererer splash automatisk fra `background_color` (lys cyan `#0ea5e9`) + ikonet. Resultatet er en grell blå flate med et hardt sort logo i midten. Det matcher ikke merkevaren (mørk navy/marine).
3. **Ingen in-app loading-skjerm** mens React/Vite-bundlen laster — brukeren ser blank skjerm før hero rendres.

## Endringer

### 1. Nye PWA-ikoner (genereres med imagegen, lagres i `public/icons/`)
- `app-icon-512.png` — full logo sentrert på mørk navy bakgrunn (`#0a1628`), brukes til `purpose: "any"`.
- `app-icon-maskable-512.png` — samme logo skalert til ~60% med riktig safe zone på navy bakgrunn, brukes til `purpose: "maskable"`.
- `app-icon-192.png` — 192px versjon av samme.

### 2. `public/site.webmanifest`
- `short_name`: `"HandyHjelp"` → `"Handy"` (unngår "HandyH..." trunkering).
- `background_color` og `theme_color`: `#0ea5e9` → `#0a1628` (mørk navy, matcher merkevaren og fjerner den grelle blå splash-flaten).
- Tre separate `icons`-entries: 192 any, 512 any, 512 maskable (med safe zone). Ingen blandet `"any maskable"`.

### 3. `index.html` — in-app loading screen
Legge til en `<div id="app-loader">` rett inne i `<body>` (før `<div id="root">`) med:
- Mørk navy bakgrunn (matcher splash → ingen "flash").
- Sentrert logo + diskret spinner + tekst "Laster…".
- CSS inline i `<head>` så det vises umiddelbart.
- I `src/main.tsx`: fjerne `#app-loader` med fade-out etter at React har mountet roten.

### 4. `<meta name="theme-color">` i `index.html`
Oppdater eksisterende theme-color tag fra `#0ea5e9` til `#0a1628` så statuslinjen i installert app matcher.

## Filer som endres
- `public/site.webmanifest` (oppdatert)
- `public/icons/app-icon-192.png` (ny)
- `public/icons/app-icon-512.png` (ny)
- `public/icons/app-icon-maskable-512.png` (ny)
- `index.html` (loader-markup + theme-color)
- `src/main.tsx` (fjerne loader når app er klar)

## Hva som IKKE endres
- Ingen service worker / offline-cache (du har ikke bedt om offline).
- Hero-seksjonen og resten av siden røres ikke — kun PWA-skall og første-frame loader.
- Logo-filen i `lovable-uploads/` beholdes uendret; nye ikoner er separate filer i `public/icons/`.

## Merk
Endringer i installert PWA vises først etter at brukeren avinstallerer og installerer på nytt (eller Android oppdaterer ikonet i bakgrunnen, kan ta tid). Splash og ikon i nettleser oppdateres ved neste lasting.
