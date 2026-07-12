---
name: performance
description: "Complete performance audit covering React rendering, bundle size, dynamic imports, image optimization, memory leaks, CPU usage, database queries, caching, network requests, hydration, SSR, streaming, and virtualization."
---

# Performance Workflow

## Checklist

Analyze and optimize each area:

1. **React rendering** — unnecessary re-renders, missing `memo`/`useMemo`/`useCallback`.
2. **Bundle size** — large dependencies, tree-shaking, code splitting.
3. **Dynamic imports** — lazy loading for routes, heavy components, libraries.
4. **Image optimization** — `next/image`, formats (WebP/AVIF), lazy loading, sizes.
5. **Memory leaks** — event listeners, intervals, subscriptions, refs, closures.
6. **CPU usage** — heavy computations on main thread, web workers opportunity.
7. **Database queries** — N+1, missing indexes, unnecessary joins, pagination.
8. **Caching** — API responses, static assets, React Query stale time, CDN.
9. **Network requests** — waterfall, parallel fetching, prefetching, deduplication.
10. **Hydration** — SSR mismatch, client-only code, hydration performance.
11. **SSR** — server component usage, data fetching strategy, streaming.
12. **Streaming** — React Suspense boundaries, progressive loading.
13. **Virtualization** — long lists, windowing, infinite scroll.

## Output

For every issue found:

- **What** — describe the problem
- **Where** — file and line
- **Impact** — estimated performance gain
- **Fix** — concrete solution

## Rules

- Measure before and after when possible.
- Focus on user-facing performance first.
- Do NOT micro-optimize at the cost of readability.
