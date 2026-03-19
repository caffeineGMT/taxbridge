# Pain-Point Headline A/B Test - CRO Experiment

**Status:** 🟢 LIVE - Ready for Production
**Created:** March 19, 2026
**Objective:** Increase landing page conversion rate by 15%+ within 1 week
**Target:** 1,000+ visitors per variant minimum

---

## Executive Summary

This A/B test evaluates 3 different pain-point focused headlines to optimize landing page conversion:

1. **Variant A (Savings Focus):** "Save $5K+ on RSU Taxes"
2. **Variant B (Simplicity Focus):** "Cross-Border Tax Made Simple"
3. **Variant C (Audience + Action Focus):** "H1B/TN Workers: Calculate Your Tax Savings"

Each variant targets a different psychological trigger:
- **Variant A:** Direct monetary benefit ($5K+ savings)
- **Variant B:** Complexity reduction (making hard things simple)
- **Variant C:** Identity + clear action (audience targeting + CTA)

---

## Test Configuration

### Traffic Split
- **Variant A (Savings):** 33% of traffic
- **Variant B (Simplicity):** 33% of traffic
- **Variant C (Audience/Action):** 34% of traffic

### Implementation Details

**Hook:** `/hooks/use-pain-point-headline-test.ts`
- 3 variants with equal traffic distribution
- PostHog event tracking for page views and CTA clicks
- Automatic variant assignment via `use-ab-test` base hook
- Cookie-based persistence (variant stays consistent per user)

**Landing Page:** `/app/page.tsx`
- Hero section headline dynamically rendered based on variant
- Subheadline customized for each variant's messaging angle
- Savings badge shown/hidden based on variant type
- CTA click tracking includes variant metadata

---

## Variant Details

### Variant A: Save $5K+ on RSU Taxes
**Messaging Focus:** Direct financial benefit
**Headline:** "Save $5K+ on RSU Taxes"
**Subheadline:** "H-1B and TN visa tech workers lose thousands to double taxation. Our CPA-verified calculator optimizes Foreign Tax Credits to eliminate overpayment."
**Badge:** ✅ Shows "Average Savings: $5,000+"
**CTA Emphasis:** Savings
**Hypothesis:** Specific dollar amount creates strong conversion intent

### Variant B: Cross-Border Tax Made Simple
**Messaging Focus:** Simplicity and ease of use
**Headline:** "Cross-Border Tax Made Simple"
**Subheadline:** "Stop struggling with US-Canada tax filing. Built specifically for H-1B/TN visa workers with RSUs who need accurate Foreign Tax Credit calculations."
**Badge:** ❌ No badge
**CTA Emphasis:** Simplicity
**Hypothesis:** Reducing perceived complexity lowers barrier to entry

### Variant C: H1B/TN Workers: Calculate Your Tax Savings
**Messaging Focus:** Audience targeting + clear action
**Headline:** "H1B/TN Workers: Calculate Your Tax Savings"
**Subheadline:** "Working in the US with RSUs but living in Canada? Get your exact Foreign Tax Credit optimization in 5 minutes with our free CPA-verified tool."
**Badge:** ✅ Shows "Calculate Now"
**CTA Emphasis:** Action
**Hypothesis:** Identity-based targeting + immediate action prompt drives qualified traffic

---

## PostHog Event Tracking

### Page View Event
**Event Name:** `landing_page_viewed`

**Properties:**
```json
{
  "funnelStep": "Landing",
  "funnelStepNumber": 1,
  "experimentName": "pain-point-headline-cro",
  "headlineVariant": "variant-a-savings" | "variant-b-simplicity" | "variant-c-audience",
  "headlineText": "<actual headline text>",
  "ctaEmphasis": "savings" | "simplicity" | "action",
  "showsSavingsBadge": true | false
}
```

### CTA Click Event
**Event Name:** `cta_button_clicked`

**Properties:**
```json
{
  "funnelStep": "Landing",
  "funnelStepNumber": 1,
  "experimentName": "pain-point-headline-cro",
  "headlineVariant": "variant-a-savings" | "variant-b-simplicity" | "variant-c-audience",
  "headlineText": "<actual headline text>",
  "ctaEmphasis": "savings" | "simplicity" | "action",
  "destination": "/dashboard"
}
```

---

## Analysis Plan

### Primary Metric: Conversion Rate
**Definition:** % of landing page visitors who click primary CTA button

**Calculation:**
```
Conversion Rate = (CTA Clicks / Page Views) * 100
```

**Success Threshold:** 15%+ relative improvement over baseline

### Secondary Metrics
1. **Time on Page:** Engagement indicator
2. **Scroll Depth:** Content consumption
3. **Bounce Rate:** Immediate exits
4. **Calculator Completion Rate:** End-to-end funnel (landing → calculator completion)

### Statistical Significance
- **Minimum Sample Size:** 1,000 visitors per variant
- **Confidence Level:** 95%
- **Statistical Power:** 80%
- **Minimum Detectable Effect:** 15% relative lift

**Estimated Timeline:** 5-7 days at 500-700 daily visitors

---

## How to Analyze Results in PostHog

### Step 1: Create Funnel
1. Go to **Insights** → **Funnels**
2. Configure funnel steps:
   - **Step 1:** `landing_page_viewed` (filter: `experimentName = "pain-point-headline-cro"`)
   - **Step 2:** `cta_button_clicked` (filter: `experimentName = "pain-point-headline-cro"`)
3. **Breakdown by:** `headlineVariant`

### Step 2: Calculate Conversion Rates
For each variant, PostHog will show:
- Total page views (Step 1)
- Total CTA clicks (Step 2)
- Conversion rate (Step 2 / Step 1)

### Step 3: Determine Winner
Compare conversion rates:
```
Variant A Conversion Rate: __%
Variant B Conversion Rate: __%
Variant C Conversion Rate: __%

Relative Lift vs Baseline (Variant B):
Variant A: +__% or -__%
Variant C: +__% or -__%
```

**Decision Criteria:**
- Winner must have ≥15% relative lift
- Winner must have ≥1,000 visitors
- Difference must be statistically significant (p < 0.05)

---

## Implementation Checklist

- ✅ Created `/hooks/use-pain-point-headline-test.ts`
- ✅ Updated `/app/page.tsx` to use new test
- ✅ Implemented PostHog tracking for page views
- ✅ Implemented PostHog tracking for CTA clicks
- ✅ Verified build passes with zero errors
- ✅ Equal traffic split (33/33/34%)
- ✅ Cookie persistence for consistent user experience
- ✅ Mobile responsive (all variants tested)
- ✅ SEO metadata unchanged (no impact on organic traffic)

---

## Next Steps

### Week 1: Monitor & Validate
1. **Day 1-2:** Verify tracking is firing correctly in PostHog
2. **Day 3-5:** Monitor for 1,000+ visitors per variant
3. **Day 6-7:** Analyze results and declare winner

### Week 2: Implement Winner
1. Remove losing variants
2. Deploy winning headline as permanent default
3. Document learnings for future tests

### Future Tests
Based on winner, test:
- CTA button copy variations
- Subheadline refinements
- Trust signal placement (above vs below hero)

---

## Code References

**Hook File:** `/hooks/use-pain-point-headline-test.ts`
**Landing Page:** `/app/page.tsx` (lines 37-200)
**Base A/B Test Hook:** `/hooks/use-ab-test.ts`
**PostHog Configuration:** Auto-configured via `use-ab-test` hook

---

## Success Metrics

**Target Outcomes:**
- 🎯 15%+ conversion rate improvement
- 🎯 1,000+ visitors per variant within 7 days
- 🎯 Statistical significance (p < 0.05)
- 🎯 Clear winner identified

**Business Impact (Projected):**
- Current baseline conversion: ~2-3% (estimated)
- Target conversion with 15% lift: ~2.3-3.5%
- At 500 daily visitors: +0.75-1.5 additional conversions/day
- Monthly impact: +22-45 additional signups/month

---

**Status:** ✅ READY FOR PRODUCTION
**Deployed:** Waiting for git push to deploy to Vercel
**Expected Results:** Available 7 days post-deployment
