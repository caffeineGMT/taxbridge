# Stripe Production Activation - Quick Start

**Date:** March 19, 2026
**Status:** READY TO EXECUTE
**Time Required:** 30-45 minutes
**Impact:** Unblocks ALL revenue ($0 → unlimited MRR potential)

---

## The Simplest Path: Run the Wizard

```bash
npm run stripe:activate
```

That's it. The interactive wizard handles everything else.

### What the Wizard Does

1. **Guides you through getting Stripe LIVE keys** - Opens exact URLs, validates format
2. **Creates products automatically** - Basic ($49), Pro ($79), Enterprise (custom)
3. **Configures webhook** - Tells you exactly what to click
4. **Updates environment** - Provides exact values for Vercel
5. **Tests payment** - Walks through test transaction + refund
6. **Generates evidence** - Auto-creates completion report

**No guessing. No errors. Just follow the prompts.**

---

## What You Need

- Access to https://dashboard.stripe.com
- Access to https://vercel.com/caffeineGMT/taxbridge
- 30-45 minutes uninterrupted
- Admin permissions on both platforms

---

## After Running the Wizard

### Verify It Worked

```bash
npm run verify:stripe
```

Should show all ✅ checkmarks.

### Check Evidence Report

Open: `docs/STRIPE_PRODUCTION_ACTIVATION_EVIDENCE.md`

Should show:
- ✅ Stripe keys in LIVE mode
- ✅ Products created
- ✅ Webhook configured
- ✅ Payment tested
- ✅ Revenue tracking verified

### Test on Production

1. Go to: https://taxbridge.vercel.app/pricing
2. Click "Subscribe" on Pro plan
3. You should see Stripe checkout (no "test mode" banner)
4. Don't complete - just verify it loads

---

## If Something Goes Wrong

### The Wizard Fails

Run individual steps manually:

```bash
# Step 1: Get keys (manual - dashboard.stripe.com)
# Step 2: Create products
export STRIPE_SECRET_KEY=sk_live_YOUR_KEY
npx tsx scripts/activate-stripe-production-annual.ts

# Step 3: Configure webhook (manual - dashboard.stripe.com/webhooks)
# Step 4: Update Vercel (manual - vercel.com)
# Step 5: Test payment (manual - taxbridge.vercel.app/pricing)
```

Full manual guide: `docs/STRIPE_PRODUCTION_ACTIVATION_GUIDE.md`

### Keys Don't Work

- Make sure you toggled to "Production" mode in Stripe dashboard
- Verify keys start with `sk_live_` not `sk_test_`
- Try regenerating keys in Stripe

### Webhook Not Receiving Events

- Verify endpoint URL: `https://taxbridge.vercel.app/api/stripe/webhook`
- Check events are selected (6 required events)
- Test using "Send test event" in Stripe dashboard

### Vercel Not Using New Values

- Verify environment scope is "Production" (not Preview/Development)
- Trigger manual redeploy
- Check deployment logs

---

## Evidence for Task Completion

The wizard auto-generates:

**File:** `docs/STRIPE_PRODUCTION_ACTIVATION_EVIDENCE.md`

This report contains:
- ✅ Proof of LIVE mode activation
- ✅ Product/price IDs
- ✅ Webhook configuration
- ✅ Payment test results
- ✅ Revenue tracking verification

**Use this report to mark the task COMPLETE.**

---

## What Changes

### Before Activation
- ❌ Stripe in TEST mode
- ❌ Cannot accept real payments
- ❌ $0 revenue
- ❌ Product Hunt launch blocked

### After Activation
- ✅ Stripe in LIVE mode
- ✅ Can accept real payments
- ✅ Revenue flows automatically
- ✅ Product Hunt launch unblocked

---

## Next Steps (After Revenue is Live)

### Day 1
- Monitor Stripe dashboard for first payment
- Set up email alerts for new subscriptions
- Verify webhook success rate = 100%

### Week 1
- Launch Product Hunt
- Enable Google Ads
- Email waitlist

### Week 2
- Build revenue dashboard
- Start A/B testing pricing
- Reach out to partnerships (CPAs, lawyers)

---

## Questions?

**"How long does this take?"**
30-45 minutes with the wizard. 45-60 minutes manually.

**"Can I mess something up?"**
Wizard validates every step. Test payment uses test card (no real charge). Very hard to break anything.

**"What if I need to pause midway?"**
Wizard is resumable. But better to complete in one sitting (30-45 min).

**"How do I know it worked?"**
Run `npm run verify:stripe` - should show all ✅

**"What about evidence?"**
Wizard auto-generates completion report with all evidence.

---

## Bottom Line

**Run this:**
```bash
npm run stripe:activate
```

**Follow the prompts.**

**In 30-45 minutes, revenue is unblocked.**

---

*Full guides:*
- *Detailed manual guide: docs/STRIPE_PRODUCTION_ACTIVATION_GUIDE.md*
- *Executive summary: docs/STRIPE_PRODUCTION_EXECUTIVE_SUMMARY.md*
- *CTO checklist: docs/STRIPE_PRODUCTION_CTO_CHECKLIST.md*
