-- Retention Analytics Migration
-- Tracks user cohorts, retention metrics, and churn analysis

-- Cohort assignments table
CREATE TABLE IF NOT EXISTS user_cohorts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  cohort_date TEXT NOT NULL, -- YYYY-MM-DD format
  cohort_week TEXT NOT NULL, -- YYYY-Www format
  cohort_month TEXT NOT NULL, -- YYYY-MM format
  signup_source TEXT,
  signup_utm_campaign TEXT,
  signup_utm_source TEXT,
  signup_utm_medium TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE(user_id) -- One cohort per user
);

-- User activity log for retention calculation
CREATE TABLE IF NOT EXISTS user_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  activity_date TEXT NOT NULL, -- YYYY-MM-DD format
  activity_type TEXT NOT NULL, -- 'login', 'calculator_use', 'dashboard_view', etc.
  metadata TEXT, -- JSON metadata
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Index for fast retention queries
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity_log(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_cohorts_month ON user_cohorts(cohort_month);
CREATE INDEX IF NOT EXISTS idx_cohorts_week ON user_cohorts(cohort_week);

-- Churn survey responses (enhanced from existing analytics_events)
CREATE TABLE IF NOT EXISTS churn_survey_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  survey_token TEXT UNIQUE NOT NULL,

  -- Survey questions
  primary_reason TEXT NOT NULL, -- Main reason for cancellation
  secondary_reasons TEXT, -- JSON array of additional reasons
  feature_requests TEXT, -- What features would bring them back
  satisfaction_score INTEGER CHECK(satisfaction_score BETWEEN 1 AND 5),
  would_recommend BOOLEAN,
  would_return BOOLEAN,
  feedback_text TEXT,

  -- Metadata
  subscription_duration_days INTEGER,
  total_calculations INTEGER,
  last_active_date TEXT,
  submitted_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Feature usage tracking for correlation analysis
CREATE TABLE IF NOT EXISTS feature_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  feature_name TEXT NOT NULL,
  usage_date TEXT NOT NULL, -- YYYY-MM-DD format
  usage_count INTEGER DEFAULT 1,
  total_time_seconds INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE(user_id, feature_name, usage_date) -- One row per user per feature per day
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON feature_usage(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_date ON feature_usage(usage_date);

-- Retention snapshots (pre-computed for performance)
CREATE TABLE IF NOT EXISTS retention_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cohort_month TEXT NOT NULL,
  cohort_size INTEGER NOT NULL,
  day_1_retained INTEGER DEFAULT 0,
  day_7_retained INTEGER DEFAULT 0,
  day_30_retained INTEGER DEFAULT 0,
  day_90_retained INTEGER DEFAULT 0,

  -- Percentage calculations
  day_1_retention_rate REAL GENERATED ALWAYS AS (CAST(day_1_retained AS REAL) / cohort_size * 100) STORED,
  day_7_retention_rate REAL GENERATED ALWAYS AS (CAST(day_7_retained AS REAL) / cohort_size * 100) STORED,
  day_30_retention_rate REAL GENERATED ALWAYS AS (CAST(day_30_retained AS REAL) / cohort_size * 100) STORED,
  day_90_retention_rate REAL GENERATED ALWAYS AS (CAST(day_90_retained AS REAL) / cohort_size * 100) STORED,

  snapshot_date TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(cohort_month, snapshot_date)
);

-- Churn reasons aggregated view
CREATE VIEW IF NOT EXISTS churn_reasons_summary AS
SELECT
  primary_reason,
  COUNT(*) as response_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM churn_survey_responses), 2) as percentage,
  ROUND(AVG(satisfaction_score), 2) as avg_satisfaction,
  ROUND(AVG(CASE WHEN would_return THEN 1 ELSE 0 END) * 100, 2) as return_likelihood_pct
FROM churn_survey_responses
GROUP BY primary_reason
ORDER BY response_count DESC;

-- Feature usage correlation with retention
CREATE VIEW IF NOT EXISTS feature_retention_correlation AS
SELECT
  f.feature_name,
  COUNT(DISTINCT f.user_id) as users_using_feature,

  -- Retention of users who used this feature
  COUNT(DISTINCT CASE
    WHEN julianday(a.activity_date) - julianday(c.cohort_date) >= 30
    THEN f.user_id
  END) as day_30_retained,

  ROUND(
    COUNT(DISTINCT CASE
      WHEN julianday(a.activity_date) - julianday(c.cohort_date) >= 30
      THEN f.user_id
    END) * 100.0 / COUNT(DISTINCT f.user_id),
    2
  ) as retention_rate_pct,

  AVG(f.usage_count) as avg_usage_per_user,
  SUM(f.usage_count) as total_usages

FROM feature_usage f
JOIN user_cohorts c ON f.user_id = c.user_id
LEFT JOIN user_activity_log a ON a.user_id = f.user_id
WHERE f.usage_date >= date('now', '-90 days')
GROUP BY f.feature_name
ORDER BY retention_rate_pct DESC;
