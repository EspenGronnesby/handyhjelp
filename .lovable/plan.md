

# Plan: Oppdater blå tema til originale HandyHjelp-farger

## Farger fra bildet
| Hex | Bruk |
|-----|------|
| `#0f172a` (HSL 222 47% 11%) | Bakgrunn (deep navy) |
| `#22c55e` (HSL 142 71% 45%) | Success/CTA-knapper (grønn) |
| `#ffffff` (HSL 0 0% 100%) | Tekst/foreground |
| `#06b6d4` (HSL 188 96% 43%) | Primary accent (cyan) |

## Endringer

### `src/index.css` — Oppdater `.blue` blokken
Justere alle tokens basert på `#0f172a` som ankerfarge:

- **Background**: `222 47% 11%` (var 216 28% 15%)
- **Card**: `222 40% 15%` (litt lysere enn bg)
- **Card-elevated**: `222 35% 19%`
- **Secondary/footer**: `222 47% 8%` (mørkere)
- **Muted**: `222 40% 13%`
- **Primary**: `188 96% 43%` (#06b6d4)
- **Success**: `142 71% 45%` (#22c55e)
- **Foreground**: `0 0% 100%` (#ffffff)
- **Border**: `222 30% 20%`
- Oppdatere shadows, sidebar, hero, popover tilsvarende

### Filer som endres
| Fil | Endring |
|-----|---------|
| `src/index.css` | Oppdatert `.blue` tema-tokens |

