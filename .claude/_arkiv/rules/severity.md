# Severity Levels

> Ikke alle problemer er like viktige. Denne filen definerer hvordan Claude skal reagere på ulike typer feil.

---

## Oversikt

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🔴 CRITICAL    Må fikses. Claude STOPPER.                      │
│                                                                 │
│  🟡 WARNING     Bør fikses. Claude FORTSETTER men rapporterer.  │
│                                                                 │
│  🔵 INFO        Valgfritt. Claude NEVNER hvis relevant.         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔴 CRITICAL

### Hva er CRITICAL:

- Build feiler (`npm run build` gir error)
- TypeScript errors (ikke warnings)
- Security issues flagget i `security.md`
- Runtime crashes / app starter ikke
- Manglende environment variables som koden krever

### BINDING regler (Claude SKAL):

1. **STOPPE** all annen aktivitet
2. **IKKE** gjøre flere kodeendringer
3. **RAPPORTERE** til bruker umiddelbart
4. **VENTE** på bruker respons

### Rapportformat:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 CRITICAL FEIL                                               │
│                                                                 │
│  Type: [build/typescript/security/runtime]                      │
│  Feilmelding:                                                   │
│  ```                                                            │
│  [faktisk error]                                                │
│  ```                                                            │
│                                                                 │
│  ⏸️ Venter på deg før jeg fortsetter.                           │
└─────────────────────────────────────────────────────────────────┘
```

### Kan bruker overstyre CRITICAL?

**JA.** Bruker kan si "ignorer og fortsett" → Claude fortsetter.

---

## 🟡 WARNING

### Hva er WARNING:

- Lint warnings
- Unused imports/variables
- Deprecated API bruk
- TypeScript `any` types
- Mer enn 5 små issues av samme type

### BINDING regler (Claude SKAL):

1. **RAPPORTERE** i summary
2. **FORTSETTE** uten å stoppe
3. **SPØRRE** bruker hvis mer enn 5 warnings

### Rapportformat:

```
┌─────────────────────────────────────────────────────────────────┐
│  🟡 WARNINGS (3 stk)                                            │
│                                                                 │
│  • Unused import: React (Login.tsx:1)                           │
│  • 'any' type brukt (utils.ts:42)                               │
│  • Deprecated: componentWillMount (Header.tsx:15)               │
│                                                                 │
│  Disse blokkerer ikke, men bør fikses senere.                   │
└─────────────────────────────────────────────────────────────────┘
```

### Når skal Claude spørre om WARNING?

```
┌─────────────────────────────────────────────────────────────────┐
│  🟡 MANGE WARNINGS (7 stk)                                      │
│                                                                 │
│  Vil du at jeg fikser disse nå, eller fortsetter vi?            │
│  [liste over warnings]                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔵 INFO

### Hva er INFO:

- Performance suggestions
- Style preferences
- "Kunne vært bedre" forslag
- Optional improvements
- Deprecation notices (fremtidige versjoner)

### BINDING regler (Claude SKAL):

1. **KAN** inkludere i summary (ikke påkrevd)
2. **SKAL IKKE** stoppe for INFO
3. **SKAL IKKE** spørre bruker om INFO

### Rapportformat (valgfritt):

```
┌─────────────────────────────────────────────────────────────────┐
│  🔵 INFO                                                        │
│                                                                 │
│  • Vurder å bruke useMemo for performance (Dashboard.tsx)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Beslutningstre

```
                        ┌─────────────────┐
                        │  Feil oppdaget  │
                        └────────┬────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │  Stopper build/typecheck?    │
                  └──────────────┬───────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
               ┌─────────┐              ┌─────────┐
               │   JA    │              │   NEI   │
               └────┬────┘              └────┬────┘
                    │                        │
                    ▼                        ▼
            ┌─────────────┐      ┌───────────────────────┐
            │ 🔴 CRITICAL │      │  Påvirker funksjon?   │
            │   STOPP     │      └───────────┬───────────┘
            └─────────────┘                  │
                                ┌────────────┴────────────┐
                                │                         │
                                ▼                         ▼
                           ┌─────────┐              ┌─────────┐
                           │   JA    │              │   NEI   │
                           └────┬────┘              └────┬────┘
                                │                        │
                                ▼                        ▼
                        ┌─────────────┐          ┌─────────────┐
                        │ 🟡 WARNING  │          │ 🔵 INFO     │
                        │ Rapporter   │          │ Valgfritt   │
                        └─────────────┘          └─────────────┘
```

---

## Eksempler

| Situasjon | Severity | Handling |
|-----------|----------|----------|
| `Cannot find module 'react'` | 🔴 CRITICAL | STOPP |
| `Type 'string' is not assignable to 'number'` | 🔴 CRITICAL | STOPP |
| `'foo' is defined but never used` | 🟡 WARNING | Rapporter |
| `Unexpected any` | 🟡 WARNING | Rapporter |
| `Consider using const instead of let` | 🔵 INFO | Ignorer/nevn |
| `React.FC is discouraged` | 🔵 INFO | Ignorer/nevn |

---

## Bruker overstyring

Bruker har ALLTID høyeste prioritet:

| Bruker sier | Claude gjør |
|-------------|-------------|
| "Ignorer alle warnings" | Rapporterer ikke 🟡 |
| "Ignorer og fortsett" | Fortsetter selv ved 🔴 |
| "Fiks alle warnings" | Fikser 🟡 før fortsettelse |
| "Bare build, ikke lint" | Hopper over lint-steg |
