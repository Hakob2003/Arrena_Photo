# Project Manifest

This file tracks all file backups and replacements as per the Backup Policy.

## 2026-07-21 16:33:41 (Admin UI Unification)

### Replaced

- `apps/frontend/app/ClientLayout.tsx` -> `replace/20260721-163341/ClientLayout.tsx`
- `apps/frontend/app/admin/layout.tsx` -> `replace/20260721-163341/layout.tsx`
- `apps/frontend/components/layout/Sidebar.tsx` -> `replace/20260721-163341/Sidebar.tsx`

### Deleted

- `apps/frontend/components/admin/AdminSidebar.tsx` -> `delete/20260721-163341/AdminSidebar.tsx`
- `apps/frontend/components/admin/AdminTopbar.tsx` -> `delete/20260721-163341/AdminTopbar.tsx`

# Manifest of Changes

## 2026-07-19 13:45 (Retroactive Backup)

### 1. Database Schema

- **Original file path:** `packages/database/prisma/schema.prisma`
- **Backup file path:** `/replace/schema_2026-07-19_13-45.prisma`
- **Operation:** Replace
- **Action performed:** Removed `@default(uuid())` from `PaymentHistory.id`, added `cardBrand` and `cardLast4` fields.
- **Reason:** Enable custom user-based transaction IDs and store Stripe card details for receipts.

### 2. Payment Service

- **Original file path:** `apps/backend-api/src/payment/payment.service.ts`
- **Backup file path:** `/replace/payment.service_2026-07-19_13-45.ts`
- **Operation:** Replace
- **Action performed:** Added `generateTransactionId` method and explicitly applied it to `PaymentHistory` creations.
- **Reason:** Generate short, readable transaction IDs associated with user IDs.

### 3. PDF Service

- **Original file path:** `apps/backend-api/src/payment/pdf.service.ts`
- **Backup file path:** `/replace/pdf.service_2026-07-19_13-45.ts`
- **Operation:** Replace
- **Action performed:** Added multi-language support (i18n) and dynamically fetch/display Stripe card info on PDF receipts.
- **Reason:** Fulfill user request for payment receipts with card info.

### 4. Stripe Webhook Controller

- **Original file path:** `apps/backend-api/src/payment/stripe-webhook.controller.ts`
- **Backup file path:** `/replace/stripe-webhook.controller_2026-07-19_13-45.ts`
- **Operation:** Replace
- **Action performed:** Extract `cardBrand` and `cardLast4` from Stripe's `charge.succeeded` event and store in `PaymentHistory`.
- **Reason:** Persist card info for PDF receipt generation.

### 5. Admin Service

- **Original file path:** `apps/backend-api/src/admin/admin.service.ts`
- **Backup file path:** `/replace/admin.service_2026-07-19_13-45.ts`
- **Operation:** Replace
- **Action performed:** Added `{ id: { contains: search, mode: "insensitive" } }` to user search query `where.OR`.
- **Reason:** Enable admin search by custom user transaction prefix (`6D8A29`).

## 2026-07-19 15:32

### 1. Render Blueprint Config

- **Original file path:** `render.yaml`
- **Backup file path:** `/replace/render.yaml_2026-07-19_15-32.yaml`
- **Operation:** Replace
- **Action:** Added STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- **Reason:** To automatically set missing Stripe variables on Render using Blueprints.

## 2026-07-19 17:15

### 1. Auto-seed PlanConfigs

- **Original file path:** `apps/backend-api/src/billing/billing.service.ts`
- **Backup file path:** `/replace/billing.service_2026-07-19_17-15.ts`
- **Operation:** Replace
- **Action:** Added `OnModuleInit` hook to automatically upsert default `PlanConfig` models on server startup.
- **Reason:** To fix `Plan PRO not found` (and other plans) error in production by ensuring the Stripe Price IDs exist in the remote database.

## 2026-07-20 10:39

### 1. Fix mobile edge swipe sensitivity for Sidebar

- **Original file path:** `apps/frontend/app/ClientLayout.tsx`
- **Backup file path:** `/replace/ClientLayout.tsx_2026-07-20_10-39.tsx`
- **Operation:** Replace
- **Action:** Restricted sidebar open logic to only trigger when swiping from the very left edge of the screen (`touchStartX < 60`) and ensure the swipe is clearly horizontal (ratio > 1.5).
- **Reason:** To prevent accidental sidebar openings when scrolling horizontally in menus like billing and profile.

## 2026-07-20 16:32

### 1. Add System Audit Feature

- **Original file paths:**
  - `apps/backend-api/src/admin/admin.service.ts`
  - `apps/backend-api/src/admin/admin.controller.ts`
  - `apps/frontend/lib/admin.api.ts`
  - `apps/frontend/components/admin/SystemAuditModal.tsx`
  - `apps/frontend/app/admin/audit-logs/page.tsx`
  - `apps/frontend/lib/i18n/en.ts`
  - `apps/frontend/lib/i18n/ru.ts`
  - `apps/frontend/lib/i18n/hy.ts`
- **Action:** Created System Audit endpoint, UI modal, and translations.
- **Reason:** To allow administrators to perform health checks (DB, Stripe config, etc) directly from the dashboard.

## 2026-07-21 06:16

### 1. Fix Dev Environment & Build Constraints

- **Operation:** Backups created before modifying configs across monorepo.
- **Action performed:** Backed up package.json and eslint.config.mjs across workspaces.
- **Reason:** To address Node v24 constraints and ESLint 10 flat config issues.

## 2026-07-21 14:17

### 1. System Audit Revamp Retroactive Backup

- **Original file paths:**
  - `apps/backend-api/src/admin/admin.service.ts`
  - `apps/backend-api/src/admin/admin.module.ts`
  - `apps/backend-api/src/admin/admin.controller.ts`
  - `apps/frontend/lib/admin.api.ts`
  - `apps/frontend/components/admin/SystemAuditModal.tsx`
- **Backup file path:** `/replace/*_202607211417`
- **Operation:** Replace
- **Action performed:** Complete overhaul of System Audit module.
- **Reason:** Upgraded audit module to production-grade E2E diagnostics.

- Backup schema.prisma to replace/schema.prisma_20260721151331
- Backup app.module.ts to replace/app.module.ts_20260721151331
- [20260722_000701] Backed up apps\frontend\app\admin\users\page.tsx to f:\Arrena_Photo\replace\20260722_000701\page.tsx before Bento Grid refactor.
- [20260722_000701] Backed up apps\frontend\app\admin\analytics\page.tsx to f:\Arrena_Photo\replace\20260722_000701\page.tsx before Bento Grid refactor.
- [20260722_000701] Backed up apps\frontend\app\admin\templates\page.tsx to f:\Arrena_Photo\replace\20260722_000701\page.tsx before Bento Grid refactor.
