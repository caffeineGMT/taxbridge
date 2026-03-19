# Screenshots Directory

This directory stores evidence screenshots for task completion verification.

## Stripe Production Activation Screenshots

**Required for P0-CRITICAL task**: Replace Stripe Production Keys

### Expected Files (12 screenshots total):

1. `stripe-mode-BEFORE.png` - Stripe dashboard showing "Test mode" indicator (before activation)
2. `stripe-mode-AFTER.png` - Stripe dashboard showing "Live mode" indicator (after activation)
3. `stripe-api-keys-LIVE.png` - Stripe API keys page showing pk_live_ and sk_live_ (secret hidden)
4. `stripe-products-LIVE.png` - Stripe Products page showing 3 products (Basic, Pro, Enterprise)
5. `stripe-webhook-LIVE.png` - Stripe Webhook configuration page
6. `vercel-env-vars-PRODUCTION.png` - Vercel environment variables (values blurred)
7. `vercel-deployment-SUCCESS.png` - Vercel deployment success page
8. `stripe-checkout-BEFORE.png` - Stripe checkout page before payment
9. `stripe-checkout-SUCCESS.png` - Success page after payment
10. `stripe-dashboard-payment-LIVE.png` - Stripe Dashboard showing payment entry
11. `stripe-refund-COMPLETE.png` - Refund confirmation
12. `stripe-webhook-events-LIVE.png` - Webhook events showing checkout.session.completed

## Directory Structure

```
docs/screenshots/
├── README.md (this file)
├── stripe-mode-BEFORE.png
├── stripe-mode-AFTER.png
├── stripe-api-keys-LIVE.png
├── stripe-products-LIVE.png
├── stripe-webhook-LIVE.png
├── vercel-env-vars-PRODUCTION.png
├── vercel-deployment-SUCCESS.png
├── stripe-checkout-BEFORE.png
├── stripe-checkout-SUCCESS.png
├── stripe-dashboard-payment-LIVE.png
├── stripe-refund-COMPLETE.png
└── stripe-webhook-events-LIVE.png
```

## Screenshot Guidelines

### What to Include
- Full browser window (showing URL bar)
- Current date/time visible
- Relevant UI elements clearly visible
- High resolution (at least 1280x720)

### What to Hide/Blur
- Secret keys (sk_live_..., whsec_...)
- Full credit card numbers (last 4 digits OK)
- Personal email addresses (if not @taxbridge.app)
- Full API tokens

### What to Show
- Publishable keys (pk_live_...) - safe to expose
- Price IDs (price_...) - safe to expose
- Product IDs (prod_...) - safe to expose
- Mode indicators ("Test mode" vs "Live mode")
- Success/confirmation messages

## How to Take Screenshots

### Mac
- Full screen: `Cmd + Shift + 3`
- Selected area: `Cmd + Shift + 4`
- Specific window: `Cmd + Shift + 4`, then press `Space`

### Windows
- Full screen: `PrtScn` or `Win + PrtScn`
- Selected area: `Win + Shift + S`

### Linux
- Full screen: `PrtScn`
- Selected area: `Shift + PrtScn`

## Verification

After uploading all screenshots, run:
```bash
npm run verify:task
```

This will check that all required screenshots exist and are properly named.

## Task Completion Policy

Per `docs/TASK_COMPLETION_POLICY.md`, tasks CANNOT be marked "done" without screenshot evidence. This directory provides the evidence required for verification.

---

**Last Updated**: 2026-03-19
**Purpose**: Task completion evidence storage
**Related**: `docs/STRIPE_PRODUCTION_ACTIVATION_CHECKLIST.md`
