# HandyHjelp

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
npm run dev       # Dev server at localhost:8080
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview build
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

## Additional Documentation

Check these files for detailed patterns and conventions:

| Topic | File |
|-------|------|
| Architectural patterns | [.claude/docs/architectural_patterns.md](.claude/docs/architectural_patterns.md) |

When working on specific areas, consult the relevant documentation above.

## Instruction Files

| File | When to read |
|------|--------------|
| `.claude/security.md` | Before security work, RLS changes, or audits |
| `.claude/lessons.md` | When encountering problems or similar tasks |
| `.claude/architectural_patterns.md` | When writing new hooks, forms, or components |

## Automatic Behaviors

**Before solving any problem:**
1. Check `.claude/lessons.md` for similar issues
2. If found, follow the documented solution

**After solving a problem:**
1. Ask: "Should I add this to lessons.md?"
2. If yes, use the format defined in that file

**Before writing new hooks, forms, or components:**
1. Check `.claude/architectural_patterns.md` for existing patterns
2. Follow established patterns for consistency
