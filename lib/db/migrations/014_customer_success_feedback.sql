-- Migration: Customer Success & Feedback Tracking
-- Purpose: Store customer feedback, churn risk scores, and outreach history

-- Create customer_feedback table
CREATE TABLE IF NOT EXISTS customer_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,

  -- Feedback content
  nps_score INTEGER CHECK(nps_score BETWEEN 0 AND 10),
  satisfaction_score INTEGER CHECK(satisfaction_score BETWEEN 1 AND 5),

  -- Structured questions
  upgrade_reason TEXT, -- Why did you upgrade to Pro?
  most_used_features TEXT, -- Comma-separated list of features
  missing_features TEXT, -- What features are missing?
  pain_points TEXT, -- What's frustrating?

  -- Open-ended feedback
  general_feedback TEXT,
  feature_requests TEXT,
  testimonial TEXT, -- Can we use this as a testimonial?

  -- Metadata
  subscription_tier TEXT CHECK(subscription_tier IN ('free', 'pro', 'enterprise')),
  days_since_subscription INTEGER,
  calculations_completed INTEGER DEFAULT 0,

  -- Source tracking
  source TEXT DEFAULT 'email-survey', -- email-survey, in-app, support-ticket, call
  utm_campaign TEXT,

  -- Timestamps
  created_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON customer_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON customer_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_nps_score ON customer_feedback(nps_score);

-- Create churn_risk_tracking table
CREATE TABLE IF NOT EXISTS churn_risk_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,

  -- Risk scoring
  churn_risk_score INTEGER CHECK(churn_risk_score BETWEEN 0 AND 100),
  risk_level TEXT CHECK(risk_level IN ('low', 'medium', 'high', 'critical')),

  -- Engagement metrics
  days_since_last_login INTEGER,
  calculations_completed INTEGER DEFAULT 0,
  days_since_subscription INTEGER,
  logins_last_30_days INTEGER DEFAULT 0,
  features_used_count INTEGER DEFAULT 0, -- Number of distinct features used

  -- Behavioral signals
  has_completed_profile BOOLEAN DEFAULT 0,
  has_multi_year_plan BOOLEAN DEFAULT 0,
  has_exported_pdf BOOLEAN DEFAULT 0,
  has_contacted_support BOOLEAN DEFAULT 0,

  -- Intervention tracking
  outreach_sent BOOLEAN DEFAULT 0,
  outreach_sent_at INTEGER,
  outreach_email_opened BOOLEAN DEFAULT 0,
  outreach_email_clicked BOOLEAN DEFAULT 0,
  responded_to_outreach BOOLEAN DEFAULT 0,
  booked_call BOOLEAN DEFAULT 0,

  -- Subscription info
  subscription_tier TEXT CHECK(subscription_tier IN ('pro', 'enterprise')),
  subscription_started_at INTEGER,

  -- Timestamps
  calculated_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_churn_risk_user_id ON churn_risk_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_churn_risk_score ON churn_risk_tracking(churn_risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_churn_risk_level ON churn_risk_tracking(risk_level);
CREATE INDEX IF NOT EXISTS idx_churn_risk_calculated_at ON churn_risk_tracking(calculated_at DESC);

-- Create customer_success_outreach table (tracks all emails sent)
CREATE TABLE IF NOT EXISTS customer_success_outreach (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,

  -- Email details
  template_type TEXT CHECK(template_type IN (
    'paid_user_checkin',
    'feedback_request',
    'churn_prevention',
    'concierge_onboarding'
  )),
  email_subject TEXT,

  -- Engagement tracking
  sent_at INTEGER DEFAULT (unixepoch()),
  delivered_at INTEGER,
  opened_at INTEGER,
  clicked_at INTEGER,

  -- Response tracking
  replied BOOLEAN DEFAULT 0,
  replied_at INTEGER,
  booked_call BOOLEAN DEFAULT 0,
  booked_call_at INTEGER,

  -- Outcome
  converted_to_action BOOLEAN DEFAULT 0, -- Did they take desired action?
  action_type TEXT, -- submitted_feedback, booked_call, renewed, canceled

  -- Metadata
  subscription_tier TEXT,
  days_since_subscription INTEGER,
  churn_risk_score INTEGER,

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_outreach_user_id ON customer_success_outreach(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_template_type ON customer_success_outreach(template_type);
CREATE INDEX IF NOT EXISTS idx_outreach_sent_at ON customer_success_outreach(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_opened_at ON customer_success_outreach(opened_at);

-- Create concierge_calls table (track 1:1 onboarding/support calls)
CREATE TABLE IF NOT EXISTS concierge_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,

  -- Call details
  call_type TEXT CHECK(call_type IN ('onboarding', 'support', 'churn_prevention')),
  scheduled_at INTEGER,
  completed_at INTEGER,
  duration_minutes INTEGER,

  -- Call notes
  topics_covered TEXT, -- Comma-separated: multi-year-planning, ftc-optimization, forms-checklist
  action_items TEXT, -- What we agreed to follow up on
  user_satisfaction INTEGER CHECK(user_satisfaction BETWEEN 1 AND 5),

  -- Outcome
  user_questions_count INTEGER DEFAULT 0,
  features_demoed TEXT, -- Comma-separated
  follow_up_required BOOLEAN DEFAULT 0,
  follow_up_completed BOOLEAN DEFAULT 0,

  -- Metadata
  subscription_tier TEXT,
  days_since_subscription INTEGER,

  -- Timestamps
  created_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_concierge_calls_user_id ON concierge_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_concierge_calls_scheduled_at ON concierge_calls(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_concierge_calls_call_type ON concierge_calls(call_type);
