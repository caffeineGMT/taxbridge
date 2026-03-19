# PostHog A/B Test Analysis Guide

## Step-by-Step: Analyzing the Landing Page Headline A/B Test

This guide walks you through analyzing the March 2026 headline CRO experiment using PostHog.

---

## Part 1: Quick Check - Is the test running?

### Step 1: Verify Feature Flag is Active

1. **Login to PostHog**: https://app.posthog.com
2. **Navigate**: Left sidebar → Feature Flags
3. **Find**: "landing-headline-cro-march-2026"
4. **Verify**:
   - Status: ✅ Enabled
   - Rollout: 100%
   - Variants showing 33%/33%/34% split

**Screenshot location**: `docs/screenshots/posthog-feature-flag-status.png`

### Step 2: Check Events are Firing

1. **Navigate**: Left sidebar → Events → Live Events
2. **Look for** these events appearing in real-time:
   - `landing_page_viewed`
   - `cta_button_clicked`
   - `tax_calculation_viewed`
3. **Click on any event** → Check properties include:
   - `experimentName: "landing-headline-cro-march-2026"`
   - `headlineVariant: "variant-a-savings"` (or b/c)

**If events are NOT firing**: Check `/lib/analytics/posthog.ts` for correct initialization

---

## Part 2: Daily Monitoring - Quick Health Check

### Quick Variant Distribution Check

**Goal**: Ensure traffic is split evenly across all 3 variants

1. **Navigate**: PostHog → Insights → New Insight
2. **Select**: Trends
3. **Configure**:
   - Event: `landing_page_viewed`
   - Filter: `experimentName = landing-headline-cro-march-2026`
   - Breakdown by: `headlineVariant`
   - Date range: Last 7 days
4. **Expected result**: 3 lines showing roughly equal traffic

**Red flag**: If one variant has <25% or >40% of traffic, feature flag may be misconfigured

---

## Part 3: Weekly Analysis - Conversion Funnel

### Create Conversion Funnel (Do this every Monday)

1. **Navigate**: PostHog → Insights → New Insight → Funnels
2. **Build funnel steps**:
   - **Step 1**: `landing_page_viewed`
     - Filter: `experimentName = landing-headline-cro-march-2026`
   - **Step 2**: `cta_button_clicked`
   - **Step 3**: `tax_calculation_viewed`
   - **Step 4** (optional): `signup_completed`
3. **Breakdown by**: `headlineVariant`
4. **Date range**: Last 7 days
5. **Click "Save & Add to Dashboard"**

### Reading the Funnel Results

**You'll see 3 funnels side-by-side**:

```
Variant A (Savings):
Landing (1,000) → CTA (350) → Calculator (280) → Signup (45)
        100%         35%          28%              4.5%

Variant B (Professional):
Landing (1,000) → CTA (280) → Calculator (220) → Signup (38)
        100%         28%          22%              3.8%

Variant C (Speed):
Landing (1,000) → CTA (420) → Calculator (340) → Signup (52)
        100%         42%          34%              5.2%
```

**In this example**: Variant C (Speed) is winning with 34% conversion rate

---

## Part 4: Statistical Significance Check

PostHog doesn't auto-calculate statistical significance for custom experiments, so use this manual check:

### Option 1: Use Online Calculator

1. **Go to**: https://www.evanmiller.org/ab-testing/chi-squared.html
2. **Input data for each variant**:
   - Variant A: 1000 visitors, 280 conversions
   - Variant B: 1000 visitors, 220 conversions
   - Variant C: 1000 visitors, 340 conversions
3. **Read result**: "Statistically significant at 95% confidence: YES/NO"

### Option 2: Manual Chi-Square Test

**Minimum sample size per variant**:
- For 15% lift: ~385 conversions per variant
- For 20% lift: ~250 conversions per variant
- For 30% lift: ~100 conversions per variant

**Confidence threshold**: p-value < 0.05 (95% confidence)

**Rule of thumb**: If winning variant has <100 conversions difference from runner-up, likely NOT significant yet

---

## Part 5: Deep Dive - Segment Analysis

### Check if results vary by traffic source

1. **Navigate**: PostHog → Insights → Funnels
2. **Use same funnel** from Part 3
3. **Add second breakdown**: `utm_source` OR `referrer`
4. **Look for patterns**:
   - Do Google Ads visitors prefer different headlines than organic?
   - Does Reddit traffic convert better with Variant C (Speed)?

**Example insights**:
- "Variant A (Savings) wins for paid search traffic"
- "Variant C (Speed) wins for Reddit/social media"

**Action**: You may want to personalize headlines by traffic source in future

### Check mobile vs desktop performance

1. **Same funnel**
2. **Breakdown by**: `$device_type`
3. **Look for**:
   - Do mobile users prefer shorter headlines? (Variant C)
   - Do desktop users engage more with professional tool messaging? (Variant B)

---

## Part 6: Final Analysis (End of Week 2)

### Generate Full Experiment Report

1. **Navigate**: PostHog → Insights → Dashboard
2. **Create new dashboard**: "Landing Headline CRO - Final Results"
3. **Add these insights**:

#### Chart 1: Variant Exposure
- Type: Trends
- Event: `landing_page_viewed`
- Breakdown: `headlineVariant`
- Date: March 19 - April 2

#### Chart 2: CTA Click Rate
- Type: Funnel
- Steps: Landing → CTA Click
- Breakdown: `headlineVariant`

#### Chart 3: Full Conversion Funnel
- Type: Funnel
- Steps: Landing → CTA → Calculator → Signup
- Breakdown: `headlineVariant`

#### Chart 4: Time to First Action
- Type: Trends
- Event: `cta_button_clicked`
- Property: `time_to_first_action` (custom property)
- Breakdown: `headlineVariant`

#### Chart 5: Bounce Rate
- Type: Trends
- Event: `page_viewed` (exit without interaction)
- Filter: No `cta_button_clicked` event within session
- Breakdown: `headlineVariant`

### Export Raw Data for Spreadsheet Analysis

1. **Navigate**: PostHog → Events
2. **Filter**:
   - `experimentName = landing-headline-cro-march-2026`
   - Date range: March 19 - April 2, 2026
3. **Export**: Click "Export" → CSV
4. **Use data** in `/scripts/analyze-ab-test-results.ts`

---

## Part 7: SQL Query for Power Users

If you need more control, use PostHog's SQL feature:

```sql
-- Full conversion funnel by variant
WITH variant_landings AS (
  SELECT
    properties.headlineVariant as variant,
    COUNT(DISTINCT person_id) as total_visitors,
    COUNT(DISTINCT timestamp::date) as days_active
  FROM events
  WHERE
    event = 'landing_page_viewed'
    AND properties.experimentName = 'landing-headline-cro-march-2026'
    AND timestamp >= '2026-03-19'
    AND timestamp <= '2026-04-02'
  GROUP BY properties.headlineVariant
),
variant_cta_clicks AS (
  SELECT
    properties.headlineVariant as variant,
    COUNT(DISTINCT person_id) as cta_clickers
  FROM events
  WHERE
    event = 'cta_button_clicked'
    AND properties.experimentName = 'landing-headline-cro-march-2026'
    AND timestamp >= '2026-03-19'
    AND timestamp <= '2026-04-02'
  GROUP BY properties.headlineVariant
),
variant_calculator AS (
  SELECT
    properties.headlineVariant as variant,
    COUNT(DISTINCT person_id) as calculator_users
  FROM events
  WHERE
    event = 'tax_calculation_viewed'
    AND timestamp >= '2026-03-19'
    AND timestamp <= '2026-04-02'
  GROUP BY properties.headlineVariant
),
variant_signups AS (
  SELECT
    properties.headlineVariant as variant,
    COUNT(DISTINCT person_id) as signups
  FROM events
  WHERE
    event = 'signup_completed'
    AND timestamp >= '2026-03-19'
    AND timestamp <= '2026-04-02'
  GROUP BY properties.headlineVariant
)
SELECT
  l.variant,
  l.total_visitors,
  COALESCE(c.cta_clickers, 0) as cta_clicks,
  COALESCE(calc.calculator_users, 0) as calculator_completions,
  COALESCE(s.signups, 0) as signups,
  ROUND(100.0 * COALESCE(c.cta_clickers, 0) / l.total_visitors, 2) as cta_rate,
  ROUND(100.0 * COALESCE(calc.calculator_users, 0) / l.total_visitors, 2) as conversion_rate,
  ROUND(100.0 * COALESCE(s.signups, 0) / l.total_visitors, 2) as signup_rate
FROM variant_landings l
LEFT JOIN variant_cta_clicks c ON l.variant = c.variant
LEFT JOIN variant_calculator calc ON l.variant = calc.variant
LEFT JOIN variant_signups s ON l.variant = s.variant
ORDER BY conversion_rate DESC;
```

**Save this query** as "Headline CRO - Full Metrics" in PostHog

---

## Part 8: Common Issues & Troubleshooting

### Issue: No events showing up

**Possible causes**:
1. PostHog not initialized (check browser console for errors)
2. Ad blocker blocking PostHog (test in incognito mode)
3. Feature flag not created or disabled

**Fix**:
```bash
# Check PostHog initialization
# Open browser console on landing page
console.log(posthog.__loaded) // Should return true
console.log(posthog.getFeatureFlag('landing-headline-cro-march-2026')) // Should return variant name
```

### Issue: Traffic split is uneven (e.g., 60% / 20% / 20%)

**Possible causes**:
1. Feature flag weights misconfigured
2. Not enough traffic yet (first 100 visitors can be random)

**Fix**:
- Check feature flag settings in PostHog dashboard
- Wait for 500+ visitors before judging distribution

### Issue: Can't find experiment in PostHog

**Possible causes**:
1. Wrong project selected
2. Experiment name typo in code
3. Feature flag not created

**Fix**:
```javascript
// In browser console
posthog.getFeatureFlag('landing-headline-cro-march-2026')
// Should return: 'variant-a-savings' or 'variant-b-professional' or 'variant-c-speed'
```

### Issue: Conversion rate looks wrong

**Possible causes**:
1. Events tracked on wrong page
2. User journey crosses multiple sessions (use person-based funnel, not session-based)
3. Duplicate events being tracked

**Fix**:
- Check event properties in PostHog Event Explorer
- Verify `experimentName` property is attached to ALL funnel steps

---

## Appendix: Key PostHog Filters

### Filter: Only experiment traffic
```
experimentName = landing-headline-cro-march-2026
```

### Filter: Specific variant
```
headlineVariant = variant-a-savings
```

### Filter: Paid traffic only
```
utm_source != (none)
```

### Filter: Mobile traffic
```
$device_type = Mobile
```

### Filter: First-time visitors
```
$is_identified = false
```

---

## Resources

- **PostHog Docs**: https://posthog.com/docs/user-guides/funnels
- **Statistical Significance Calculator**: https://www.evanmiller.org/ab-testing/chi-squared.html
- **Sample Size Calculator**: https://www.optimizely.com/sample-size-calculator/
- **A/B Testing Best Practices**: https://cxl.com/blog/ab-testing-guide/

---

**Last Updated**: March 19, 2026
**Experiment Owner**: CTO
**Questions**: Post in #growth-experiments Slack channel
