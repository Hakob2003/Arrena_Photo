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

## Design Language & Patterns

### Bento Grid (Smart Resizing)

- Use Flexbox (`flex flex-wrap gap-4 lg:gap-6`) instead of strict CSS Grid (`grid-cols-12`) for Bento Grid wrappers.
- For Bento cards to smartly resize based on translated content (Armenian, Russian), use `flex-auto min-w-[200px]` (or similar `min-w-min`).
- Ensure titles and labels have `whitespace-nowrap` so they push the boundaries of their parent bento cards elegantly without wrapping.

### Glassmorphism

- Use deep dark backgrounds (`bg-[#0A0A0A]/80`) with strong backdrop blur (`backdrop-blur-2xl`).
- Add subtle borders (`border-white/5`) and soft, custom gradients (`from-purple-500/10 to-transparent`) for an inner glow effect.

### Modals / Dialogs

- The default Shadcn `DialogContent` restricts width to `sm:max-w-md` (448px).
- If a modal contains a wide table (e.g. `min-w-[700px]`), ALWAYS override the width explicitly using `w-[95vw] sm:max-w-4xl` to prevent content or buttons from overflowing outside the dark modal container.
- For wide tables, always wrap the `<Table>` component in `<div className="overflow-x-auto border rounded-md">`.

## Rules

- Do NOT touch backend files.
- Do NOT change API contracts.
- Prefer Server Components where possible.
- Use `useTranslation()` for all text (RU, EN, HY).
- Ensure no unnecessary re-renders.
