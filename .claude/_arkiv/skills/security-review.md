# Security Review Skill

> **Formål:** Oppdage reelle sikkerhetsrisikoer uten false positives
> **Prioritet:** Kan overstyres av bruker (se precedence)
> **Referanse:** Full dokumentasjon i `.claude/docs/security.md`

---

## Når skal denne skillen brukes?

### ✅ KJØR security review når:

- Du oppretter eller endrer Edge Functions
- Du jobber med RLS policies eller database-tilgang
- Du legger til autentisering eller autorisasjonslogikk
- Du jobber med skjemaer som tar brukerinput
- Du håndterer filer, storage, eller uploads
- Bruker eksplisitt ber om "sikkerhetssjekk" eller "security review"

### ❌ IKKE kjør security review når:

- Bare styling/CSS endres
- Bare dokumentasjon oppdateres
- Bruker sier "hopp over security"

---

## Hvordan tenke

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Anta at ALL frontend-kode er offentlig.                        │
│  Sikkerhet = det som skjer SERVER-SIDE.                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tre spørsmål ved hver endring:

```
1. Kan en bruker uten tilgang utnytte dette?
   → Sjekk RLS, auth, og autorisasjon

2. Er det hemmeligheter som lekker?
   → Sjekk for hardkodede nøkler (IKKE variable-referanser)

3. Kan dette misbrukes i stor skala?
   → Sjekk rate limiting, spam-beskyttelse
```

---

## BINDING regler

### ✅ Alltid

- Sjekk `.claude/docs/security.md` for false positive-listen FØR du flagger
- Skille mellom variabel-referanser og faktiske verdier
- Bruk severity fra `.claude/rules/severity.md`

### ❌ Aldri

- Flagge `VITE_*` variabler som sikkerhetsrisiko
- Flagge rolle-enums (`'admin'`, `'user'`) som sårbarhet
- Flagge policy-navn som inneholder "admin"
- Spekulere uten bevis - kun flagg det du KAN bevise

---

## Beslutningslogikk (hurtigversjon)

```
Potensiell issue funnet?
│
├── Er det i false positive-listen i security.md?
│   → JA: Ignorer helt
│   → NEI: ↓
│
├── Er det en faktisk hemmelighet (lang streng, JWT, privat nøkkel)?
│   → JA: 🔴 CRITICAL
│   → NEI: ↓
│
├── Kan brukerdata lekke uten autorisasjon?
│   → JA: Flagg etter severity
│   → NEI: ↓
│
├── Kan det misbrukes i stor skala (spam, DoS)?
│   → JA: 🟠 HIGH
│   → NEI: Sannsynligvis ikke en sikkerhetsrisiko
```

For full beslutningslogikk, detaljerte eksempler, og audit-prosedyre:
→ Se `.claude/docs/security.md`

---

## Rapportformat

Når issues finnes:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔒 SECURITY REVIEW                                             │
│                                                                 │
│  Sjekket: [hva ble gjennomgått]                                 │
│                                                                 │
│  Funn:                                                          │
│  • [severity-emoji] [kort beskrivelse] ([fil:linje])            │
│                                                                 │
│  Anbefaling: [hva bør gjøres]                                   │
└─────────────────────────────────────────────────────────────────┘
```

Når alt er OK:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔒 SECURITY REVIEW                                             │
│                                                                 │
│  Sjekket: [hva ble gjennomgått]                                 │
│  Resultat: ✅ Ingen issues funnet                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Overstyring

Bruker kan alltid si:

- "Ignorer security" → Skill deaktivert for denne oppgaven
- "Full security audit" → Kjør komplett prosedyre fra security.md
- "Bare sjekk RLS" → Begrens scope til database-tilgang

**Bruker har ALLTID høyeste prioritet.**
