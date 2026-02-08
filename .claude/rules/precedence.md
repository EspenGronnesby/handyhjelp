# Rule Precedence

> Når flere regler kan gjelde samtidig, følg denne rekkefølgen.
> **Bruker har ALLTID høyeste prioritet.**

---

## Prioritetsrekkefølge

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   #1  DU (BRUKER)                              HØYEST           │
│   ═══════════════════════════════════════════════════════════   │
│   Din eksplisitte instruks i chatten trumfer ALT.               │
│   Inkluderer: "ignorer feil", "hopp over", "gjør det likevel"   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   #2  CLAUDE.MD                                                 │
│   ═══════════════════════════════════════════════════════════   │
│   Prosjektspesifikke regler og konfigurasjon.                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   #3  SKILLS                                                    │
│   ═══════════════════════════════════════════════════════════   │
│   Prosedyrer som verify.md, etc.                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   #4  RULES                                                     │
│   ═══════════════════════════════════════════════════════════   │
│   Generelle regler som severity.md, denne filen.                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   #5  DOCS/SECURITY.MD                                               │
│   ═══════════════════════════════════════════════════════════   │
│   Sikkerhetssjekker og audit-regler.                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   #6  DOCS/LESSONS.MD                                LAVEST          │
│   ═══════════════════════════════════════════════════════════   │
│   Tidligere lærte løsninger.                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Hvordan bruke dette

### Eksempel 1: Bruker vs Skill

```
Situasjon:
• verify.md sier: "Kjør alltid npm run build etter endringer"
• Bruker sier: "Ikke kjør build, bare endre filen"

Resultat: Følg bruker (#1 > #3)
→ Endre filen, IKKE kjør build
```

### Eksempel 2: Bruker vs Security

```
Situasjon:
• security.md sier: "CRITICAL: Hardkodet API-nøkkel funnet"
• Bruker sier: "Ignorer det, jeg fikser det senere"

Resultat: Følg bruker (#1 > #5)
→ Claude VARSLER om risikoen, men fortsetter som bruker ber om
```

### Eksempel 3: CLAUDE.md vs Lessons

```
Situasjon:
• lessons.md sier: "Bruk løsning A for denne typen problem"
• CLAUDE.md sier: "Bruk alltid løsning B i dette prosjektet"

Resultat: Følg CLAUDE.md (#2 > #6)
→ Bruk løsning B
```

---

## Varsling ved overstyring

Når bruker overstyrer en sikkerhet eller CRITICAL regel:

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ MERKNAD                                                     │
│                                                                 │
│  Du ba meg ignorere: [beskrivelse]                              │
│  Risiko: [kort forklaring]                                      │
│                                                                 │
│  Fortsetter som du ba om.                                       │
└─────────────────────────────────────────────────────────────────┘
```

Claude skal:
- **VARSLE** kort om risikoen
- **IKKE** nekte eller spørre om bekreftelse
- **FORTSETTE** med det bruker ba om

---

## Oppsummering

| Prioritet | Kilde | Eksempel |
|-----------|-------|----------|
| #1 | Bruker | "Gjør X", "Ignorer Y" |
| #2 | CLAUDE.md | Prosjektregler |
| #3 | Skills | verify.md prosedyrer |
| #4 | Rules | severity.md, precedence.md |
| #5 | security.md | Sikkerhetssjekker |
| #6 | lessons.md | Tidligere løsninger |

**Huskeregel:** Bruker > Prosjekt > System > Historie
