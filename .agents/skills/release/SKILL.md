---
name: release
description: "Pre-deployment checklist. Run lint, typecheck, build, tests, security review, performance review, dependency review, dead code review, and generate a final report before any deployment."
---

# Release Workflow

## Pipeline

Execute in strict order. Stop at first failure.

```
1. pnpm run lint
        ↓
2. npx tsc --noEmit
        ↓
3. pnpm run build
        ↓
4. pnpm test (if tests exist)
        ↓
5. Security Review
   - Check for vulnerable dependencies
   - Check for exposed secrets
   - Check for XSS/CSRF vectors
        ↓
6. Performance Review
   - Check bundle size
   - Check for heavy imports
   - Check for missing lazy loading
        ↓
7. Dependency Review
   - Check for outdated packages
   - Check for unused dependencies
   - Check for license issues
        ↓
8. Dead Code Review
   - Find unused exports
   - Find unused components
   - Find unused utilities
        ↓
9. Final Report
   - Summary of all checks
   - List of warnings
   - Go/No-Go recommendation
```

## Output

Create a release report artifact with:

- All check results (pass/fail)
- Warnings and recommendations
- Go/No-Go decision

Send the report to Telegram.

## Rules

- **NEVER** run `git push` — only the user can trigger deployment.
- If ANY check fails, the release is **blocked**.
- Document every warning, even non-blocking ones.
