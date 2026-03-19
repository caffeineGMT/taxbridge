# Pricing Experiment Setup Guide

**Experiment:** 3-Way Pricing Test ($29 vs $49 vs $79/year)
**Duration:** 14 days (March 19 - April 2, 2026)
**Traffic Split:** 33% / 33% / 33%
**Tracking:** PostHog + Stripe Revenue

## Objective

Test 3 annual price points to identify the optimal revenue-maximizing price:
- **Variant A:** $29/year (competitor match: SimpleTax/Sprintax pricing)
- **Variant B:** $49/year (middle ground: value positioning)
- **Variant C:** $79/year (current premium pricing)

## Hypothesis

Current $79/year pricing may be too high relative to competitors ($29/year market rate), limiting conversions. A lower price point may increase conversion rate enough to offset reduced revenue per customer, resulting in higher overall MRR.

## Success Metrics

**Primary:** Total revenue (conversion rate × price)
**Secondary:**
- Conversion rate (pricing page → checkout started)
- Trial-to-paid conversion rate
- Customer Lifetime Value (LTV)
- Churn rate by variant

**Minimum Sample:** 300 pricing page views per variant (900 total)
**Statistical Significance:** 95% confidence, 80% power

---

## Part 1: Create Stripe Price IDs

### Step 1: Log into Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/products
2. Click on "TaxBridge Pro" product (or create if missing)
3. Click "+ Add another price"

### Step 2: Create $29/year Price

**Name:** Pro Annual - Competitor Match ($29/year)
**Billing Period:** Yearly
**Price:** $29.00 USD
**Description:** Annual subscription - competitor pricing match

Click "Add price" and copy the price ID: `price_XXXXXXXXXXXXX`

### Step 3: Create $49/year Price

**Name:** Pro Annual - Value Tier ($49/year)
**Billing Period:** Yearly
**Price:** $49.00 USD
**Description:** Annual subscription - middle pricing tier

Click "Add price" and copy the price ID: `price_XXXXXXXXXXXXX`

### Step 4: Create $79/year Price (Current)

**Name:** Pro Annual - Premium ($79/year)
**Billing Period:** Yearly
**Price:** $79.00 USD
**Description:** Annual subscription - premium pricing tier

Click "Add price" and copy the price ID: `price_XXXXXXXXXXXXX`

### Step 5: Verify Monthly Price Exists

Ensure you have a monthly price ($19/month) for all variants to toggle between:

**Name:** Pro Monthly ($19/month)
**Billing Period:** Monthly
**Price:** $19.00 USD

Copy the price ID: `price_XXXXXXXXXXXXX`

---

## Part 2: Configure Environment Variables

### Development (.env.local)

```bash
# Stripe Price IDs for Pricing Experiment (TEST MODE)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29=price_XXXXXXXXXXXXX_29_test
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXXX_49_test
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=price_XXXXXXXXXXXXX_79_test
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=price_XXXXXXXXXXXXX_monthly_test

# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Production (Vercel Environment Variables)

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add the following production price IDs:

```bash
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29=price_XXXXXXXXXXXXX_29_live
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXXX_49_live
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=price_XXXXXXXXXXXXX_79_live
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=price_XXXXXXXXXXXXX_monthly_live
```

3. Redeploy after setting variables

---

## Part 3: PostHog Feature Flag Setup (Optional Enhancement)

### Create Feature Flag in PostHog

1. Go to https://app.posthog.com/feature_flags
2. Click "New feature flag"
3. Configure:

**Name:** `pricing_experiment_variant`
**Key:** `pricing_experiment_variant`
**Type:** Multivariate
**Variants:**
- `annual_29` (33%)
- `annual_49` (33%)
- `annual_79` (34%)

**Rollout:** 100% of users
**Persistence:** Yes (critical - ensures users see same price on return visits)

### Enable the Feature Flag

Click "Save and enable"

---

## Part 4: Verify Implementation

### Test Variant Assignment

1. **Clear browser storage:** Open DevTools → Application → Clear site data
2. **Visit pricing page:** https://taxbridge.vercel.app/pricing
3. **Check localStorage:** `pricing_experiment_variant` should be set to one of: `annual_29`, `annual_49`, `annual_79`
4. **Verify price displayed:** Should match the variant ($29, $49, or $79)
5. **Repeat 10 times:** Ensure random distribution (~33% each)

### Test PostHog Events

1. Open PostHog → Live Events
2. Visit pricing page
3. Verify these events fire:
   - `pricing_experiment_exposed` (with variant, annualPrice)
   - `pricing_page_viewed` (with variant, experiment name)
4. Click "Start Trial"
5. Verify:
   - `pricing_tier_selected` (with variant, price, priceId)
   - `checkout_started` (with plan, funnelStep)

### Test Stripe Checkout

1. Click upgrade button for each variant
2. Verify correct price appears in checkout
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify in Stripe Dashboard:
   - Correct price ID attached to subscription
   - Correct amount charged

---

## Part 5: Monitoring & Analytics

### PostHog Dashboard Setup

**Create Insight: Pricing Experiment Overview**

1. Go to PostHog → Insights → New Insight
2. Select "Funnel" type
3. Configure funnel:
   - Step 1: `pricing_page_viewed`
   - Step 2: `pricing_tier_selected`
   - Step 3: `checkout_started`
   - Step 4: `checkout_completed`
4. Breakdown by: `variant` (annual_29, annual_49, annual_79)
5. Time range: Last 14 days
6. Save as: "Pricing Experiment Conversion Funnel"

**Create Insight: Revenue by Variant**

1. New Insight → Trends
2. Event: `checkout_completed`
3. Formula: `SUM(revenue)` grouped by `variant`
4. Time range: Last 14 days
5. Save as: "Revenue by Pricing Variant"

**Create Dashboard**

1. New Dashboard: "Pricing Experiment 2026-Q1"
2. Add insights:
   - Pricing Experiment Conversion Funnel
   - Revenue by Pricing Variant
   - Visitors by Variant (ensure even split)
   - Average Time to Conversion by Variant
   - Trial-to-Paid Rate by Variant

### Stripe Revenue Tracking

Monitor in Stripe Dashboard → Analytics:
- MRR by price ID
- Customer count by price ID
- Conversion rate

---

## Part 6: Decision Framework

### When to End Experiment

**Minimum Duration:** 14 days
**Minimum Sample:** 300 pricing page views per variant (900 total)
**Statistical Significance:** p < 0.05 (95% confidence)

### How to Analyze Results

1. **Calculate Revenue per 100 Visitors:**
   - Variant A: Conversion Rate (CR) × $29
   - Variant B: CR × $49
   - Variant C: CR × $79

2. **Example:**
   - Variant A: 8% CR × $29 = $2.32 revenue/100 visitors
   - Variant B: 5% CR × $49 = $2.45 revenue/100 visitors ← **WINNER**
   - Variant C: 3% CR × $79 = $2.37 revenue/100 visitors

3. **Check Statistical Significance:**
   - Use PostHog's built-in significance calculator
   - Or manual: https://www.evanmiller.org/ab-testing/chi-squared.html

4. **Secondary Metrics:**
   - Trial-to-paid conversion rate (better at lower prices?)
   - Churn rate (do cheaper customers churn faster?)
   - LTV (6-month projected revenue per customer)

### Decision Matrix

| Scenario | Action |
|----------|--------|
| **Clear winner (>20% revenue lift, p<0.05)** | Implement winning variant for all users immediately |
| **Marginal winner (5-20% lift, p<0.05)** | Run extended test (7 more days) or implement cautiously |
| **No significant difference** | Default to $49 (middle option) or run long-term cohort analysis |
| **Inconclusive (<300 views/variant)** | Extend test until sample size reached |

---

## Part 7: Post-Experiment Actions

### If $29 Wins:
1. Update `.env.production`: Set `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=$29_price_id`
2. Update pricing page default to $29
3. Archive $49 and $79 price IDs (don't delete - existing customers)
4. Create "Limited Time: Competitor Match" marketing campaign
5. Update blog content: "We beat SimpleTax pricing by X%"

### If $49 Wins:
1. Update `.env.production`: Set default to $49
2. Position as "best value" messaging
3. Archive $29 and $79 variants
4. A/B test value-based headlines

### If $79 Wins:
1. Keep current pricing
2. Focus on premium positioning and differentiation
3. Run value-add experiments (add features to justify premium)
4. Target enterprise/CPA market more aggressively

---

## Troubleshooting

### Issue: Users see different prices on page refresh
**Cause:** Variant not persisting in localStorage
**Fix:** Check `use-pricing-experiment.ts` lines 98-99 ensure localStorage.setItem() succeeds

### Issue: PostHog events not firing
**Cause:** PostHog not initialized or wrong API key
**Fix:**
1. Check `.env.local` has correct `NEXT_PUBLIC_POSTHOG_KEY`
2. Verify PostHog init in `app/providers.tsx`
3. Check DevTools Console for PostHog errors

### Issue: Wrong Stripe price ID in checkout
**Cause:** Environment variable mismatch
**Fix:**
1. Verify `.env.production` has correct price IDs
2. Redeploy Vercel after updating env vars
3. Clear CDN cache if using Vercel Edge Functions

### Issue: Uneven traffic split (not 33/33/33)
**Cause:** Small sample size or randomization seed
**Fix:**
1. Wait for more traffic (need 900+ visitors)
2. Check Math.random() in `use-pricing-experiment.ts` line 86
3. Verify PostHog doesn't have overriding feature flag

---

## Rollback Plan

If experiment causes revenue drop >20% in first 48 hours:

1. **Immediate:** Set all users to $79 (current pricing)
   ```bash
   # Force variant in use-pricing-experiment.ts
   function getVariantAssignment(): PricingVariant {
     return 'annual_79'; // EMERGENCY ROLLBACK
   }
   ```

2. **Deploy:** Push to production immediately

3. **Communicate:** Email affected users about pricing correction

4. **Analyze:** Review PostHog data to understand what went wrong

---

## Success Criteria

✅ **Launch Checklist:**
- [ ] 3 Stripe price IDs created (TEST)
- [ ] 3 Stripe price IDs created (PRODUCTION)
- [ ] Environment variables set in Vercel
- [ ] PostHog events verified firing
- [ ] Variant assignment tested (33/33/33 split)
- [ ] Stripe checkout tested for all 3 variants
- [ ] PostHog dashboard created
- [ ] Team notified of experiment start date

✅ **End Experiment Checklist:**
- [ ] 300+ views per variant achieved
- [ ] Statistical significance reached (p < 0.05)
- [ ] Revenue per 100 visitors calculated
- [ ] Secondary metrics reviewed (trial-to-paid, churn, LTV)
- [ ] Decision made (which variant to implement)
- [ ] Production pricing updated
- [ ] Experiment results documented
- [ ] Team briefed on findings

---

## Timeline

| Day | Activity |
|-----|----------|
| **Day 0 (Mar 19)** | Create Stripe price IDs, configure env vars, deploy to production |
| **Day 1-2** | Monitor for errors, verify even traffic split |
| **Day 3-7** | Collect data, monitor conversion rates |
| **Day 8-10** | Mid-experiment check: review preliminary data |
| **Day 11-14** | Final data collection |
| **Day 15** | Analyze results, calculate significance |
| **Day 16** | Make decision, implement winning variant |
| **Day 17** | Document results, share with team |

---

## Contact

**Experiment Owner:** Michael Guo (CEO)
**Analytics:** PostHog Dashboard - https://app.posthog.com
**Revenue:** Stripe Dashboard - https://dashboard.stripe.com
**Questions:** Slack #revenue-experiments

---

**Status:** ✅ IMPLEMENTATION COMPLETE - Ready to launch
**Last Updated:** March 19, 2026
**Experiment ID:** `annual_pricing_competitive_test_2026_q1`
