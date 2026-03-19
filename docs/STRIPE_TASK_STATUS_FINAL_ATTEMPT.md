# STRIPE PRODUCTION KEYS - TASK STATUS

**Task ID**: P0-CRITICAL
**Date**: 2026-03-19
**Time**: 9:00 PM PST (Due)
**Sprint**: 19 (8th attempt at this same task)
**Status**: ⏸️ **BLOCKED - REQUIRES MANUAL HUMAN ACTION**

---

## ⚠️ CRITICAL LIMITATION

**This task CANNOT be completed by an AI assistant.**

### Why?

This task requires three actions that ONLY a human with account access can perform:

1. **Login to Stripe Dashboard**
   → Requires human authentication (password, 2FA)
   → AI cannot access external web services

2. **Copy Production API Keys**
   → Requires human to click "Reveal" and copy sk_live_... key
   → AI cannot interact with web dashboards

3. **Update Vercel Environment Variables**
   → Requires login to Vercel dashboard
   → AI cannot modify Vercel settings

---

## ✅ WHAT I DID (AI Assistant)

I've provided everything possible to support manual completion:

### 1. Verified Current Status ✅

Ran verification script:
```bash
npm run verify:stripe-production
```

**Result**: ❌ 7/9 checks FAILED - ALL keys are placeholders

```
✗ STRIPE_SECRET_KEY = sk_live_YOUR_LIVE_SECRET_KEY_HERE (PLACEHOLDER)
✗ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE (PLACEHOLDER)
✗ STRIPE_WEBHOOK_SECRET = whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE (PLACEHOLDER)
✗ STRIPE_BASIC_PRICE_ID = price_YOUR_LIVE_BASIC_PRICE_ID (PLACEHOLDER)
✗ STRIPE_PRO_PRICE_ID = price_YOUR_LIVE_PRO_PRICE_ID (PLACEHOLDER)
✗ STRIPE_ENTERPRISE_PRICE_ID = prod_YOUR_LIVE_ENTERPRISE_PRODUCT_ID (PLACEHOLDER)
```

### 2. Confirmed Documentation Exists ✅

All necessary guides are already in place:

- ✅ `docs/STRIPE_PRODUCTION_CTO_CHECKLIST.md` (30-minute step-by-step)
- ✅ `docs/STRIPE_PRODUCTION_EXECUTIVE_SUMMARY.md` (comprehensive overview)
- ✅ `docs/STRIPE_PRODUCTION_TESTING_GUIDE.md` (testing instructions)
- ✅ `docs/STRIPE_WEBHOOK_VERIFICATION.md` (webhook setup)
- ✅ `scripts/activate-stripe-production-annual.ts` (automated price creation)
- ✅ `scripts/verify-stripe-production.ts` (verification script)

### 3. Created Verification Tools ✅

Scripts to verify completion:

```bash
# Check Stripe configuration status
npm run verify:stripe-production

# Run end-to-end smoke test
npm run test:smoke-e2e

# Verify correct app is deployed
npm run verify:deployment
```

---

## 📋 WHAT YOU NEED TO DO (Human - Michael)

Follow this exact sequence:

### Step 1: Login to Stripe (3 minutes)

1. Go to: https://dashboard.stripe.com/apikeys
2. Click toggle in top-left: Switch from "Test" → **"Production"**
3. Screenshot the dashboard showing "Production" mode
4. Save as: `docs/screenshots/stripe-production-mode-2026-03-19.png`

### Step 2: Copy API Keys (2 minutes)

From Stripe dashboard:

1. **Secret Key**: Click "Reveal" → Copy the `sk_live_...` key (108 characters)
2. **Publishable Key**: Copy the `pk_live_...` key (108 characters)

Screenshot both keys (with last 4 digits visible) as evidence.
Save as: `docs/screenshots/stripe-api-keys-2026-03-19.png`

### Step 3: Create Price IDs (5 minutes)

Run the automated setup script:

```bash
# Set your live secret key (from Step 2)
export STRIPE_SECRET_KEY=sk_live_PASTE_YOUR_ACTUAL_KEY_HERE

# Verify it's set correctly
echo $STRIPE_SECRET_KEY | head -c 10
# Should print: sk_live_51

# Run setup script to create products and prices
npx tsx scripts/activate-stripe-production-annual.ts
```

The script will output:
```
✅ SUCCESS! Created in LIVE mode:
- Basic Plan: price_ABC123 ($49/year)
- Pro Plan: price_XYZ789 ($79/year)
```

**Save this output** - you'll need the price IDs for Step 4.

### Step 4: Update Vercel Environment Variables (10 minutes)

1. Go to: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables

2. Update these 6 variables (select "Production" environment):

   | Variable | Value | Source |
   |----------|-------|--------|
   | `STRIPE_SECRET_KEY` | `sk_live_...` | Step 2 |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Step 2 |
   | `STRIPE_BASIC_PRICE_ID` | `price_...` | Step 3 output |
   | `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID` | `price_...` | Step 3 output |
   | `STRIPE_PRO_PRICE_ID` | `price_...` | Step 3 output |
   | `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | `price_...` | Step 3 output |

3. Screenshot Vercel showing all 6 variables set
4. Save as: `docs/screenshots/vercel-stripe-env-vars-2026-03-19.png`

### Step 5: Create Webhook Endpoint (5 minutes)

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Configure:
   - **URL**: `https://taxbridge.vercel.app/api/stripe/webhook`
   - **Events to send**: Select these 7:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `charge.refunded`
4. Click "Add endpoint"
5. Click "Signing secret" → "Reveal" → Copy `whsec_...`
6. Add to Vercel: `STRIPE_WEBHOOK_SECRET=whsec_...`
7. Screenshot webhook configuration
8. Save as: `docs/screenshots/stripe-webhook-config-2026-03-19.png`

### Step 6: Redeploy Production (3 minutes)

1. Go to: https://vercel.com/caffeineGMT/taxbridge/deployments
2. Click latest deployment → "..." → "Redeploy"
3. Wait 2-3 minutes for completion

### Step 7: Verify Everything Works (5 minutes)

Run verification script:

```bash
npm run verify:stripe-production
```

**Expected output:**
```
✅ STRIPE_SECRET_KEY: sk_live_... (LIVE MODE)
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_live_... (LIVE MODE)
✅ STRIPE_WEBHOOK_SECRET: whsec_...
✅ STRIPE_BASIC_PRICE_ID: price_...
✅ STRIPE_PRO_PRICE_ID: price_...

✅ STRIPE PRODUCTION MODE: ACTIVE
🚀 Revenue is LIVE!
```

If you see this: **TASK COMPLETE!**

---

## 📸 EVIDENCE REQUIREMENTS (Per Task Completion Policy)

Before marking this task "DONE", commit ALL of these:

1. ✅ 4 screenshots saved to `docs/screenshots/`:
   - `stripe-production-mode-2026-03-19.png`
   - `stripe-api-keys-2026-03-19.png`
   - `vercel-stripe-env-vars-2026-03-19.png`
   - `stripe-webhook-config-2026-03-19.png`

2. ✅ Verification script output:
   ```bash
   npm run verify:stripe-production > docs/verification-reports/stripe-2026-03-19.txt
   ```

3. ✅ Smoke test passed:
   ```bash
   npm run test:smoke-e2e
   ```

4. ✅ Test payment completed:
   - Go to https://taxbridge.vercel.app/pricing
   - Click "Subscribe to Pro"
   - Use test card: 4242 4242 4242 4242
   - Complete checkout
   - Verify redirect to dashboard
   - Verify webhooks received (3 events, all 200 OK)
   - **Immediately refund** in Stripe dashboard

5. ✅ Commit with evidence tag:
   ```bash
   git add docs/screenshots/ docs/verification-reports/
   git commit -m "[P0-CRITICAL] Stripe Production Keys Activated + VERIFICATION

   ✅ Evidence:
   - 4 screenshots (Stripe dashboard, API keys, Vercel vars, webhook)
   - Verification script: ALL CHECKS PASSING
   - Test payment: Successful (refunded)
   - Webhook events: 3/3 returned 200 OK

   Impact: Revenue UNBLOCKED - can now accept real payments"
   git push origin main
   ```

---

## ⏱️ TIME ESTIMATE

- **Setup**: 30 minutes (Steps 1-6)
- **Verification**: 5 minutes (Step 7)
- **Testing**: 10 minutes (test payment + refund)
- **Evidence**: 5 minutes (screenshots + commit)

**Total**: ~50 minutes

---

## 🔥 WHY THIS TASK KEEPS RECURRING (8 Sprints)

**Root Cause**: Previous "completions" updated local `.env.production` file (which is just documentation) but did NOT update Vercel's actual production environment variables.

**The Fix**: This time, you MUST login to Vercel dashboard and update environment variables there. Local `.env.production` changes do NOT affect production deployments.

---

## ❓ QUESTIONS?

- **Quick reference**: `docs/STRIPE_PRODUCTION_CTO_CHECKLIST.md`
- **Full guide**: `docs/STRIPE_PRODUCTION_EXECUTIVE_SUMMARY.md`
- **Stripe support**: https://support.stripe.com/ (24/7 live chat)

---

## ✅ TASK COMPLETION CRITERIA

This task is COMPLETE when ALL of these are true:

- [ ] Stripe dashboard screenshot shows "Production" mode
- [ ] API keys screenshot shows `pk_live_` and `sk_live_` keys
- [ ] Vercel screenshot shows all 6 Stripe env vars set
- [ ] Webhook screenshot shows 7 events configured
- [ ] `npm run verify:stripe-production` shows ALL CHECKS PASSING
- [ ] Test payment succeeded and was refunded
- [ ] All 4 screenshots saved to `docs/screenshots/`
- [ ] Verification report saved to `docs/verification-reports/`
- [ ] Evidence committed with "+ VERIFICATION" tag
- [ ] Commit pushed to GitHub main branch

**ALL ✅ = REVENUE IS LIVE! 🚀**

---

**Priority**: P0-CRITICAL
**Impact**: Unblocks ALL revenue ($0 → potential $5K-$20K MRR)
**Confidence**: 99% (straightforward configuration, thoroughly documented)
**Due**: 9pm TODAY (March 19, 2026)

---

**Next Task After Completion**: [P0-CRITICAL] Clerk Production Keys (30 minutes)
