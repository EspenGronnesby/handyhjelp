# Scope Guard Skill

> **Formål:** Forhindre feature creep og unødvendig kompleksitet
> **Prioritet:** Kan overstyres av bruker (se precedence)

---

## Når skal denne skillen brukes?

### ✅ ALLTID aktiv når:

- Du mottar en oppgave fra bruker
- Du planlegger endringer i kode
- Du vurderer å legge til noe "ekstra"

---

## Kjerneregel

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Løs NØYAKTIG det bruker ba om.                                │
│  Ikke mer. Ikke mindre.                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Hvordan tenke

Før du skriver kode, still deg selv disse spørsmålene:

```
1. Hva ba bruker om?
   → Definer oppgaven i én setning.
   → Klarer du IKKE det? → Oppgaven er uklar. SPØR.

2. Trenger jeg noe mer enn det for å løse oppgaven?
   → Hvis nei: Gjør kun det.
   → Hvis ja: Spør bruker først.

3. Tenker jeg "det hadde vært fint å også..."?
   → STOPP. Det er scope creep.
```

---

## Uklare oppgaver

Hvis bruker gir en vag eller bred forespørsel, **IKKE gjett**. Spør først.

### Tegn på at oppgaven er uklar:

- Bruker beskriver et problem uten å si hva løsningen skal være
- Oppgaven kan tolkes på flere måter
- Det mangler viktige detaljer (hvilken fil, hvilken side, hvilket design)
- Bruker bruker vage ord som "fiks det", "gjør det bedre", "oppdater den"
- Du må anta mer enn 1 ting for å begynne

### BINDING regler ved uklarhet:

1. **STOPP** - Ikke begynn å kode
2. **OPPSUMMER** - Si hva du tror bruker mener (kort)
3. **SPØR** - Still 1-2 konkrete spørsmål som avklarer
4. **VENT** - Ikke fortsett før bruker bekrefter

### Format:

```
┌─────────────────────────────────────────────────────────────────┐
│  ❓ AVKLARING TRENGS                                            │
│                                                                 │
│  Jeg forstår det som: [din tolkning i én setning]               │
│                                                                 │
│  Men jeg er usikker på:                                         │
│  • [konkret spørsmål 1]                                         │
│  • [konkret spørsmål 2] (valgfritt)                             │
│                                                                 │
│  Avklar så bygger jeg riktig med én gang.                       │
└─────────────────────────────────────────────────────────────────┘
```

### Eksempler:

| Bruker sier | Problem | Claude spør |
|---|---|---|
| "Fiks kontaktskjemaet" | Hva er feil? | "Hva er problemet - sender det ikke, ser det feil ut, eller noe annet?" |
| "Legg til en side" | Hvilken side? | "Hva slags side - en om-oss, en tjenesteside, eller noe annet?" |
| "Gjør det penere" | Subjektivt | "Hva liker du ikke - farger, layout, spacing, fonter?" |
| "Oppdater dashboardet" | Hva skal endres? | "Hva vil du endre - nye data, nytt design, ny funksjon?" |

---

## BINDING regler (Claude SKAL):

### ✅ Alltid

- Løse det som ble spurt om
- Bruke enkleste løsning som fungerer
- Spørre bruker hvis oppgaven er uklar
- Holde endringer til minimum antall filer

### ❌ Aldri

- Legge til funksjoner bruker ikke ba om
- Refaktorere eksisterende kode med mindre bruker ba om det
- Legge til nye dependencies uten å spørre
- Endre filstruktur uten å spørre
- Legge til "fremtidssikring" eller abstraksjonslag
- Fikse urelaterte issues du oppdager underveis

---

## Hva teller som scope creep?

| Bruker ba om | Scope creep | Riktig respons |
|---|---|---|
| "Fiks denne buggen" | Refaktorere hele filen | Fiks kun buggen |
| "Legg til en knapp" | Legge til animasjoner og hover-effekter | Legg til knappen |
| "Endre fargen til blå" | Oppdatere hele fargetemaet | Endre den ene fargen |
| "Lag en contact form" | Legge til validering, toast, analytics | Lag formen, spør om resten |

---

## Når du oppdager noe underveis

Hvis du ser noe som bør fikses, men som IKKE er del av oppgaven:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔵 OBSERVASJON (ikke del av oppgaven)                          │
│                                                                 │
│  Jeg la merke til: [kort beskrivelse]                           │
│  Vil du at jeg fikser det etterpå?                              │
│                                                                 │
│  Fortsetter med den opprinnelige oppgaven.                      │
└─────────────────────────────────────────────────────────────────┘
```

### BINDING regler for observasjoner:

1. **RAPPORTER** kort hva du fant
2. **IKKE** fiks det uten å spørre
3. **FORTSETT** med opprinnelig oppgave
4. **VENT** på bruker hvis de vil at du tar det

---

## Nye dependencies

Før du kjører `npm install [pakke]`:

```
┌─────────────────────────────────────────────────────────────────┐
│  📦 NY DEPENDENCY                                               │
│                                                                 │
│  Jeg trenger: [pakkenavn]                                       │
│  Grunn: [hvorfor den trengs for oppgaven]                       │
│                                                                 │
│  Skal jeg installere den?                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Overstyring

Bruker kan alltid si:

- "Fiks alt du ser" → Scope guard deaktivert for denne oppgaven
- "Refaktorer gjerne" → Tillater refaktorering
- "Legg til det du mener trengs" → Tillater ekstra funksjonalitet
- "Hold deg til det jeg sa" → Forsterker scope guard

**Bruker har ALLTID høyeste prioritet.**
