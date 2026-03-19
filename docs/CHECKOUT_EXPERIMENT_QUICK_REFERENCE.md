# Checkout A/B/C Test - Quick Reference

**Status:** ✅ ACTIVE | **Start:** March 19, 2026 | **Duration:** 2-4 weeks

---

## What We're Testing

**3 checkout variants:** Stripe-native (control) vs Embedded form vs Amazon Pay

**Goal:** Find which checkout flow has the highest conversion rate after free tier increased to 10 entries

---

## Variants

| Variant | Description | Split | Why It Might Win |
|---------|------------|-------|------------------|
| **A** | Stripe Checkout (redirect) | 33% | Trusted Stripe brand, proven reliability |
| **B** | Embedded form (on-site) | 33% | No redirect = less friction |
| **C** | Amazon Pay (one-click) | 34% | One-click for Amazon customers |

---

## Key Metrics

**Primary:** Checkout completion rate (target: 51.75%+ vs 45% baseline)

**Secondary:** Time to complete, error rate, revenue per variant

---

## How to Check Results (PostHog)

### Conversion Rate
1. PostHog → Funnels
2. `checkout_initiated` → `checkout_completed`
3. Breakdown by: `variant`

### Time to Complete
1. PostHog → Trends
2. Event: `checkout_completed`, Property: `timeToComplete` (avg)
3. Breakdown by: `variant`

### Revenue
1. PostHog → Trends
2. Event: `checkout_completed`, Property: `revenue` (sum)
3. Breakdown by: `variant`

---

## Sample Size Needed

**385 conversions per variant** for statistical significance (p<0.05)

At 45% conversion rate, need ~856 checkout initiations per variant = **2,568 total**

**Estimated timeline:**
- 100 trials/month = 2.5 months ❌ TOO LONG
- 250 trials/month = 1 month ✅ GOOD
- 500 trials/month = 2 weeks ✅ IDEAL

---

## Decision Criteria

**Win conditions:**
- ✅ Sample size reached (385+ per variant)
- ✅ Statistically significant (p < 0.05)
- ✅ At least 2 weeks of data

**If Embedded (B) wins:** Roll out to 100%, expected +15-25% revenue

**If Amazon Pay (C) wins:** Requires Amazon Pay setup, otherwise use B

**If Stripe-native (A) wins:** Keep current, investigate why

---

## Testing Variants Manually

Force a specific variant by adding to URL:
```
/checkout?...&force=stripe_native
/checkout?...&force=embedded_form
/checkout?...&force=amazon_pay
```

---

## Files Changed

**New Files:**
- `hooks/use-checkout-experiment.ts` - Experiment logic
- `components/checkout/*.tsx` - 3 variant components
- `app/checkout/page.tsx` - Unified checkout page
- `app/api/stripe/create-payment-intent/route.ts` - For embedded variant
- `app/api/amazon-pay/create-checkout/route.ts` - For Amazon Pay

**Modified Files:**
- `app/pricing/page.tsx` - Routes to /checkout instead of inline
- `package.json` - Added Stripe React packages

---

## Timeline

| Date | Milestone |
|------|-----------|
| Mar 19 | ✅ Launch experiment |
| Apr 2 | Review initial results (2 weeks) |
| Apr 5 | Make decision if significant |
| Apr 8 | Roll out winner to 100% |

---

## Red Flags (Stop Experiment If)

- Error rate >10% on any variant
- Checkout completion rate drops >20% vs historical
- Major technical issues blocking revenue
- Amazon Pay fallback >50% of Variant C traffic

---

## Contact

- **Product Lead:** Michael Guo
- **Documentation:** `/docs/CHECKOUT_EXPERIMENT_DOCUMENTATION.md`
- **PostHog:** [Dashboard link TBA]
