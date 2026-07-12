---
name: refactor
description: "Analyze project architecture, find technical debt, create implementation plan, and refactor step by step with full validation after every change."
---

# Refactor Workflow

## Steps

1. **Analyze project** — understand the current architecture and codebase structure.
2. **Find all related files** — trace imports, exports, dependencies, and consumers.
3. **Explain current architecture** — document how the code works today.
4. **List technical debt** — identify anti-patterns, code smells, duplication, and violations.
5. **List risks** — document what could break, side effects, and migration concerns.
6. **Create implementation plan** — write a detailed step-by-step plan with file changes.
7. **Wait for confirmation** — do NOT proceed without user approval.
8. **Implement step by step** — make the smallest safe change at each step.
9. **After every step, run:**
   - `pnpm run lint`
   - `npx tsc --noEmit`
   - `pnpm run build`
   - Review (all 6 roles)
   - Performance review
   - Security review
10. **Stop only when everything passes.**

## Rules

- Never change more than 3–5 files per step.
- Never introduce new `any` types.
- Never skip validation.
- If a step fails validation, fix it before moving on.
- Document every architectural decision.
