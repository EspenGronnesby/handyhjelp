# Gjestekunder: opprett manuelt og avslutt prosjekter

## Bakgrunn

I dag dukker en "gjestekunde" bare opp i admin hvis det finnes en forespørsel (quote) uten bruker knyttet til e-posten. Det finnes ingen måte å legge inn en kunde som aldri har bestilt via nettsiden. Derfor kan du ikke opprette jobb, fullføre den og sende sluttmail på vanlig måte for f.eks. hjordisjohansen@hotmail.com.

Merk: Du kan allerede i dag sende en enkelt e-post til adressen via E-post → Send e-post → "Legg til ekstern mottaker". Det som mangler er selve gjestekunden og prosjektet/jobben bak den.

## Det som bygges

### 1. Ny knapp: "Ny gjestekunde"
Plasseres i Brukere → Kunder, ved siden av søkefeltet.

Skjema (modal):
- Navn (påkrevd)
- E-post (påkrevd)
- Telefon (valgfritt)
- Adresse (valgfritt)
- Kundetype: privat / bedrift (+ firmanavn og org.nr ved bedrift)
- Beskrivelse av oppdraget (påkrevd)

Ved lagring opprettes en oppdragsforespørsel uten brukerkonto, markert som manuelt registrert. Kunden vises umiddelbart i gjestelisten og kan åpnes i gjestekunde-kortet med historikk, jobber og e-poster.

### 2. Opprett oppdrag for gjestekunde
"Opprett oppdrag manuelt" utvides slik at kundesøket også viser gjestekunder (ikke bare registrerte brukere). Velger du en gjest, opprettes jobben knyttet til e-postadressen i stedet for en brukerkonto. Samme valg som i dag: registrer / start / fullfør direkte.

### 3. Sluttmail til gjestekunde
Fra gjestekunde-kortet legges det til en "Send e-post"-knapp som åpner e-postkomposisjonen med adressen forhåndsutfylt som ekstern mottaker, slik at du kan bruke en mal (f.eks. "Jobben er ferdig") og sende sluttmail med informasjon.

Fullføring av jobb for gjestekunde bruker eksisterende status-e-post-flyt via jobbens e-postadresse.

## Teknisk

- Ingen ny tabell. Gjestekunden lagres som rad i `quotes` med `user_id = null`; `jobs.customer_email` brukes videre som i dag.
- Nye/endrede filer:
  - `src/components/admin/CreateGuestCustomerModal.tsx` (ny)
  - `src/components/admin/AllCustomersPanel.tsx` — knapp + refresh etter lagring
  - `src/components/admin/CreateJobModal.tsx` — gjestekunder i kundesøket
  - `src/hooks/useAdminData.tsx` — støtte for jobb uten `user_id` (setter `customer_email`)
  - `src/components/admin/GuestCustomerModal.tsx` — "Send e-post"-knapp
  - `src/pages/AdminDashboard.tsx` — kobling til e-postfanen med forhåndsutfylt mottaker
- Sjekker at gjeldende tilgangsregler tillater admin å opprette forespørsel uten bruker; hvis ikke, legges en migrasjon til for det.
