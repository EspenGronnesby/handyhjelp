

# Implementeringsplan: Klikkbare kort + Google Reviews med bedriftsinformasjon

## Oversikt
Denne planen implementerer tre forbedringer:
1. **Klikkbare kort** på /tjenester-siden
2. **Manuell inntasting av Google-anmeldelser** uten API-kostnader
3. **Bedriftsinformasjon på anmeldelser** via Brønnøysund-søk

---

## Del 1: Klikkbare kort på /tjenester

### Nåværende situasjon
Kortene "Engangsjobb" og "Fast avtale" på bunnen av /tjenester er statiske. Kun CTA-knappen "Få tilbud på fast avtale" er klikkbar.

### Løsning
Gjør hele kortene klikkbare:
- **Engangsjobb-kortet** → `/tilbud`
- **Fast avtale-kortet** → `/fast-avtale`

### Endringer
**`src/components/service-edit/EditableComparisonSection.tsx`**:
- Wrap hvert kort i `<Link>`-komponent
- Legg til visuell hover-effekt og "Klikk for å starte →" hint
- Behold eksisterende redigeringsfunksjonalitet

---

## Del 2: Google Reviews uten API-kostnad

### Utfordring
Du ønsker:
- Kunder skal legge igjen anmeldelser på Google for synlighet
- Disse anmeldelsene skal også vises på nettsiden
- Ingen API-kostnader

### Løsning: Admin legger inn Google-anmeldelser manuelt

Når du mottar en ny Google-anmeldelse, kan du legge den inn via admin-panelet med tydelig markering at den kommer fra en verifisert kunde. Dette er **ikke det samme som å lage falske anmeldelser** - du kopierer ekte anmeldelser fra Google og markerer dem som "Google-verifisert".

### Teknisk flyt

```text
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Google Maps   │    │   Admin-panel    │    │   Nettside       │
│   (kunde gir    │───▶│   (admin kopierer│───▶│   (viser med     │
│   anmeldelse)   │    │   anmeldelse)    │    │   Google-badge)  │
└─────────────────┘    └──────────────────┘    └──────────────────┘
```

### Database-endringer
Legg til nye kolonner i `reviews`-tabellen:
- `source` (text) - 'website', 'google', eller 'manual'
- `company_name` (text) - bedriftsnavn (fra Brønnøysund eller manuelt)
- `org_number` (text) - organisasjonsnummer for bedrifter
- `is_verified_customer` (boolean) - om dette er en verifisert kunde

---

## Del 3: Bedriftsinformasjon på anmeldelser

### Konsept
Når admin legger inn en anmeldelse (enten manuell eller fra Google), kan de søke opp bedriften via Brønnøysund-søket som allerede finnes i systemet. Dette gir:
- Verifisert bedriftsnavn fra offentlig register
- Organisasjonsnummer for troverdighet
- Mulighet til å vise hvilke bedrifter dere har jobbet med

### Admin-panel forbedringer
Legg til ny "Legg til anmeldelse"-knapp i ReviewManagement:
- Skjema for å legge inn kundenavn/kommentar/rating
- Brønnøysund-søk (CompanySearch-komponenten) for bedrifter
- Valg av kilde: "Nettside", "Google", "Manuell"
- Checkbox: "Verifisert kunde" (for anmeldelser fra kunder dere har jobbet med)

---

## Filer som endres/opprettes

| Fil | Type | Beskrivelse |
|-----|------|-------------|
| `supabase/migrations/[timestamp]_add_review_source_and_company.sql` | Ny | Database-skjema for kilde og bedrift |
| `src/components/service-edit/EditableComparisonSection.tsx` | Endres | Wrap kort i Link-komponenter |
| `src/components/admin/ReviewManagement.tsx` | Endres | Legg til "Opprett anmeldelse"-funksjonalitet |
| `src/components/admin/CreateReviewModal.tsx` | Ny | Modal for å legge inn nye anmeldelser |
| `src/components/TestimonialsSection.tsx` | Endres | Vis Google-badge og bedriftsnavn |
| `supabase/functions/send-feedback-request/index.ts` | Endres | Lenke kun til Google Reviews |
| `supabase/functions/send-manual-email/index.ts` | Endres | Lenke kun til Google Reviews |

---

## Detaljerte endringer

### Database-migrering
```sql
ALTER TABLE public.reviews 
ADD COLUMN source text DEFAULT 'website',
ADD COLUMN company_name text,
ADD COLUMN org_number text,
ADD COLUMN is_verified_customer boolean DEFAULT false;

COMMENT ON COLUMN public.reviews.source IS 'Kilde: website, google, manual';
COMMENT ON COLUMN public.reviews.is_verified_customer IS 'Om kunden er verifisert (f.eks. fra jobb vi har utført)';
```

### CreateReviewModal (ny komponent)
Admin-skjema med:
- Kundenavn (tekst)
- Rating (1-5 stjerner)
- Kommentar (tekst)
- Kilde (dropdown: Nettside / Google / Manuell)
- Bedriftssøk (gjenbruk CompanySearch-komponenten)
- "Verifisert kunde"-checkbox
- E-post (valgfritt, for intern referanse)

### TestimonialsSection visning
Når anmeldelse vises:
- Hvis `source === 'google'`: Vis Google-ikon/badge
- Hvis `company_name` finnes: Vis bedriftsnavn med Building-ikon
- Hvis `is_verified_customer`: Vis "Verifisert kunde"-badge

### Email-endringer
Endre tilbakemeldingslenken i emails til å gå direkte til Google:
```
URL: https://g.page/r/CW2GzzcrRsq5EAE/review
Knappetekst: "Gi oss en Google-anmeldelse ⭐"
```

---

## Arbeidsflyt for admin

### Når en kunde gir Google-anmeldelse:
1. Du får varsel om ny Google-anmeldelse (via Google-appen)
2. Åpne admin-panel → Anmeldelser → "Legg til anmeldelse"
3. Velg kilde: "Google"
4. Kopier inn kundenavn, rating og kommentar
5. Søk opp bedriften via Brønnøysund (hvis bedriftskunde)
6. Merk "Verifisert kunde" (siden du har jobbet med dem)
7. Lagre - anmeldelsen vises på nettsiden med Google-badge

### Fordeler
- Ingen API-kostnader
- Full kontroll over hva som vises
- Verifiserte kundeanmeldelser fra ekte kunder
- Mulighet til å vise hvilke bedrifter dere har jobbet med
- Profesjonelt utseende med Google-badge

---

## Testing etter implementering
1. Gå til `/tjenester` og verifiser at kortene er klikkbare
2. Test at Engangsjobb → `/tilbud` og Fast avtale → `/fast-avtale`
3. Legg til en test-anmeldelse via admin-panelet
4. Verifiser at anmeldelsen vises i testimonials med riktige badges
5. Test bedriftssøk i anmeldelseskjemaet
6. Send en test-email og verifiser at Google-lenken fungerer

