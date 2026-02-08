# Claude Code Agent Teams - Oppsett og bruk

## Status
Agent teams er aktivert globalt i `~/.claude/settings.json`.
Fungerer i alle prosjekter automatisk.

## Hva er Agent Teams?
Agent teams lar deg koordinere flere Claude Code-instanser som jobber sammen.
En session er **team lead** som koordinerer, og **teammates** jobber uavhengig
med egne kontekstvinduer og kommuniserer direkte med hverandre.

## Krav
- Claude Code CLI (nyeste versjon)
- Opus 4.6 (anbefalt for team lead)
- Sonnet for teammates (billigere, raskere)

## Global aktivering (allerede gjort)
```json
// ~/.claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Display modes
- **In-process** (standard): Alt i ett terminal-vindu. Shift+Up/Down for å bytte mellom teammates.
- **Split panes**: Krever tmux eller iTerm2. Hver teammate i eget panel.

Konfigurer i settings.json:
```json
{
  "teammateMode": "in-process"
}
```

## Brukseksempler

### 1. Parallell code review
```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

### 2. Ny feature med flere lag
```
Create a team with 3 teammates to build the new notification system:
- Frontend teammate: build the UI components in src/components/notifications/
- Backend teammate: create the Supabase edge function and database schema
- Test teammate: write tests for both frontend and backend
Use Sonnet for each teammate.
```

### 3. Debugging med konkurrerende hypoteser
```
Users report the app crashes on login. Spawn 3 agent teammates to
investigate different hypotheses. Have them talk to each other to
disprove each other's theories.
```

### 4. Research og utforskning
```
Create an agent team to research the best approach for adding
real-time features. One teammate investigates WebSockets, one SSE,
one polling. Compare findings and recommend.
```

## Viktige kommandoer under bruk
- **Shift+Up/Down**: Bytt mellom teammates (in-process mode)
- **Shift+Tab**: Aktiver delegate mode (lead koordinerer kun, koder ikke)
- **Ctrl+T**: Vis/skjul oppgaveliste
- **Enter** på teammate: Se deres session
- **Escape**: Avbryt teammates nåværende tur

## Best practices
1. **Gi nok kontekst**: Teammates arver CLAUDE.md men IKKE leadens samtalehistorikk
2. **Riktig oppgavestørrelse**: Ikke for små (overhead), ikke for store (lang tid uten sjekk)
3. **Unngå filkonflikter**: Hver teammate bor eie sine egne filer
4. **Bruk Sonnet for teammates**: Billigere og raskere enn Opus
5. **Start med research**: Prøv review/research først før parallell koding
6. **Plan approval**: For risikable oppgaver, krev at teammates planlegger først:
   ```
   Spawn an architect teammate to refactor auth.
   Require plan approval before they make any changes.
   ```

## Begrensninger
- Ingen session resumption for in-process teammates
- Kun ett team per session
- Ingen nestede teams (teammates kan ikke lage egne teams)
- Split panes fungerer IKKE i VS Code terminal eller Windows Terminal
- Lead kan ikke byttes etter opprettelse
- Alle teammates starter med leadens permission-innstillinger

## Agent Teams vs Subagents
| | Subagents | Agent Teams |
|---|---|---|
| Kontekst | Rapporterer tilbake til hoved-agent | Helt uavhengige |
| Kommunikasjon | Kun tilbake til caller | Snakker direkte med hverandre |
| Token-kostnad | Lavere | Høyere (hver er egen instans) |
| Best for | Fokuserte enkeloppgaver | Komplekst arbeid med samarbeid |

## Når IKKE bruke agent teams
- Sekvensielle oppgaver (bruk vanlig session)
- Enkle endringer i samme fil
- Oppgaver med mange avhengigheter
- Rutinearbeid (enkelt session er billigere)

## Feilsøking
- **Teammates vises ikke**: Shift+Down for å bla gjennom aktive teammates
- **For mange permission-prompts**: Pre-godkjenn vanlige operasjoner i permissions
- **Orphaned tmux sessions**: `tmux ls` og `tmux kill-session -t <navn>`
