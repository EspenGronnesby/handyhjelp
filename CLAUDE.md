# HandyHjelp

Facility management services platform for Kristiansand, Norway. Provides property maintenance services (vaktmester, carpentry, roofing), service agreements, quote management, and multi-role dashboards.

**Language**: Norwegian UI

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vite 5 + React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| State | TanStack React Query |
| Forms | React Hook Form + Zod validation |
| Animation | Framer Motion |
| Icons | Lucide React |

## Commands

```bash
npm run dev       # Start dev server at localhost:8080
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Project Structure

```
src/
├── pages/              # 33 route pages (Index, Auth, Dashboard, Admin, etc.)
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── admin/          # Admin dashboard components
│   ├── worker/         # Worker submission components
│   ├── loyalty/        # Loyalty program components
│   ├── motion/         # Animation wrappers
│   └── SEO/            # Meta tags and structured data
├── hooks/              # 27 custom hooks (useAuth, useAdmin, useAdminData, etc.)
├── contexts/           # React contexts (EditModeContext)
├── lib/
│   ├── validations/    # Zod schemas (quoteFormSchema, serviceAgreementSchema)
│   └── utils.ts        # Utility functions
├── integrations/
│   └── supabase/
│       ├── client.ts   # Supabase client
│       └── types.ts    # Auto-generated types (DO NOT EDIT)
└── types/              # TypeScript definitions

supabase/
├── config.toml         # Supabase project config
├── migrations/         # 52 database migrations
└── functions/          # 12 Edge Functions
```

## Key Files

- **Entry**: `src/main.tsx`, `src/App.tsx`
- **Routing**: `src/App.tsx` (React Router v7)
- **Auth hook**: `src/hooks/useAuth.tsx`
- **Admin data**: `src/hooks/useAdminData.tsx`
- **Supabase types**: `src/integrations/supabase/types.ts` (auto-generated from DB)
- **Quote form**: `src/components/QuoteForm.tsx`
- **Validation schemas**: `src/lib/validations/`

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-key]
VITE_SUPABASE_PROJECT_ID=[project-id]
```

## Patterns

### Path Alias
`@/*` maps to `src/*`. Use `@/components/ui/button` instead of relative paths.

### Authentication & Roles
Four user roles via Supabase Auth:
- `platform_owner` - Full access, can edit content inline
- `admin` - Manages jobs, quotes, content
- `customer` - Views own data, submits quotes
- `worker` - Submits work, views assigned jobs

Check roles with `useAuth()` or `useAdmin()` hooks.

### Forms
Multi-step forms use React Hook Form with Zod schemas:
```typescript
import { quoteFormSchema } from '@/lib/validations/quoteFormSchema';
```

Norwegian-specific validation:
- Phone: exactly 8 digits
- Characters: æ, ø, å allowed in names

### Row-Level Security
Supabase RLS controls data access. Customers see only their data; admins see all.

### Edit Mode
Platform owners can toggle inline editing via `EditModeContext`. Content editable components check this context.

## Database

PostgreSQL via Supabase with key tables:
- `profiles` - User data
- `user_roles` - Role assignments
- `quotes` - Customer quote requests
- `jobs` - Work jobs
- `service_agreements` - Contracts
- `reviews` - Customer reviews (public_reviews view for privacy)
- `blog_posts`, `projects` - Content

Edge Functions handle email notifications and document generation.

## Development Notes

- **No test framework** - Tests not configured
- **Lenient TypeScript** - `strictNullChecks: false`, `noImplicitAny: false`
- **XSS protection** - DOMPurify sanitizes user content
- **Type generation** - `supabase/types.ts` is auto-generated; regenerate with Supabase CLI after schema changes
