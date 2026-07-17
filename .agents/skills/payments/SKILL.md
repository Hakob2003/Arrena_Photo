---
name: payments
description: Guidelines and architecture for implementing a secure, provider-independent payment system.
---

# Role
You are a Senior Payment Systems Engineer.
Your responsibility is to design and implement a secure, scalable, provider-independent payment architecture.
Always prioritize long-term maintainability over the quickest implementation.

# Main Goal
The payment system must be independent of any specific payment provider.
The user interface must belong entirely to Arrena Photo.
Stripe, Adyen, Braintree, PayPal, or any other provider are implementation details only.

# Core Principles
* Never tightly couple the frontend to Stripe.
* Never hardcode provider-specific logic into UI components.
* Use abstraction for every payment provider.
* Design for replacing providers without rewriting the frontend.
* Support sandbox and production environments.
* Keep payment logic isolated from business logic.

# Payment Flow
User
↓
Arrena Photo Payment UI
↓
Payment Service
↓
Payment Provider
↓
Bank
↓
Result

The provider must never control the website UI.

# Supported Payment Methods
Implement support for:
* Credit / Debit Cards
* Google Pay
* Apple Pay
* PayPal

Future-ready for:
* Adyen
* Checkout.com
* Braintree
* Fiserv
* Nuvei

# Google Pay
Requirements:
* Official Google Pay API
* Automatic availability detection
* Browser compatibility detection
* Wallet availability detection
* Test environment support
* Production support
* Graceful fallback
Never display Google Pay on unsupported devices.

# Apple Pay
Requirements:
* Official Apple Pay JS API
* Merchant Validation
* Browser detection
* Device detection
* Sandbox support
* Production support
Never display Apple Pay on unsupported devices.

# Card Payments
Cards are an independent payment method.
Only after selecting "Card" should the card form appear.
Never show the Stripe Card Element before the user chooses Card.

# PayPal
PayPal must be an independent payment method.
Do not mix PayPal with card payments.

# Provider Abstraction
Always implement:
PaymentProvider Interface
Example providers:
* StripeProvider
* AdyenProvider
* BraintreeProvider
* PayPalProvider
* MockProvider

Frontend communicates only with PaymentService.

# Architecture
Follow:
* SOLID
* Clean Architecture
* Dependency Injection
* Provider Pattern
* Strategy Pattern
* Interface Segregation
* Single Responsibility Principle

# Security
Always:
* Validate payment requests
* Verify payment status server-side
* Never trust client-side payment results
* Never expose secret keys
* Use idempotency for payment requests
* Validate webhook signatures
* Store only required payment metadata

# Stripe Rules
Stripe is only the first payment provider.
Never make architectural decisions that assume Stripe will always be used.
Do not expose Stripe-specific UI as the main payment interface.

# UX Rules
The payment selector belongs to Arrena Photo.
Example:
Choose Payment Method
✓ Card
✓ Google Pay
✓ Apple Pay
✓ PayPal
Only after selecting a payment method should the corresponding provider UI appear.

# Testing
Support:
* Stripe Test Mode
* Google Pay Test Environment
* Apple Pay Sandbox
* Mock Payment Provider
Testing must not require production credentials.

# Code Quality
Always write:
* TypeScript
* Strong typing
* Reusable components
* Small focused services
* Dependency Injection
* Error handling
* Logging
* Retry strategy where appropriate
Avoid duplicated payment logic.

# Forbidden
Never:
* Couple UI to Stripe
* Hardcode provider logic
* Duplicate payment flows
* Mix business logic with payment logic
* Store sensitive payment data
* Assume only one payment provider

# Stripe Wallet Integration Rules
When using raw wallet APIs (Apple Pay JS / Google Pay) via Stripe, always adhere to:
1. **Google Pay TEST Mode**: In `TEST` environment, the `merchantId` inside `merchantInfo` MUST be omitted or `undefined`, otherwise Google Pay throws `OR_BIBED_06`.
2. **Google Pay Tokenization**: For Stripe, strict tokenization parameters must be used:
   `gateway: 'stripe'`, `'stripe:version': '2023-10-16'`, and `'stripe:publishableKey': <key>`. Never use the standard `gatewayMerchantId` for Stripe.
3. **Backend Token Processing**: When passing the wallet token to the Stripe API on the backend, strictly use the object format: `payment_method_data: { type: 'card', card: { token: 'tok_xxx' } }`. Passing a raw string like `payment_method: 'tok_xxx'` will cause an error.
4. **Environment Variables**: The `STRIPE_PUBLISHABLE_KEY` MUST be present in the backend `.env` file so the backend can serve it to the frontend via API (e.g. `/payment/config`).
5. **Mocking Apple/Google Pay Tokens**: When creating mock sessions for Apple Pay or Google Pay during local development (to support unsupported browsers), NEVER generate a fake string like `tok_mock_apple_pay_xxx`. Stripe will reject it even in `TEST` mode. Always use valid Stripe test tokens (e.g., `tok_visa`) for the mock session to successfully complete the test payment.
6. **Wallet Subscriptions**: To process a subscription using an Apple Pay/Google Pay raw token, the backend must create a `PaymentMethod` from the token, attach it to the Stripe `Customer`, and then create a `Subscription` with that default payment method. The frontend should send a payload like `{ token, amount, type: 'SUBSCRIPTION', planName }`.

# Pricing Architecture
1. **Centralized Configuration**: NEVER hardcode prices, credits, or plan names in UI components (e.g., PaymentModal, PlansTab).
2. **Single Source of Truth**: Always extract packages and subscription plans into a single centralized configuration file (e.g., `config/pricing.ts`).
3. **Dynamic Evaluation**: The frontend should dynamically read from this config to determine the correct `amountUsd` to pass to the Wallet APIs or Payment UI. This ensures that users always see and pay the exact amount configured, without desyncs between components.

# Final Objective
Build a payment system that can switch from Stripe to another provider with minimal code changes while preserving the same Arrena Photo user experience.
