-- Attribution Tracking Migration
-- Comprehensive channel attribution system for tracking user acquisition sources and revenue

-- Channel conversions tracking table
CREATE TABLE IF NOT EXISTS channel_conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- Attribution data
  utm_source TEXT, -- e.g., 'reddit', 'producthunt', 'google', 'organic'
  utm_medium TEXT, -- e.g., 'organic', 'cpc', 'email', 'social'
  utm_campaign TEXT, -- e.g., 'reddit-growth-q1-2026', 'ph-launch-2026'
  utm_term TEXT, -- e.g., subreddit name, keyword
  utm_content TEXT, -- e.g., 'case-study', 'comment', 'ad-variant-a'

  -- Referral data
  referrer_url TEXT,
  landing_page TEXT,

  -- Conversion funnel events (timestamps)
  landed_at INTEGER, -- Unix timestamp of first page view
  signed_up_at INTEGER, -- Unix timestamp of signup
  first_calculation_at INTEGER, -- Unix timestamp of first calculator use
  upgraded_at INTEGER, -- Unix timestamp of first paid conversion

  -- Revenue data
  subscription_tier TEXT, -- 'pro' or 'enterprise'
  subscription_amount REAL, -- Annual subscription amount in USD
  lifetime_value REAL DEFAULT 0, -- Total revenue from this user

  -- Metadata
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE(user_id) -- One attribution record per user (first-touch)
);

-- Indexes for fast channel queries
CREATE INDEX IF NOT EXISTS idx_channel_conversions_source ON channel_conversions(utm_source);
CREATE INDEX IF NOT EXISTS idx_channel_conversions_campaign ON channel_conversions(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_channel_conversions_upgraded ON channel_conversions(upgraded_at);

-- Channel performance snapshot table (pre-computed metrics for dashboard)
CREATE TABLE IF NOT EXISTS channel_performance_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Channel identification
  utm_source TEXT NOT NULL,
  utm_campaign TEXT,
  snapshot_date TEXT NOT NULL, -- YYYY-MM-DD

  -- Traffic metrics
  total_sessions INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,

  -- Conversion funnel metrics
  signups INTEGER DEFAULT 0,
  calculator_completions INTEGER DEFAULT 0,
  paid_conversions INTEGER DEFAULT 0,

  -- Conversion rates (%)
  signup_rate REAL GENERATED ALWAYS AS (
    CASE WHEN total_sessions > 0
    THEN CAST(signups AS REAL) / total_sessions * 100
    ELSE 0 END
  ) STORED,

  calculator_completion_rate REAL GENERATED ALWAYS AS (
    CASE WHEN total_sessions > 0
    THEN CAST(calculator_completions AS REAL) / total_sessions * 100
    ELSE 0 END
  ) STORED,

  conversion_rate REAL GENERATED ALWAYS AS (
    CASE WHEN signups > 0
    THEN CAST(paid_conversions AS REAL) / signups * 100
    ELSE 0 END
  ) STORED,

  -- Revenue metrics
  total_revenue REAL DEFAULT 0,
  avg_revenue_per_user REAL GENERATED ALWAYS AS (
    CASE WHEN paid_conversions > 0
    THEN total_revenue / paid_conversions
    ELSE 0 END
  ) STORED,

  -- Cost metrics (manually entered or imported from ad platforms)
  ad_spend REAL DEFAULT 0,
  cost_per_acquisition REAL GENERATED ALWAYS AS (
    CASE WHEN paid_conversions > 0
    THEN ad_spend / paid_conversions
    ELSE 0 END
  ) STORED,

  -- ROI calculation
  roi REAL GENERATED ALWAYS AS (
    CASE WHEN ad_spend > 0
    THEN (total_revenue - ad_spend) / ad_spend * 100
    ELSE 0 END
  ) STORED,

  created_at INTEGER DEFAULT (unixepoch()),

  UNIQUE(utm_source, utm_campaign, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_channel_snapshots_date ON channel_performance_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_channel_snapshots_source ON channel_performance_snapshots(utm_source);

-- Ad spend tracking table (for manual entry or API imports)
CREATE TABLE IF NOT EXISTS ad_spend_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Channel identification
  utm_source TEXT NOT NULL, -- e.g., 'google', 'facebook', 'reddit'
  utm_campaign TEXT,

  -- Spend data
  spend_date TEXT NOT NULL, -- YYYY-MM-DD
  amount REAL NOT NULL, -- USD
  currency TEXT DEFAULT 'USD',

  -- Platform metadata
  platform TEXT, -- 'Google Ads', 'Facebook Ads', 'Reddit Ads'
  campaign_id TEXT, -- External campaign ID
  notes TEXT,

  created_at INTEGER DEFAULT (unixepoch()),

  UNIQUE(utm_source, utm_campaign, spend_date)
);

CREATE INDEX IF NOT EXISTS idx_ad_spend_date ON ad_spend_log(spend_date);
CREATE INDEX IF NOT EXISTS idx_ad_spend_source ON ad_spend_log(utm_source);

-- View: Channel performance summary (last 30 days)
CREATE VIEW IF NOT EXISTS channel_performance_summary AS
SELECT
  cc.utm_source,
  cc.utm_campaign,

  -- Traffic
  COUNT(DISTINCT cc.user_id) as total_users,
  COUNT(DISTINCT CASE WHEN cc.signed_up_at IS NOT NULL THEN cc.user_id END) as signups,
  COUNT(DISTINCT CASE WHEN cc.first_calculation_at IS NOT NULL THEN cc.user_id END) as calculator_users,
  COUNT(DISTINCT CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.user_id END) as paid_conversions,

  -- Conversion rates
  ROUND(
    COUNT(DISTINCT CASE WHEN cc.signed_up_at IS NOT NULL THEN cc.user_id END) * 100.0 /
    NULLIF(COUNT(DISTINCT cc.user_id), 0),
    2
  ) as signup_rate_pct,

  ROUND(
    COUNT(DISTINCT CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.user_id END) * 100.0 /
    NULLIF(COUNT(DISTINCT CASE WHEN cc.signed_up_at IS NOT NULL THEN cc.user_id END), 0),
    2
  ) as conversion_rate_pct,

  -- Revenue
  SUM(CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.subscription_amount ELSE 0 END) as total_revenue,
  ROUND(
    SUM(CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.subscription_amount ELSE 0 END) /
    NULLIF(COUNT(DISTINCT CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.user_id END), 0),
    2
  ) as avg_revenue_per_conversion,

  -- Ad spend (from ad_spend_log)
  COALESCE(
    (SELECT SUM(amount) FROM ad_spend_log
     WHERE ad_spend_log.utm_source = cc.utm_source
     AND (ad_spend_log.utm_campaign = cc.utm_campaign OR cc.utm_campaign IS NULL)
     AND spend_date >= date('now', '-30 days')
    ),
    0
  ) as total_ad_spend,

  -- CAC (Customer Acquisition Cost)
  ROUND(
    COALESCE(
      (SELECT SUM(amount) FROM ad_spend_log
       WHERE ad_spend_log.utm_source = cc.utm_source
       AND (ad_spend_log.utm_campaign = cc.utm_campaign OR cc.utm_campaign IS NULL)
       AND spend_date >= date('now', '-30 days')
      ),
      0
    ) /
    NULLIF(COUNT(DISTINCT CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.user_id END), 0),
    2
  ) as cost_per_acquisition,

  -- ROI
  ROUND(
    (SUM(CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.subscription_amount ELSE 0 END) -
     COALESCE(
       (SELECT SUM(amount) FROM ad_spend_log
        WHERE ad_spend_log.utm_source = cc.utm_source
        AND (ad_spend_log.utm_campaign = cc.utm_campaign OR cc.utm_campaign IS NULL)
        AND spend_date >= date('now', '-30 days')
       ),
       0
     )) /
    NULLIF(
      COALESCE(
        (SELECT SUM(amount) FROM ad_spend_log
         WHERE ad_spend_log.utm_source = cc.utm_source
         AND (ad_spend_log.utm_campaign = cc.utm_campaign OR cc.utm_campaign IS NULL)
         AND spend_date >= date('now', '-30 days')
        ),
        0
      ),
      0
    ) * 100,
    2
  ) as roi_pct

FROM channel_conversions cc
WHERE cc.landed_at >= unixepoch('now', '-30 days')
GROUP BY cc.utm_source, cc.utm_campaign
ORDER BY paid_conversions DESC, total_revenue DESC;

-- View: Top performing channels (by revenue, last 30 days)
CREATE VIEW IF NOT EXISTS top_channels_by_revenue AS
SELECT
  utm_source,
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT CASE WHEN upgraded_at IS NOT NULL THEN user_id END) as paid_conversions,
  SUM(CASE WHEN upgraded_at IS NOT NULL THEN subscription_amount ELSE 0 END) as total_revenue,

  ROUND(
    COUNT(DISTINCT CASE WHEN upgraded_at IS NOT NULL THEN user_id END) * 100.0 /
    NULLIF(COUNT(DISTINCT CASE WHEN signed_up_at IS NOT NULL THEN user_id END), 0),
    2
  ) as conversion_rate_pct

FROM channel_conversions
WHERE landed_at >= unixepoch('now', '-30 days')
GROUP BY utm_source
HAVING paid_conversions > 0
ORDER BY total_revenue DESC
LIMIT 10;

-- View: Underperforming channels (low conversion rate, minimum 10 signups)
CREATE VIEW IF NOT EXISTS underperforming_channels AS
SELECT
  utm_source,
  utm_campaign,
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT CASE WHEN signed_up_at IS NOT NULL THEN user_id END) as signups,
  COUNT(DISTINCT CASE WHEN upgraded_at IS NOT NULL THEN user_id END) as paid_conversions,

  ROUND(
    COUNT(DISTINCT CASE WHEN upgraded_at IS NOT NULL THEN user_id END) * 100.0 /
    NULLIF(COUNT(DISTINCT CASE WHEN signed_up_at IS NOT NULL THEN user_id END), 0),
    2
  ) as conversion_rate_pct,

  SUM(CASE WHEN upgraded_at IS NOT NULL THEN subscription_amount ELSE 0 END) as total_revenue

FROM channel_conversions
WHERE landed_at >= unixepoch('now', '-30 days')
  AND signed_up_at IS NOT NULL
GROUP BY utm_source, utm_campaign
HAVING signups >= 10
  AND conversion_rate_pct < 5.0 -- Less than 5% conversion = underperforming
ORDER BY conversion_rate_pct ASC;
