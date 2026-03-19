# Stripe Production Activation Guide

**Priority:** P0-CRITICAL - REVENUE BLOCKER
**Time Required:** 30-45 minutes
**Impact:** Unblocks 100% of revenue capability
**Status:** ⏳ PENDING ACTIVATION

---

## Why This Matters

TaxBridge has been in **TEST MODE** for 8+ sprints, meaning:
- ❌ $0 revenue (cannot accept real payments)
- ❌ All transactions use test cards only
- ❌ No actual money can flow through the system
- ❌ Product Hunt launch blocked
- ❌ Marketing campaigns wasted (traffic can't convert to revenue)

**This single task unblocks the entire revenue pipeline.**

---

## Quick Start (Recommended)

We've built an **interactive wizard** that guides you through every step, validates your inputs, and auto-generates evidence for task completion.

### Option A: Interactive Wizard (30-45 min)

```bash
npm run stripe:activate
```

The wizard will:
1. ✅ Guide you through getting Stripe LIVE keys
2. ✅ Create products and prices in Stripe automatically
3. ✅ Help configure webhook endpoint
4. ✅ Provide exact values for Vercel environment variables
5. ✅ Walk through payment testing
6. ✅ Generate evidence report for task completion

**Advantages:**
- Step-by-step prompts (no guessing)
- Real-time validation (catches errors immediately)
- Auto-generates evidence report
- One-command execution
- Cannot skip critical steps

**Just run it and follow the prompts. Everything else is automated.**

---

## Option B: Manual Step-by-Step (45-60 min)

If you prefer manual execution or the wizard fails, follow these steps:

### Step 1: Get Stripe LIVE API Keys (5 min)

1. Open: https://dashboard.stripe.com/apikeys
2. **CRITICAL:** Toggle from "Test" to "Production" mode (top-right corner)
3. Find "Secret key" → Click "Reveal live key token"
4. Copy the key (starts with `sk_live_...`)
5. Find "Publishable key" → Copy (starts with `pk_live_...`)

**Validation:**
- ✅ Secret key format: `sk_live_[50+ characters]`
- ✅ Publishable key format: `pk_live_[50+ characters]`
- ❌ If you see `sk_test_` or `pk_test_`, you're in TEST mode (go back to step 2)

---

### Step 2: Create Products & Price IDs (10 min)

Run the product creation script:

```bash
export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE
npx tsx scripts/activate-stripe-production-annual.ts
```

This creates 3 products in Stripe:
- **Basic Plan:** $49/year (5 RSU entries)
- **Pro Plan:** $79/year (unlimited RSUs)
- **Enterprise Plan:** Custom pricing

**Script Output:**
The script will print price IDs like:
```
STRIPE_BASIC_PRICE_ID=price_1ABC123...
STRIPE_PRO_PRICE_ID=price_1DEF456...
STRIPE_ENTERPRISE_PRICE_ID=prod_1GHI789...
```

**Copy these values** - you'll need them in Step 4.

**Verify in Stripe:**
1. Open: https://dashboard.stripe.com/products
2. You should see 3 products: TaxBridge Basic, Pro, Enterprise

---

### Step 3: Configure Webhook Endpoint (10 min)

1. Open: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL:
   ```
   https://taxbridge.vercel.app/api/stripe/webhook
   ```
4. Description: `TaxBridge Production Webhook`
5. Click "Select events" → Choose:
   - ✓ `checkout.session.completed`
   - ✓ `customer.subscription.created`
   - ✓ `customer.subscription.updated`
   - ✓ `customer.subscription.deleted`
   - ✓ `invoice.payment_succeeded`
   - ✓ `invoice.payment_failed`
6. Click "Add endpoint"
7. Click "Reveal" to show webhook signing secret
8. Copy the secret (starts with `whsec_...`)

---

### Step 4: Update Vercel Environment Variables (15 min)

1. Open: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
2. Add these 9 variables (scope: **Production only**):

```bash
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET

STRIPE_BASIC_PRICE_ID=price_YOUR_BASIC_PRICE_ID
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_YOUR_BASIC_PRICE_ID

STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID

STRIPE_ENTERPRISE_PRICE_ID=prod_YOUR_ENTERPRISE_PRODUCT_ID
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=prod_YOUR_ENTERPRISE_PRODUCT_ID
```

**Critical:** Make sure environment scope is **Production** (not Preview or Development).

3. After adding all variables, trigger a new deployment:
   - Vercel should auto-deploy when you add variables
   - If not, go to Deployments → Click "Redeploy"
   - Wait ~2-3 minutes for deployment to complete

---

### Step 5: Test Payment Flow (10 min)

**⚠️  WARNING: This is LIVE mode. You will create a REAL charge. Refund it immediately.**

1. Open: https://taxbridge.vercel.app/pricing
2. Click "Subscribe" on Pro plan ($79/year)
3. Sign up or sign in
4. At Stripe checkout, use **test card**:
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/28 (any future date)
   CVC: 123 (any 3 digits)
   ZIP: 12345 (any 5 digits)
   ```
5. Complete checkout
6. Verify redirect to success page

**Verify in Stripe:**
1. Open: https://dashboard.stripe.com/payments
2. You should see the $79.00 payment
3. Click on the payment → Click "Refund" → Full refund

**Verify Webhook:**
1. Open: https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint
3. You should see "checkout.session.completed" event
4. Status should be "Succeeded"

---

### Step 6: Verify Revenue Tracking (5 min)

1. Open: https://dashboard.stripe.com/dashboard
2. Check "Recent payments" - you should see your test payment (refunded)
3. Check "Customers" - you should see your test customer
4. Check "Subscriptions" - subscription should show as cancelled (due to refund)

---

## Evidence Collection (Required)

To mark this task as COMPLETE, you must provide:

### Screenshot 1: Stripe Dashboard in LIVE Mode
- URL: https://dashboard.stripe.com/dashboard
- Must show mode toggle set to "Production"
- Must show recent test payment

**File:** `docs/screenshots/stripe-live-mode-dashboard-YYYY-MM-DD.png`

### Screenshot 2: Successful Test Payment
- URL: https://dashboard.stripe.com/payments
- Must show $79.00 payment with status "Refunded"

**File:** `docs/screenshots/stripe-test-payment-success-YYYY-MM-DD.png`

### Screenshot 3: Webhook Delivery Success
- URL: https://dashboard.stripe.com/webhooks
- Must show "checkout.session.completed" event with status "Succeeded"

**File:** `docs/screenshots/stripe-webhook-success-YYYY-MM-DD.png`

---

## Verification Commands

After completing all steps, run these verification commands:

### Verify Stripe Mode
```bash
npm run verify:stripe:mode
```

Should output:
```
✅ STRIPE_SECRET_KEY: LIVE MODE (sk_live_...)
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: LIVE MODE (pk_live_...)
```

### Verify All Environment Variables
```bash
npm run verify:stripe
```

Should output all 9 variables with ✅ checkmarks.

### Test Payment Flow (Integration Test)
```bash
npm run test:payment-flow
```

Should complete without errors.

---

## Troubleshooting

### Issue: "Invalid API key"
**Cause:** Using test key instead of live key
**Fix:** Make sure you toggled to "Production" mode in Stripe dashboard

### Issue: "Product already exists"
**Cause:** Script run multiple times
**Fix:** Check https://dashboard.stripe.com/products - use existing price IDs

### Issue: "Webhook not receiving events"
**Cause:** Incorrect endpoint URL or events not selected
**Fix:**
1. Verify endpoint URL: `https://taxbridge.vercel.app/api/stripe/webhook`
2. Check events are selected (checkout.session.completed, etc.)
3. Test webhook using "Send test event" in Stripe dashboard

### Issue: "Deployment not picking up new env vars"
**Cause:** Vercel cache or deployment scope mismatch
**Fix:**
1. Verify env vars are set to "Production" scope (not Preview)
2. Trigger manual redeploy
3. Check deployment logs for env var loading

---

## Success Criteria

✅ Stripe dashboard shows "Production" mode
✅ 3 products created (Basic $49, Pro $79, Enterprise custom)
✅ Webhook endpoint configured with 6 events
✅ 9 environment variables set in Vercel Production
✅ Test payment completed and refunded
✅ Webhook delivered successfully
✅ All verification scripts pass
✅ 3 screenshots captured as evidence

**When all criteria met → Revenue is UNBLOCKED 🎉**

---

## Next Steps After Activation

1. **Monitor First Real Payment:**
   - Set up Stripe email alerts
   - Watch https://dashboard.stripe.com/dashboard

2. **Customer Support Readiness:**
   - Test cancellation flow
   - Test refund process
   - Document common payment issues

3. **Revenue Optimization:**
   - Monitor conversion rate (signup → paid)
   - A/B test pricing ($49 vs $79 vs $99)
   - Add payment plan options if needed

---

## Time Breakdown

| Task | Time |
|------|------|
| Get Stripe LIVE keys | 5 min |
| Create products/prices | 10 min |
| Configure webhook | 10 min |
| Update Vercel env vars | 15 min |
| Test payment flow | 10 min |
| Verify & screenshot | 5 min |
| **TOTAL** | **30-45 min** |

---

## Support

**Questions?** Check:
1. Stripe documentation: https://stripe.com/docs
2. Vercel env vars guide: https://vercel.com/docs/environment-variables
3. Existing scripts in `scripts/` directory

**Script Issues?**
- Run with `--help` flag for usage info
- Check script source code for debugging
- Verify Node.js version: `node --version` (should be 18+)

---

*Last Updated: 2026-03-19*
*Task: [P0-CRITICAL] Replace Stripe Production Keys - REVENUE BLOCKER (8th Sprint)*
