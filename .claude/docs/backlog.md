# Backlog — Fremtidige ideer og forbedringer

> Ting vi vil jobbe på senere, men ikke har kapasitet til akkurat nå.
> Oppdater dette når nye ideer dukker opp.

---

## AdminAttentionPanel — forbedringer

**Kontekst:** Panelet viser nå 3 varsler (gamle forespørsler, ventende innhold, forfalt faktura).
Lagt til: 2026-06-21

### Nye varsler å legge til
| Varsel | Hvorfor viktig |
|--------|---------------|
| Avtaler som nærmer seg fornyelse | Unngå at kunden forsvinner stille |
| Jobber startet men ikke fullført på X dager | Fanger prosjekter som har stoppet opp |
| Tilbud sendt men ikke svart på etter 5 dager | Følg opp før kunden glemmer |
| Fakturaer som forfaller *om 3 dager* (ikke bare forfalt) | Proaktiv varsling, ikke reaktiv |
| Kunder som ikke har hørt fra dere på lenge | Oppfølging for mersalg |

### UX-forbedringer
- Vis antall dager ("venter i 7 dager") ikke bare antall items
- Fargekoding etter hastegrad: gul (3-5 dager) → oransje (5-10) → rød (10+)
- "Merk som sett"-knapp per rad — rydd vekk uten å måtte fikse det nå
- Prioriteringsrekkefølge: rød øverst, gul nederst

---

## Dashboard — andre forbedringer (Gruppe B–F)

**Kontekst:** Bruker valgte Gruppe A (synlighet) som prioritet 2026-06-21.
Resten lagres her for fremtiden.

### B — Profil og konto
- Profilbildeoplasting (foto i stedet for initialer, lagres i Supabase Storage)
- Profilkomplettelsesstatus med fremdriftslinje ("60% utfylt") — forskning viser 3× bedre retensjon
- Varslingspreferanser (velg hvilke e-postvarsler du vil ha)
- Kontoaktivitetslogg (siste innlogginger med dato/IP)

### C — Kundeopplevelse
- Visuell steg-for-steg tidslinje på forespørsler (slik Housecall Pro gjør)
- "Godkjenn tilbud"-knapp direkte i dashboardet — hele den flyten mangler i dag
- Meldingsfelt: kunde kan skrive kommentar på en forespørsel
- Før/etter-bilder fra fullførte jobber på kundens side

### D — Medarbeider
- Avvisningsgrunner tydeligere fremhevet med tips om hva som bør fikses
- Innleveringsstatistikk (godkjennelsesrate, antall publisert)
- Eget galleri/arkiv for godkjente innleveringer

### E — Admin-effektivitet
- Globalt søk på tvers av kunder, jobber, forespørsler (Jobber sin viktigste admin-funksjon)
- Hurtighandlinger-knapper under statskortene
- Dato-range-filter på jobber/forespørsler/e-posthistorikk
- Bulk-godkjenning av prosjekter og blogginnlegg

### F — Notifikasjoner
- Klikk på varsel → navigerer direkte til riktig side/item
- Datogruppering (I dag / I går / Denne uken)
- Filter på varseltype (Jobber | Fakturaer | System)
