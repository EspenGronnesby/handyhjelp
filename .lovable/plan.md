

# Plan: E-postvarsling til admin ved worker-innleveringer

## Hva som bygges
En ny edge function `send-content-notification` som sender e-post til alle admins/owners når en worker sender inn prosjekt eller blogginnlegg til godkjenning. De 4 worker-formene oppdateres til å kalle denne funksjonen etter at in-app notifikasjonen er opprettet.

## Filer som endres/opprettes

| Fil | Endring |
|-----|---------|
| `supabase/functions/send-content-notification/index.ts` | Ny edge function |
| `supabase/config.toml` | Ny funksjonskonfigurasjon |
| `src/components/worker/WorkerProjectForm.tsx` | Legg til `functions.invoke` etter notifikasjon |
| `src/components/worker/WorkerBlogForm.tsx` | Samme |
| `src/components/worker/WorkerProjectEditForm.tsx` | Samme |
| `src/components/worker/WorkerBlogEditForm.tsx` | Samme |

## Edge function: `send-content-notification`
- Mottar: `{ type: "project" | "blog", title: string, submitterEmail: string, isEdit: boolean }`
- Henter alle admin/owner-brukere fra `user_roles` + `profiles` (for e-postadresser)
- Sender branded HandyHjelp-e-post via Resend med info om hva som er sendt inn
- Bruker eksisterende `RESEND_API_KEY`-secret

## Klientkode-endring (alle 4 filer)
Etter eksisterende notifikasjonslogikk, legg til:
```typescript
await supabase.functions.invoke('send-content-notification', {
  body: {
    type: 'project', // eller 'blog'
    title: formData.title,
    submitterEmail: user?.email,
    isEdit: false, // true for edit-varianter
  },
});
```
Feiler stille (fire-and-forget) — skal ikke blokkere brukeropplevelsen.

