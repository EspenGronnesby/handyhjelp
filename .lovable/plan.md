
# Plan: Hindre uønsket refresh ved tab-bytte

## Problemet
Når du bytter bort fra tabben og tilbake, re-fetches data fra serveren fordi React Query sin standardoppførsel er å refetche ved window focus. Dette kan føre til:

1. **Email-siden**: Mottakere, emne og innhold du har skrevet inn nullstilles hvis komponenten re-rendres
2. **Admin-dashboard**: Tab-valg og filter-status resettes
3. **Worker-dashboard**: Åpne modaler kan lukkes ved re-render

## Løsningen

### Del 1: Global QueryClient-konfigurasjon
Deaktivere `refetchOnWindowFocus` globalt i QueryClient slik at data ikke re-fetches automatisk ved focus.

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutter
    },
  },
});
```

### Del 2: Email Composer - Persistent state
EmailComposer bruker kun lokal useState som forsvinner ved unmount. Vi legger til draft-persistens for:
- Valgte mottakere
- Emne
- Innhold  
- Valgt mal
- Tilbakemeldingsknapp-toggle

### Del 3: Admin Dashboard - Tab-persistens i URL
Lagre aktiv kategori og aktiv tab i URL-parametre slik at navigasjonsstate beholdes ved refresh.

### Del 4: Worker Dashboard - Allerede løst
WorkerProjectForm og WorkerBlogForm har allerede `useFormDraft` hooks som lagrer utkast til localStorage. Disse fungerer som forventet.

---

## Tekniske endringer

### Fil 1: `src/App.tsx`
```typescript
// Erstatt linje 47
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache data i 5 minutter
    },
  },
});
```

### Fil 2: `src/components/admin/EmailComposer.tsx`
- Legge til `useFormDraft` hook for å persistere skjemadata
- Lagre mottakere, emne, innhold, mal-valg og tilbakemeldingsknapp

### Fil 3: `src/pages/AdminDashboard.tsx`
- Bruke URL searchParams for `activeCategory` og `activeTab`
- Ved refresh/tab-bytte beholdes navigasjonsstate

---

## Filer som endres

| Fil | Endring |
|-----|---------|
| `src/App.tsx` | QueryClient-konfigurasjon med refetchOnWindowFocus: false |
| `src/components/admin/EmailComposer.tsx` | Draft-persistens for skjemadata |
| `src/pages/AdminDashboard.tsx` | URL-basert tab-persistens |

---

## Fordeler
- Data re-fetches ikke automatisk ved tab-bytte
- E-postutkast lagres automatisk
- Admin navigasjonsstate beholdes i URL
- Worker-skjemaer fungerer allerede med draft-persistens
- Manuell refresh (F5) henter fersk data som forventet

