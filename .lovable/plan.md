

# Plan: Dark mode redesign — fra "mørk app" til moderne nettside

## Problemanalyse

Etter research av 2026 dark mode best practices (Mrkt360, InkBot Design, NateBal) og gjennomgang av koden:

**Kjerneproblemet**: Dark mode bruker `11% lightness` bakgrunn — dette er for mørkt og skaper en "bunker"-følelse. Moderne nettsider i 2026 bruker **15-18% lightness** for bakgrunn, med **tydelig lagdeling** mellom bakgrunn → kort → elevated. Kortene (`15%`) er nesten usynlige mot bakgrunnen (`11%`).

**App-symptomer som gjenstår**:
1. For lite kontrast mellom bakgrunn og kort (11% vs 15% = bare 4% forskjell)
2. Hero-seksjonen bruker `from-secondary/95 to-secondary/90` overlay — alt blir en mørk vegg
3. `dark:ring-1 dark:ring-white/5` på kort er nesten usynlig
4. Alle seksjoner har samme bakgrunn — ingen visuell rytme
5. Footer `bg-secondary` (20%) er for lik bakgrunnen

## 2026 Dark Mode Best Practices (fra research)

- **Bakgrunn**: `#1a1a2e` eller lignende — ca 16-18% lightness, med svak fargeshimmer
- **Kort/surfaces**: 3-5% lysere enn bakgrunn, med synlige borders
- **Tekst**: Ikke ren hvit (#fff) men off-white (#e2e8f0) for å unngå halation
- **Seksjonsseparasjon**: Alternerende lightness (16% → 19% → 16%) i stedet for borders
- **Merkefarger**: Beholdes men gjøres litt lysere/mer mettet for synlighet

## Ny fargepalett (dark mode)

| Variabel | Nå | Ny | Hva endres |
|----------|-----|-----|------------|
| `--background` | `220 15% 11%` | `220 14% 16%` | Lysere, mer "nettside" |
| `--card` | `220 13% 15%` | `220 12% 20%` | Tydelig kontrast mot bg |
| `--card-elevated` | `220 13% 19%` | `220 12% 24%` | Klar lagdeling |
| `--muted` | `220 10% 14%` | `220 12% 13%` | Mørkere enn bg for seksjoner |
| `--secondary` | `220 15% 20%` | `220 14% 12%` | Footer/header mørkere enn bg |
| `--border` | `220 10% 24%` | `220 10% 28%` | Mer synlige borders |
| `--foreground` | `210 20% 95%` | `210 15% 90%` | Off-white, mindre halation |
| `--muted-foreground` | `215 15% 72%` | `215 12% 65%` | Mer subtil |
| `--hero-bg` | `220 15% 8%` | `220 14% 10%` | Litt lysere hero |

## Endringer

### Steg 1: Oppdater dark mode fargepalett (`src/index.css`)
Hele `.dark`-blokken oppdateres med den nye paletten. Nøkkelen: **mer plass mellom lagene** (bg → card → elevated), og en litt varmere/lysere base.

### Steg 2: Seksjonsseparasjon med alternerende bakgrunner (`src/pages/Index.tsx`)
Legge til tydelige vekslende bakgrunner i dark mode:
- Hero: mørkest
- ClientLogos: `bg-background`
- Process: `bg-muted/50` (litt mørkere)
- Projects: `bg-background`  
- Testimonials: `bg-muted/50`
- Services: `bg-background`

### Steg 3: Hero overlay — mer gjennomsiktig (`src/components/HeroSection.tsx`)
Redusere overlay-opasiteten fra `from-secondary/95 to-secondary/90` til `from-secondary/85 to-secondary/80` slik at bakgrunnsbildet skinner mer gjennom i dark mode.

### Steg 4: Gjør kort-borders synligere (`src/index.css`)
Endre `dark:ring-white/5` til `dark:ring-white/10` på `.card-professional` og `.card-enhanced` for at kortene faktisk synes mot bakgrunnen.

### Steg 5: Footer — tydelig mørkere seksjon
Footer bruker `bg-secondary` som nå blir mørkere enn body. Dette skaper naturlig visuell separasjon uten å legge til ekstra elementer.

### Filer som endres
| Fil | Endring |
|-----|---------|
| `src/index.css` | Dark mode fargepalett + kort-ring synlighet |
| `src/pages/Index.tsx` | Seksjonsbakgrunner for visuell rytme |
| `src/components/HeroSection.tsx` | Lettere overlay |

