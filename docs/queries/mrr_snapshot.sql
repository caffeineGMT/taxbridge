-- Monthly Recurring Revenue (MRR) Snapshot Query
-- Run this query to calculate current MRR and subscriber counts
--
-- Usage: sqlite3 data/taxbridge.db < docs/queries/mrr_snapshot.sql
--
-- MRR Pricing:
-- - Pro Tier: $299/year = $24.92/month
-- - Enterprise Tier: $2,000/year = $166.67/month

SELECT
  'MRR Summary' as report_type,
  COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as pro_subscribers,
  COUNT(CASE WHEN subscription_tier = 'enterprise' THEN 1 END) as enterprise_subscribers,
  COUNT(*) as total_paid_subscribers,
  ROUND(COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) * 24.92, 2) as pro_mrr_usd,
  ROUND(COUNT(CASE WHEN subscription_tier = 'enterprise' THEN 1 END) * 166.67, 2) as enterprise_mrr_usd,
  ROUND(
    (COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) * 24.92) +
    (COUNT(CASE WHEN subscription_tier = 'enterprise' THEN 1 END) * 166.67),
    2
  ) as total_mrr_usd,
  ROUND(
    ((COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) * 24.92) +
    (COUNT(CASE WHEN subscription_tier = 'enterprise' THEN 1 END) * 166.67)) * 12,
    2
  ) as annual_run_rate_usd,
  datetime('now') as snapshot_date
FROM user_profiles
WHERE subscription_status = 'active'
  AND subscription_tier IN ('pro', 'enterprise');

-- Detailed breakdown by tier
SELECT
  'Tier Breakdown' as report_type,
  subscription_tier,
  subscription_status,
  COUNT(*) as subscriber_count,
  ROUND(
    CASE
      WHEN subscription_tier = 'pro' THEN COUNT(*) * 24.92
      WHEN subscription_tier = 'enterprise' THEN COUNT(*) * 166.67
      ELSE 0
    END,
    2
  ) as mrr_usd
FROM user_profiles
WHERE subscription_tier IN ('free', 'pro', 'enterprise')
GROUP BY subscription_tier, subscription_status
ORDER BY subscription_tier, subscription_status;

-- Recent conversions (last 30 days)
SELECT
  'Recent Conversions (30 days)' as report_type,
  COUNT(*) as new_paid_subscribers,
  COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as new_pro,
  COUNT(CASE WHEN subscription_tier = 'enterprise' THEN 1 END) as new_enterprise,
  ROUND(
    (COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) * 24.92) +
    (COUNT(CASE WHEN subscription_tier = 'enterprise' THEN 1 END) * 166.67),
    2
  ) as new_mrr_added
FROM user_profiles
WHERE subscription_status = 'active'
  AND subscription_tier IN ('pro', 'enterprise')
  AND updated_at >= datetime('now', '-30 days');

-- Churn analysis (last 30 days)
SELECT
  'Churn (30 days)' as report_type,
  COUNT(*) as canceled_subscriptions,
  COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as canceled_pro,
  COUNT(CASE WHEN subscription_tier = 'enterprise' THEN 1 END) as canceled_enterprise,
  ROUND(
    (COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) * 24.92) +
    (COUNT(CASE WHEN subscription_tier = 'enterprise' THEN 1 END) * 166.67),
    2
  ) as churned_mrr
FROM user_profiles
WHERE subscription_status = 'canceled'
  AND updated_at >= datetime('now', '-30 days');

-- Trial conversions tracking
SELECT
  'Trial Status' as report_type,
  COUNT(*) as active_trials,
  COUNT(CASE WHEN trial_ends_at < unixepoch() THEN 1 END) as expired_trials,
  COUNT(CASE WHEN trial_ends_at >= unixepoch() THEN 1 END) as active_trials_remaining
FROM user_profiles
WHERE subscription_status = 'trialing';
