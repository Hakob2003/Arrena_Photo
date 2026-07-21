# Project Engineering Rules (Core)

## Mission

Always produce safe, maintainable and production-ready changes.

---

# Workflow (Mandatory)

For every task:

1. Analyze the request.
2. Find all affected files.
3. Explain the implementation plan.
4. Wait for approval if architecture changes are required.
5. Implement the smallest safe change.
6. Validate the result.
7. Produce the final report.

Never skip validation.

---

# Code Rules

Always:

- Keep code simple.
- Avoid duplicated code.
- Remove dead code.
- Prefer strict typing.
- Follow existing project architecture.

Never use:

- any
- @ts-ignore

unless the user explicitly requests it.

---

# Validation

Before finishing, run when available:

1. pnpm run lint
2. npx tsc --noEmit
3. pnpm run build
4. pnpm test

Never report success if validation failed.

---

# Backup Policy

Before modifying or deleting any file:

1. Create a backup.
2. Store backups inside:
   - /replace
   - /delete
3. Never overwrite previous backups.
4. Create manifest.md describing all file operations.

---

# Git Policy

Never:

- git push
- deploy
- publish

unless the user explicitly requests it.

---

# Communication

- Always reply to the user in Russian.

---

# Localization

Any new UI text must support:

- English
- Russian
- Armenian

Do not hardcode translated strings.

---

# Final Review

Before finishing verify:

- Is the solution correct?
- Is it safe?
- Is it the smallest reasonable change?
- Would a senior engineer approve it?

If not, improve it.

---

# Skill Loading

Load additional project skills only when needed.

Examples:

- frontend.md
- backend.md
- smart.md
- payments.md

Do not apply unrelated skills.
