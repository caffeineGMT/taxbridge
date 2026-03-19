# 📸 STRIPE DASHBOARD SCREENSHOT VERIFICATION CHECKLIST

**Purpose**: Visual verification that Stripe is in LIVE mode (not TEST mode)
**Time Required**: 10 minutes
**Prerequisites**: Access to Stripe Dashboard (https://dashboard.stripe.com)

---

## 🎯 REQUIRED SCREENSHOTS (5 Total)

### Screenshot 1: Mode Indicator
**Location**: Top-left corner of Stripe Dashboard
**What to Capture**:
```
┌─────────────────────────────────────┐
│ [Stripe Logo]  [🔴 Test mode ▼]    │  ← SHOULD BE "Live mode" NOT "Test mode"
│                 ^^^^^^^^^            │
│           CAPTURE THIS TOGGLE        │
└─────────────────────────────────────┘
```

**Instructions**:
1. Login to https://dashboard.stripe.com
2. Look at top-left corner
3. Screenshot the mode toggle switch
4. **VERIFY**: It says "Live mode" (NOT "Test mode")

**Filename**: `stripe-mode-indicator.png`

---

### Screenshot 2: API Keys
**Location**: Developers → API Keys (https://dashboard.stripe.com/apikeys)
**What to Capture**:
```
┌────────────────────────────────────────────────────────┐
│ Standard keys                                           │
│                                                         │
│ Publishable key                                         │
│ pk_live_51ABcDEf...XYZ1234  [Reveal]  [Roll]          │
│ ^^^^^^^                                                 │
│ VERIFY: Starts with pk_live_ (NOT pk_test_)           │
│                                                         │
│ Secret key                                              │
│ sk_live_51ABcDEf...•••••••  [Reveal]  [Roll]          │
│ ^^^^^^^                                                 │
│ VERIFY: Starts with sk_live_ (NOT sk_test_)           │
└────────────────────────────────────────────────────────┘
```

**Instructions**:
1. Navigate to: Developers → API Keys
2. **DO NOT REVEAL** the full secret key in screenshot
3. Capture the key prefixes (first 10-15 characters visible)
4. **VERIFY**: Both keys start with `pk_live_` and `sk_live_`

**Filename**: `stripe-api-keys-redacted.png`

---

### Screenshot 3: Products & Prices
**Location**: Products (https://dashboard.stripe.com/products)
**What to Capture**:
```
┌────────────────────────────────────────────────────────┐
│ Products                         [+ New]                │
│                                                         │
│ ✓ TaxBridge Basic - $49/year                          │
│   ID: price_1ABcDEf...                                 │
│   Active • Recurring • Annual                          │
│                                                         │
│ ✓ TaxBridge Pro - $79/year                            │
│   ID: price_1DEfGHi...                                 │
│   Active • Recurring • Annual                          │
│                                                         │
│ ✓ TaxBridge Enterprise - $299/year                    │
│   ID: price_1GHiJKl...                                 │
│   Active • Recurring • Annual                          │
└────────────────────────────────────────────────────────┘
```

**Instructions**:
1. Navigate to: Products
2. Verify 3 products exist with annual pricing
3. Screenshot the product list
4. **COPY** the price IDs (starting with `price_1...`)

**Filename**: `stripe-products-list.png`

**Action Required**: Update `.env.production` with these price IDs

---

### Screenshot 4: Webhooks
**Location**: Developers → Webhooks (https://dashboard.stripe.com/webhooks)
**What to Capture**:
```
┌────────────────────────────────────────────────────────┐
│ Endpoints                            [+ Add endpoint]  │
│                                                         │
│ ✓ https://taxbridgecpa.com/api/stripe/webhook         │
│   whsec_ABC...XYZ                                      │
│   Enabled • 5 events                                   │
│   Last delivery: Success (just now)                    │
│                                                         │
│   Events: checkout.session.completed,                  │
│           customer.subscription.created,               │
│           customer.subscription.updated,               │
│           customer.subscription.deleted,               │
│           invoice.payment_failed                       │
└────────────────────────────────────────────────────────┘
```

**Instructions**:
1. Navigate to: Developers → Webhooks
2. Verify webhook exists for production domain
3. Check webhook signing secret (starts with `whsec_`)
4. Screenshot the webhook configuration

**Filename**: `stripe-webhook-config.png`

**Action Required**: Update `.env.production` with webhook secret

---

### Screenshot 5: Test Payment
**Location**: Payments (https://dashboard.stripe.com/payments)
**What to Capture**:
```
┌────────────────────────────────────────────────────────┐
│ Payments                             [Live mode ▼]     │
│                                                         │
│ ✓ $79.00 • Succeeded • Just now                       │
│   TaxBridge Pro - Annual Subscription                  │
│   Card •••• 4242                                       │
│   test@example.com                                     │
│   Payment ID: pi_ABC123...                             │
│   [Refund] [Send receipt]                              │
│                                                         │
│   Status: ✓ Succeeded                                  │
│   Refunded: $79.00 (just now)                          │
└────────────────────────────────────────────────────────┘
```

**Instructions**:
1. Complete test payment on production site
2. Use card: 4242 4242 4242 4242
3. Verify payment appears in Stripe Dashboard → Payments
4. **IMMEDIATELY REFUND** the test payment
5. Screenshot showing both payment success AND refund

**Filename**: `stripe-test-payment-refunded.png`

---

## 📋 FILE EVIDENCE CHECKLIST

### `.env.production` (Redacted)
**Location**: `/Users/michaelguo/hivemind-projects/cross-border-tax/.env.production`

**Show ONLY**:
```bash
# REDACTED FOR SECURITY - Show first 15 chars only
STRIPE_SECRET_KEY=sk_live_51ABcDE...***REDACTED***
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51ABcDE...***REDACTED***
STRIPE_WEBHOOK_SECRET=whsec_ABcDE...***REDACTED***

# Price IDs can be shown in full (not sensitive)
STRIPE_BASIC_PRICE_ID=price_1ABcDEfGHiJKlMNoPQrSt
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_1ABcDEfGHiJKlMNoPQrSt
STRIPE_PRO_PRICE_ID=price_1DEfGHiJKlMNoPQrStUvWx
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1DEfGHiJKlMNoPQrStUvWx
STRIPE_ENTERPRISE_PRICE_ID=price_1GHiJKlMNoPQrStUvWxYz
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_1GHiJKlMNoPQrStUvWxYz
```

**Instructions**:
1. Open `.env.production` in code editor
2. Copy first 15 characters of each key
3. Replace rest with `...***REDACTED***`
4. Save as: `env-production-redacted.txt`

---

## 🔍 VERCEL ENVIRONMENT VARIABLES VERIFICATION

### Required Screenshot
**Location**: Vercel Dashboard → Project Settings → Environment Variables
**URL**: https://vercel.com/[your-account]/[project-name]/settings/environment-variables

**What to Capture**:
```
┌────────────────────────────────────────────────────────┐
│ Environment Variables                                   │
│                                                         │
│ Production                                              │
│                                                         │
│ STRIPE_SECRET_KEY                                      │
│ sk_live_51ABcDE...•••••••                              │
│ ^^^^^^^                                                 │
│ VERIFY: Starts with sk_live_ (NOT sk_test_)           │
│                                                         │
│ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY                     │
│ pk_live_51ABcDE...                                     │
│ ^^^^^^^                                                 │
│ VERIFY: Starts with pk_live_ (NOT pk_test_)           │
│                                                         │
│ STRIPE_PRO_PRICE_ID                                    │
│ price_1DEfGHi...                                       │
│                                                         │
│ (... other variables ...)                              │
└────────────────────────────────────────────────────────┘
```

**Instructions**:
1. Login to Vercel
2. Navigate to project settings
3. Click "Environment Variables"
4. Filter by "Production" environment
5. Screenshot showing Stripe variables
6. **VERIFY**: Keys start with `sk_live_` and `pk_live_`

**Filename**: `vercel-env-vars-production.png`

---

## ✅ VERIFICATION CHECKLIST

Complete this checklist with screenshot evidence:

- [ ] **Screenshot 1**: Stripe mode indicator shows "Live mode" ✓
  - File: `stripe-mode-indicator.png`
  - Status: LIVE (not TEST)

- [ ] **Screenshot 2**: API keys show `pk_live_` and `sk_live_` prefixes ✓
  - File: `stripe-api-keys-redacted.png`
  - Publishable key prefix: `pk_live_51...`
  - Secret key prefix: `sk_live_51...`

- [ ] **Screenshot 3**: Products exist with annual pricing ✓
  - File: `stripe-products-list.png`
  - Basic Plan price ID: `price_1_________`
  - Pro Plan price ID: `price_1_________`
  - Enterprise Plan price ID: `price_1_________`

- [ ] **Screenshot 4**: Webhook configured for production domain ✓
  - File: `stripe-webhook-config.png`
  - Endpoint URL: `https://taxbridgecpa.com/api/stripe/webhook`
  - Webhook secret prefix: `whsec_...`
  - Events configured: 5+ events

- [ ] **Screenshot 5**: Test payment succeeded and refunded ✓
  - File: `stripe-test-payment-refunded.png`
  - Payment amount: $79.00 (or $49.00 for Basic)
  - Payment status: Succeeded → Refunded
  - Card used: •••• 4242

- [ ] **File Evidence**: `.env.production` updated with live keys ✓
  - File: `env-production-redacted.txt`
  - Secret key starts with: `sk_live_51...`
  - Publishable key starts with: `pk_live_...`
  - Price IDs copied from Stripe Dashboard

- [ ] **Vercel Evidence**: Production environment variables set ✓
  - File: `vercel-env-vars-production.png`
  - `STRIPE_SECRET_KEY` starts with: `sk_live_51...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with: `pk_live_...`

---

## 🚨 RED FLAGS (FAILURE INDICATORS)

**DO NOT mark complete if ANY of these are true**:

❌ **Mode indicator says "Test mode"**
- Dashboard is in test mode
- All transactions will be fake
- No real money can be processed

❌ **API keys start with `sk_test_` or `pk_test_`**
- Test keys cannot process real payments
- Must use LIVE keys

❌ **No products exist in Stripe**
- Users cannot subscribe
- Checkout will fail
- Must run product creation script

❌ **No webhook configured**
- Subscription events won't be received
- User access won't be granted after payment
- Must create webhook endpoint

❌ **Vercel env vars still have placeholders**
- Production deployment won't work
- Must update ALL 9 Stripe environment variables

❌ **Test payment failed**
- Integration is broken
- Must debug before marking complete

---

## 📁 EVIDENCE SUBMISSION FORMAT

Create a folder: `docs/stripe-verification-evidence/`

```
stripe-verification-evidence/
├── stripe-mode-indicator.png
├── stripe-api-keys-redacted.png
├── stripe-products-list.png
├── stripe-webhook-config.png
├── stripe-test-payment-refunded.png
├── vercel-env-vars-production.png
└── env-production-redacted.txt
```

**Commit message**:
```bash
git add docs/stripe-verification-evidence/
git commit -m "[P0] Stripe Production Verification Evidence - LIVE mode confirmed"
git push origin main
```

---

## 🎯 SUCCESS CRITERIA

Task is ONLY complete when:

1. ✅ All 5 screenshots taken and saved
2. ✅ All screenshots show LIVE mode (not test)
3. ✅ Keys start with `sk_live_` and `pk_live_`
4. ✅ 3 products exist with annual pricing
5. ✅ Webhook configured for production domain
6. ✅ Test payment succeeded using card 4242...
7. ✅ Test payment immediately refunded
8. ✅ Evidence committed to repository

**Time Estimate**: 10-15 minutes (assuming Stripe is already activated)
**Blocker**: If mode shows "Test mode", Stripe is NOT activated - see main report for activation steps

---

**Next Step**: If verification FAILS (Test mode detected), follow the 8-step activation checklist in `STRIPE_PRODUCTION_VERIFICATION_REPORT.md`
