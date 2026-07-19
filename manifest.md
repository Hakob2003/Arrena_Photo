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
