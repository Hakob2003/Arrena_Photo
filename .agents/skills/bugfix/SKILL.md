---
name: bugfix
description: "Systematic bug investigation and fix. Understand the bug, find root cause, choose the safest fix, implement, verify, and explain what caused the issue."
---

# Bugfix Workflow

## Steps

1. **Understand the bug** — read the error, reproduce the symptoms, gather context.
2. **Reproduce it** — find the exact steps or conditions that trigger the bug.
3. **Find root cause** — trace the execution path, check logs, inspect state.
4. **List possible fixes** — enumerate all options with trade-offs.
5. **Choose safest fix** — pick the fix with least side effects and risk.
6. **Implement** — apply the minimal change needed.
7. **Verify** — confirm the bug is fixed and no regressions introduced.
8. **Run validation:**
   - `pnpm run lint`
   - `npx tsc --noEmit`
   - `pnpm run build`
9. **Explain** — document what caused the issue, why, and how the fix works.

## Rules

- Never apply a fix you don't fully understand.
- Never suppress errors with `try/catch` without proper handling.
- Prefer fixing the root cause over patching symptoms.
- If the fix requires architectural changes, stop and create a plan first.
- Always check for similar bugs elsewhere in the codebase.
