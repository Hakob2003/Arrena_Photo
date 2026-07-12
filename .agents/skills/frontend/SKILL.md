---
name: frontend
description: "Frontend-only workflow. Analyze and improve UI, UX, accessibility, animations, responsiveness, and design consistency. Do not touch backend code."
---

# Frontend Workflow

## Scope

Work only on frontend. Do NOT modify backend, API, or database code.

## Steps

1. **Analyze UI** — review current component structure, layout, visual hierarchy.
2. **Improve UX** — user flows, loading states, error states, empty states, feedback.
3. **Improve Accessibility** — ARIA labels, keyboard navigation, focus management, contrast.
4. **Improve animations** — transitions, micro-interactions, loading indicators, scroll effects.
5. **Improve responsiveness** — mobile, tablet, desktop breakpoints, touch targets.
6. **Improve consistency** — design tokens, spacing, typography, color palette.
7. **Keep design system** — use existing components, do not create duplicates.

## Validation

After every change:

- `pnpm run lint`
- `npx tsc --noEmit`
- `pnpm run build`
- Visual review in browser

## Rules

- Do NOT touch backend files.
- Do NOT change API contracts.
- Prefer Server Components where possible.
- Use `useTranslation()` for all text (RU, EN, HY).
- Ensure no unnecessary re-renders.
