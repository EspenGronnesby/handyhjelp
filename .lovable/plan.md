# Bytt PWA-ikon til den ekte sorte logoen

## Hva som var galt
De AI-genererte ikonene jeg laget sist var ikke ekte logo — bare etterligninger. Skal erstattes med den ekte sorte HandyHjelp-logoen som allerede finnes i `public/lovable-uploads/b938c0bf-4496-4b1f-8e38-fc4d96f22ae2.png` (sort tekst + teal diamant på hvit bakgrunn).

## Endringer

### 1. Generer ikoner fra ekte logo (via Python/PIL, ikke imagegen)
- Slett de AI-genererte filene i `public/icons/`.
- Komponer nye ikoner ved å plassere den ekte logoen sentrert på hvit bakgrunn:
  - `public/icons/app-icon-512.png` — logo skalert til ~85% av 512×512 lerret, hvit bakgrunn.
  - `public/icons/app-icon-192.png` — samme, 192×192.
  - `public/icons/app-icon-maskable-512.png` — logo skalert til ~60% (safe zone for Android maskable cropping), hvit bakgrunn.

### 2. `public/site.webmanifest`
- `background_color` og `theme_color`: `#0a1628` → `#ffffff` (matcher den hvite logo-bakgrunnen så splash blir hvit, ikke navy).

### 3. `index.html`
- `<meta name="theme-color">`: `#0a1628` → `#ffffff`.
- `#app-loader` CSS: bakgrunn `#0a1628` → `#ffffff`, tekstfarge mørkere (`#475569`), spinner-farge bytter til logoens teal `#2BA8B5`.

## Filer som endres
- `public/icons/app-icon-192.png` (overskrives med ekte logo)
- `public/icons/app-icon-512.png` (overskrives)
- `public/icons/app-icon-maskable-512.png` (overskrives)
- `public/site.webmanifest`
- `index.html`

## Hva som IKKE endres
- `src/main.tsx` loader-fjerning beholdes som er.
- `short_name: "Handy"` beholdes (fikser fortsatt "HandyH..." trunkering).
- Den ekte logo-filen i `lovable-uploads/` røres ikke.
