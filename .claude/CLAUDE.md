# HandyHjelp

This file provides guidance to Claude Code when working with this repository.

---

## Rule Precedence

**Bruker har ALLTID høyeste prioritet.** Se `.claude/rules/precedence.md` for detaljer.

```
#1 BRUKER (din eksplisitte instruks) → trumfer alt
#2 CLAUDE.MD (denne filen)
#3 SKILLS (.claude/skills/)
#4 RULES (.claude/rules/)
#5 SECURITY.MD
#6 LESSONS.MD
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

## Verification (IMPORTANT)

**After changing code files, run verification.** See `.claude/skills/verify.md` for full details.

### Quick reference:

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

## Severity Levels

See `.claude/rules/severity.md` for full details.

| Level | Handling |
|-------|----------|
| 🔴 CRITICAL | STOPP, rapporter, vent på bruker |
| 🟡 WARNING | Rapporter, men fortsett |
| 🔵 INFO | Nevn hvis relevant |

---

## Automatic Behaviors

### Before solving any problem
1. Check `.claude/lessons.md` for similar issues
2. If found, follow the documented solution
3. If not found, solve and then document

### After changing code
1. Run verification (unless bruker sier hopp over)
2. Report result using the formats in skills/verify.md

### After solving a problem
1. Ask: "Skal jeg legge dette til i lessons.md?"
2. If yes, add using the format in that file

### Before writing new hooks, forms, or components
1. Check `.claude/architectural_patterns.md` for existing patterns
2. Follow established patterns for consistency

### Before security-related work
1. Read `.claude/security.md`
2. Follow the guidelines for RLS, secrets, etc.

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

## Additional Documentation

Check these files for detailed patterns and conventions:

| Topic | File |
|-------|------|
| Architectural patterns | [.claude/architectural_patterns.md](.claude/architectural_patterns.md) |

When working on specific areas, consult the relevant documentation above.

## Instruction Files

| File | Purpose | When to read |
|------|---------|--------------|
| `.claude/rules/precedence.md` | Priority order | When rules conflict |
| `.claude/rules/severity.md` | Error handling | When errors occur |
| `.claude/skills/verify.md` | Code verification | After code changes |
| `.claude/security.md` | Security guidelines | Before security work |
| `.claude/lessons.md` | Past solutions | When encountering problems |
| `.claude/architectural_patterns.md` | Code patterns | When writing new hooks, forms, or components |

---

## Project-Specific Notes

<!-- Add notes as the project evolves -->
