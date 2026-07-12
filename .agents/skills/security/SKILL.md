---
name: security
description: "Complete security audit covering JWT, XSS, CSRF, SQL injection, Prisma safety, rate limiting, secrets, environment variables, permissions, input validation, and output escaping."
---

# Security Workflow

## Checklist

Analyze and verify each area:

1. **JWT** — expiration, refresh tokens, storage (httpOnly cookies vs localStorage), validation.
2. **XSS** — user input rendering, `dangerouslySetInnerHTML`, sanitization.
3. **CSRF** — token validation, SameSite cookies, origin checks.
4. **SQL Injection** — raw queries, parameterized queries, Prisma safety.
5. **Prisma safety** — `$queryRaw` usage, input validation before queries.
6. **Rate limiting** — API endpoints, login attempts, brute force protection.
7. **Secrets** — hardcoded keys, `.env` files, git history, client-side exposure.
8. **Environment variables** — `NEXT_PUBLIC_` prefix awareness, server-only secrets.
9. **Permissions** — authorization checks, role-based access, resource ownership.
10. **Input validation** — server-side validation, schema validation (Zod/Joi), sanitization.
11. **Output escaping** — HTML escaping, JSON escaping, URL encoding.

## Output

For every vulnerability found:

- **Severity** — Critical / High / Medium / Low
- **Vector** — how it can be exploited
- **Location** — file and line
- **Fix** — concrete remediation

## Rules

- Never log sensitive data.
- Never expose stack traces to the client.
- Always validate on the server, never trust the client.
- Report findings even if exploitation seems unlikely.
