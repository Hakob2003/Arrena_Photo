---
name: backend
description: "Backend-only workflow. Review and improve API design, Prisma usage, database queries, validation, logging, transactions, concurrency, and error handling. Do not modify frontend code."
---

# Backend Workflow

## Scope

Work only on backend. Do NOT modify frontend, UI, or client-side code.

## Steps

1. **Review API** — RESTful design, versioning, response format, status codes, documentation.
2. **Review Prisma** — model design, relations, migrations, query efficiency, type safety.
3. **Review database** — schema normalization, indexes, constraints, data integrity.
4. **Review validation** — input validation (DTOs), schema validation, sanitization.
5. **Review logging** — structured logging, log levels, sensitive data filtering.
6. **Review transactions** — atomicity, rollback handling, concurrent access.
7. **Review concurrency** — race conditions, deadlocks, queue processing.
8. **Review error handling** — error types, HTTP status codes, user-facing messages, logging.

## Validation

After every change:

- `pnpm run lint`
- `npx tsc --noEmit`
- `pnpm run build`
- Test API endpoints manually or with existing tests

## Rules

- Do NOT modify frontend files.
- Do NOT change API contracts without documenting breaking changes.
- Always validate on the server side.
- Never expose internal errors to clients.
- Use Prisma transactions for multi-step operations.
