

# Plan: Lysere, skarpere nettside-design med mer whitespace

## Problemet
Dark mode bruker ekstremt mørke, mettede blåtoner (`background: 222 47% 8%`, `card: 222 47% 14%`) som gjør alt tungt og "mørkeblått". Seksjonene har lite visuell separasjon — alt smelter sammen. Light mode er OK men kan også forbedres med mer whitespace.

## Referanse-stil
Profesjonelle håndverker-nettsider (Mitsubishi Electric, Caverion, ISS) bruker:
- Nøytrale grå-toner i dark mode (ikke mettede blåfarger)
- Tydelig seksjonsseparasjon med alternerende bakgrunner
- Mer generøs padding mellom seksjoner
- Hint av merkefarge (blå) som aksent, ikke som bakgrunnstone

## Endringer

### Steg 1: Justere dark mode fargepalett (`src/index.css`)
Gjøre dark mode mindre "blåsvart" og mer nøytral-mørk med hint av blå:

| Variabel | Nå | Ny |
|----------|-----|-----|
| `--background` | `222 47% 8%` | `220 15% 11%` (nøytral mørk) |
| `--card` | `222 47% 14%` | `220 13% 15%` (lettere, mindre blå) |
| `--card-elevated` | `222 47% 18%` | `220 13% 19%` |
| `--muted` | `222 47% 16%` | `220 10% 14%` |
| `--secondary` | `222 47% 20%` | `220 15% 20%` |
| `--border` | `222 47% 28%` | `220 10% 24%` |

Saturasjonen reduseres fra ~47% til ~10-15%, noe som gir en mer nøytral, profesjonell "slate"-tone med bare et hint av blå.

### Steg 2: Øke seksjonsseparasjon i `Index.tsx`
- Legge til alternerende bakgrunner: `bg-background` → `bg-muted/30` → `bg-background` osv.
- Øke padding fra `py-12 md:py-16` til `py-16 md:py-24` på hovedseksjoner for mer pusterom

### Steg 3: Forbedre seksjonsbakgrunner i komponentene
- `ProcessSection`: Legg til `bg-muted/30` bakgrunn for visuell separasjon
- `TestimonialsSection`: Behold gradient men gjøre den subtilere
- `EditableBottomCTA`: Beholde som den er (CTA-seksjon med farge er OK)
- Services-seksjonen: Legg til `bg-muted/20` for kontrast

### Steg 4: Fjerne `hover:bg-warning` fra BottomCTA-knappen
Linje 54 i `EditableBottomCTA.tsx` — "Ring oss"-knappen har `hover:bg-warning hover:text-warning-foreground` som skaper dårlig kontrast. Erstatt med subtilere hover.

### Filer som endres
| Fil | Endring |
|-----|---------|
| `src/index.css` | Dark mode fargepalett (redusere saturasjon) |
| `src/pages/Index.tsx` | Øke seksjonpadding, alternerende bakgrunner |
| `src/components/ProcessSection.tsx` | Bakgrunnsfarge + padding |
| `src/components/TestimonialsSection.tsx` | Justere gradient |
| `src/components/EditableBottomCTA.tsx` | Fiks warning-hover på knapp |

### Hva som IKKE endres
- Ingen funksjonalitet
- Light mode beholdes (bare minor whitespace-økning)
- Fargepalett for primary/accent/success beholdes
- Mobil-layout beholdes

