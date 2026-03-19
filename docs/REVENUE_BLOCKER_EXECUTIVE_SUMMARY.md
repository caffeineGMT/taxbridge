# 🔴 REVENUE BLOCKER - STRIPE NOT LIVE

**Status:** BLOCKED
**Priority:** P0-CRITICAL
**Owner:** Michael Guo (CEO)
**ETA to Fix:** 30 minutes
**Date:** March 19, 2026

---

## THE PROBLEM

❌ **Cannot execute end-to-end payment test because Stripe is still in TEST MODE**

All environment variables contain placeholder values:
- `STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE` ← NOT REAL
- `STRIPE_PRO_PRICE_ID=price_1ProAnnual` ← FAKE ID
- Webhook endpoint: NOT CREATED

**Impact:** ZERO revenue capability. Cannot accept real payments from customers.

---

## THE FIX (30 Minutes)

### Step 1: Get Stripe Live Keys (3 min)
1. Go to https://dashboard.stripe.com/apikeys
2. Toggle to **"Production"** mode (top-left)
3. Copy `pk_live_...` and `sk_live_...` keys

### Step 2: Run Setup Script (5 min)
```bash
export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY
cd /Users/michaelguo/hivemind-projects/cross-border-tax
npx tsx scripts/activate-stripe-production-annual.ts
```

This creates:
- Basic plan: $49/year (price_XXXXX)
- Pro plan: $79/year (price_XXXXX)
- Enterprise: Custom (prod_XXXXX)

### Step 3: Create Webhook (5 min)
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://taxbridgecpa.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`, `charge.refunded`
4. Copy webhook secret: `whsec_...`

### Step 4: Update Vercel (5 min)
Go to Vercel → Settings → Environment Variables → Production

Add these 9 variables (copy from Step 2 output):
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=prod_...
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=prod_...
```

### Step 5: Redeploy (2 min)
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### Step 6: Test Payment (10 min)
1. Go to https://taxbridgecpa.com/pricing
2. Click "Subscribe to Pro - $79/year"
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify webhook fired (Stripe Dashboard → Webhooks → 200 OK)
6. **IMMEDIATELY REFUND** (Stripe Dashboard → Payments → Refund)

✅ **DONE!** Revenue is now LIVE.

---

## WHY THIS IS URGENT

- **Cost of delay:** $100-500/day in lost revenue
- **Product Hunt launch:** Blocked (scheduled March 25)
- **Customer trust:** Cannot accept payments = not a real product
- **Competitive risk:** Users will try alternatives

---

## DETAILED GUIDES

- **Full Report:** `docs/REVENUE_ACTIVATION_VERIFICATION_REPORT.md`
- **CTO Checklist:** `docs/STRIPE_PRODUCTION_CTO_CHECKLIST.md`
- **Testing Guide:** `docs/STRIPE_PRODUCTION_TESTING_GUIDE.md`
- **Webhook Setup:** `docs/STRIPE_WEBHOOK_VERIFICATION.md`

---

## CURRENT VERIFICATION STATUS

| Checkpoint | Status |
|-----------|--------|
| Stripe in LIVE mode | ❌ Still TEST mode |
| Live API keys | ❌ All placeholders |
| Price IDs created | ❌ Never ran script |
| Webhook endpoint | ❌ Not configured |
| Vercel env vars | ❌ Not set |
| Payment test | ⏸️ BLOCKED |

**Result:** 0 of 6 checkpoints passed. **CANNOT PROCEED** with verification test.

---

## NEXT STEP

**Michael:** Execute Steps 1-6 above (30 min), then reassign this task to engineering to re-run the verification test.

**Timeline:**
- Today 10:00 AM - 10:30 AM: Complete Stripe activation
- Today 10:30 AM - 10:45 AM: Engineering runs payment verification test
- Today 10:45 AM: **REVENUE GOES LIVE** 🚀
