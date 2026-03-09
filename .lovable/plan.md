

# Plan: Tre tema-valg — Hvit, Blå og Svart

## Oversikt
Legge til et tredje "blå" tema som gjenspeiler den originale mørkeblå fargepaletten (marine blue). Brukeren kan velge mellom tre temaer via en oppdatert theme-toggle.

## Hvordan det fungerer

`next-themes` støtter egendefinerte tema-verdier. Vi legger til `"blue"` som et tredje alternativ ved siden av `"light"` og `"dark"`.

**Fargelagdeling:**
- **Hvit (light)** = nåværende `:root` — uendret
- **Blå (blue)** = den originale mørkeblå paletten med marine blue bakgrunn (~`213 51% 24%`), deep blue kort, turkis CTA
- **Svart (dark)** = nåværende `.dark` — uendret (den nye 2026-paletten)

## Endringer

### 1. `src/index.css` — Legg til `.blue` tema-klasse
Ny CSS-blokk `.blue { ... }` med den originale blå paletten:
- Background: `213 51% 18%` (dyp marine)
- Card: `213 45% 22%`
- Card-elevated: `213 40% 26%`
- Secondary: `210 29% 14%` (mørkere for footer)
- Primary: turkis som i dag
- Foreground: off-white

### 2. `src/App.tsx` — Oppdater ThemeProvider
Endre `themes` prop til å inkludere `['light', 'dark', 'blue']`.

### 3. `src/components/ThemeToggle.tsx` — Tre-valgs toggle
Erstatte Switch/Button med en 3-knapp gruppe (Sun/Waves/Moon ikoner) som setter `light`, `blue`, eller `dark`. Brukes både i header og profilside.

### Filer som endres
| Fil | Endring |
|-----|---------|
| `src/index.css` | Ny `.blue` fargepalett |
| `src/App.tsx` | Legg til `themes={['light', 'dark', 'blue']}` |
| `src/components/ThemeToggle.tsx` | Tre-knapp toggle med ikoner |

