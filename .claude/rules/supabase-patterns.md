# Supabase-mønstre (BINDENDE)

> Utledet fra lessons.md-hendelser. Brudd på disse har tidligere gitt produksjonsfeil.

1. **Skriv-rekkefølge:** Opprett alltid den avhengige raden (f.eks. jobs-insert)
   FØR du endrer status på kilderaden (f.eks. quotes.status). Statusendring er
   siste steg. Feiler et steg, skal kilderaden være urørt. (Ref: lessons.md
   2026-06-19 «stuck quotes».)
2. **SECURITY DEFINER:** Alle nye funksjoner skal ha `SET search_path = public`
   i funksjonsdefinisjonen.
3. **RLS-hjelpefunksjoner:** `has_role()` o.l. skal alltid ha GRANT EXECUTE til
   både `authenticated` og `anon`. Test /prosjekter og forsiden utlogget etter
   sikkerhetsmigrasjoner.
4. **Joins kan være null:** Data fra `.select('*, quotes(...)')` skal alltid
   leses med optional chaining (`job.quotes?.x`) + fallback.
5. **Gjesteflyt:** Test alltid tilbuds-/jobbflyt med et tilbud sendt uten
   innlogging (user_id = null).
6. **Rollesjekk:** Bruk `useRole()` som eneste kilde for isAdmin/isOwner.
   Ikke lag nye frittstående rollesjekk-hooks.

