# Verification Skill

> **Formål:** Sikre at kodeendringer fungerer før du sier "ferdig"
> **Prioritet:** Kan overstyres av bruker (se precedence)

---

## Når skal denne skillen brukes?

### ✅ KJØR verification når:

- Du har endret `.ts`, `.tsx`, `.js`, eller `.jsx` filer
- Du har lagt til nye dependencies i `package.json`
- Du har endret config-filer (`vite.config`, `tsconfig`, `.env`)
- Bruker eksplisitt ber om "sjekk", "verifiser", eller "test"

### ❌ IKKE kjør verification når:

- Bare `.md`, `.css`, eller dokumentasjon er endret
- Bare kommentarer er lagt til i kode
- Bruker sier "hopp over verify" eller "ikke sjekk"

---

## Working Directory

```
┌─────────────────────────────────────────────────────────────────┐
│  REGEL: Kjør ALLTID kommandoer fra PROJECT ROOT                 │
│                                                                 │
│  Project root = mappen som inneholder CLAUDE.md                 │
└─────────────────────────────────────────────────────────────────┘
```

### Før første kommando, BEKREFT:

1. Finn `package.json` - finnes den i project root?
2. Har `package.json` et `build` script?
3. Hvis FLERE `package.json` finnes → STOPP og spør bruker

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ FLERE PACKAGE.JSON FUNNET                                   │
│                                                                 │
│  Jeg fant:                                                      │
│  • /package.json                                                │
│  • /apps/web/package.json                                       │
│                                                                 │
│  Hvilken skal jeg bruke for verification?                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Verification Steps

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  STEG 1: BUILD                                                  │
│  ════════════════════════════════════════════════════════════   │
│  Kommando: npm run build                                        │
│                                                                 │
│  Resultat:                                                      │
│  ├── ✅ Suksess → Gå til steg 2                                 │
│  └── ❌ Feil → Fiks og prøv igjen (maks 3 forsøk)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  STEG 2: LINT (hvis tilgjengelig)                               │
│  ════════════════════════════════════════════════════════════   │
│  Kommando: npm run lint                                         │
│                                                                 │
│  Resultat:                                                      │
│  ├── ✅ Suksess → Gå til steg 3                                 │
│  ├── 🟡 Warnings → Rapporter, men fortsett                      │
│  └── ❌ Errors → Fiks og prøv igjen (maks 2 forsøk)             │
│                                                                 │
│  Hvis lint script ikke finnes: Hopp til steg 3                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  STEG 3: TYPECHECK (hvis TypeScript)                            │
│  ════════════════════════════════════════════════════════════   │
│  Kommando: npx tsc --noEmit                                     │
│                                                                 │
│  Resultat:                                                      │
│  ├── ✅ Suksess → VERIFICATION COMPLETE                         │
│  └── ❌ Feil → Fiks og prøv igjen (maks 3 forsøk)               │
│                                                                 │
│  Hvis tsconfig.json ikke finnes: Hopp over                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Retry Limits

| Steg | Maks forsøk | Etter maks |
|------|-------------|------------|
| Build | 3 | STOPP og rapporter |
| Lint | 2 | STOPP og rapporter |
| TypeCheck | 3 | STOPP og rapporter |

---

## Failure Protocol

Når maks forsøk er nådd UTEN suksess:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 VERIFICATION FEILET                                         │
│                                                                 │
│  Steg som feilet: [build/lint/typecheck]                        │
│  Forsøk gjort: X/Y                                              │
│                                                                 │
│  Siste feilmelding:                                             │
│  ```                                                            │
│  [kopier faktisk error output her]                              │
│  ```                                                            │
│                                                                 │
│  Hva jeg prøvde:                                                │
│  1. [beskriv første forsøk]                                     │
│  2. [beskriv andre forsøk]                                      │
│  3. [beskriv tredje forsøk]                                     │
│                                                                 │
│  Anbefaling: [konkret forslag til hva bruker kan gjøre]         │
│                                                                 │
│  ⏸️ Venter på din respons før jeg fortsetter.                   │
└─────────────────────────────────────────────────────────────────┘
```

### BINDING REGLER ved failure:

1. **STOPP** - Ikke gjør flere kodeendringer
2. **RAPPORTER** - Bruk formatet over
3. **VENT** - Ikke fortsett før bruker responderer

---

## Success Summary

Når ALL verification er komplett:

```
┌─────────────────────────────────────────────────────────────────┐
│  ✅ VERIFISERT                                                  │
│                                                                 │
│  • Build: OK                                                    │
│  • Lint: OK (X warnings - ikke kritiske)                        │
│  • TypeScript: OK                                               │
│                                                                 │
│  Endringer klare for commit.                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Språkregler

### Forbudt språk (ALDRI bruk):

- ❌ "Jeg antar at build fungerer..."
- ❌ "Dette burde kompilere..."
- ❌ "Sannsynligvis OK..."

### Påkrevd språk (ALLTID bruk):

- ✅ "Bekreftet: `npm run build` returnerte exit code 0"
- ✅ "Verifisert: Ingen TypeScript errors"
- ✅ "Feil funnet: [konkret feilmelding]"

---

## Overstyring

Bruker kan alltid si:

- "Hopp over verification" → Ikke kjør denne skillen
- "Ignorer build feil" → Fortsett selv om build feiler
- "Bare bygg, ikke lint" → Kjør kun steg 1

**Bruker har ALLTID høyeste prioritet.**
