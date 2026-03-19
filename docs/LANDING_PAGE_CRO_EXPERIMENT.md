# Landing Page CRO A/B Test - March 2026

**Experiment ID:** `landing-headline-cro-march-2026`
**Status:** 🟢 ACTIVE
**Start Date:** March 19, 2026
**End Date:** March 26, 2026 (1 week)
**Target Sample Size:** 100+ visitors per variant (300+ total)

---

## 📊 Experiment Overview

### Objective
Test 3 headline variants to increase landing page → calculator completion conversion rate by **20%+**.

### Hypothesis
Headlines that emphasize specific financial pain, professional tool positioning, or urgent action will significantly outperform generic "cross-border tax" messaging.

---

## 🧪 Test Variants

| Variant | Type | Headline | Subheadline | Badge |
|---------|------|----------|-------------|-------|
| **A (Control)** | Pain-focused | "Save $5,000+ on H1B RSU Taxes" | H-1B and TN visa tech workers lose thousands to double taxation every year. Our CPA-verified calculator optimizes Foreign Tax Credits so you keep more of your RSU income. | "$5,000+" |
| **B** | Feature-focused | "Cross-Border Tax Calculator for Tech Workers" | Accurate US-Canada tax calculations built specifically for H-1B/TN visa holders with RSU compensation. CPA-verified Foreign Tax Credit optimizer included. | None |
| **C** | Urgency-focused | "Stop Overpaying on Stock Compensation Tax" | Take action now—H-1B/TN workers overpay thousands annually on RSU taxes due to missed Foreign Tax Credits. Our calculator ensures you claim every dollar you deserve. | "Stop Overpaying" |

**Traffic Split:** 33% / 33% / 34% (equal distribution)

---

## 📈 Success Metrics

### Primary Metric (Goal)
**Landing Page → Calculator Completion Rate**
- Event sequence: `landing_page_viewed` → `calculator_completed`
- Target: 20%+ improvement in best variant vs control
- Baseline (estimated): 15% completion rate

### Secondary Metrics
1. **Landing Page → Signup Rate**
   - Event sequence: `landing_page_viewed` → `user_signed_up`
   - Target: 10%+ improvement
   - Baseline (estimated): 5% signup rate

2. **CTA Click-Through Rate**
   - Event: `cta_button_clicked` from landing page
   - Target: 25%+ CTR in best variant
   - Baseline (estimated): 18% CTR

### Revenue Metrics
3. **Calculator → Paid Conversion Rate**
   - Event sequence: `calculator_completed` → `subscription_purchased`
   - Target: Revenue increase proportional to completion rate lift
   - Baseline (estimated): 2% paid conversion

---

## 🔬 Statistical Significance

- **Minimum Sample Size:** 100 visitors per variant (300 total)
- **Confidence Level:** 95% (p-value < 0.05)
- **Expected Test Duration:** 1 week (based on current traffic: ~50 visitors/day)
- **Early Stopping:** DO NOT stop test before reaching minimum sample size

### Statistical Power Calculation
- **Baseline Conversion Rate:** 15%
- **Minimum Detectable Effect (MDE):** 20% relative improvement (3% absolute)
- **Expected Conversion Rate Range:** 15% (control) to 18% (winner)
- **Power:** 80% (β = 0.20)

---

## 📊 PostHog Monitoring Guide

### 1. Access PostHog Experiments Dashboard

**Dashboard URL:** https://app.posthog.com/project/{project_id}/experiments

**Find This Experiment:**
1. Navigate to **Experiments** in left sidebar
2. Search for: `landing-headline-cro-march-2026`
3. Or filter by **Status: Running**

### 2. Key Events to Track

Monitor these events in PostHog Insights:

#### Funnel Events (in order)
```
1. landing_page_viewed (with experimentName: 'landing-headline-cro-march-2026')
   ↓
2. cta_button_clicked (with headlineVariant: variant-a-pain|variant-b-feature|variant-c-urgency)
   ↓
3. calculator_completed
   ↓
4. user_signed_up
   ↓
5. subscription_purchased
```

#### Event Properties to Filter By
- `experimentName`: `landing-headline-cro-march-2026`
- `headlineVariant`: `variant-a-pain` | `variant-b-feature` | `variant-c-urgency`
- `headlineText`: Full headline text
- `ctaEmphasis`: `pain` | `feature` | `urgency`
- `showsSavingsBadge`: `true` | `false`

### 3. Create Custom Insights

**Insight #1: Conversion Funnel by Variant**
```sql
Events: landing_page_viewed → calculator_completed → user_signed_up
Breakdown by: headlineVariant
Filter: experimentName = 'landing-headline-cro-march-2026'
```

**Insight #2: CTA Click Rate by Variant**
```sql
Event: cta_button_clicked
Breakdown by: headlineVariant
Formula: (cta_button_clicked / landing_page_viewed) * 100
Filter: experimentName = 'landing-headline-cro-march-2026'
```

**Insight #3: Revenue by Variant**
```sql
Events: subscription_purchased
Breakdown by: headlineVariant (from previous landing_page_viewed)
Sum: subscription_amount
Filter: experimentName = 'landing-headline-cro-march-2026'
```

### 4. Automated Results Script

Run the automated experiment analysis script:

```bash
npm run analyze:experiment
```

This script will:
- Pull experiment data from PostHog API
- Calculate conversion rates for all variants
- Perform statistical significance tests
- Generate a results report with recommendations
- Export data to CSV for further analysis

**Output Files:**
- `docs/experiment-results/landing-headline-cro-march-2026-results.json`
- `docs/experiment-results/landing-headline-cro-march-2026-results.csv`
- `docs/experiment-results/landing-headline-cro-march-2026-report.md`

---

## 🎯 Decision Criteria

### When to Stop the Test

**STOP and implement winner if:**
- ✅ Minimum sample size reached (300+ total visitors)
- ✅ Statistical significance achieved (p < 0.05)
- ✅ Clear winner with 20%+ lift in primary metric
- ✅ At least 7 days of data collected

**CONTINUE testing if:**
- ❌ Sample size < 300 visitors total
- ❌ No statistical significance (p ≥ 0.05)
- ❌ Test running < 7 days
- ❌ Results are inconclusive or contradictory

**EXTEND test if:**
- 🟡 Trend shows promise but not yet significant
- 🟡 Weekend vs weekday traffic differs significantly
- 🟡 Conversion rates are unstable (high variance)

### Winner Selection Criteria

**Primary:** Variant with highest `landing_page_viewed → calculator_completed` rate (min 20% lift, p < 0.05)

**Tiebreaker (if primary metric is tied):**
1. Secondary: Highest `landing_page_viewed → user_signed_up` rate
2. Revenue: Highest `subscription_purchased` count
3. Engagement: Highest average time on landing page

---

## 📅 Experiment Timeline

| Date | Milestone | Action Required |
|------|-----------|-----------------|
| **March 19** | Test launched | ✅ Monitor first 24 hours for tracking errors |
| **March 21** | Mid-test check | 📊 Review preliminary data, check for anomalies |
| **March 23** | 5-day checkpoint | 📈 Assess if on track for sample size target |
| **March 26** | Test end date | 🎯 Pull final results, run statistical analysis |
| **March 27** | Implementation | 🚀 Deploy winning variant to 100% of traffic |

---

## 🚨 Quality Assurance Checklist

**Before Test Launch:**
- [x] PostHog tracking verified on landing page
- [x] All 3 variants rendering correctly
- [x] Event properties include `experimentName` and `headlineVariant`
- [x] Funnel events firing in correct sequence
- [x] Traffic split is equal (33/33/34%)

**During Test (Daily Checks):**
- [ ] No JavaScript errors in browser console
- [ ] Event volume is consistent across variants
- [ ] No bot traffic skewing results
- [ ] Mobile vs desktop traffic is balanced
- [ ] Conversion rates are stable (no sudden spikes/drops)

**After Test (Before Implementation):**
- [ ] Statistical significance confirmed (p < 0.05)
- [ ] Minimum sample size reached (300+ visitors)
- [ ] Results are reproducible (stable over 7 days)
- [ ] Winner has 20%+ lift in primary metric
- [ ] Stakeholder approval obtained

---

## 🔍 Troubleshooting

### Issue: No events showing in PostHog

**Diagnosis:**
1. Open browser DevTools → Console
2. Look for PostHog errors
3. Check Network tab for failed API calls to `https://app.posthog.com/capture`

**Solutions:**
- Verify PostHog API key is set in `.env.production`
- Check if PostHog SDK is initialized in `app/layout.tsx`
- Ensure `posthog.capture()` calls are not blocked by ad blockers

### Issue: Uneven traffic distribution

**Diagnosis:**
```bash
npm run analyze:experiment -- --check-distribution
```

**Expected:** 33% ± 5% per variant (acceptable range: 28-38%)

**Solutions:**
- If deviation > 10%, check useABTest hook weight configuration
- Verify localStorage is not cached causing sticky assignments
- Clear cookies and test in incognito mode

### Issue: Events firing out of order

**Diagnosis:**
Check event timestamps in PostHog → Person view

**Solutions:**
- Ensure `trackEvent()` calls are in correct sequence
- Use `useEffect` dependencies to control event firing
- Add delays between rapid-fire events if needed

---

## 📚 Resources

- **PostHog Experiments Guide:** https://posthog.com/docs/experiments
- **Statistical Significance Calculator:** https://www.optimizely.com/sample-size-calculator/
- **A/B Testing Best Practices:** https://cxl.com/blog/ab-testing-guide/
- **Internal Documentation:** `/docs/AB_TESTING_PLAYBOOK.md`

---

## 👥 Experiment Owners

- **Product Lead:** Michael Guo
- **Engineering:** TaxBridge Dev Team
- **Analytics:** PostHog Dashboard
- **Decision Maker:** CEO (based on results)

---

## 📝 Notes

- This experiment runs **independently** from other landing page tests (CTA button, trust signals placement)
- If winner has < 15% absolute conversion rate, consider running a follow-up test with revised subheadlines
- Plan to test winning headline against 3 NEW variants in April 2026 sprint for continuous optimization
- Document insights in `docs/experiment-learnings/` for future reference

---

**Last Updated:** March 19, 2026
**Next Review:** March 26, 2026
