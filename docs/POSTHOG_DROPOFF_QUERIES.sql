# PostHog Drop-Off Analysis SQL Queries
**TaxBridge Analytics - Data Analysis**
**Purpose:** SQL queries to identify conversion funnel drop-off points, field-level abandonment, and user journey bottlenecks

---

## How to Run These Queries

Navigate to PostHog → **SQL Explorer** → **New Query**

Paste any query below and click **Run**

**Note:** Replace date ranges as needed (`now() - INTERVAL '7 days'`)

---

## Query 1: Calculator Funnel Drop-Off Analysis

**Purpose:** Identify where users abandon the calculator flow

```sql
WITH funnel_steps AS (
  SELECT
    person_id,
    MAX(CASE WHEN event = 'calculator_page_viewed' THEN 1 ELSE 0 END) AS step_1_viewed,
    MAX(CASE WHEN event = 'tax_calculation_viewed' THEN 1 ELSE 0 END) AS step_2_calculated,
    MAX(CASE WHEN event = 'email_captured' THEN 1 ELSE 0 END) AS step_3_email,
    MIN(CASE WHEN event = 'calculator_page_viewed' THEN timestamp END) AS calculator_time,
    MIN(CASE WHEN event = 'tax_calculation_viewed' THEN timestamp END) AS calculation_time,
    MIN(CASE WHEN event = 'email_captured' THEN timestamp END) AS email_time
  FROM events
  WHERE timestamp >= now() - INTERVAL '30 days'
    AND person_id NOT LIKE '%test%'
  GROUP BY person_id
)
SELECT
  COUNT(*) AS total_users,
  SUM(step_1_viewed) AS viewed_calculator,
  SUM(step_2_calculated) AS completed_calculation,
  SUM(step_3_email) AS captured_email,

  -- Drop-off counts
  SUM(CASE WHEN step_1_viewed = 1 AND step_2_calculated = 0 THEN 1 ELSE 0 END) AS dropoff_before_calc,
  SUM(CASE WHEN step_2_calculated = 1 AND step_3_email = 0 THEN 1 ELSE 0 END) AS dropoff_after_calc,

  -- Conversion rates
  ROUND(100.0 * SUM(step_2_calculated) / NULLIF(SUM(step_1_viewed), 0), 2) AS calc_completion_rate,
  ROUND(100.0 * SUM(step_3_email) / NULLIF(SUM(step_2_calculated), 0), 2) AS email_capture_rate,
  ROUND(100.0 * SUM(step_3_email) / NULLIF(SUM(step_1_viewed), 0), 2) AS overall_conversion
FROM funnel_steps;
```

**Expected Output:**
| total_users | viewed_calculator | completed_calculation | captured_email | dropoff_before_calc | dropoff_after_calc | calc_completion_rate | email_capture_rate | overall_conversion |
|-------------|-------------------|----------------------|----------------|---------------------|-------------------|---------------------|-------------------|-------------------|
| 1000 | 800 | 640 | 96 | 160 | 544 | 80.00 | 15.00 | 12.00 |

**Interpretation:**
- `calc_completion_rate < 70%`: Calculator UX issue or loading problem
- `email_capture_rate < 10%`: Value proposition not compelling
- `dropoff_after_calc` high: Users don't see enough value to share email

---

## Query 2: Time to Convert Analysis

**Purpose:** Understand how long users take to complete each funnel step

```sql
WITH funnel_times AS (
  SELECT
    person_id,
    MIN(CASE WHEN event = 'calculator_page_viewed' THEN timestamp END) AS t1,
    MIN(CASE WHEN event = 'tax_calculation_viewed' THEN timestamp END) AS t2,
    MIN(CASE WHEN event = 'email_captured' THEN timestamp END) AS t3
  FROM events
  WHERE timestamp >= now() - INTERVAL '30 days'
  GROUP BY person_id
  HAVING COUNT(DISTINCT event) >= 2
)
SELECT
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (t2 - t1))) AS median_time_to_calculate_sec,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (t3 - t2))) AS median_time_to_email_sec,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (t3 - t1))) AS median_total_time_sec,

  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (t2 - t1))) AS p90_time_to_calculate_sec,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (t3 - t2))) AS p90_time_to_email_sec
FROM funnel_times
WHERE t2 IS NOT NULL;
```

**Expected Output:**
| median_time_to_calculate_sec | median_time_to_email_sec | median_total_time_sec | p90_time_to_calculate_sec | p90_time_to_email_sec |
|------------------------------|-------------------------|----------------------|--------------------------|---------------------|
| 45 | 30 | 75 | 180 | 120 |

**Interpretation:**
- `median_time_to_calculate` > 2 min: Calculator too complex or confusing
- `p90_time_to_email` > 5 min: Users hesitant to provide email

**Action Items:**
- If time_to_calculate > 3 min: Simplify input fields or add default values
- If time_to_email > 2 min: Improve email CTA or reduce form fields

---

## Query 3: Field-Level Abandonment

**Purpose:** Identify which form fields cause users to drop off

```sql
SELECT
  properties->>'form_id' AS form,
  properties->>'field_name' AS field,

  COUNT(CASE WHEN properties->>'event_type' = 'field_focus' THEN 1 END) AS focus_count,
  COUNT(CASE WHEN properties->>'event_type' = 'field_blur' THEN 1 END) AS blur_count,
  COUNT(CASE WHEN properties->>'event_type' = 'field_change' THEN 1 END) AS change_count,

  -- Completion rate = changed / focused
  ROUND(100.0 * COUNT(CASE WHEN properties->>'event_type' = 'field_change' THEN 1 END) /
        NULLIF(COUNT(CASE WHEN properties->>'event_type' = 'field_focus' THEN 1 END), 0), 2) AS completion_rate,

  -- Average time spent (blur - focus)
  ROUND(AVG(
    CASE WHEN properties->>'event_type' = 'field_blur'
    THEN (properties->>'time_spent_ms')::numeric
    END
  ) / 1000.0, 2) AS avg_time_spent_sec

FROM events
WHERE event = 'page_viewed'
  AND properties->>'event_type' IN ('field_focus', 'field_blur', 'field_change')
  AND timestamp >= now() - INTERVAL '7 days'
GROUP BY form, field
ORDER BY completion_rate ASC;
```

**Expected Output:**
| form | field | focus_count | blur_count | change_count | completion_rate | avg_time_spent_sec |
|------|-------|-------------|-----------|--------------|----------------|-------------------|
| rsu-entry-form | grantDate | 450 | 440 | 180 | 40.00 | 12.5 |
| rsu-entry-form | vestDate | 420 | 415 | 350 | 83.33 | 8.2 |
| marketing-tax-calculator | email | 200 | 195 | 30 | 15.00 | 45.0 |

**Interpretation:**
- `completion_rate < 50%`: Field is confusing or has validation issues
- `avg_time_spent > 30 sec`: Users struggling to understand what to enter
- High `focus_count` but low `change_count`: Users click but don't fill (UX issue)

**Action Items:**
- For `grantDate` (40% completion): Add date picker, example, or tooltip
- For `email` (15% completion): Too much friction, reduce ask or improve value prop
- For fields with high time spent: Add help text or inline validation

---

## Query 4: Mobile vs Desktop Conversion Rates

**Purpose:** Identify device-specific drop-off issues

```sql
WITH device_funnel AS (
  SELECT
    properties->>'deviceType' AS device,
    person_id,
    MAX(CASE WHEN event = 'calculator_page_viewed' THEN 1 ELSE 0 END) AS viewed,
    MAX(CASE WHEN event = 'tax_calculation_viewed' THEN 1 ELSE 0 END) AS calculated,
    MAX(CASE WHEN event = 'email_captured' THEN 1 ELSE 0 END) AS email
  FROM events
  WHERE timestamp >= now() - INTERVAL '30 days'
  GROUP BY device, person_id
)
SELECT
  device,
  COUNT(*) AS users,
  SUM(viewed) AS viewed_count,
  SUM(calculated) AS calculated_count,
  SUM(email) AS email_count,

  ROUND(100.0 * SUM(calculated) / NULLIF(SUM(viewed), 0), 2) AS calc_rate,
  ROUND(100.0 * SUM(email) / NULLIF(SUM(calculated), 0), 2) AS email_rate,
  ROUND(100.0 * SUM(email) / NULLIF(SUM(viewed), 0), 2) AS overall_rate
FROM device_funnel
GROUP BY device
ORDER BY users DESC;
```

**Expected Output:**
| device | users | viewed_count | calculated_count | email_count | calc_rate | email_rate | overall_rate |
|--------|-------|--------------|-----------------|-------------|----------|-----------|-------------|
| desktop | 600 | 500 | 420 | 75 | 84.00 | 17.86 | 15.00 |
| mobile | 300 | 250 | 150 | 15 | 60.00 | 10.00 | 6.00 |
| tablet | 100 | 80 | 55 | 6 | 68.75 | 10.91 | 7.50 |

**Interpretation:**
- Mobile calc_rate << Desktop: Responsive design issue or input friction
- Mobile email_rate << Desktop: Email form not optimized for mobile

**Action Items:**
- If mobile calc_rate < 50%: Check input types (use `inputMode="numeric"` for numbers)
- If mobile email_rate < 10%: Reduce form fields or add social login

---

## Query 5: Traffic Source Performance

**Purpose:** Identify which marketing channels convert best

```sql
WITH source_funnel AS (
  SELECT
    properties->>'utm_source' AS source,
    person_id,
    MAX(CASE WHEN event = 'calculator_page_viewed' THEN 1 ELSE 0 END) AS viewed,
    MAX(CASE WHEN event = 'email_captured' THEN 1 ELSE 0 END) AS converted
  FROM events
  WHERE timestamp >= now() - INTERVAL '30 days'
  GROUP BY source, person_id
)
SELECT
  COALESCE(source, 'direct') AS traffic_source,
  COUNT(*) AS users,
  SUM(viewed) AS calculator_views,
  SUM(converted) AS emails_captured,
  ROUND(100.0 * SUM(converted) / NULLIF(SUM(viewed), 0), 2) AS conversion_rate
FROM source_funnel
GROUP BY source
ORDER BY emails_captured DESC;
```

**Expected Output:**
| traffic_source | users | calculator_views | emails_captured | conversion_rate |
|----------------|-------|-----------------|----------------|----------------|
| google | 400 | 350 | 63 | 18.00 |
| facebook | 200 | 180 | 18 | 10.00 |
| linkedin | 150 | 140 | 28 | 20.00 |
| direct | 250 | 200 | 20 | 10.00 |

**Interpretation:**
- LinkedIn converts best (20%): High-intent B2B traffic
- Facebook converts worst (10%): Lower intent or wrong audience
- Google has volume but lower conversion: Generic keywords?

**Action Items:**
- Double down on LinkedIn (create more posts)
- Pause Facebook campaigns or adjust targeting
- For Google: Add negative keywords to filter low-intent traffic

---

## Query 6: User Journey Sanity Check

**Purpose:** Detect data quality issues (events firing out of order)

```sql
WITH user_journey AS (
  SELECT
    person_id,
    MIN(CASE WHEN event = 'calculator_page_viewed' THEN timestamp END) AS t_calculator,
    MIN(CASE WHEN event = 'email_captured' THEN timestamp END) AS t_email,
    MIN(CASE WHEN event = 'signup_completed' THEN timestamp END) AS t_signup,
    MIN(CASE WHEN event = 'subscription_activated' THEN timestamp END) AS t_paid
  FROM events
  WHERE timestamp >= now() - INTERVAL '30 days'
  GROUP BY person_id
)
SELECT
  COUNT(*) AS total_users,
  COUNT(CASE WHEN t_email < t_calculator THEN 1 END) AS broken_email_before_calc,
  COUNT(CASE WHEN t_signup < t_email THEN 1 END) AS broken_signup_before_email,
  COUNT(CASE WHEN t_paid < t_signup THEN 1 END) AS broken_paid_before_signup,

  ROUND(100.0 * COUNT(CASE WHEN t_email >= t_calculator OR t_email IS NULL THEN 1 END) / COUNT(*), 2) AS data_quality_pct
FROM user_journey
WHERE t_calculator IS NOT NULL;
```

**Expected Output:**
| total_users | broken_email_before_calc | broken_signup_before_email | broken_paid_before_signup | data_quality_pct |
|-------------|-------------------------|---------------------------|--------------------------|-----------------|
| 1000 | 0 | 2 | 0 | 99.80 |

**Interpretation:**
- `broken_*` > 0: Timestamp issues or event tracking bugs
- `data_quality_pct < 95%`: Investigate event tracking implementation

**Action Items:**
- If broken events detected: Check server time sync
- Review event tracking code for async issues

---

## Query 7: Signup to Activation Funnel

**Purpose:** Measure onboarding effectiveness

```sql
WITH activation_funnel AS (
  SELECT
    person_id,
    MIN(CASE WHEN event = 'signup_completed' THEN timestamp END) AS t_signup,
    MIN(CASE WHEN event = 'onboarding_completed' THEN timestamp END) AS t_onboarding,
    MIN(CASE WHEN event = 'first_rsu_entry_completed' THEN timestamp END) AS t_first_rsu
  FROM events
  WHERE timestamp >= now() - INTERVAL '30 days'
  GROUP BY person_id
  HAVING MIN(CASE WHEN event = 'signup_completed' THEN timestamp END) IS NOT NULL
)
SELECT
  COUNT(*) AS signups,
  COUNT(t_onboarding) AS completed_onboarding,
  COUNT(t_first_rsu) AS completed_first_rsu,

  ROUND(100.0 * COUNT(t_onboarding) / COUNT(*), 2) AS onboarding_rate,
  ROUND(100.0 * COUNT(t_first_rsu) / NULLIF(COUNT(t_onboarding), 0), 2) AS activation_rate,
  ROUND(100.0 * COUNT(t_first_rsu) / COUNT(*), 2) AS overall_activation,

  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (t_first_rsu - t_signup)) / 3600.0) AS median_hours_to_activate
FROM activation_funnel;
```

**Expected Output:**
| signups | completed_onboarding | completed_first_rsu | onboarding_rate | activation_rate | overall_activation | median_hours_to_activate |
|---------|---------------------|-------------------|----------------|----------------|-------------------|-------------------------|
| 200 | 170 | 102 | 85.00 | 60.00 | 51.00 | 2.5 |

**Interpretation:**
- `onboarding_rate < 70%`: Email verification or onboarding flow issue
- `activation_rate < 50%`: Onboarding doesn't teach users how to use product
- `median_hours_to_activate > 24`: Product not sticky enough

**Action Items:**
- If onboarding_rate low: Reduce onboarding steps or allow skipping
- If activation_rate low: Add in-app tutorial or sample RSU data
- If time_to_activate high: Send activation email reminder at 6 hours

---

## Query 8: Revenue Funnel Analysis

**Purpose:** Identify where users drop off before paying

```sql
WITH revenue_funnel AS (
  SELECT
    person_id,
    MAX(CASE WHEN event = 'first_rsu_entry_completed' THEN 1 ELSE 0 END) AS activated,
    MAX(CASE WHEN event = 'paywall_shown' THEN 1 ELSE 0 END) AS saw_paywall,
    MAX(CASE WHEN event = 'pricing_page_viewed' THEN 1 ELSE 0 END) AS viewed_pricing,
    MAX(CASE WHEN event = 'checkout_started' THEN 1 ELSE 0 END) AS started_checkout,
    MAX(CASE WHEN event = 'subscription_activated' THEN 1 ELSE 0 END) AS became_paid
  FROM events
  WHERE timestamp >= now() - INTERVAL '30 days'
  GROUP BY person_id
)
SELECT
  COUNT(*) AS total_users,
  SUM(activated) AS activated_users,
  SUM(saw_paywall) AS saw_paywall,
  SUM(viewed_pricing) AS viewed_pricing,
  SUM(started_checkout) AS started_checkout,
  SUM(became_paid) AS paid_users,

  -- Drop-off between steps
  SUM(CASE WHEN saw_paywall = 1 AND viewed_pricing = 0 THEN 1 ELSE 0 END) AS dropoff_at_paywall,
  SUM(CASE WHEN viewed_pricing = 1 AND started_checkout = 0 THEN 1 ELSE 0 END) AS dropoff_at_pricing,
  SUM(CASE WHEN started_checkout = 1 AND became_paid = 0 THEN 1 ELSE 0 END) AS dropoff_at_checkout,

  -- Conversion rates
  ROUND(100.0 * SUM(viewed_pricing) / NULLIF(SUM(saw_paywall), 0), 2) AS paywall_to_pricing_rate,
  ROUND(100.0 * SUM(started_checkout) / NULLIF(SUM(viewed_pricing), 0), 2) AS pricing_to_checkout_rate,
  ROUND(100.0 * SUM(became_paid) / NULLIF(SUM(started_checkout), 0), 2) AS checkout_to_paid_rate,
  ROUND(100.0 * SUM(became_paid) / NULLIF(SUM(activated), 0), 2) AS overall_conversion
FROM revenue_funnel;
```

**Expected Output:**
| activated_users | saw_paywall | viewed_pricing | started_checkout | paid_users | dropoff_at_paywall | dropoff_at_pricing | dropoff_at_checkout | paywall_to_pricing_rate | pricing_to_checkout_rate | checkout_to_paid_rate | overall_conversion |
|----------------|------------|---------------|-----------------|-----------|-------------------|-------------------|-------------------|------------------------|-------------------------|---------------------|-------------------|
| 500 | 450 | 180 | 108 | 65 | 270 | 72 | 43 | 40.00 | 60.00 | 60.19 | 13.00 |

**Interpretation:**
- `paywall_to_pricing_rate < 30%`: Paywall not compelling enough
- `pricing_to_checkout_rate < 50%`: Pricing too high or unclear value
- `checkout_to_paid_rate < 60%`: Payment friction (Stripe integration issue)

**Action Items:**
- If paywall conversion low: Improve paywall copy or show specific locked feature
- If pricing page low: A/B test price points or add annual discount
- If checkout low: Test Stripe Checkout vs embedded form

---

## Query 9: Churn Risk Analysis

**Purpose:** Identify paid users at risk of churning

```sql
WITH paid_users AS (
  SELECT DISTINCT
    person_id,
    MIN(timestamp) AS subscription_start
  FROM events
  WHERE event = 'subscription_activated'
  GROUP BY person_id
),
recent_activity AS (
  SELECT
    person_id,
    MAX(timestamp) AS last_seen
  FROM events
  WHERE event IN ('dashboard_viewed', 'rsu_entry_created', 'tax_calculation_viewed')
    AND timestamp >= now() - INTERVAL '60 days'
  GROUP BY person_id
)
SELECT
  p.person_id,
  p.subscription_start,
  r.last_seen,
  EXTRACT(DAY FROM now() - r.last_seen) AS days_since_last_activity,

  CASE
    WHEN r.last_seen IS NULL THEN 'critical_risk'
    WHEN EXTRACT(DAY FROM now() - r.last_seen) > 30 THEN 'high_risk'
    WHEN EXTRACT(DAY FROM now() - r.last_seen) > 14 THEN 'medium_risk'
    ELSE 'healthy'
  END AS churn_risk
FROM paid_users p
LEFT JOIN recent_activity r ON p.person_id = r.person_id
ORDER BY days_since_last_activity DESC NULLS FIRST
LIMIT 100;
```

**Expected Output:**
| person_id | subscription_start | last_seen | days_since_last_activity | churn_risk |
|-----------|-------------------|-----------|-------------------------|-----------|
| user_123 | 2026-01-15 | 2026-01-20 | 58 | critical_risk |
| user_456 | 2026-02-01 | 2026-02-25 | 22 | medium_risk |

**Interpretation:**
- `critical_risk`: User paid but never came back (onboarding failure)
- `high_risk`: No activity in 30+ days (send re-engagement email)
- `medium_risk`: No activity in 14+ days (monitor closely)

**Action Items:**
- For critical_risk: Reach out personally, offer refund if unhappy
- For high_risk: Automated email "We miss you" with feature highlight
- For medium_risk: In-app notification or product update email

---

## Query 10: Feature Usage Heatmap

**Purpose:** Understand which features are used most

```sql
SELECT
  event AS feature,
  COUNT(DISTINCT person_id) AS unique_users,
  COUNT(*) AS total_uses,
  ROUND(COUNT(*) / NULLIF(COUNT(DISTINCT person_id), 0), 2) AS avg_uses_per_user,

  -- Usage by user tier
  COUNT(CASE WHEN properties->>'userTier' = 'free' THEN 1 END) AS free_uses,
  COUNT(CASE WHEN properties->>'userTier' = 'pro' THEN 1 END) AS pro_uses
FROM events
WHERE event IN (
  'ftc_optimizer_used',
  'pdf_exported',
  'csv_import_started',
  'forms_checklist_opened',
  'multi_year_analysis_viewed'
)
  AND timestamp >= now() - INTERVAL '30 days'
GROUP BY event
ORDER BY unique_users DESC;
```

**Expected Output:**
| feature | unique_users | total_uses | avg_uses_per_user | free_uses | pro_uses |
|---------|-------------|-----------|------------------|----------|---------|
| pdf_exported | 250 | 450 | 1.80 | 50 | 400 |
| ftc_optimizer_used | 180 | 320 | 1.78 | 120 | 200 |
| csv_import_started | 80 | 95 | 1.19 | 10 | 85 |

**Interpretation:**
- PDF export most popular: Good paywall feature
- CSV import low usage: Either not needed or not discoverable
- Free users using FTC optimizer: Should be behind paywall

**Action Items:**
- For low-usage features: Add in-app prompts or tutorial
- For high free-tier usage: Consider paywalling to increase conversions

---

## Usage Instructions

1. **Weekly Review**: Run Queries 1, 3, 4 every Monday
2. **Monthly Deep Dive**: Run all queries first Monday of month
3. **Real-Time Alerts**: Set up PostHog alerts for critical metrics
4. **Dashboard**: Pin Query 1 and Query 8 results to Slack #growth

**Next Steps:**
- Export results to Google Sheets for trend tracking
- Share findings with product/engineering team
- Prioritize fixes based on drop-off magnitude
- Re-run queries after implementing fixes to measure impact

---

**Related Documentation:**
- `docs/ANALYTICS_DEEP_DIVE_REPORT.md` - Full audit report
- `docs/POSTHOG_FUNNEL_CONFIGURATION.md` - Dashboard setup guide
- `docs/POSTHOG_IMPLEMENTATION_SUMMARY.md` - Event tracking reference
