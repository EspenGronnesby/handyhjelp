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

<!-- 
ADD NEW LESSONS BELOW

Use the format above. Keep it short and concrete.
-->
