
# Plan: Fiks byggfeil + Kundelogo-vegg

## Del 1: Fiks byggfeil i BlogManagement.tsx

### Problem
På linje 558 brukes `handleCloseDialog` direkte som `onClick`-handler på en `<Button>`:
```tsx
<Button type="button" variant="outline" onClick={handleCloseDialog}>
```
TypeScript klager fordi `handleCloseDialog` forventer `boolean | undefined`, men `onClick` sender `MouseEvent`. 

### Fix
Pakk kallet i en arrow-funksjon slik at `clearDrafts` ikke mottar et mouse-event:
```tsx
onClick={() => handleCloseDialog(true)}
```

---

## Del 2: Kundelogo-vegg

### Hva som bygges
En ny seksjon på forsiden (mellom TestimonialsSection og Services) som viser logoer til bedrifter HandyHjelp har jobbet for. I redigeringsmodus kan owner legge til, redigere og fjerne logoer.

### Database
Ny tabell `client_logos` med følgende kolonner:
- `id` (uuid, PK)
- `name` (text) – bedriftsnavn
- `logo_url` (text) – URL til logo i storage
- `website_url` (text, nullable) – evt. lenke til bedriftens nettside
- `display_order` (integer, default 0)
- `is_active` (boolean, default true)
- `created_at` (timestamp)

RLS-regler:
- Alle kan lese aktive logoer (`is_active = true`)
- Kun `platform_owner` kan opprette, oppdatere og slette

Storage bucket `client-logos` (public) for logo-opplasting.

### Filer som opprettes/endres

| Fil | Endring |
|-----|---------|
| `supabase/migrations/...` | Ny migrasjon for tabell + RLS + storage bucket |
| `src/components/ClientLogosSection.tsx` | Ny seksjon som vises på forsiden |
| `src/components/ClientLogosEditModal.tsx` | Modal for å legge til / redigere en logo |
| `src/pages/Index.tsx` | Legg inn `<ClientLogosSection />` mellom Testimonials og Services |

### Slik ser seksjonen ut

```text
┌──────────────────────────────────────────────────────┐
│          Stolte samarbeidspartnere                    │
│  ────────────────────────────────────────────────    │
│  [Logo]  [Logo]  [Logo]  [Logo]  [Logo]  [Logo]     │
│                                                      │
│  (I redigeringsmodus: blyant-ikon over hver logo,   │
│   + "Legg til"-knapp til høyre)                     │
└──────────────────────────────────────────────────────┘
```

### Redigeringsflyt (owner med edit mode på)
1. Blyant-ikon vises øverst til høyre på seksjonen
2. Klikk åpner en modal med liste over alle logoer
3. I modalen kan owner:
   - Laste opp ny logo (bilde-upload)
   - Skrive inn bedriftsnavn
   - Legge til valgfri nettside-URL
   - Dra for å endre rekkefølge (display_order)
   - Slette en logo

### Design
- Logoer vises i en horisontal rad med `grayscale` filter → fargelagt ved hover
- Responsiv: 3 kolonner mobil, 6 kolonner desktop
- Subtil auto-scroll animasjon (marquee-stil) valgfritt

### Teknisk arkitektur

Følger eksisterende CMS-mønster fra `EditableServiceCard` og `TeamMemberEditor`:
- Data hentes via `useQuery` / Supabase
- Upload til `client-logos` storage bucket
- Edit modal følger samme mønster som `TeamMemberEditor`
- Seksjonen er usynlig hvis ingen aktive logoer finnes (og editMode er av)
