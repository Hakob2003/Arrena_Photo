---
name: review
description: "Pretend another Senior Engineer wrote the code. Review it as if it goes to production tomorrow. Find bugs, architecture problems, performance issues, security issues, maintainability issues, and TypeScript/React/Next.js/Prisma issues. Implement improvements and repeat until no issues remain."
---

# Review Workflow

## Mindset

**Forget that you wrote this code.**

Pretend another Senior Engineer wrote it. Review as if this code will go into production tomorrow. **Reject every questionable solution.**

## Checklist

Find and report:

1. **Bugs** — logic errors, edge cases, race conditions, null checks.
2. **Architecture problems** — coupling, cohesion, responsibility violations, circular dependencies.
3. **Performance issues** — unnecessary renders, missing memoization, heavy computations, N+1 queries.
4. **Security issues** — XSS, CSRF, injection, exposed secrets, missing auth checks.
5. **Maintainability issues** — readability, naming, complexity, documentation, dead code.
6. **TypeScript issues** — `any` usage, missing types, type assertions, incorrect generics.
7. **React issues** — missing keys, effect dependencies, state management, component design.
8. **Next.js issues** — routing, SSR/SSG misuse, data fetching patterns, middleware.
9. **Prisma issues** — query efficiency, missing includes, transaction safety, schema design.

## Process

1. Review the code.
2. List all issues found.
3. Suggest improvements for each issue.
4. **Implement the improvements.**
5. Run validation:
   - `pnpm run lint`
   - `npx tsc --noEmit`
   - `pnpm run build`
6. **Repeat from step 1** until no issues remain.

## Rules

- Be ruthless. Production code must be excellent.
- Never approve code with known issues.
- If you find yourself saying "it's fine for now" — it's NOT fine.
- Every cycle must reduce the issue count to zero.
