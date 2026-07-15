---
name: kunnskapsbase
description: Espens Obsidian-vault med lessons learned fra alle prosjekter, UI/UX-bibliotek og Claude-instruksjoner. Bruk når (1) et teknisk problem skal løses — sjekk om det finnes en lesson fra før, (2) et problem er løst og bør dokumenteres, (3) et UI/UX-mønster/teknikk skal lagres eller slås opp, (4) brukeren nevner vault, kunnskapsbase, lessons eller obsidian.
---

# Kunnskapsbase (Obsidian-vault)

Vaulten ligger på: `/Users/espen/Projects/Kunnskapsbase`
Prosjektene ligger i: `/Users/espen/Projects/<prosjekt>/`

## Struktur

```
Kunnskapsbase/
├── Home.md                       # Dashboard
├── 00-Innboks/                   # Raske, usorterte notater
├── 10-Lessons/
│   ├── Lessons-oversikt.md       # AUTOGENERERT indeks over alle lessons
│   └── Prosjekter/<prosjekt>.md  # AUTOGENERERT kopi per prosjekt
├── 20-UI-UX/
│   ├── UI-UX-oversikt.md
│   ├── Mønstre/                  # UX-mønstre og teknikker
│   ├── Komponenter/              # Komponent-oppskrifter med kode
│   └── Inspirasjon/              # Lenker og skjermbilder
├── 30-Claude/
│   ├── Claude-oversikt.md
│   ├── CLAUDE-filer/             # AUTOGENERERT kopi av CLAUDE.md per prosjekt
│   ├── Prompts/                  # Gjenbrukbare prompts
│   └── Prosjektmal.md            # Beste praksis for nye prosjekter
├── 90-Maler/                     # Obsidian-maler (Lesson-mal, UI-UX-mal)
└── _scripts/sync-lessons.sh      # Synk-skript
```

## Regler

1. **AUTOGENERERTE filer redigeres ALDRI direkte** (`10-Lessons/Prosjekter/`, `Lessons-oversikt.md`, `30-Claude/CLAUDE-filer/`). Rediger originalen i prosjektet (`<prosjekt>/.claude/docs/lessons.md` eller `<prosjekt>/.claude/CLAUDE.md`), og kjør deretter synk-skriptet.
2. **Før du løser et vanskelig problem:** søk i `10-Lessons/` (grep etter nøkkelord, f.eks. "RLS", "Vercel", "hydration"). Mange problemer er løst før i andre prosjekter.
3. **Etter at et problem er løst:** foreslå å dokumentere det i prosjektets `lessons.md` med formatet i `90-Maler/Lesson-mal.md` (tittel, dato, kategori, problem, løsning, forebygging). Kjør så synk.
4. **UI/UX-kunnskap:** nye mønstre/teknikker lagres som eget notat i riktig undermappe av `20-UI-UX/` med YAML-frontmatter (`kategori`, `beskrivelse`, `kilde`, `tags: [ui-ux, ui-ux/<kategori>]`) — se `90-Maler/UI-UX-mal.md` og eksempelnotatet i `Mønstre/`.
5. **Gjentakende lessons på tvers av prosjekter:** foreslå å løfte dem inn i `30-Claude/Prosjektmal.md` slik at nye prosjekter arver løsningen.
6. **Lenking:** bruk Obsidian wiki-lenker `[[Notatnavn]]` mellom notater der det gir mening.

## Synk

```bash
bash "/Users/espen/Projects/Kunnskapsbase/_scripts/sync-lessons.sh"
```

Samler alle `lessons.md` og `CLAUDE.md` fra prosjektene inn i vaulten og regenererer `Lessons-oversikt.md`. Trygt å kjøre når som helst. Kjør den etter at en lesson er lagt til i et prosjekt.

## Typiske oppgaver

- «Har vi hatt dette problemet før?» → grep i `10-Lessons/Prosjekter/`, svar med prosjekt + løsning.
- «Lagre denne UI-teknikken» → nytt notat i `20-UI-UX/<kategori>/` med malen.
- «Oppsummer alle lessons om Supabase» → les alle filer i `10-Lessons/Prosjekter/`, filtrer på kategori/nøkkelord.
- «Synk vaulten» → kjør synk-skriptet.
