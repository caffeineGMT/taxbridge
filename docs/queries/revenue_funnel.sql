-- Revenue Funnel Analysis
-- Track conversion rates from signup to paid subscriber
--
-- Usage: sqlite3 data/taxbridge.db < docs/queries/revenue_funnel.sql

-- Funnel Overview
WITH funnel_steps AS (
  SELECT
    'Total Users' as step,
    1 as step_order,
    COUNT(*) as user_count
  FROM user_profiles

  UNION ALL

  SELECT
    'With RSU Entries' as step,
    2 as step_order,
    COUNT(DISTINCT user_id) as user_count
  FROM rsu_entries

  UNION ALL

  SELECT
    'Checkout Started (last 30 days)' as step,
    3 as step_order,
    COUNT(DISTINCT user_id) as user_count
  FROM analytics_events
  WHERE event_name = 'checkout_started'
    AND created_at >= unixepoch('now', '-30 days')

  UNION ALL

  SELECT
    'Paid Subscribers' as step,
    4 as step_order,
    COUNT(*) as user_count
  FROM user_profiles
  WHERE subscription_status = 'active'
    AND subscription_tier IN ('pro', 'enterprise')
)
SELECT
  step,
  user_count,
  ROUND(100.0 * user_count / FIRST_VALUE(user_count) OVER (ORDER BY step_order), 2) || '%' as conversion_from_start,
  ROUND(100.0 * user_count / LAG(user_count) OVER (ORDER BY step_order), 2) || '%' as conversion_from_previous
FROM funnel_steps
ORDER BY step_order;

-- Weekly signup to paid conversion rate
SELECT
  'Weekly Conversions' as report_type,
  strftime('%Y-W%W', datetime(created_at, 'unixepoch')) as week,
  COUNT(*) as signups,
  COUNT(CASE WHEN subscription_status = 'active' AND subscription_tier IN ('pro', 'enterprise') THEN 1 END) as paid_conversions,
  ROUND(
    100.0 * COUNT(CASE WHEN subscription_status = 'active' AND subscription_tier IN ('pro', 'enterprise') THEN 1 END) / COUNT(*),
    2
  ) || '%' as conversion_rate
FROM user_profiles
WHERE created_at >= unixepoch('now', '-90 days')
GROUP BY week
ORDER BY week DESC;
