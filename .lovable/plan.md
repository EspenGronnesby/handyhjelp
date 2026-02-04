
# Plan: Fiks manglende favicons og lydfil med HandyHjelp-branding

## Oversikt
Flere filer som brukes i koden er slettet og må erstattes. Jeg vil bruke logoen du refererte til (`public/lovable-uploads/1269f51d-725a-4c46-a6aa-cad9053d1c73.png`) som basis for all favicon-branding.

---

## Del 1: Favicons - Hva som mangler

### Referanser til slettede filer:
| Fil | Hvor den brukes | Størrelse |
|-----|-----------------|-----------|
| `/apple-touch-icon.png` | index.html, site.webmanifest | 180x180 |
| `/favicon-32x32.png` | index.html, site.webmanifest | 32x32 |
| `/favicon-16x16.png` | index.html, site.webmanifest | 16x16 |
| `/favicon-base.png` | site.webmanifest | 512x512 |
| `/favicon.ico` | useNotificationSound.tsx | multi-size |

### Løsning
Forenkle favicon-oppsettet ved å bruke kun den eksisterende logoen direkte. Dette eliminerer behovet for flere filer og sikrer konsistent branding.

---

## Del 2: Lydfil - Notification sound

### Problem
`/notification-sound.mp3` er slettet og brukes i `useNotificationSound.tsx` for å spille av lyd ved nye varsler.

### Løsning
Endre hooken til å håndtere manglende lydfil gracefully, eller fjerne lydavspilling helt. Alternativt kan vi bruke Web Audio API for en enkel systemlyd uten ekstern fil.

---

## Del 3: Filer som endres

| Fil | Endring |
|-----|---------|
| `index.html` | Forenkle til én favicon-referanse som peker til logoen |
| `public/site.webmanifest` | Oppdater alle ikon-referanser til logoen |
| `src/hooks/useNotificationSound.tsx` | Oppdater ikon-sti + håndter manglende lyd |

---

## Tekniske endringer

### index.html
```html
<!-- Erstatt alle favicon-referanser med: -->
<link rel="icon" type="image/png" href="/lovable-uploads/1269f51d-725a-4c46-a6aa-cad9053d1c73.png">
<link rel="apple-touch-icon" href="/lovable-uploads/1269f51d-725a-4c46-a6aa-cad9053d1c73.png">
```

### site.webmanifest
```json
"icons": [
  {
    "src": "/lovable-uploads/1269f51d-725a-4c46-a6aa-cad9053d1c73.png",
    "sizes": "any",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
```

### useNotificationSound.tsx
- Endre `/favicon.ico` til `/lovable-uploads/1269f51d-725a-4c46-a6aa-cad9053d1c73.png`
- Fjerne lydavspilling (siden filen ikke finnes) eller bruke en enkel Web Audio beep

---

## Fordeler med denne løsningen
- Konsistent branding med HandyHjelp-logoen overalt
- Ingen avhengighet av eksterne lydfiler
- Forenklet vedlikehold - én fil for alle favicons
- Fungerer umiddelbart uten behov for bildegenerering

---

## Alternativ: Generere optimaliserte favicons
Hvis du ønsker kan jeg også generere optimaliserte favicon-størrelser fra logoen din, men den enkleste løsningen er å bruke PNG-filen direkte - moderne nettlesere håndterer dette fint.
