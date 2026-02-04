
# Plan: Fiks manglende hero-bilde for forsiden

## Problemet
Build feiler fordi `src/assets/hero-building-maintenance.jpg` ikke finnes, men importeres i `HeroSection.tsx`.

## Status på hero-bilder

| Fil | Status | Brukes av |
|-----|--------|-----------|
| `hero-building-maintenance.jpg` | **MANGLER** | HeroSection.tsx (forsiden) |
| `hero-caretaker.jpg` | ✅ Finnes | About.tsx |
| `hero-services-background.png` | ✅ Finnes | Services.tsx, alle service-sider |

## Løsning
Kopiere bildet du lastet opp til `src/assets/hero-building-maintenance.jpg`.

## Teknisk endring

### Fil som kopieres:
```
user-uploads://Hjem_Heropage.jpg → src/assets/hero-building-maintenance.jpg
```

### Ingen kodeendringer nødvendig
Koden i `HeroSection.tsx` importerer allerede denne filen korrekt:
```typescript
import heroDefaultImage from "@/assets/hero-building-maintenance.jpg";
```

## Resultat
- Build vil fungere igjen
- Forsiden får tilbake det originale hero-bildet (byggarbeider på treramme)
- Alle andre hero-bilder forblir uendret
