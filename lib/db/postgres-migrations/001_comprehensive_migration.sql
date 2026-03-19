-- Comprehensive PostgreSQL Migration
-- Includes all tables from SQLite migrations 001-013
-- This file creates all additional tables not in the base schema

-- ============================================================================
-- EMAIL & NOTIFICATIONS
-- ============================================================================

-- Email preferences column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_preferences TEXT DEFAULT '{"marketing_emails": true}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS in_app_notifications_enabled BOOLEAN DEFAULT TRUE;

-- Email events for drip campaigns
CREATE TABLE IF NOT EXISTS email_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('drip_welcome', 'drip_day3', 'drip_day7', 'drip_day14')),
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  metadata TEXT,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_events_user_type ON email_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_sent_at ON email_events(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('deadline', 'ftc_opportunity', 'new_feature', 'renewal')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- ============================================================================
-- AFFILIATE & REFERRAL PROGRAMS
-- ============================================================================

-- Affiliate Partners
CREATE TABLE IF NOT EXISTS affiliate_partners (
  id SERIAL PRIMARY KEY,
  partner_name TEXT NOT NULL,
  firm_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  commission_rate NUMERIC(4, 3) NOT NULL DEFAULT 0.20,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  total_referrals INTEGER DEFAULT 0,
  total_revenue NUMERIC(12, 2) DEFAULT 0.0,
  stripe_connect_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_affiliate_partners_code ON affiliate_partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_status ON affiliate_partners(status);

-- User Referrals
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;

CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_user_id INTEGER NOT NULL,
  referred_user_id INTEGER NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'completed', 'rewarded')) DEFAULT 'pending',
  reward_granted BOOLEAN DEFAULT FALSE,
  reward_type TEXT CHECK(reward_type IN ('free_month', 'discount', 'credit')),
  reward_value NUMERIC(8, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (referrer_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);

-- Influencer Affiliates
CREATE TABLE IF NOT EXISTS influencer_affiliates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  platform TEXT CHECK(platform IN ('youtube', 'tiktok', 'instagram', 'twitter', 'linkedin', 'blog')),
  handle TEXT NOT NULL,
  follower_count INTEGER,
  referral_code TEXT UNIQUE NOT NULL,
  commission_rate NUMERIC(4, 3) DEFAULT 0.30,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue NUMERIC(12, 2) DEFAULT 0.0,
  stripe_connect_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_influencer_code ON influencer_affiliates(referral_code);

-- ============================================================================
-- MULTI-YEAR & FTC CARRYFORWARD
-- ============================================================================

-- Add year column to rsu_entries
ALTER TABLE rsu_entries ADD COLUMN IF NOT EXISTS year INTEGER NOT NULL DEFAULT 2026;
CREATE INDEX IF NOT EXISTS idx_rsu_entries_year ON rsu_entries(year);

-- FTC Carryforward
CREATE TABLE IF NOT EXISTS ftc_carryforward (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  unused_ftc_cad NUMERIC(12, 2) NOT NULL CHECK(unused_ftc_cad >= 0),
  source_year INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  applied_to_year INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ftc_carryforward_user ON ftc_carryforward(user_id);
CREATE INDEX IF NOT EXISTS idx_ftc_carryforward_year ON ftc_carryforward(year);

-- ============================================================================
-- ENTERPRISE FEATURES
-- ============================================================================

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_members (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('admin', 'member', 'client')),
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  joined_at TIMESTAMP,
  UNIQUE(org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

-- Enterprise Prospects
CREATE TABLE IF NOT EXISTS enterprise_prospects (
  id SERIAL PRIMARY KEY,
  firm_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  contact_title TEXT,
  city TEXT,
  state TEXT,
  website TEXT,
  attorney_count INTEGER,
  specialties TEXT,
  source TEXT,
  status TEXT DEFAULT 'target',
  first_email_sent_at TIMESTAMP,
  last_email_sent_at TIMESTAMP,
  email_opened BOOLEAN DEFAULT FALSE,
  email_clicked BOOLEAN DEFAULT FALSE,
  replied BOOLEAN DEFAULT FALSE,
  reply_date TIMESTAMP,
  demo_scheduled_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enterprise_prospects_status ON enterprise_prospects(status);

-- Enterprise Leads
CREATE TABLE IF NOT EXISTS enterprise_leads (
  id SERIAL PRIMARY KEY,
  firm_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  clients_count INTEGER,
  current_tax_software TEXT,
  pain_points TEXT,
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'demo_scheduled', 'demo_completed', 'proposal_sent', 'closed_won', 'closed_lost')),
  demo_scheduled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enterprise_leads_status ON enterprise_leads(status);

-- HR Prospects
CREATE TABLE IF NOT EXISTS hr_prospects (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_title TEXT,
  contact_email TEXT NOT NULL,
  linkedin_url TEXT,
  company_size TEXT,
  industry TEXT,
  h1b_sponsorship BOOLEAN DEFAULT FALSE,
  tn_sponsorship BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'target',
  first_outreach_at TIMESTAMP,
  last_outreach_at TIMESTAMP,
  response_received BOOLEAN DEFAULT FALSE,
  response_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hr_prospects_status ON hr_prospects(status);

-- ============================================================================
-- A/B TESTING & TESTIMONIALS
-- ============================================================================

-- Email A/B Testing
CREATE TABLE IF NOT EXISTS email_ab_variants (
  id SERIAL PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  body_template TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campaign_name, variant_name)
);

CREATE TABLE IF NOT EXISTS email_ab_assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  campaign_name TEXT NOT NULL,
  variant_id INTEGER NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES email_ab_variants(id) ON DELETE CASCADE,
  UNIQUE(user_id, campaign_name)
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  feedback_text TEXT NOT NULL,
  use_case TEXT,
  job_title TEXT,
  company TEXT,
  rsu_income_bucket TEXT,
  approved_for_marketing BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved_for_marketing);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured);

-- ============================================================================
-- API KEYS
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  name TEXT,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
