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

<!--
ADD NEW LESSONS BELOW

Use the format above. Keep it short and concrete.
-->
