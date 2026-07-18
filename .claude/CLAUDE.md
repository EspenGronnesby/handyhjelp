# HandyHjelp

This file provides guidance to Claude Code when working with this repository.

---

## Rule Precedence

**Bruker har ALLTID høyeste prioritet.** Se felles regel `precedence` (arves fra ~/.claude/rules/).

```
#1 BRUKER (din eksplisitte instruks) → trumfer alt
#2 CLAUDE.MD (denne filen)
#3 SKILLS (.claude/skills/)
#4 RULES (.claude/rules/)
#5 DOCS (.claude/docs/)
```

---

## Oppsett: felles + prosjektspesifikt

**Generiske skills, regler og agenter arves automatisk fra `~/.claude/`**
(kilde: `~/Vibe-kode/System/claude-felles/` — rediger der, aldri her):
- Skills: scope-guard, verify, security-review, secret-guard, ui-ux-review, webapp-testing, kunnskapsbase
- Regler: precedence, severity, kommunikasjon
- Agenter: verifier, utforsker, lesson-skriver, security-reviewer

**I dette prosjektet ligger kun det prosjektspesifikke:**

```
.claude/
├── CLAUDE.md                      # ← DU ER HER
├── rules/supabase-patterns.md
├── docs/  (security.md, lessons.md, backlog.md)
├── architectural_patterns.md
└── _arkiv/                        # Gamle dupliserte filer (nå i claude-felles)
```

---

## Project Overview

Facility management services platform for Kristiansand, Norway. Handles property maintenance (vaktmester, carpentry, roofing), service quotes, job management, and multi-role dashboards.

**Language**: Norwegian UI

> **IMPORTANT**: When you work on a new feature or bug, create a git branch first. Then work on changes in that branch for the remainder of the session.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Build | Vite 5 |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix) |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| State | TanStack React Query |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server at localhost:8080
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview build
```

## Project Structure

```
src/
├── pages/                  # Route pages (33 files)
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── admin/              # Admin dashboard
│   ├── worker/             # Worker features
│   ├── loyalty/            # Loyalty program
│   └── motion/             # Animation wrappers
├── hooks/                  # Custom hooks (27 files)
├── contexts/               # EditModeContext
├── lib/validations/        # Zod schemas
├── integrations/supabase/  # Client + auto-generated types
└── types/                  # TypeScript definitions

supabase/
├── migrations/             # 52 database migrations
└── functions/              # 12 Edge Functions
```

## Key Files

| Purpose | Location |
|---------|----------|
| Entry | `src/main.tsx:1`, `src/App.tsx:1` |
| Routing | `src/App.tsx:60-130` |
| Auth hook | `src/hooks/useAuth.tsx:1` |
| Role hook | `src/hooks/useRole.tsx:1` |
| Admin data | `src/hooks/useAdminData.tsx:1` |
| Supabase client | `src/integrations/supabase/client.ts:1` |
| Supabase types | `src/integrations/supabase/types.ts` (auto-generated) |
| Quote validation | `src/lib/validations/quoteFormSchema.ts:1` |
| Agreement validation | `src/lib/validations/serviceAgreementSchema.ts:1` |

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

## Quick Reference

**Path alias**: `@/*` maps to `src/*`

**User roles**: `platform_owner`, `admin`, `worker`, `moderator`, `user`
- Check with `useRole()` hook returning `{ isOwner, isAdmin, isWorker }`

**Database types**: Auto-generated in `src/integrations/supabase/types.ts`
- Regenerate with Supabase CLI after schema changes

**Norwegian validation**: Phone must be 8 digits, names allow æøå

## Database Tables

Core tables: `profiles`, `user_roles`, `quotes`, `jobs`, `service_agreements`, `reviews`, `blog_posts`, `projects`, `invoices`, `audit_logs`, `email_logs`, `notifications`

RLS enforces access: customers see own data, admins see all.

---

## Working Rules

### Git Workflow

**ALWAYS create a new branch before making changes. Never commit directly to `main`.**

```bash
git checkout -b feature/description   # or fix/, refactor/, chore/
git commit -m "type: short description"
git push origin branch-name
```

### Supabase Database Changes

**Claude Code CANNOT run SQL directly against Supabase.**

When database changes are needed:
1. Write SQL in a code block marked `sql`
2. Label clearly: **"COPY AND RUN IN SUPABASE SQL EDITOR"**
3. Provide step-by-step instructions
4. **ASK if it's done before continuing**

### Windows Compatibility

Never create files named: `nul`, `con`, `prn`, `aux`, `com1-9`, `lpt1-9`

### Communication

The owner is learning. Always explain simply what's happening and why. Give a brief summary after each change. Communicate in Norwegian.

---

## Automatic Behaviors

### Before ANY code task
1. **Scope guard** (felles skill: scope-guard):
   - Kan du definere oppgaven i én setning? Hvis nei → spør bruker
   - Løs nøyaktig det som ble spurt om, ikke mer
   - Ikke legg til dependencies, refaktorer, eller endre filer uten å spørre

2. **Arbeidsmodus og agent-hierarki:**
   Hovedsesjonen planlegger og skriver kritisk kode. Rutinearbeid delegeres til billige agenter:

   ```
   VANLIG SESSION (standard):
   → Én ting, 1-3 filer, sekvensielt. Billigst.

   DELEGER TIL AGENT (bruk aktivt, sparer credits):
   → Lete/lese i mange filer          → utforsker (haiku)
   → Verifisere etter kodeendringer   → verifier (haiku)
   → Dokumentere løst problem         → lesson-skriver (haiku)
   → Auth/RLS/Edge Functions endret   → security-reviewer (sonnet)

   STOR OPPGAVE (planlegging + mye koding):
   → Anbefal brukeren `/model opusplan` (sterk modell planlegger, billig koder)

   AGENT TEAMS (sjelden, 4-5x tokens):
   → Kun ved flere ULIKE deler som må koordinere. SPØR ALLTID bruker først.
   ```

### Before solving a problem
1. Check `.claude/docs/lessons.md` for similar issues
2. If found, follow the documented solution
3. If not found, solve and then document

### When touching auth, RLS, input, or Edge Functions
1. Aktiver **security review** (felles skill: security-review — eller deleger til security-reviewer-agenten)
2. Sjekk false positive-listen i `.claude/docs/security.md` FØR du flagger
3. Kun flagg det du kan bevise

### After changing code
1. Run **verification** (deleger til verifier-agenten) unless bruker sier hopp over
2. Report result using the formats in that file

### After ANY UI change
1. Oppdater `.claude/docs/design.md` (relevant seksjon + endringsloggen med dato)
2. Ved designtilbakemelding fra Espen («liker ikke…», «mer luft…», «alltid…»):
   spør om preferansen også skal inn i den FELLES designprofilen
   (`~/Vibe-kode/System/claude-felles/skills/min-designprofil/`) så alle prosjekter lærer den

### After solving a problem
1. Ask: "Skal jeg legge dette til i docs/lessons.md?"
2. If yes: deleger til lesson-skriver-agenten (dokumenterer + synker Kunnskapsbasen)

### Before writing new hooks, forms, or components
1. Check `.claude/architectural_patterns.md` for existing patterns
2. Follow established patterns for consistency

---

## Severity Levels

Full details: felles regel `severity` (arves fra ~/.claude/rules/).

| Level | Handling |
|-------|----------|
| 🔴 CRITICAL | STOPP, rapporter, vent på bruker |
| 🟡 WARNING | Rapporter, men fortsett |
| 🔵 INFO | Nevn hvis relevant |

---

## State Tracking

When working on multi-step tasks, use this format:

```
Plan:
1. [ ] First task
2. [ ] Second task
3. [ ] Verification

Status:
1. [✓] First task - FERDIG
2. [ ] Second task - NESTE
3. [ ] Verification
```

### Forbudt språk:
- ❌ "Jeg antar at..."
- ❌ "Dette burde..."
- ❌ "Sannsynligvis..."

### Påkrevd språk:
- ✅ "Bekreftet: [kommando] returnerte [resultat]"
- ✅ "Verifisert: [hva som ble sjekket]"
- ✅ "Venter på: [hva bruker må gjøre]"

---

## Verification (Quick Reference)

Full details: felles skill `verify`. Deleger helst til verifier-agenten (billig).

```
WHEN TO VERIFY:
✅ Changed .ts, .tsx, .js, .jsx files
✅ Changed package.json
✅ Changed config files (vite.config, tsconfig)
❌ Only changed .md, .css, or comments

VERIFICATION STEPS:
1. npm run build     (maks 3 forsøk)
2. npm run lint      (maks 2 forsøk, hvis tilgjengelig)
3. npx tsc --noEmit  (maks 3 forsøk, hvis TypeScript)

ON FAILURE:
🔴 STOPP → RAPPORTER → VENT på bruker
```

### Bruker kan alltid si:
- "Hopp over verify" → Skip verification
- "Ignorer feil" → Fortsett selv ved feil

---

## Project-Specific Notes

<!-- Add notes as the project evolves -->
