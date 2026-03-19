# Stripe Dashboard Screenshot Guide

**Purpose:** Visual guide for verifying Stripe production mode

---

## Screenshot 1: Live Mode Indicator

**Location:** https://dashboard.stripe.com/dashboard

**What to Screenshot:**
```
┌─────────────────────────────────────────┐
│ [Stripe Logo]  [Production ▼]  [Search]│  ← Top navigation bar
└─────────────────────────────────────────┘
```

**Look For:**
- ✅ **"Production"** with green/blue indicator (top-left corner)
- ❌ **"Test Data"** with orange indicator = FAILED

**Save As:** `docs/screenshots/stripe-live-mode-indicator.png`

---

## Screenshot 2: API Keys Page

**Location:** https://dashboard.stripe.com/apikeys

**What to Screenshot:**
```
┌─────────────────────────────────────────────┐
│ API Keys                                     │
│                                              │
│ Mode: ● Production                           │  ← Verify this shows "Production"
│                                              │
│ Publishable key                              │
│ pk_live_51ABC...XYZ                         │  ← Should start with pk_live_
│                                              │
│ Secret key                                   │
│ sk_live_••••••••••••ABC                     │  ← Should start with sk_live_ (hidden)
│ [Reveal test key]                            │
└─────────────────────────────────────────────┘
```

**Look For:**
- ✅ Mode toggle shows "Production"
- ✅ Publishable key starts with `pk_live_`
- ✅ Secret key starts with `sk_live_` (partially hidden for security)

**Verification:**
1. Copy the secret key (click "Reveal")
2. Compare first 20 characters to Vercel `STRIPE_SECRET_KEY`
3. **Must match exactly**

**Save As:** `docs/screenshots/stripe-api-keys-production.png`

---

## Screenshot 3: Products Page

**Location:** https://dashboard.stripe.com/products

**What to Screenshot:**
```
┌──────────────────────────────────────────────────┐
│ Products                                          │
│                                                   │
│ [Active] TaxBridge Basic                         │
│          $49.00 per year                          │
│          Price ID: price_1QRdEb...               │  ← Copy this
│                                                   │
│ [Active] TaxBridge Pro                           │
│          $79.00 per year                          │
│          Price ID: price_1QRdFc...               │  ← Copy this
│                                                   │
│ [Active] TaxBridge Enterprise                    │
│          Custom                                   │
│          Product ID: prod_1QRdGd...              │  ← Copy this
└──────────────────────────────────────────────────┘
```

**Look For:**
- ✅ 3 products exist: Basic ($49), Pro ($79), Enterprise (custom)
- ✅ All products show [Active] status
- ✅ Price IDs start with `price_` or `prod_`

**Verification:**
1. Copy each price ID
2. Compare to Vercel environment variables:
   - `STRIPE_BASIC_PRICE_ID` should match Basic price ID
   - `STRIPE_PRO_PRICE_ID` should match Pro price ID
   - `STRIPE_ENTERPRISE_PRICE_ID` should match Enterprise product ID
3. **Must match exactly**

**If products don't exist:**
Run: `npx tsx scripts/activate-stripe-production-annual.ts`

**Save As:** `docs/screenshots/stripe-products-list.png`

---

## Screenshot 4: Webhook Endpoint

**Location:** https://dashboard.stripe.com/webhooks

**What to Screenshot:**
```
┌──────────────────────────────────────────────────┐
│ Webhooks                                          │
│                                                   │
│ [✓] https://taxbridge.vercel.app/api/stripe/... │  ← Your endpoint
│     Status: Enabled                               │
│     Events: 7 events                              │
│                                                   │
│     Events to send:                               │
│     • checkout.session.completed                  │
│     • customer.subscription.created               │
│     • customer.subscription.updated               │
│     • customer.subscription.deleted               │
│     • invoice.payment_succeeded                   │
│     • invoice.payment_failed                      │
│     • charge.refunded                             │
│                                                   │
│     Recent deliveries:                            │
│     2026-03-19 16:45  200  checkout.session...   │  ← Green checkmark
│     2026-03-19 16:45  200  customer.subscri...   │
│     2026-03-19 16:45  200  invoice.payment_...   │
└──────────────────────────────────────────────────┘
```

**Look For:**
- ✅ Endpoint URL matches: `https://taxbridge.vercel.app/api/stripe/webhook`
- ✅ Status: **Enabled**
- ✅ 7 events configured (see list above)
- ✅ Recent deliveries show **200** status (green checkmarks)
- ❌ If recent deliveries show 4xx/5xx errors (red X) = FAILED

**Verification:**
1. Click endpoint → "Signing secret" → Reveal
2. Copy the `whsec_...` secret
3. Compare to Vercel `STRIPE_WEBHOOK_SECRET`
4. **Must match exactly**

**If endpoint doesn't exist:**
Create webhook (see `docs/STRIPE_PRODUCTION_CTO_CHECKLIST.md` Step 4)

**Save As:** `docs/screenshots/stripe-webhook-configured.png`

---

## Screenshot 5: Test Payment Success

**Location:** https://dashboard.stripe.com/payments

**What to Screenshot (After Test Payment):**
```
┌──────────────────────────────────────────────────┐
│ Payments                                          │
│                                                   │
│ 2026-03-19  $79.00  Succeeded  [test@exam...]   │  ← Your test payment
│                                                   │
│ Click payment for details:                        │
│                                                   │
│ Amount: $79.00 USD                                │
│ Status: ✓ Succeeded                               │
│ Customer: cus_ABC123 (test@example.com)          │  ← New customer
│ Subscription: sub_XYZ789 (TaxBridge Pro)         │  ← Active subscription
│ Payment method: •••• 4242 (Test card)            │
└──────────────────────────────────────────────────┘
```

**Look For:**
- ✅ Payment shows "Succeeded" status
- ✅ Amount is $79.00 (Pro plan)
- ✅ Customer created with your test email
- ✅ Subscription shows "TaxBridge Pro"
- ✅ Payment method ends with 4242 (test card)

**CRITICAL: Immediately Refund After Screenshot**
1. Click payment → "Refund" button
2. Select: Full refund ($79.00)
3. Reason: "Test transaction"
4. Confirm refund

**Save As:** `docs/screenshots/stripe-test-payment-success.png`

---

## Screenshot 6: Customers Page

**Location:** https://dashboard.stripe.com/customers

**What to Screenshot (After Test Payment):**
```
┌──────────────────────────────────────────────────┐
│ Customers                                         │
│                                                   │
│ test@example.com                                  │  ← Your test email
│ Customer ID: cus_ABC123                           │
│ Balance: $0.00                                    │
│                                                   │
│ Subscriptions:                                    │
│ ✓ TaxBridge Pro - $79.00/year                    │  ← Active subscription
│   Status: Active                                  │
│   Next invoice: 2027-03-19                        │
└──────────────────────────────────────────────────┘
```

**Look For:**
- ✅ Customer exists with your test email
- ✅ Subscription status: **Active**
- ✅ Product: TaxBridge Pro
- ✅ Amount: $79.00/year

**After Screenshot: Cancel Subscription**
1. Click customer → Subscriptions tab
2. Click subscription → Actions → Cancel immediately
3. Confirm cancellation

**Save As:** `docs/screenshots/stripe-customer-created.png`

---

## Verification Summary Checklist

After taking all screenshots, verify:

| Screenshot | Requirement | Pass/Fail |
|------------|-------------|-----------|
| #1 Live Mode | Shows "Production" (not "Test Data") | ☐ |
| #2 API Keys | Shows `sk_live_` and `pk_live_` | ☐ |
| #3 Products | 3 products exist with correct prices | ☐ |
| #4 Webhook | Endpoint configured with 7 events | ☐ |
| #5 Payment | Test payment succeeded | ☐ |
| #6 Customer | Customer created with active subscription | ☐ |

**All ✅ = Stripe is in Production Mode**
**Any ❌ = Configuration incomplete**

---

## File Organization

Save all screenshots to:
```
docs/screenshots/
├── stripe-live-mode-indicator.png
├── stripe-api-keys-production.png
├── stripe-products-list.png
├── stripe-webhook-configured.png
├── stripe-test-payment-success.png
└── stripe-customer-created.png
```

Create directory if needed:
```bash
mkdir -p docs/screenshots
```

---

## What to Do With Screenshots

1. **Save all 6 screenshots** to `docs/screenshots/`
2. **Verify all checkboxes** in summary checklist above
3. **If all pass:**
   - Update task status to ✅ COMPLETE
   - Notify team: "Stripe production verified - revenue enabled"
   - Enable marketing campaigns

4. **If any fail:**
   - Follow fix instructions in: `docs/STRIPE_PRODUCTION_CTO_CHECKLIST.md`
   - Re-test after fixes
   - Take new screenshots

---

## Security Note

**Do NOT commit screenshots containing:**
- Full API keys (always redact/blur)
- Customer emails (unless test emails)
- Webhook secrets (redact)

**Safe to show:**
- "Production" mode indicator ✅
- First/last 4 characters of API keys ✅
- Price IDs ✅
- Webhook endpoint URL ✅
- Test card numbers (4242...) ✅

---

**Next Step:** Take these 6 screenshots and complete verification checklist

**Questions?** See full report: `docs/STRIPE_MODE_VERIFICATION_FINAL_REPORT.md`
