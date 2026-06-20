# Lessons Learned

> Documentation of problems we've solved and how to avoid them in the future.
> Update this file whenever we learn something new.

---

## How to Use This File

**Claude Code automatic behavior:**
1. **Before solving a problem:** Check this file for similar issues
2. **If found:** Follow the documented solution
3. **After solving:** Ask the owner if this should be documented

---

## Entry Format

```markdown
### [Short title]
**Date:** YYYY-MM-DD
**Category:** Git | Supabase | React | TypeScript | Lovable | Other
**Affected files:** path/to/file.tsx, path/to/other.ts

**Problem:**
What went wrong?

**Solution:**
How did we fix it?

**Prevention:**
What should we do differently next time?
```

---

## Lessons

### Windows reserved filenames
**Date:** 2025-01
**Category:** Other
**Affected files:** N/A (system-level issue)

**Problem:**
File named `nul` crashed on Windows because it's a reserved system name.

**Solution:**
Deleted the file and renamed it.

**Prevention:**
Never create files named: `nul`, `con`, `prn`, `aux`, `com1-9`, `lpt1-9`

---

### RLS policies must be run manually
**Date:** 2025-01
**Category:** Supabase
**Affected files:** Database policies (Supabase Dashboard)

**Problem:**
Claude Code cannot run SQL directly against Supabase, so changes weren't applied.

**Solution:**
Owner must copy SQL and run in Supabase SQL Editor.

**Prevention:**
- Always write SQL in clear code blocks
- Mark with "COPY AND RUN IN SUPABASE SQL EDITOR"
- Ask if it's done before continuing

---

### hCaptcha brukes kun som frontend-gate (ikke server-side verifisert)
**Date:** 2026-02-01
**Category:** Other
**Affected files:** src/pages/Contact.tsx, src/components/QuoteForm.tsx

**Problem:**
Web3Forms avviste skjema-innsending når `h-captcha-response`-tokenet ble sendt med, fordi hCaptcha secret key ikke er konfigurert i Web3Forms-dashboardet.

**Solution:**
Fjernet `h-captcha-response` fra Web3Forms-dataen. hCaptcha brukes nå kun som frontend-gate (send-knapp deaktivert til captcha er løst).

**Prevention / Fremtidig oppgradering:**
For full server-side verifisering: legg til hCaptcha secret key i Web3Forms-dashboardet, og send `h-captcha-response`-tokenet med i form-dataen igjen. Dette gir beskyttelse mot avanserte bots som kaller API-et direkte.

---

### Supabase storage policies: sjekk eksisterende før du oppretter nye
**Date:** 2026-02-01
**Category:** Supabase
**Affected files:** supabase/migrations/

**Problem:**
Migrering feilet med `policy already exists` fordi vi prøvde å opprette admin-policies som allerede fantes, samtidig med å fjerne de permissive.

**Solution:**
Delte migreringen: bare `DROP POLICY IF EXISTS` for de permissive, siden admin-policies allerede var på plass.

**Prevention:**
Alltid sjekk eksisterende policies med `SELECT * FROM pg_policies WHERE schemaname = 'storage'` før du lager nye.

---

### Edge Function rate limiting: cooldown vs. window-basert
**Date:** 2026-02-01
**Category:** Supabase
**Affected files:** supabase/functions/send-manual-email/index.ts, supabase/functions/submit-quick-feedback/index.ts

**Problem:**
Admin-brukere trenger å sende mange e-poster (cold emails til kunder), men fast rate limit (10/min) var for restriktivt uten å gi feedback.

**Solution:**
Brukte cooldown-basert rate limiting (1 req per 10s) med `retryAfterMs` i responsen, og en synlig nedtellingstimer i admin UI. For feedback-endepunktet: 1 req per 10 min (enkel klikk-funksjon).

**Prevention:**
Velg rate limiting-strategi basert på bruksmønster: cooldown med timer for admin-verktøy, strengere vindu-basert for offentlige endepunkter.

---

### Lovable Cloud: VITE_-variabler må ligge i .env, ikke Cloud Secrets
**Date:** 2026-02-01
**Category:** Lovable
**Affected files:** .env

**Problem:**
hCaptcha vistes ikke i produksjon på handyhjelp.no fordi `VITE_HCAPTCHA_SITE_KEY` var lagt til som Cloud Secret. `VITE_`-variabler bakes inn ved build-tid og må ligge i `.env`-filen for å være tilgjengelige i frontend.

**Solution:**
La til `VITE_HCAPTCHA_SITE_KEY` i `.env`-filen i Lovable og trigget ny build.

**Prevention:**
- `VITE_`-prefiks = frontend, må i `.env`-filen
- Cloud Secrets = kun for edge functions/backend (f.eks. `HCAPTCHA_SECRET`)

---

### Gjestekundar og NOT NULL constraints
**Date:** 2026-06-19
**Category:** Supabase
**Affected files:** src/hooks/useAdminData.tsx, supabase/migrations/

**Problem:**
handleStartJob() satte jobs.user_id = quote.user_id direkte. For gjestekundar er quote.user_id null — men jobs.user_id hadde NOT NULL constraint. Jobben ble aldri opprettet, men quote-status ble satt til 'in_progress' like før krasjet. Resultatet var en "stuck" quote som forsvant fra admin-panelet (vises ikke i "pending" og ingen job i "active").

**Solution:**
`ALTER TABLE public.jobs ALTER COLUMN user_id DROP NOT NULL;`
Deretter reset stuck quote: `UPDATE public.quotes SET status = 'pending' WHERE id = '...';`

**Prevention:**
- Nullable foreign keys til profiles skal aldri ha NOT NULL på relaterte tabeller når kildetabellen (quotes) tillater null
- Test alltid "start jobb"-flyten med et tilbud sendt uten innlogging (gjestekunde)
- Legg customer_email direkte på jobs-tabellen — gjør gjestejobber søkbare uten JOIN
- send-job-status-email edge function bør logge til email_logs slik at e-poster til gjester vises i historikken

---

### REVOKE på has_role() brekker RLS for anonyme brukere
**Date:** 2026-06-20
**Category:** Supabase
**Affected files:** supabase/migrations/, alle tabeller med has_role() i SELECT-policies

**Problem:**
Sikkerhets-migrering kjørte `REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon`.
Dette brøt prosjektvisningen (og potensielt andre sider) for alle ikke-innloggede besøkende.

Årsak: PostgreSQL evaluerer **alle** permissive SELECT-policies med OR. Selv om `projects`-tabellen
har en enkel policy `status = 'published'` (trenger ikke has_role), finnes det også en
"Admins can view all projects"-policy som kaller `has_role()`. Når anon mangler EXECUTE,
krasjer hele spørringen — selv om den enkle policyen ville returnert true.

**Solution:**
```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon;
```

Dette er trygt: `anon` kaller `has_role(auth.uid(), 'admin')` → `auth.uid()` er null for
uinnloggede → funksjonen returnerer alltid false. Ingen sikkerhetsrisiko.

**Prevention:**
- Når du REVOKEr EXECUTE på hjelpefunksjoner som brukes i RLS-policies, **alltid** behold
  GRANT til `anon` — ellers brekker du tilgang for alle besøkende
- Etter sikkerhets-migreringer: test alltid `/prosjekter` og forsiden uten å være innlogget
- Regel: `has_role()` må alltid ha EXECUTE for både `authenticated` og `anon`

<!--
ADD NEW LESSONS BELOW

Use the format above. Keep it short and concrete.
-->

---

### Flex-element uten min-w-0 gjør hele siden for bred
**Date:** 2026-06-20
**Category:** React
**Affected files:** src/pages/Dashboard.tsx

**Problem:**
`<main className="flex-1">` i et `flex-row`-layout hadde standardverdien `min-width: auto`. Det betyr at flex-elementet aldri kan krympe under sin "min-content bredde" — den minste bredden innholdet trenger. En tabell med mange kolonner i AdminDashboard satte en høy min-content bredde som boblet opp til `main`, som da ble bredere enn viewport og dytta alt innhold til høyre.

**Solution:**
Legg til `min-w-0` på flex-elementet: `<main className="flex-1 min-w-0">`. Dette lar elementet krympe til 0 og lar scrollbare barn (som tabeller med `overflow-auto`) håndtere overflyt internt.

**Prevention:**
Alltid legg `min-w-0` på `flex-1`-elementer som inneholder scrollbart innhold (tabeller, kode, lange tekster). Dette er CSS best practice for flex-layouts.

---

### Supabase storage: file_url er en sti, ikke en URL
**Date:** 2026-06-20
**Category:** Supabase
**Affected files:** src/components/admin/CustomerDetailModal.tsx

**Problem:**
`file_url` i `invoices`-tabellen er en intern storage-sti (f.eks. `/invoices/filnavn.pdf`), ikke en nettadresse. Bruk av den direkte som `<a href>` ga "Bucket not found" 404 fra Supabase storage.

**Solution:**
Bruk `supabase.storage.from('invoices').download(filePath)` der `filePath = file_url.split('/invoices/')[1]`. Lag en blob-URL med `URL.createObjectURL(data)` og trigger nedlasting programmatisk.

**Prevention:**
Aldri bruk `file_url` fra databasen direkte som href. Alltid bruk `storage.download()` + `createObjectURL`, eller generer en signed URL med `storage.createSignedUrl()`.
