# Checkout Page A/B/C Test: Conversion Optimization Experiment

**Experiment Name:** `checkout_flow_optimization_march_2026`
**Start Date:** March 19, 2026
**Status:** ✅ ACTIVE
**Experiment Type:** A/B/C Split Test (3 variants, 33/33/34% traffic split)

---

## Executive Summary

This experiment tests three different checkout implementations to determine which converts best after the free tier increase from 1 to 10 RSU entries.

**Hypothesis:** Embedded checkout (Variant B) will have the highest conversion rate due to reduced friction and no page redirect.

**Expected Impact:**
- 15-25% conversion rate improvement over baseline (Stripe-native)
- Revenue increase of $200-500/month (assuming 100 trials/month baseline)
- Faster time-to-purchase (30-50% reduction in checkout duration)

---

## Experiment Design

### Variants

| Variant | Implementation | Traffic Split | Pros | Cons |
|---------|---------------|---------------|------|------|
| **A: Stripe-native** | Stripe Checkout Sessions | 33% | ✅ Trusted Stripe branding<br>✅ PCI compliant<br>✅ Apple Pay/Google Pay built-in | ❌ Requires redirect<br>❌ Context switch<br>❌ Slower |
| **B: Embedded form** | Stripe Elements (on-site) | 33% | ✅ No redirect<br>✅ Seamless UX<br>✅ Full customization | ❌ More complex<br>❌ Higher dev maintenance |
| **C: Amazon Pay** | Amazon Pay one-click | 34% | ✅ One-click for Amazon users<br>✅ Trusted Amazon brand<br>✅ No card entry | ❌ Limited to Amazon customers<br>❌ Additional fees |

### Traffic Allocation

Users are randomly assigned to one of three variants on their **first pricing page visit**. Assignment is **persistent** (stored in `localStorage`) so users see the same variant on return visits.

```javascript
// 33/33/34 split
if (random < 0.33) → Stripe-native
else if (random < 0.66) → Embedded form
else → Amazon Pay
```

### Control & Treatment

- **Control (Variant A):** Stripe-native checkout (current production implementation)
- **Treatment 1 (Variant B):** Embedded Stripe Elements form
- **Treatment 2 (Variant C):** Amazon Pay one-click checkout

---

## Metrics & Success Criteria

### Primary Metric
**Checkout Completion Rate:** % of users who complete payment after clicking "Upgrade"

**Target:** 15% improvement over control (Stripe-native)

| Metric | Control (A) Baseline | Target (B/C) | Measurement Method |
|--------|---------------------|--------------|-------------------|
| Checkout initiated → Completed | 45% (estimated) | 51.75%+ | PostHog funnel: `checkout_initiated` → `checkout_completed` |

### Secondary Metrics

1. **Time to Complete Checkout**
   - Control: 120s (estimated)
   - Target: <90s for Variant B, <60s for Variant C
   - Tracked via `timeToComplete` in `checkout_completed` event

2. **Checkout Abandonment Rate**
   - Control: 55% (estimated)
   - Target: <48.25%
   - Tracked via `checkout_abandoned` events with `step` and `reason`

3. **Revenue per Variant**
   - Calculated as: (conversions × average price)
   - Must account for different price points ($39/$49/$79/$99 pricing experiment)

4. **Error Rate**
   - Target: <5% of checkout attempts
   - Tracked via `checkout_error` events

---

## PostHog Event Tracking

### Events Logged

| Event Name | When Fired | Properties |
|------------|-----------|-----------|
| `checkout_experiment_exposed` | User lands on checkout page | `variant`, `experiment_name`, `user_cohort` |
| `checkout_page_viewed` | Checkout page loads | `variant`, `variantName` |
| `checkout_initiated` | User clicks "Pay" button | `variant`, `tier`, `priceId`, `price`, `timestamp` |
| `checkout_completed` | Payment succeeds | `variant`, `tier`, `price`, `timeToComplete`, `revenue` |
| `checkout_abandoned` | User leaves without completing | `variant`, `step`, `reason`, `timeSpent` |
| `checkout_error` | Payment fails or error occurs | `variant`, `error` |

### PostHog Feature Flags

**Flag Name:** `checkout_experiment_variant`
**Values:** `checkout_stripe_native`, `checkout_embedded_form`, `checkout_amazon_pay`

---

## Implementation Details

### Files Created

```
hooks/use-checkout-experiment.ts          # Experiment logic & tracking
components/checkout/StripeNativeCheckout.tsx   # Variant A
components/checkout/EmbeddedCheckout.tsx       # Variant B
components/checkout/AmazonPayCheckout.tsx      # Variant C
app/checkout/page.tsx                     # Unified checkout page
app/api/stripe/create-payment-intent/route.ts  # API for Variant B
app/api/amazon-pay/create-checkout/route.ts    # API for Variant C (placeholder)
```

### Modified Files

```
app/pricing/page.tsx                      # Route to /checkout instead of inline checkout
package.json                              # Added @stripe/stripe-js, @stripe/react-stripe-js
```

### Dependencies Added

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## How to Analyze Results (PostHog)

### Step 1: Create Conversion Funnel

1. Go to PostHog → **Insights** → **Funnels**
2. Create funnel:
   - Step 1: `checkout_initiated`
   - Step 2: `checkout_completed`
3. **Breakdown by:** `variant`
4. **Date range:** Last 30 days (or experiment start date)

**Expected Output:**
```
Variant A (stripe_native):     checkout_initiated (100) → checkout_completed (45)  = 45%
Variant B (embedded_form):     checkout_initiated (100) → checkout_completed (55)  = 55% ✅ +22%
Variant C (amazon_pay):        checkout_initiated (100) → checkout_completed (60)  = 60% ✅ +33%
```

### Step 2: Time to Complete Analysis

1. Go to PostHog → **Insights** → **Trends**
2. Event: `checkout_completed`
3. **Property:** `timeToComplete` (average)
4. **Breakdown by:** `variant`

**Expected Output:**
```
Variant A: 120s average
Variant B: 85s average  (-29%)
Variant C: 55s average  (-54%)
```

### Step 3: Revenue Analysis

1. Go to PostHog → **Insights** → **Trends**
2. Event: `checkout_completed`
3. **Property:** `revenue` (sum)
4. **Breakdown by:** `variant`

**Expected Output:**
```
Variant A: $4,500 (100 conversions × $45 avg)
Variant B: $5,500 (110 conversions × $50 avg)  +22%
Variant C: $6,000 (120 conversions × $50 avg)  +33%
```

### Step 4: Error Rate Analysis

1. Go to PostHog → **Insights** → **Trends**
2. Events: `checkout_error` and `checkout_initiated`
3. Formula: `checkout_error / checkout_initiated × 100`
4. **Breakdown by:** `variant`

**Target:** <5% error rate for all variants

---

## Statistical Significance

**Minimum Sample Size:** 385 conversions per variant (assuming 45% baseline, 5% significance, 80% power)

**How to Check:**
1. Go to PostHog Experiments (if available)
2. Or use external calculator: [Evan Miller A/B Test Calculator](https://www.evanmiller.org/ab-testing/sample-size.html)

**Don't declare a winner until:**
- ✅ Sample size reached (385+ per variant)
- ✅ p-value < 0.05
- ✅ At least 2 weeks of data (account for weekly patterns)

---

## Decision Framework

### If Variant B (Embedded) Wins:
- **Roll out to 100%** of traffic
- Deprecate Stripe-native checkout
- Monitor for 1 week post-rollout
- Expected revenue increase: +$200-300/month

### If Variant C (Amazon Pay) Wins:
- **Requires Amazon Pay setup** (merchant account, credentials)
- If not configured: Roll out Variant B instead (2nd best)
- If configured: Roll out to 100%

### If Variant A (Stripe-native) Wins:
- Keep current implementation
- Investigate why embedded didn't perform better
- Consider hybrid approach (offer choice)

---

## Rollout Plan

### Week 1-2: Monitor & Iterate
- Watch for technical issues (errors, timeouts)
- Fix bugs immediately
- Don't change traffic split

### Week 2-3: Analyze
- Check sample size (need 385+ per variant)
- Calculate statistical significance
- Review qualitative feedback (session recordings)

### Week 3-4: Decision
- If clear winner with p<0.05: Roll out to 100%
- If inconclusive: Run for 2 more weeks
- If all variants tie: Keep Stripe-native (lowest maintenance)

---

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Embedded form has higher error rate | Medium | High | Monitor `checkout_error` events daily, rollback if >10% |
| Amazon Pay not configured | High | Medium | Fallback to Stripe-native in component code |
| Users confused by different experiences | Low | Medium | A/B test is invisible to users, consistent branding |
| One variant gets all Product Hunt traffic | Medium | Medium | Stratify by `user_cohort` in analysis |

---

## Testing & QA

### Manual Test Checklist

**Variant A (Stripe-native):**
- [ ] Click "Upgrade to Pro" → redirects to Stripe Checkout
- [ ] Complete payment → returns to /pricing?upgrade=success
- [ ] Cancel payment → returns to /pricing?upgrade=cancelled
- [ ] PostHog events fire correctly

**Variant B (Embedded):**
- [ ] Click "Upgrade to Pro" → stays on page, shows payment form
- [ ] Enter card details → payment succeeds
- [ ] Test failed payment (use Stripe test card 4000 0000 0000 9995)
- [ ] PostHog events fire correctly

**Variant C (Amazon Pay):**
- [ ] Click "Upgrade to Pro" → shows Amazon Pay UI (or fallback message)
- [ ] If not configured: Shows "Pay with Credit Card" button
- [ ] Fallback redirects to Variant A
- [ ] PostHog events fire correctly

### Forcing Variants (for QA)

Add `?force=stripe_native`, `?force=embedded_form`, or `?force=amazon_pay` to the checkout URL:

```
https://taxbridge.vercel.app/checkout?tier=pro&priceId=price_1ProAnnual49&price=49&interval=annual&force=embedded_form
```

---

## Next Steps

1. ✅ **Implementation complete** (March 19, 2026)
2. ⏳ **Monitor for 2 weeks** (March 19 - April 2)
3. ⏳ **Analyze results** (April 2-5)
4. ⏳ **Make decision** (April 5)
5. ⏳ **Roll out winner** (April 8)

---

## Questions or Issues?

Contact: Michael Guo (Product Lead)
PostHog Dashboard: [Link to be added]
Slack Channel: #revenue-experiments
