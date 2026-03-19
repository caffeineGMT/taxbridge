# Pricing Strategy A/B/C Test: $29 vs $49 vs $79/year

**Experiment Name:** `pricing_competitive_test_2026_q1`
**Status:** 🚀 READY TO LAUNCH
**Duration:** 14 days
**Created:** 2026-03-19
**Owner:** CEO / Product Team

---

## 🎯 Objective

**Determine the optimal annual pricing for TaxBridge Pro that maximizes revenue per visitor.**

Current $79/year pricing may be too high compared to competitors (SimpleTax $29, Sprintax $29), potentially limiting conversion rate. This experiment tests if lower price points can increase conversions enough to offset lower revenue per customer.

---

## 📊 Hypothesis

### Problem Statement
- Competitor research shows market rate for cross-border tax tools is **$29/year**
- TaxBridge currently priced at **$79/year** (2.7x competitor pricing)
- Conversion rate unknown but suspected to be low due to price resistance
- Hypothesis: **Price is a conversion blocker**

### Test Hypothesis
**IF** we lower the annual price from $79 to $49 or $29,
**THEN** conversion rate will increase,
**AND** total revenue per visitor may increase despite lower price per customer.

### Success Criteria
- **Primary Metric:** Revenue per visitor (conversion_rate × price)
- **Winner:** Variant with highest revenue per visitor after 14 days
- **Decision Threshold:** 90% statistical confidence + 10% revenue lift

---

## 🧪 Experiment Design

### Variants

| Variant | Price    | Price ID Env Var | Value Proposition | Target Cohort | Expected Conv. Rate | Expected Rev/Visitor |
|---------|----------|------------------|-------------------|---------------|---------------------|----------------------|
| **A**   | $29/year | `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29` | **COMPETITOR MATCH**: SimpleTax/Sprintax pricing - Limited time! | Price-sensitive, students, entry-level | 8% | $2.32 (8% × $29) |
| **B**   | $49/year | `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | **SMART CHOICE**: Best value for cross-border tax compliance | Mid-career, value-conscious | 5% | $2.45 (5% × $49) |
| **C**   | $79/year | `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79` | **PREMIUM**: Professional-grade tax optimization & support | Senior engineers, complex cases | 3% | $2.37 (3% × $79) |

**Monthly Option:** $19/month available to ALL variants (user choice)

### Traffic Split
- **33% / 33% / 33%** random assignment
- Assignment persisted in localStorage (sticky sessions)
- Product Hunt cohort tracked separately

### Differentiated Messaging

Each variant has **unique value propositions** to maximize conversion:

**Variant A ($29/year):**
- Tagline: "🔥 COMPETITOR MATCH: SimpleTax/Sprintax pricing - Limited time!"
- Savings message: "Save $50 vs competitors — Market-leading pricing expires April 15"
- Positioning: Affordable, accessible, market rate
- Urgency: Limited-time pricing + competitor comparison

**Variant B ($49/year):**
- Tagline: "⚡ SMART CHOICE: Best value for cross-border tax compliance"
- Savings message: "Save vs monthly — Smart tax planning under $4/month"
- Positioning: Balanced value, smart middle ground
- Urgency: Value-focused, practical

**Variant C ($79/year):**
- Tagline: "💎 PREMIUM: Professional-grade tax optimization & support"
- Savings message: "Premium value — Includes priority CPA support worth $200"
- Positioning: Premium quality, professional support
- Urgency: Exclusivity, professional-grade

---

## 📈 Metrics & Tracking

### Primary Metric
**Revenue per Visitor** = Conversion Rate × Price

Example calculations:
- Variant A: 8% × $29 = **$2.32/visitor**
- Variant B: 5% × $49 = **$2.45/visitor** ← Hypothetical winner
- Variant C: 3% × $79 = **$2.37/visitor**

### Secondary Metrics
1. **Conversion Rate:** % of visitors who purchase
2. **Average Order Value (AOV):** Price of purchased plan
3. **Monthly vs Annual Selection:** % choosing monthly vs annual
4. **Time to Purchase:** Median time from pricing page view to purchase
5. **Customer Lifetime Value (LTV):** Projected LTV by variant

### PostHog Events Tracked
```javascript
// Exposure (when user sees pricing page)
pricing_experiment_exposed {
  variant: 'annual_29' | 'annual_49' | 'annual_79',
  experiment_name: 'pricing_competitive_test_2026_q1',
  is_product_hunt_user: boolean,
  user_cohort: 'organic' | 'product_hunt',
}

// Interval toggle (annual ↔ monthly)
pricing_interval_toggled {
  variant: string,
  from: 'monthly' | 'annual',
  to: 'monthly' | 'annual',
  annualPrice: number,
  monthlyPrice: number,
}

// Tier selection (user clicks CTA)
pricing_tier_selected {
  variant: string,
  interval: 'monthly' | 'annual',
  price: number,
  priceId: string,
  experiment: 'pricing_competitive_test_2026_q1',
}

// Checkout completion
checkout_completed {
  variant: string,
  interval: 'monthly' | 'annual',
  price: number,
  revenue: number,
}
```

### Sample Size
- **Target:** 300 total visitors (100 per variant)
- **Minimum for significance:** 30 conversions (10 per variant)
- **Projected timeline:** 14 days at current traffic

---

## 🗓️ Timeline

| Day | Milestone | Action |
|-----|-----------|--------|
| **Day 0** | Setup complete | Deploy experiment to production |
| **Day 1-6** | Data collection | Monitor daily, no decisions |
| **Day 7** | Mid-experiment check | Review metrics, check for technical issues |
| **Day 8-13** | Continued collection | Monitor daily |
| **Day 14** | Final analysis | Pull final metrics, calculate significance |
| **Day 15** | Decision & rollout | Implement winning variant for all users |

---

## 🔬 Decision Framework

### When to Decide

**Option 1: Early Winner (before Day 14)**
- IF one variant has 90%+ confidence AND 20%+ revenue lift
- AND minimum 50 total conversions reached
- THEN conclude early and implement winner

**Option 2: Full 14-Day Run (default)**
- Run full 14 days regardless of interim results
- Make decision on Day 14 with full dataset
- More conservative, higher confidence

**Option 3: Extension (low volume)**
- IF Day 14 conversions < 30 total
- OR revenue differences < 10% and not statistically significant
- THEN extend 7-14 more days

### Decision Criteria

1. **Revenue per Visitor** (primary)
   - Variant with highest revenue per visitor wins
   - Minimum 10% lift required to switch from current $79 pricing

2. **Statistical Significance** (gatekeeper)
   - Minimum 90% confidence (p-value < 0.10)
   - Use chi-squared test for conversion rate differences

3. **Cohort Analysis** (secondary)
   - Check Product Hunt cohort vs organic separately
   - Ensure winner performs across both cohorts

4. **LTV Considerations** (long-term)
   - Estimate LTV impact based on retention assumptions
   - Lower price may attract less sticky customers

---

## 🛠️ Implementation

### 1. Environment Variables

Add to `.env.local` and `.env.production`:

```bash
# Variant A - $29/year (NEW)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29=price_XXXXXXXXXXXXXXX

# Variant B - $49/year (EXISTING)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXXXXX

# Variant C - $79/year (EXISTING)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=price_XXXXXXXXXXXXXXX

# Monthly option (EXISTING)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=price_XXXXXXXXXXXXXXX
```

### 2. Setup Stripe Prices

Run the setup script to create the $29/year price:

```bash
npx ts-node scripts/setup-pricing-experiment-v2.ts
```

This creates:
- Stripe price for $29/year variant
- Experiment configuration file
- Quick reference guide

### 3. Deploy to Production

```bash
npm run build
git add -A
git commit -m "[P2-MEDIUM] Pricing Strategy A/B Test - $29 vs $49 vs $79/year variants with PostHog tracking"
git push origin main
```

### 4. Monitor Daily

```bash
npm run monitor:pricing-experiment
```

Generates daily reports with:
- Conversion rates by variant
- Revenue per visitor
- Statistical significance
- Decision recommendations

---

## 📊 Analysis Plan

### Day 7 Mid-Experiment Check

**Review:**
1. Are all variants receiving traffic? (Should be ~33% each)
2. Are conversions being tracked correctly in PostHog?
3. Any technical issues or bugs?
4. Preliminary conversion rate trends

**Action:**
- Fix any technical issues
- Continue experiment
- Do NOT make pricing decisions yet

### Day 14 Final Analysis

**Pull Data:**
```bash
npm run analyze:pricing-experiment
```

**Calculate:**
1. Conversion rate by variant (with 95% confidence intervals)
2. Revenue per visitor by variant
3. Statistical significance (chi-squared test)
4. Monthly vs annual selection by variant
5. Cohort breakdown (Product Hunt vs organic)

**Decision Matrix:**

| Scenario | Winning Variant | Action |
|----------|-----------------|--------|
| **A wins** | $29/year | Lower price to $29, update all marketing |
| **B wins** | $49/year | Keep $49 as current price |
| **C wins** | $79/year | Revert to $79 original pricing |
| **Tie** | No clear winner | Extend 7 days OR default to middle ground ($49) |

**Rollout:**
1. Update `usePricingExperiment` hook to hardcode winning variant
2. Remove experiment logic after 30 days
3. Update marketing materials with winning price
4. Document learnings for future experiments

---

## 🚨 Risks & Mitigation

### Risk 1: Low Traffic Volume
**Impact:** May not reach statistical significance in 14 days
**Mitigation:**
- Monitor daily traffic
- Extend experiment to 21-28 days if needed
- Consider paid traffic boost (Google Ads)

### Risk 2: Revenue Cannibalization
**Impact:** Lower price may reduce revenue from existing users
**Mitigation:**
- New users only (existing users grandfathered)
- Monitor customer quality metrics (retention, support tickets)
- Can revert to higher price if LTV decreases

### Risk 3: Brand Perception
**Impact:** $29 pricing may cheapen premium positioning
**Mitigation:**
- Differentiated messaging emphasizes different value props
- $79 variant still available for premium positioning test
- Can always raise prices later if needed

### Risk 4: Technical Issues
**Impact:** Stripe price IDs misconfigured, tracking broken
**Mitigation:**
- Test all variants manually before launch
- Monitor PostHog events daily
- Setup alerts for 0 conversions in 24hrs

---

## ✅ Pre-Launch Checklist

- [ ] Create $29/year Stripe price (`setup-pricing-experiment-v2.ts`)
- [ ] Add all price IDs to `.env.production`
- [ ] Test each variant manually in staging
- [ ] Verify PostHog tracking fires correctly
- [ ] Verify Stripe checkout works for all variants
- [ ] Setup daily monitoring script in cron
- [ ] Create experiment dashboard in PostHog
- [ ] Brief team on experiment (no manual intervention)
- [ ] Deploy to production
- [ ] Verify live traffic split is 33/33/33

---

## 📚 References

- **Competitor Research:** docs/COMPETITOR_PRICING_ANALYSIS_2026_Q1.md
- **Experiment Config:** docs/PRICING_EXPERIMENT_V2_CONFIG.json
- **Quick Reference:** docs/PRICING_EXPERIMENT_V2_QUICK_REFERENCE.md
- **PostHog Docs:** https://posthog.com/docs/experiments
- **Stripe Prices API:** https://stripe.com/docs/api/prices

---

## 📞 Contact

**Questions or Issues:**
- Product Lead: Michael Guo
- Analytics: PostHog Dashboard
- Revenue Data: Stripe Dashboard

**Emergency Stop:** If experiment causes major revenue drop or technical issues, revert immediately by hardcoding `variant: 'annual_79'` in `usePricingExperiment` hook.

---

**Status:** ✅ Ready to deploy
**Next Action:** Run `npx ts-node scripts/setup-pricing-experiment-v2.ts` to create Stripe prices and deploy
