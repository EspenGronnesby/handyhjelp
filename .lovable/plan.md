Jeg fant at feilen oppstår rett etter trykk på kamera/hero-redigering, og appen navigerer videre mot `/dashboard` før den ender i ErrorBoundary. Den mest sannsynlige årsaken er at hero-redigering bruker en egen `useAdmin()`-sjekk som kun godkjenner rollen `admin`, mens resten av edit/admin-systemet også bruker `platform_owner`. Det kan gi feil tilstand/navigering for eierkonto og utløse fallbacken.

Plan:

1. Fiks rollelogikken for hero-redigering
   - Endre `HeroImageEditor` slik at den bruker eksisterende `useEditMode()`-verdiene (`isAdmin`, `editMode`) i stedet for å starte en ny `useAdmin()`-sjekk.
   - Da behandles eier/admin likt over hele siden, og komponenten slipper ekstra auth-kall når hero-knappen vises.

2. Stopp unødvendig dashboard-redirect/flimmer
   - Rydd bort dobbelt auth-redirect i `Dashboard.tsx`.
   - Sørg for at dashboard ikke viser full loader igjen bare fordi rolle/badge-kall oppdaterer seg i bakgrunnen.

3. Forbedre feilsikkerhet rundt hero-redigering
   - Gjør hero-editor-dialogen tryggere på mobil ved å gi dialogen maksimal høyde og naturlig scroll.
   - Hvis opplasting eller rolledata feiler, skal det gi toast/ingen handling, ikke krasje hele siden.

4. Fiks mail-historikk sideveis scroll endelig
   - Juster `EmailHistory` slik at wrapperen faktisk tillater horisontal touch-scroll på mobil (`overflow-x-auto`, `touch-pan-x`, stabil min-bredde på tabellen).
   - Unngå at en vertikal scroll-container fanger sveipene når brukeren prøver å dra sideveis.

5. Verifisering
   - Sjekk at kamera/hero-redigering ikke fører til “Noe gikk galt”.
   - Sjekk at admin-faner ikke gir full refresh/fallback.
   - Sjekk at e-posthistorikk kan scrolles sideveis på telefonstørrelse.