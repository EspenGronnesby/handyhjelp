

# Plan: Google-innlogging med automatisk kontokobling

## Oppsummering av funn

### Nåværende brukere med roller
Fra databasen ser jeg at disse brukerne har spesielle roller:
- **essi1403@gmail.com** (Espen Grønnesby): platform_owner, admin, worker
- **02larsen22@gmail.com** (Benjamin Larsen): worker

### Hvordan Lovable Cloud håndterer kontokobling

Lovable Cloud har **automatisk kontokobling** basert på e-postadresse. Dette betyr:

1. Hvis en eksisterende bruker (f.eks. essi1403@gmail.com) logger inn med Google med samme e-post, vil systemet automatisk koble Google-identiteten til den eksisterende kontoen
2. Alle roller i `user_roles`-tabellen beholdes fordi de er knyttet til `user_id` (UUID)
3. Profilen i `profiles`-tabellen forblir uendret

### Teknisk forklaring
- `profiles.id` = `auth.users.id` (samme UUID)
- `user_roles.user_id` = `auth.users.id` (samme UUID)
- Når Google-innlogging kobles til eksisterende konto, beholdes samme UUID
- Derfor beholdes alle roller og profildata automatisk

---

## Hva vi implementerer

### 1. Konfigurer Google OAuth
Bruke Lovable Cloud sitt verktøy for å generere nødvendig integrasjonskode.

### 2. Oppdater Auth.tsx

#### Nye importer
```typescript
import { lovable } from "@/integrations/lovable/index";
```

#### Ny funksjon for Google-innlogging
```typescript
const handleGoogleSignIn = async () => {
  setLoading(true);
  try {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) throw error;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    toast({
      title: 'Feil',
      description: 'Kunne ikke logge inn med Google. Prøv igjen.',
      variant: 'destructive'
    });
    setLoading(false);
  }
};
```

#### Google-knapp i UI
Legges til på begge flyter (innlogging og registrering):

```tsx
{/* Divider */}
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-card px-2 text-muted-foreground">
      Eller fortsett med
    </span>
  </div>
</div>

{/* Google Button */}
<Button
  type="button"
  variant="outline"
  className="w-full"
  onClick={handleGoogleSignIn}
  disabled={loading}
>
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <!-- Google logo -->
  </svg>
  Google
</Button>
```

---

## Hva skjer med eksisterende brukere?

| Scenario | Resultat |
|----------|----------|
| Espen logger inn med Google (essi1403@gmail.com) | Google kobles til eksisterende konto. Beholder platform_owner, admin, worker roller |
| Benjamin logger inn med Google (02larsen22@gmail.com) | Google kobles til eksisterende konto. Beholder worker rolle |
| Ny bruker logger inn med Google | Ny konto opprettes. Profil lages via `handle_new_user`-triggeren |

### Viktig: Hva `handle_new_user`-triggeren gjør for Google-brukere

Triggeren henter metadata fra `raw_user_meta_data`, som inkluderer:
- `full_name` fra Google-profilen
- `email` fra Google-kontoen

For nye Google-brukere vil disse feltene settes automatisk:
- `phone`: Tom (kan fylles ut senere i dashboard)
- `customer_type`: NULL (kan settes senere)
- `org_number` og `company_name`: NULL

---

## Filer som endres

| Fil | Endring |
|-----|---------|
| `src/integrations/lovable/` | Ny mappe generert automatisk |
| `src/pages/Auth.tsx` | Legge til Google-knapp og OAuth-funksjon |

---

## Brukeropplevelse

### For eksisterende brukere (med roller)
1. Klikker "Google"
2. Velger sin Google-konto med samme e-post
3. Logges direkte inn med alle eksisterende roller intakt
4. Sendes til dashboard som vanlig

### For nye brukere
1. Klikker "Google"
2. Velger sin Google-konto
3. Ny konto opprettes automatisk
4. Sendes til dashboard
5. Kan oppdatere profil med telefon, kundetype etc. senere

---

## Sikkerhet

- Roller er trygt lagret i separat `user_roles`-tabell
- RLS-policyer beskytter mot uautorisert tilgang
- `has_role`-funksjonen bruker SECURITY DEFINER for sikker rollesjekk
- Ingen endringer i rollestrukturen

