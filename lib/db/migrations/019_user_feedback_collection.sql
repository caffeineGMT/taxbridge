-- Migration: User Feedback Collection
-- Purpose: Track user feedback collection campaigns for conversion optimization

-- Create user_feedback_campaigns table (track campaign launches)
CREATE TABLE IF NOT EXISTS user_feedback_campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Campaign details
  campaign_type TEXT CHECK(campaign_type IN ('paid_purchase_barriers', 'free_upgrade_barriers', 'general_satisfaction')) NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_description TEXT,

  -- Targeting
  target_user_type TEXT CHECK(target_user_type IN ('paid', 'free', 'all')) NOT NULL,
  target_user_ids TEXT, -- Comma-separated list of user IDs, or NULL for all

  -- Email content
  email_subject TEXT,
  email_template_id TEXT,
  survey_url TEXT,
  incentive_offered TEXT, -- e.g., '$10 Amazon gift card'

  -- Campaign status
  status TEXT CHECK(status IN ('draft', 'active', 'completed', 'paused')) DEFAULT 'draft',

  -- Stats
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  target_responses INTEGER DEFAULT 5, -- Minimum responses needed

  -- Timestamps
  created_at INTEGER DEFAULT (unixepoch()),
  launched_at INTEGER,
  completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_feedback_campaigns_type ON user_feedback_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_feedback_campaigns_status ON user_feedback_campaigns(status);

-- Create user_feedback_responses table (structured feedback responses)
CREATE TABLE IF NOT EXISTS user_feedback_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  user_id INTEGER,
  email TEXT NOT NULL,

  -- User context
  subscription_tier TEXT, -- 'free', 'pro', 'enterprise'
  days_since_signup INTEGER,
  calculations_completed INTEGER,

  -- Response type
  response_type TEXT CHECK(response_type IN ('paid_barriers', 'free_upgrade', 'general')) NOT NULL,

  -- PAID USER QUESTIONS (What almost stopped you from buying?)
  purchase_hesitation TEXT, -- Main reason for hesitation
  purchase_hesitation_category TEXT CHECK(purchase_hesitation_category IN (
    'price_too_high', 'value_unclear', 'trust_concerns', 'feature_missing',
    'comparison_shopping', 'timing_not_right', 'other', NULL
  )),
  purchase_hesitation_details TEXT, -- Detailed explanation
  what_convinced_purchase TEXT, -- What ultimately made them buy
  compared_alternatives TEXT, -- Other tools they considered
  would_pay_earlier_if TEXT, -- What would have made them buy sooner

  -- FREE USER QUESTIONS (Why didn't you upgrade?)
  why_not_upgrade TEXT, -- Main reason for not upgrading
  why_not_upgrade_category TEXT CHECK(why_not_upgrade_category IN (
    'price_too_high', 'value_unclear', 'free_tier_sufficient', 'feature_missing',
    'trying_before_buying', 'timing_not_right', 'other', NULL
  )),
  why_not_upgrade_details TEXT, -- Detailed explanation
  what_would_make_upgrade TEXT, -- What feature/outcome would make them upgrade
  price_expectation_usd INTEGER, -- What would they be willing to pay?
  free_compared_alternatives TEXT, -- Other tools they're using instead

  -- GENERAL QUESTIONS (both user types)
  overall_satisfaction INTEGER CHECK(overall_satisfaction BETWEEN 1 AND 5), -- 1-5 scale
  most_valuable_feature TEXT,
  missing_features TEXT,
  pain_points TEXT,
  would_recommend_to_friend BOOLEAN,
  testimonial TEXT,
  testimonial_permission BOOLEAN DEFAULT 0,

  -- Incentive
  incentive_requested BOOLEAN DEFAULT 1, -- User wants the gift card
  incentive_email TEXT, -- Email to send gift card to
  incentive_delivered BOOLEAN DEFAULT 0,
  incentive_code TEXT,
  incentive_delivered_at INTEGER,

  -- Metadata
  utm_source TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  ip_address TEXT,

  -- Timestamps
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (campaign_id) REFERENCES user_feedback_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_responses_campaign ON user_feedback_responses(campaign_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_user ON user_feedback_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_type ON user_feedback_responses(response_type);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_created ON user_feedback_responses(created_at DESC);

-- Create feedback_email_tracking table (track individual emails sent)
CREATE TABLE IF NOT EXISTS feedback_email_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  user_id INTEGER,
  email TEXT NOT NULL,

  -- Email status
  status TEXT CHECK(status IN ('sent', 'delivered', 'opened', 'clicked', 'responded', 'bounced', 'failed')) DEFAULT 'sent',

  -- Email details
  subject TEXT,
  template_id TEXT,

  -- Tracking
  sent_at INTEGER DEFAULT (unixepoch()),
  delivered_at INTEGER,
  opened_at INTEGER,
  clicked_at INTEGER,
  responded_at INTEGER,

  -- Engagement
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Metadata
  sendgrid_message_id TEXT,
  error_message TEXT,

  FOREIGN KEY (campaign_id) REFERENCES user_feedback_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_email_tracking_campaign ON feedback_email_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_feedback_email_tracking_user ON feedback_email_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_email_tracking_status ON feedback_email_tracking(status);
CREATE INDEX IF NOT EXISTS idx_feedback_email_tracking_sent ON feedback_email_tracking(sent_at DESC);

-- Create view for campaign analytics
CREATE VIEW IF NOT EXISTS feedback_campaign_analytics AS
SELECT
  c.id AS campaign_id,
  c.campaign_name,
  c.campaign_type,
  c.target_user_type,
  c.status,
  c.total_sent,
  c.total_responses,
  c.target_responses,
  ROUND(CAST(c.total_responses AS REAL) / NULLIF(c.total_sent, 0) * 100, 2) AS response_rate,

  -- Email engagement
  (SELECT COUNT(*) FROM feedback_email_tracking WHERE campaign_id = c.id AND status IN ('opened', 'clicked', 'responded')) AS emails_opened,
  (SELECT COUNT(*) FROM feedback_email_tracking WHERE campaign_id = c.id AND status IN ('clicked', 'responded')) AS emails_clicked,

  -- Response breakdown
  (SELECT COUNT(*) FROM user_feedback_responses WHERE campaign_id = c.id AND response_type = 'paid_barriers') AS paid_responses,
  (SELECT COUNT(*) FROM user_feedback_responses WHERE campaign_id = c.id AND response_type = 'free_upgrade') AS free_responses,

  -- Common themes
  (SELECT COUNT(*) FROM user_feedback_responses WHERE campaign_id = c.id AND purchase_hesitation_category = 'price_too_high') AS price_concerns,
  (SELECT COUNT(*) FROM user_feedback_responses WHERE campaign_id = c.id AND purchase_hesitation_category = 'value_unclear') AS value_concerns,
  (SELECT COUNT(*) FROM user_feedback_responses WHERE campaign_id = c.id AND why_not_upgrade_category = 'free_tier_sufficient') AS free_tier_sufficient,

  -- Satisfaction
  (SELECT AVG(overall_satisfaction) FROM user_feedback_responses WHERE campaign_id = c.id) AS avg_satisfaction,
  (SELECT COUNT(*) FROM user_feedback_responses WHERE campaign_id = c.id AND would_recommend_to_friend = 1) AS would_recommend_count,

  c.created_at,
  c.launched_at,
  c.completed_at
FROM user_feedback_campaigns c;
