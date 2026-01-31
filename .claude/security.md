# Security Audit Instructions

> **Stack:** Lovable Cloud (Vite frontend) + Supabase (Auth, Database, Storage) + GitHub
> **Principle:** All security is enforced server-side. Frontend code is always public.

---

## 1. FALSE POSITIVES - DO NOT FLAG

The following patterns are **normal and expected**. Do not flag them as security issues.

### 1.1 Database roles and authorization patterns

These are standard database security patterns, not vulnerabilities:

```sql
-- ✅ NORMAL: Role enums and columns
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'user';

-- ✅ NORMAL: Role-based policies
CREATE POLICY "admin_access" ON table_name
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ✅ NORMAL: Policy names containing "admin"
CREATE POLICY "admin_only_delete" ON sensitive_data FOR DELETE
  USING (is_admin(auth.uid()));
```

```typescript
// ✅ NORMAL: Role checks in application code
if (user.role === 'admin') { showAdminPanel(); }
const isAdmin = profile?.role === 'admin';
const hasAccess = ['admin', 'moderator'].includes(userRole);
```

### 1.2 Public Supabase configuration

These are **designed to be public** in Supabase architecture:

| Item | Status | Reason |
|------|--------|--------|
| `VITE_SUPABASE_URL` | ✅ Public OK | Project identifier, protected by RLS |
| `VITE_SUPABASE_ANON_KEY` | ✅ Public OK | Limited permissions, RLS enforced |
| `VITE_*` variables | ✅ Public OK | Frontend configuration by design |
| Supabase project ID | ✅ Public OK | Equivalent to a domain name |

### 1.3 Code patterns that look dangerous but aren't

```typescript
// ✅ NORMAL: Variable/type names with "secret", "key", "token", "password"
interface ApiKey { id: string; name: string; created_at: Date; }
const TOKEN_EXPIRY = 3600;
const passwordInputRef = useRef<HTMLInputElement>(null);
type SecretQuestion = { question: string; answer: string; };

// ✅ NORMAL: Environment variable REFERENCES
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const apiEndpoint = process.env.NEXT_PUBLIC_API_URL;

// ✅ NORMAL: Auth-related code
const { data: { session } } = await supabase.auth.getSession();
headers: { 'Authorization': `Bearer ${session.access_token}` }

// ✅ NORMAL: Comments and documentation
// This function validates the API key format
// TODO: Add secret rotation logic
```

### 1.4 Test and mock data

```typescript
// ✅ NORMAL: Test fixtures with fake data
const mockUser = { id: 'test-123', role: 'admin', email: 'test@test.com' };
const TEST_API_KEY = 'test_key_not_real';
```

---

## 2. ACTUAL SECURITY ISSUES - FLAG THESE

### 2.1 Hardcoded secrets (CRITICAL)

```typescript
// 🔴 CRITICAL: Actual API keys in code
const STRIPE_KEY = "sk_live_abc123def456...";  // Real key pattern
const serviceRole = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";  // JWT

// 🔴 CRITICAL: Service role in frontend
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);
```

**How to identify real secrets:**
- Long alphanumeric strings (32+ characters)
- Patterns: `sk_live_*`, `sk_test_*`, `ghp_*`, `glpat-*`
- JWTs: strings starting with `eyJ`
- Private keys: `-----BEGIN PRIVATE KEY-----`

### 2.2 Missing or broken RLS (CRITICAL)

```sql
-- 🔴 CRITICAL: Table without RLS
-- (Check: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public')

-- 🔴 CRITICAL: Policy allows everything
CREATE POLICY "bad_policy" ON users FOR SELECT USING (true);

-- 🔴 CRITICAL: User can set their own ID on insert
CREATE POLICY "insert" ON posts FOR INSERT WITH CHECK (true);
-- Should be: WITH CHECK (auth.uid() = user_id)
```

### 2.3 XSS vulnerabilities (HIGH)

```tsx
// 🔴 HIGH: Unsanitized user content
<div dangerouslySetInnerHTML={{ __html: userInput }} />
<div dangerouslySetInnerHTML={{ __html: comment.body }} />

// ✅ SAFE: Sanitized content
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

### 2.4 Sensitive data logging (MEDIUM)

```typescript
// 🔴 MEDIUM: Logging sensitive data
console.log('Session:', session);
console.log('User data:', user);
console.log('Request body:', req.body);
console.log('Error:', error);  // May expose stack traces

// ✅ SAFE: Non-sensitive logging
console.log('Action completed:', actionType);
console.log('User ID:', userId);
```

### 2.5 Storage misconfigurations (HIGH)

```sql
-- 🔴 HIGH: Private files in public bucket
-- Check: SELECT id, name, public FROM storage.buckets;

-- 🔴 HIGH: No policies on private bucket
-- Check: SELECT * FROM storage.policies WHERE bucket_id = 'documents';
```

### 2.6 Rate limiting & abuse (HIGH)

Check for these vulnerabilities, especially on public-facing features:

```typescript
// 🔴 HIGH: Edge Function without rate limiting
// supabase/functions/send-email/index.ts - no rate limit = spam risk

// 🔴 HIGH: Public form without protection
// Contact forms, quote requests callable without limits

// 🔴 HIGH: Unauthenticated writes
// INSERT allowed without auth.uid() check
```

**What to check:**
- Edge Functions: Do they have rate limiting?
- Public forms: Can they be abused for spam?
- Third-party services (Resend, Web3Forms): Are API keys protected server-side?
- Unauthenticated endpoints: Can they be called infinitely?

**Solutions:**
- Add rate limiting to Edge Functions (use Upstash Redis or similar)
- Use honeypot fields or CAPTCHA on public forms
- Move API keys to Edge Functions (never in frontend)
- Add request throttling for unauthenticated endpoints

---

## 3. DECISION LOGIC

When evaluating potential security issues, follow this order:

```
1. Is it in the FALSE POSITIVES list above?
   → YES: Ignore completely
   → NO: Continue to step 2

2. Is it an actual secret value (not a variable name or reference)?
   → YES: Flag as CRITICAL
   → NO: Continue to step 3

3. Does it involve user data being exposed without authorization?
   → YES: Flag based on severity
   → NO: Continue to step 4

4. Can it be abused at scale (spam, cost, DoS)?
   → YES: Flag as HIGH (rate limiting issue)
   → NO: Likely not a security issue
```

### Severity classification

| Severity | Criteria | Action |
|----------|----------|--------|
| 🔴 CRITICAL | Data breach possible, secrets exposed | Must fix before launch |
| 🟠 HIGH | Significant risk, XSS, missing RLS, abuse vectors | Should fix before launch |
| 🟡 MEDIUM | Limited risk, logging issues | Fix soon after launch |
| 🔵 LOW | Best practice improvements | Fix when convenient |

---

## 4. AUDIT PROCEDURE

### 4.1 Automated scans

```bash
# Secrets scan (should return 0 results for real secrets)
grep -rn --include="*.{ts,tsx,js,jsx,json}" \
  -E "(sk_live_|sk_test_|eyJhbGci|-----BEGIN|service_role.*=.*['\"]ey)" .

# Check for .env files not in .gitignore
find . -name ".env*" -type f -exec echo "Found: {}" \;

# Check git history for leaked secrets
git log --all -p | grep -E "(sk_live_|sk_test_|service_role)" | head -20

# XSS scan
grep -rn "dangerouslySetInnerHTML" --include="*.tsx" --include="*.jsx" .

# Dependency audit
npm audit --audit-level=high
```

### 4.2 Manual checks

**Supabase Dashboard:**
- [ ] Authentication → URL Configuration (verify redirect URLs)
- [ ] Database → All tables have RLS enabled
- [ ] Storage → Private buckets have policies
- [ ] API Settings → service_role key not exposed

**Code review:**
- [ ] No hardcoded credentials
- [ ] All `dangerouslySetInnerHTML` uses sanitization
- [ ] No sensitive data in console.log statements
- [ ] Environment variables properly prefixed

**Edge Functions & Forms:**
- [ ] Edge Functions have rate limiting
- [ ] Public forms have spam protection
- [ ] Third-party API keys are server-side only
- [ ] Unauthenticated endpoints are throttled

### 4.3 Post-build verification

```bash
npm run build
# Search built files for secrets
grep -rn "service_role\|sk_live\|sk_test" dist/
# Should return empty
```

---

## 5. REPORT FORMAT

```markdown
# Security Audit Report

**Date:** YYYY-MM-DD
**Auditor:** Claude Code
**Project:** [name]

## Summary
- Critical: X
- High: Y
- Medium: Z
- Risk level: [Low/Medium/High]
- Recommendation: [Go/No-go for launch]

## 🔴 Critical Findings
### [Finding title]
- **File:** `path/to/file.ts:42`
- **Issue:** [Description]
- **Risk:** [What could happen]
- **Fix:** [Specific solution]

## 🟠 High Findings
[Same format]

## 🟡 Medium Findings
[Same format]

## ✅ Verified Secure
- [x] No hardcoded secrets in codebase
- [x] RLS enabled on all public tables
- [x] Storage buckets properly configured
- [x] Auth redirect URLs restricted
- [x] No XSS vulnerabilities found
- [x] Rate limiting on public endpoints
- [x] Form spam protection in place

## Required Environment Variables
| Variable | Location | Purpose |
|----------|----------|---------|
| VITE_SUPABASE_URL | Frontend | Project URL |
| VITE_SUPABASE_ANON_KEY | Frontend | Public API key |
```

---

## 6. QUICK REFERENCE

### Always ignore
- Role enums (`'admin'`, `'user'`, `'moderator'`)
- Policy names containing "admin"
- `VITE_*` environment variables
- Type/interface definitions with "secret"/"key" in name
- Environment variable references (not values)
- Test/mock data

### Always flag
- Actual API key values (long alphanumeric strings)
- `service_role` key in frontend code
- JWTs hardcoded in source
- Tables without RLS
- `dangerouslySetInnerHTML` without DOMPurify
- `console.log` with session/token objects
- Edge Functions without rate limiting
- Public forms without spam protection

### Context matters
- `role === 'admin'` → Security feature, not vulnerability
- `admin_email` column → Schema design, not exposure
- `CREATE POLICY "admin_only"` → Just a policy name
- `const API_KEY = process.env.VITE_API_KEY` → Reference is OK
