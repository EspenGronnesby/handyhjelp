# Architectural Patterns

This document describes patterns used across multiple files in the HandyHjelp codebase.

## State Management

### React Query with Custom Hooks
Data fetching abstracted into custom hooks using `@tanstack/react-query`.

- `src/hooks/useUserProfile.tsx:24-60` - Query with 5-min staleTime
- `src/hooks/useEditableContent.tsx:9-30` - Query with cache invalidation
- `src/hooks/useDashboardStats.tsx:22-57` - Parallel queries via Promise.all

Pattern: Hooks return `{ data, isLoading, error }`. Use `enabled` flag for conditional fetching. Cache invalidation via `queryClient.invalidateQueries()`.

### Context for Global State
`EditModeContext` manages edit-mode state for platform owners.

- `src/contexts/EditModeContext.tsx:13-115` - Provider with role-based state
- `src/App.tsx:144` - Provider wrapping app

Pattern: Custom hook `useEditMode()` exposes `{ isEditMode, toggleEditMode, canEdit }`.

## Form Handling

### React Hook Form + Zod
Schema-driven validation with `zodResolver`.

- `src/components/ServiceAgreementForm.tsx:39-46` - useForm setup
- `src/lib/validations/serviceAgreementSchema.ts:12-111` - Schema with transforms
- `src/components/QuoteForm.tsx:100-139` - Manual step validation alternative

Pattern: Define Zod schema with `.transform()` for sanitization, use `zodResolver(schema)` in useForm.

### Multi-Step Form Hook
Reusable hook for wizard-style forms.

- `src/hooks/useMultiStepForm.tsx:21-70` - step, next, back, progress
- `src/components/ServiceAgreementForm.tsx:48-50` - Usage with onValidate

### Form Submission Wrapper
Generic async submission with loading state and toasts.

- `src/hooks/useFormSubmit.tsx:19-67` - Returns `{ submit, isSubmitting }`
- `src/components/ServiceAgreementForm.tsx:52-55` - Usage with options

## Authentication & Authorization

### Auth Session Management
Supabase auth listener pattern.

- `src/hooks/useAuth.tsx:10-27` - Auth state listener with cleanup
- `src/hooks/useAuth.tsx:30-80` - signIn, signUp, signOut methods

### Role-Based Access
Roles fetched from `user_roles` table: `platform_owner`, `admin`, `worker`, `moderator`, `user`.

- `src/hooks/useRole.tsx:24-90` - Query with computed flags
- `src/contexts/EditModeContext.tsx:38-41` - Role check for edit mode
- `src/pages/Dashboard.tsx:66-83` - Conditional nav based on role

Pattern: `useRole()` returns `{ isOwner, isAdmin, isWorker }`. Check flags before rendering protected UI.

### Route Protection
Pages check auth and redirect rather than using route guards.

- `src/pages/Dashboard.tsx:24-28` - useEffect redirect if not authenticated
- `src/pages/AdminDashboard.tsx:47` - useAdmin() check before render

## API Integration

### Supabase Client
Singleton client with typed queries.

- `src/integrations/supabase/client.ts:1-17` - Client initialization
- `src/hooks/useAdminData.tsx:21-34` - Parallel queries pattern
- `src/hooks/useEditableContent.tsx:42-87` - Upsert with error handling

### Edge Function Invocation
Non-blocking calls to Supabase Edge Functions.

- `src/hooks/useAdminData.tsx:79-86` - `.functions.invoke()` with .catch()
- `src/hooks/useWeb3Forms.tsx:31-111` - Multi-channel submission

Pattern: Fire-and-forget with `.catch(console.error)` for notifications.

### Realtime Subscriptions
Listen for database changes.

- `src/hooks/useLoyalty.tsx:106-140` - Channel with postgres_changes
- `src/hooks/useAuth.tsx:12-18` - Auth state subscription

Pattern: Create channel in useEffect, filter by user, return unsubscribe cleanup.

## Error Handling

### Error Boundary
Class component catching render errors.

- `src/components/ErrorBoundary.tsx:17-89` - getDerivedStateFromError pattern
- `src/components/ErrorBoundary.tsx:92-105` - withErrorBoundary HOC
- `src/App.tsx:90-92,99-101` - Boundary wrapping dashboards

### Try/Catch with Toast
Async error handling with user feedback.

- `src/hooks/useAdminData.tsx:101-111` - Pattern in each handler
- `src/hooks/useActivityLog.tsx:114-162` - Async error logging

Pattern: `try { await op() } catch (e) { toast({ variant: "destructive", ... }); console.error(e) }`

## Component Patterns

### Editable Wrapper
Overlay component enabling inline editing for owners.

- `src/components/EditableWrapper.tsx:20-141` - Wrapper with edit mode context
- `src/components/EditableWrapper.tsx:115-138` - Conditional modal rendering

Pattern: Wrap content, show edit button on hover when `canEdit && isEditMode`.

## Validation

### Zod Schema Patterns
Sanitization and Norwegian-specific validation.

- `src/lib/validations/serviceAgreementSchema.ts:3-5` - Sanitization helpers
- `src/lib/validations/serviceAgreementSchema.ts:7-10` - Norwegian regex
- `src/lib/validations/quoteFormSchema.ts:1-150` - Phone: 8 digits, æøå support

Pattern: `.transform(str => sanitize(str))` on string fields. `.refine()` for complex rules.

## Logging

### Activity Logging
Enriched audit trail for admin operations.

- `src/hooks/useActivityLog.tsx:106-162` - logActivity() fetches user context
- `src/hooks/useActivityLog.tsx:165-222` - useActivityLogs() with filters
- `src/hooks/useAdminData.tsx:89-94` - Usage after job operations

Pattern: Call `logActivity(action, category, metadata)` after mutations.
