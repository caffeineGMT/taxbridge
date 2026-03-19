# Stripe Production Mode - Quick Verification Checklist

**Date:** 2026-03-19
**Task:** [P0-CRITICAL] Stripe Production Mode - FINAL VERIFICATION

Print this checklist and check off each item as you complete it.

## 1. Environment Variables ✓

- [ ] .env.production file exists
- [ ] STRIPE_SECRET_KEY starts with `sk_live_`
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY starts with `pk_live_`
- [ ] STRIPE_WEBHOOK_SECRET starts with `whsec_`
- [ ] STRIPE_BASIC_PRICE_ID starts with `price_`
- [ ] STRIPE_PRO_PRICE_ID starts with `price_`
- [ ] No placeholder values (no "YOUR_" strings)

## 2. Vercel Environment Variables ✓

- [ ] Login to Vercel: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
- [ ] All Stripe keys set with "Production" scope
- [ ] Screenshot saved: docs/screenshots/vercel-env-vars-YYYY-MM-DD.png

## 3. Stripe Dashboard - Mode Toggle ✓

- [ ] Login to Stripe: https://dashboard.stripe.com/dashboard
- [ ] Toggle in top-left shows "Production" (NOT "Test mode")
- [ ] Screenshot saved: docs/screenshots/stripe-production-mode-YYYY-MM-DD.png

## 4. Stripe Dashboard - API Keys ✓

- [ ] Open: https://dashboard.stripe.com/apikeys
- [ ] "Viewing test data" toggle is OFF
- [ ] Publishable key starts with `pk_live_`
- [ ] Secret key starts with `sk_live_` (revealed)
- [ ] Screenshot saved (with secret key blurred): docs/screenshots/stripe-api-keys-YYYY-MM-DD.png

## 5. Stripe Dashboard - Products/Prices ✓

- [ ] Open: https://dashboard.stripe.com/products
- [ ] "Viewing test data" toggle is OFF
- [ ] Product exists: TaxBridge Basic ($49/year)
- [ ] Product exists: TaxBridge Pro ($79/year)
- [ ] Both price IDs start with `price_`
- [ ] Screenshot saved: docs/screenshots/stripe-products-YYYY-MM-DD.png

## 6. Stripe Dashboard - Webhook ✓

- [ ] Open: https://dashboard.stripe.com/webhooks
- [ ] "Viewing test data" toggle is OFF
- [ ] Endpoint URL: https://taxbridge.vercel.app/api/stripe/webhook
- [ ] Events selected (7 total):
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed
  - [ ] charge.refunded
- [ ] Signing secret starts with `whsec_`
- [ ] Screenshot saved: docs/screenshots/stripe-webhook-YYYY-MM-DD.png

## 7. Test Payment - $1 Checkout ✓

- [ ] Visit: https://taxbridge.vercel.app/pricing
- [ ] Click "Subscribe to Pro"
- [ ] Stripe Checkout loads
- [ ] Fill form with test card: 4242 4242 4242 4242
- [ ] Payment succeeds ($79.00)
- [ ] Redirected back to site
- [ ] Screenshots saved (7 total):
  - [ ] 01-pricing-page.png
  - [ ] 02-stripe-checkout.png
  - [ ] 03-success-page.png
  - [ ] 04-stripe-payment.png
  - [ ] 05-webhook-events.png
  - [ ] 06-refund-confirmation.png
  - [ ] 07-refund-webhook.png

## 8. Stripe Dashboard - Verify Payment ✓

- [ ] Open: https://dashboard.stripe.com/payments
- [ ] Payment shows: $79.00 Succeeded
- [ ] Customer: test@example.com

## 9. Stripe Dashboard - Verify Webhooks ✓

- [ ] Open: https://dashboard.stripe.com/webhooks
- [ ] Click webhook endpoint
- [ ] Recent events tab shows:
  - [ ] checkout.session.completed → 200 OK
  - [ ] customer.subscription.created → 200 OK
  - [ ] invoice.payment_succeeded → 200 OK

## 10. REFUND Test Payment ✓

- [ ] Open payment in Stripe dashboard
- [ ] Click "Refund"
- [ ] Full refund: $79.00
- [ ] Refund confirmed
- [ ] Refund webhook received: charge.refunded → 200 OK

## 11. Documentation ✓

- [ ] All screenshots captured (minimum 10 total)
- [ ] Screenshots organized in docs/screenshots/
- [ ] Verification report created
- [ ] Task marked complete with evidence

## Final Verification

- [ ] ALL 70+ items above checked ✓
- [ ] No placeholder environment variables remain
- [ ] Stripe dashboard shows "Production" mode
- [ ] Test payment succeeded and refunded
- [ ] Webhook events all returned 200 OK
- [ ] Screenshot evidence saved

## Status

**Automated checks:** Run `npm run verify:stripe:final`

**Manual checks:** Complete this checklist

**Evidence:** Save all screenshots to `docs/screenshots/`

**Task completion:** ✅ Only after ALL items checked

---

**Completion Date:** _______________

**Completed By:** _______________

**Evidence Location:** docs/screenshots/stripe-verification-[DATE]/

**Task ID:** [P0-CRITICAL] Stripe Production Mode - FINAL VERIFICATION