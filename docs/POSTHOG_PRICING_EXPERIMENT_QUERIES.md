# PostHog Queries for Pricing Experiment

**Experiment:** `annual_pricing_competitive_test_2026_q1`
**Variants:** `annual_29`, `annual_49`, `annual_79`
**Duration:** 14 days (March 19 - April 2, 2026)

---

## Dashboard Setup

### Create Dashboard: "Pricing Experiment 2026-Q1"

1. Go to: https://app.posthog.com/dashboards
2. Click "New dashboard"
3. Name: **Pricing Experiment 2026-Q1**
4. Description: **3-way A/B/C test: $29 vs $49 vs $79 annual pricing**
5. Add the insights below

---

## Insight 1: Conversion Funnel by Variant

**Type:** Funnel
**Name:** Pricing Experiment Conversion Funnel

### Configuration
```
Funnel Steps:
1. pricing_page_viewed
2. pricing_tier_selected (plan = 'pro')
3. checkout_started
4. checkout_completed

Breakdown by: variant
Filter: experiment = 'annual_pricing_competitive_test_2026_q1'
Date range: Last 14 days
Conversion window: 7 days
```

### Expected Output
```
Variant A (annual_29):
  Step 1: 300 visitors → 100%
  Step 2: 24 selected   → 8.0%
  Step 3: 20 checkout   → 6.7%
  Step 4: 18 completed  → 6.0%

Variant B (annual_49):
  Step 1: 300 visitors → 100%
  Step 2: 15 selected  → 5.0%
  Step 3: 13 checkout  → 4.3%
  Step 4: 12 completed → 4.0%

Variant C (annual_79):
  Step 1: 300 visitors → 100%
  Step 2: 9 selected   → 3.0%
  Step 3: 8 checkout   → 2.7%
  Step 4: 7 completed  → 2.3%
```

---

## Insight 2: Revenue by Variant

**Type:** Trends
**Name:** Total Revenue by Pricing Variant

### Configuration
```
Event: checkout_completed
Formula: SUM(revenue)
Breakdown by: variant
Filter: experiment = 'annual_pricing_competitive_test_2026_q1'
Date range: Last 14 days
```

### Expected Output
```
annual_29: $522 (18 customers × $29)
annual_49: $588 (12 customers × $49)  ← Highest revenue
annual_79: $553 (7 customers × $79)
```

**Winner:** Variant B ($49) - 12.6% higher revenue than $29

---

## Insight 3: Visitor Distribution (Traffic Split Check)

**Type:** Trends
**Name:** Visitors by Variant (Should be 33/33/33)

### Configuration
```
Event: pricing_page_viewed
Formula: COUNT(DISTINCT person_id)
Breakdown by: variant
Filter: experiment = 'annual_pricing_competitive_test_2026_q1'
Date range: Last 14 days
```

### Expected Output
```
annual_29: 298 (33.1%) ✓
annual_49: 301 (33.4%) ✓
annual_79: 301 (33.4%) ✓

Total: 900 visitors
```

**Alert:** If any variant is <30% or >36%, traffic split is broken!

---

## Insight 4: Conversion Rate Over Time

**Type:** Trends
**Name:** Daily Conversion Rate by Variant

### Configuration
```
Event: checkout_completed
Formula: (COUNT(checkout_completed) / COUNT(pricing_page_viewed)) × 100
Breakdown by: variant
Filter: experiment = 'annual_pricing_competitive_test_2026_q1'
Date range: Last 14 days
Interval: Daily
```

### Expected Output
```
Day 1-3:   Lower CR (users are browsing, not ready to buy)
Day 4-10:  Steady CR increase (trial users converting)
Day 11-14: Plateau (market rate established)

Target CR:
  annual_29: 6-10%
  annual_49: 4-6%
  annual_79: 2-4%
```

---

## Insight 5: Average Time to Conversion

**Type:** Trends
**Name:** Time to Conversion by Variant

### Configuration
```
Event: checkout_completed
Formula: AVG(time_to_conversion)
Breakdown by: variant
Filter: experiment = 'annual_pricing_competitive_test_2026_q1'
Date range: Last 14 days
```

**Hypothesis:** Lower prices = faster conversion (less deliberation)

### Expected Output
```
annual_29: 45 minutes (quick decision)
annual_49: 2.5 hours (moderate deliberation)
annual_79: 6 hours (significant deliberation)
```

---

## Insight 6: Trial-to-Paid Conversion Rate

**Type:** Funnel
**Name:** Trial to Paid by Variant

### Configuration
```
Funnel Steps:
1. trial_started
2. trial_converted_to_paid

Breakdown by: variant
Filter: experiment = 'annual_pricing_competitive_test_2026_q1'
Date range: Last 14 days + 7 days (to capture trial ends)
```

**Question:** Do cheaper trials convert better?

### Expected Output
```
annual_29: 60% trial-to-paid (high conversion)
annual_49: 55% trial-to-paid (moderate)
annual_79: 45% trial-to-paid (lower, but higher LTV?)
```

---

## Insight 7: Revenue per 100 Visitors (KEY METRIC)

**Type:** Formula
**Name:** Revenue per 100 Visitors by Variant

### Manual Calculation
```sql
Revenue/100 = (Total Revenue ÷ Total Visitors) × 100

Example:
annual_29: ($522 ÷ 298) × 100 = $1.75/visitor
annual_49: ($588 ÷ 301) × 100 = $1.95/visitor ← WINNER
annual_79: ($553 ÷ 301) × 100 = $1.84/visitor
```

**Winner:** Variant with highest revenue per 100 visitors

---

## Insight 8: Cohort Retention by Variant

**Type:** Retention
**Name:** 30-Day Retention by Pricing Variant

### Configuration
```
Start event: subscription_activated
Return event: (any activity in dashboard)
Breakdown by: variant
Filter: experiment = 'annual_pricing_competitive_test_2026_q1'
Cohort period: 30 days
```

**Question:** Do cheaper customers churn faster?

### Expected Output
```
Day 1:  annual_29 (95%), annual_49 (96%), annual_79 (98%)
Day 7:  annual_29 (85%), annual_49 (90%), annual_79 (92%)
Day 30: annual_29 (70%), annual_49 (80%), annual_79 (85%)
```

**Insight:** If $29 customers churn 2x faster, LTV may favor $49 or $79

---

## Custom Queries (SQL)

### Query 1: Detailed Conversion Metrics by Variant

```sql
SELECT
  properties.variant,
  COUNT(DISTINCT person_id) AS visitors,
  COUNT(DISTINCT CASE WHEN event = 'pricing_tier_selected' THEN person_id END) AS tier_selections,
  COUNT(DISTINCT CASE WHEN event = 'checkout_started' THEN person_id END) AS checkout_starts,
  COUNT(DISTINCT CASE WHEN event = 'checkout_completed' THEN person_id END) AS checkouts,
  SUM(CASE WHEN event = 'checkout_completed' THEN properties.revenue ELSE 0 END) AS total_revenue,
  ROUND(
    (COUNT(DISTINCT CASE WHEN event = 'checkout_completed' THEN person_id END) * 100.0 /
     COUNT(DISTINCT person_id)),
    2
  ) AS conversion_rate,
  ROUND(
    (SUM(CASE WHEN event = 'checkout_completed' THEN properties.revenue ELSE 0 END) * 100.0 /
     COUNT(DISTINCT person_id)),
    2
  ) AS revenue_per_100_visitors
FROM events
WHERE
  properties.experiment = 'annual_pricing_competitive_test_2026_q1'
  AND timestamp >= '2026-03-19'
  AND timestamp <= '2026-04-02'
GROUP BY properties.variant
ORDER BY revenue_per_100_visitors DESC;
```

### Query 2: Hourly Traffic Distribution Check

```sql
SELECT
  DATE_TRUNC('hour', timestamp) AS hour,
  properties.variant,
  COUNT(*) AS page_views
FROM events
WHERE
  event = 'pricing_page_viewed'
  AND properties.experiment = 'annual_pricing_competitive_test_2026_q1'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY hour, properties.variant
ORDER BY hour DESC;
```

---

## Alerts to Set Up

### Alert 1: Uneven Traffic Split

**Condition:** Any variant <30% or >36% of total traffic
**Action:** Slack notification + email
**Check:** Every 6 hours

### Alert 2: Revenue Drop

**Condition:** Total revenue drops >20% compared to previous 7-day average
**Action:** Immediate Slack alert
**Check:** Every 1 hour

### Alert 3: PostHog Events Not Firing

**Condition:** Zero `pricing_experiment_exposed` events in past 2 hours
**Action:** PagerDuty alert
**Check:** Every 2 hours

### Alert 4: Sample Size Reached

**Condition:** Each variant has 300+ pricing_page_viewed events
**Action:** Email notification "Ready to analyze experiment"
**Check:** Daily at 9am

---

## Statistical Significance Test

### Use PostHog's Built-in Calculator

1. Go to experiment funnel insight
2. Click "Significance" tab
3. PostHog calculates p-value automatically

**Interpretation:**
- **p < 0.05:** Winner is statistically significant (95% confidence) → Implement
- **p >= 0.05:** No significant difference → Extend test or default to $49

### Manual Chi-Squared Test (Backup)

If PostHog doesn't have significance calculator, use:
https://www.evanmiller.org/ab-testing/chi-squared.html

**Input:**
- Control (annual_79): 300 visitors, 7 conversions
- Variant A (annual_29): 300 visitors, 18 conversions
- Variant B (annual_49): 300 visitors, 12 conversions

**Output:** p-value for each comparison

---

## Export Data for Analysis

### Export to CSV

1. Go to insight
2. Click "..." menu → Export to CSV
3. Open in Google Sheets or Excel
4. Run pivot tables and charts

### Export to Google Sheets (Automated)

1. PostHog → Integrations → Google Sheets
2. Select insights to sync
3. Schedule daily sync at 9am
4. Share spreadsheet with team

---

## Checklist for Monitoring

**Daily (First 3 Days):**
- [ ] Check visitor distribution (33/33/33)
- [ ] Verify PostHog events firing
- [ ] Monitor revenue vs baseline
- [ ] Check for error spikes in Sentry

**Weekly (Day 7):**
- [ ] Run mid-experiment analysis
- [ ] Check sample size (900+ total views?)
- [ ] Review conversion rate trends
- [ ] Estimate time to statistical significance

**Final (Day 14):**
- [ ] Export all data to CSV
- [ ] Calculate revenue per 100 visitors
- [ ] Run statistical significance test
- [ ] Document winner and decision rationale
- [ ] Share results with team

---

**Dashboard URL:** https://app.posthog.com/dashboards/[ID]
**Created:** March 19, 2026
**Owner:** Michael Guo
