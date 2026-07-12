---
name: audit
description: "Perform a complete project audit across architecture, frontend, backend, database, security, performance, accessibility, SEO, testing, DX, and code style. Report every problem with severity, explanation, solution, priority, and expected impact."
---

# Audit Workflow

## Scope

Perform a complete project audit. Review every aspect:

1. **Architecture** — module boundaries, dependency graph, coupling, cohesion.
2. **Frontend** — React patterns, component design, state management, rendering.
3. **Backend** — API design, validation, error handling, business logic.
4. **Database** — schema design, queries, indexes, migrations, Prisma usage.
5. **Security** — XSS, CSRF, JWT, CORS, input validation, secrets, dependencies.
6. **Performance** — bundle size, render count, queries, caching, memory leaks.
7. **Accessibility** — ARIA, keyboard navigation, screen readers, contrast.
8. **SEO** — meta tags, heading structure, semantic HTML, sitemap, robots.
9. **Testing** — coverage, edge cases, integration tests, E2E.
10. **DX** — developer experience, documentation, tooling, onboarding.
11. **Code Style** — consistency, naming, formatting, comments.

## Output Format

For every problem found, provide:

| Field               | Description                    |
| ------------------- | ------------------------------ |
| **Severity**        | Critical / High / Medium / Low |
| **Explanation**     | What is wrong and why          |
| **Solution**        | How to fix it                  |
| **Priority**        | P0 / P1 / P2 / P3              |
| **Expected Impact** | What improves after the fix    |

## Rules

- Do NOT make any code changes during audit.
- Create the audit report as an artifact.
- Send the report to Telegram.
- Wait for user to decide which issues to fix.
