-- Migration 008: Add Enterprise Leads table for demo requests and sales pipeline
-- Tracks incoming demo requests from immigration firms and corporate tax departments

CREATE TABLE IF NOT EXISTS enterprise_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firm_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  clients_count INTEGER,
  current_tax_software TEXT,
  pain_points TEXT,
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'demo_scheduled', 'demo_completed', 'proposal_sent', 'closed_won', 'closed_lost')),
  demo_scheduled_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enterprise_leads_status ON enterprise_leads(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_leads_email ON enterprise_leads(contact_email);
CREATE INDEX IF NOT EXISTS idx_enterprise_leads_created ON enterprise_leads(created_at);
