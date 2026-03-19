# Pricing Experiment: $29/Year Variant Test

**Status:** 🚀 READY TO LAUNCH
**Duration:** 2 weeks (March 19 - April 2, 2026)
**Hypothesis:** Lower price point ($29/year vs $49/$79) increases signup volume 3x
**Decision Date:** April 3, 2026

---

## Executive Summary

### Objective

Test if matching competitor pricing ($29/year like SimpleTax/Sprintax) significantly increases conversion volume to offset lower price point and drive higher total revenue.

### Hypothesis

**Primary:** $29/year price point will increase signup conversion rate by 3x compared to current pricing
**Secondary:** Higher volume at lower price will generate more total revenue than lower volume at higher price

### Experiment Design

- **Type:** A/B/C test with 3 price variants
- **Traffic Split:** 33% / 33% / 33% (equal distribution)
- **Duration:** 14 days minimum
- **Success Criteria:** 100+ total conversions OR statistically significant result (p < 0.05)

### Variants

| Variant | Price | Positioning | Hypothesis |
|---------|-------|-------------|------------|
| **annual_29** | $29/year | Competitor Match | HIGH volume, competitive parity with SimpleTax/Sprintax |
| **annual_49** | $49/year | Value Tier (Default) | MEDIUM volume, perceived value positioning |
| **annual_79** | $79/year | Premium | LOW volume, premium quality positioning |

All variants include $19/month option for users who prefer monthly billing.

---

## Metrics Tracked

### Primary Metrics

1. **Signup Conversion Rate**
   - Definition: Visitors who complete checkout / Total pricing page visitors
   - Goal: $29 variant achieves 3x conversion rate vs $79 variant
   - PostHog Events: `pricing_page_viewed` → `checkout_completed`

2. **Revenue per Visitor**
   - Definition: Total revenue / Total visitors to pricing page
   - Goal: $29 variant generates highest revenue per visitor (volume × price)
   - PostHog Events: `checkout_completed` with `revenue` property

3. **Total Revenue by Variant**
   - Definition: Sum of all subscription revenue per variant
   - Goal: Identify revenue-maximizing price point
   - Source: Stripe Dashboard + PostHog events

### Secondary Metrics

4. **Time to Conversion**
   - Avg time from first visit to checkout completion per variant
   - Hypothesis: Lower price = faster decision-making

5. **Billing Interval Preference**
   - % annual vs monthly by variant
   - Hypothesis: $29 annual has highest annual/monthly ratio

6. **Geographic Distribution**
   - Revenue by country (US vs Canada) per variant
   - Hypothesis: Canadian users (stronger USD exchange) prefer lower prices

7. **Cohort Analysis**
   - Product Hunt users vs organic traffic behavior
   - Hypothesis: Product Hunt users more price-sensitive

### Statistical Significance

- **Minimum Sample Size:** 100 total conversions (33 per variant)
- **Confidence Level:** 95% (p-value < 0.05)
- **Practical Significance:** 20%+ difference in conversion or revenue

---

## Revenue Projections

### Conservative Scenario (Current Traffic: ~500 visitors/week)

| Variant | Conv Rate | Conversions/Week | Weekly Revenue | 52-Week Revenue | vs $79 Baseline |
|---------|-----------|------------------|----------------|-----------------|-----------------|
| $29/year | 6% | 30 | $870 | $45,240 | +177% |
| $49/year | 4% | 20 | $980 | $50,960 | +212% |
| $79/year | 2% | 10 | $790 | $41,080 | Baseline |

### Optimistic Scenario (2x traffic growth: ~1,000 visitors/week)

| Variant | Conv Rate | Conversions/Week | Weekly Revenue | 52-Week Revenue | vs $79 Baseline |
|---------|-----------|------------------|----------------|-----------------|-----------------|
| $29/year | 8% | 80 | $2,320 | $120,640 | +270% |
| $49/year | 5% | 50 | $2,450 | $127,400 | +291% |
| $79/year | 2.5% | 25 | $1,975 | $102,700 | Baseline |

**Key Insight:** If $29 drives 3x conversions (6% vs 2%), it generates $45K/year. But if $49 drives 2x conversions (4% vs 2%), it beats both at $51K/year. **$49 may be the sweet spot.**

---

## Implementation Checklist

### Pre-Launch (Day -1)

- [x] Pricing experiment hook implemented (`hooks/use-pricing-experiment.ts`)
- [x] Pricing page integrated with A/B/C variants
- [x] PostHog tracking events configured
- [ ] **CRITICAL:** Create 3 Stripe price IDs ($29, $49, $79) in production
- [ ] Update `.env.production` with live price IDs
- [ ] Verify checkout flow works for all 3 variants
- [ ] Test Stripe test mode payments for each variant
- [ ] Deploy to production

### Launch Day (Day 0 - March 19)

- [ ] Switch Stripe from test to live mode
- [ ] Verify live payments work end-to-end
- [ ] Monitor first 10 conversions (verify correct price IDs)
- [ ] Check PostHog events firing correctly
- [ ] Send Slack/email notification: "Pricing experiment LIVE"

### During Experiment (Days 1-14)

- [ ] **Daily:** Run `npm run monitor:pricing-experiment`
- [ ] Monitor PostHog dashboard for real-time metrics
- [ ] Check Stripe dashboard for revenue by price ID
- [ ] Document any anomalies or outliers
- [ ] Day 7: Mid-experiment check (50+ conversions?)
- [ ] Day 10: Statistical significance check
- [ ] Day 14: Final data collection

### Post-Experiment (Day 15 - April 3)

- [ ] Run final analysis: `npm run pricing:analyze`
- [ ] Calculate statistical significance (chi-squared test)
- [ ] Generate revenue projections for each variant
- [ ] Present findings to stakeholders
- [ ] Decide winning variant
- [ ] Update pricing page to remove losing variants
- [ ] Archive experiment data
- [ ] Document results in `docs/PRICING_EXPERIMENT_RESULTS_2026.md`

---

## Decision Framework

### Scenario 1: Clear Winner (>30% revenue lift, p < 0.05)

**Action:** Adopt winning variant immediately
**Timeline:** Update pricing page within 24 hours
**Communication:** Email existing users about new pricing (grandfather early adopters)

### Scenario 2: No Clear Winner (<10% difference)

**Action:** Default to $49/year (middle ground)
**Rationale:** Balances volume and revenue, perceived value positioning
**Next Steps:** Test other conversion levers (checkout UX, trust signals)

### Scenario 3: Low Sample Size (<100 conversions)

**Action:** Extend experiment to 21-28 days
**Rationale:** Need more data for statistical confidence
**Communication:** Notify stakeholders of extension

### Scenario 4: $29 Wins Conversions but $49 Wins Revenue

**Action:** Adopt $49/year as primary, offer $29 as limited-time promo
**Rationale:** Maximize revenue while maintaining conversion tool
**Implementation:** Use $29 for Product Hunt, Reddit campaigns; default to $49

---

## Monitoring Tools

### 1. Real-Time Dashboard

**URL:** `/dashboard/pricing-analytics`
**Metrics:**
- Live conversion counts by variant
- Revenue totals by variant
- Conversion rate trends (updated hourly)
- Statistical significance indicator

### 2. Daily Monitoring Script

**Command:** `npm run monitor:pricing-experiment`
**Outputs:**
- Day-by-day progress report
- Current leader by conversion and revenue
- Recommendation (continue/extend/decide)
- Saves report to `docs/pricing-experiment-reports/`

### 3. PostHog Funnels

**Funnel 1:** Pricing Page → Checkout Started → Checkout Completed
**Funnel 2:** Calculator → Pricing Page → Checkout
**Filters:** Segment by `pricingVariant` property

### 4. Stripe Revenue Dashboard

**Filters:**
- Price ID: `price_XXXX_29_live` (filter by specific price)
- Date Range: March 19 - April 2
- Metrics: MRR, total customers, revenue

---

## Risk Mitigation

### Risk 1: Low Traffic Volume

**Mitigation:**
- Increase traffic via Google Ads, Reddit, Product Hunt
- Target: 1,000+ visitors/week minimum
- Extend experiment if <100 conversions by Day 14

### Risk 2: Stripe Configuration Error

**Mitigation:**
- Test all 3 variants in Stripe test mode before launch
- Use test cards to verify correct price IDs attached
- Monitor first 10 production payments manually

### Risk 3: PostHog Tracking Failure

**Mitigation:**
- Verify PostHog events in browser DevTools before launch
- Fallback to Stripe revenue data if PostHog fails
- Daily spot-checks on event volume

### Risk 4: Variant Assignment Bias

**Mitigation:**
- Use cryptographic random assignment (Math.random())
- Verify 33/33/33 split in PostHog after 100 visitors
- Check for Product Hunt cohort bias (may skew price-sensitive)

---

## Success Criteria

### Experiment is SUCCESSFUL if:

1. ✅ Achieved 100+ total conversions (33+ per variant)
2. ✅ Winner has statistically significant advantage (p < 0.05)
3. ✅ Winner shows 20%+ revenue lift vs $79 baseline
4. ✅ Data quality high (no tracking failures, correct price IDs)

### Experiment FAILS if:

1. ❌ <100 conversions after 14 days (low traffic)
2. ❌ No significant difference between variants (<10% gap)
3. ❌ Tracking failures corrupt data (PostHog/Stripe mismatch)
4. ❌ External factors distort results (viral spike, competitor change)

### Post-Experiment Actions

#### If $29/year wins:

- Update default pricing to $29/year
- Archive $49 and $79 price IDs in Stripe
- Update marketing messaging to "Starting at $29/year"
- Grandfather existing $79 customers (keep their pricing)
- Run upsell experiments ($29 → $99 enterprise)

#### If $49/year wins:

- Keep $49/year as default
- Offer $29/year as limited-time promo code
- Use $79 for "professional" tier with added features
- Test $49 vs $59 in future experiment

#### If $79/year wins:

- Maintain $79/year pricing
- Add lower-tier $29 "Basic" plan with restricted features
- Position as premium product
- Focus on quality over volume marketing

---

## Appendix

### PostHog Event Schema

```typescript
// Pricing page view
trackEvent('pricing_page_viewed', {
  variant: 'annual_29' | 'annual_49' | 'annual_79',
  annualPrice: 29 | 49 | 79,
  monthlyPrice: 19,
  defaultInterval: 'annual' | 'monthly',
  experiment: 'annual_pricing_competitive_test_2026_q1',
  is_product_hunt_user: boolean,
  user_cohort: 'product_hunt' | 'organic' | 'paid_ads',
});

// Checkout completed
trackEvent('checkout_completed', {
  plan: 'pro',
  variant: 'annual_29' | 'annual_49' | 'annual_79',
  price: 29 | 49 | 79 | 19,
  priceId: 'price_XXXXXXXXXXXXX',
  interval: 'annual' | 'monthly',
  revenue: number,
  currency: 'USD' | 'CAD',
  experiment: 'annual_pricing_competitive_test_2026_q1',
});
```

### Stripe Price ID Naming Convention

```
Test Mode:
- price_1ProAnnual29Test  ($29/year)
- price_1ProAnnual49Test  ($49/year, default)
- price_1ProAnnual79Test  ($79/year)
- price_1ProMonthly19Test ($19/month)

Live Mode:
- price_1ProAnnual29Live  ($29/year)
- price_1ProAnnual49Live  ($49/year, default)
- price_1ProAnnual79Live  ($79/year)
- price_1ProMonthly19Live ($19/month)
```

---

**Document Version:** 1.0
**Last Updated:** March 19, 2026
**Owner:** Michael Guo (CEO)
**Approved By:** CTO (TBD)
**Launch Date:** March 19, 2026 (PENDING Stripe setup)
