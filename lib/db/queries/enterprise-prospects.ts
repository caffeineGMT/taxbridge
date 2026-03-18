/**
 * Database queries for enterprise prospect tracking
 */

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data/taxbridge.db');

export interface EnterpriseProspect {
  id: number;
  firm_name: string;
  contact_email: string;
  contact_name?: string;
  contact_title?: string;
  city?: string;
  state?: string;
  website?: string;
  attorney_count?: number;
  specialties?: string;
  source?: string;
  status: 'target' | 'contacted' | 'opened' | 'clicked' | 'replied' | 'demo_scheduled' | 'trial_started' | 'closed_won' | 'closed_lost';
  email_sequence_position: number;
  last_contact_date?: string;
  last_contact_type?: string;
  email_opened: boolean;
  email_clicked: boolean;
  reply_date?: string;
  reply_content?: string;
  demo_scheduled_date?: string;
  demo_completed_date?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  closed_won_date?: string;
  closed_lost_date?: string;
  closed_lost_reason?: string;
  seats_count?: number;
  annual_contract_value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailEvent {
  id: number;
  prospect_id: number;
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'spam';
  email_subject?: string;
  email_template?: string;
  link_clicked?: string;
  event_timestamp: string;
  metadata?: string;
}

export interface Campaign {
  id: number;
  campaign_name: string;
  campaign_type: string;
  target_segment?: string;
  start_date?: string;
  end_date?: string;
  total_prospects: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_replied: number;
  total_demos: number;
  total_trials: number;
  total_closed_won: number;
  goal_reply_rate: number;
  goal_demo_count: number;
  goal_trial_count: number;
  goal_closed_won_count: number;
  goal_arr: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

/**
 * Get all prospects with optional filters
 */
export function getProspects(filters?: {
  status?: string;
  city?: string;
  state?: string;
  source?: string;
  limit?: number;
  offset?: number;
}): EnterpriseProspect[] {
  const db = new Database(dbPath);

  let query = 'SELECT * FROM enterprise_prospects WHERE 1=1';
  const params: any[] = [];

  if (filters?.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters?.city) {
    query += ' AND city = ?';
    params.push(filters.city);
  }

  if (filters?.state) {
    query += ' AND state = ?';
    params.push(filters.state);
  }

  if (filters?.source) {
    query += ' AND source = ?';
    params.push(filters.source);
  }

  query += ' ORDER BY updated_at DESC';

  if (filters?.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  if (filters?.offset) {
    query += ' OFFSET ?';
    params.push(filters.offset);
  }

  const prospects = db.prepare(query).all(...params) as EnterpriseProspect[];
  db.close();

  return prospects;
}

/**
 * Get prospect by ID
 */
export function getProspectById(id: number): EnterpriseProspect | null {
  const db = new Database(dbPath);
  const prospect = db.prepare('SELECT * FROM enterprise_prospects WHERE id = ?').get(id) as EnterpriseProspect | undefined;
  db.close();

  return prospect || null;
}

/**
 * Get prospect by email
 */
export function getProspectByEmail(email: string): EnterpriseProspect | null {
  const db = new Database(dbPath);
  const prospect = db.prepare('SELECT * FROM enterprise_prospects WHERE contact_email = ?').get(email) as EnterpriseProspect | undefined;
  db.close();

  return prospect || null;
}

/**
 * Create new prospect
 */
export function createProspect(data: Partial<EnterpriseProspect>): number {
  const db = new Database(dbPath);

  const insert = db.prepare(`
    INSERT INTO enterprise_prospects (
      firm_name, contact_email, contact_name, contact_title,
      city, state, website, attorney_count, specialties, source, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    data.firm_name || '',
    data.contact_email || '',
    data.contact_name || null,
    data.contact_title || null,
    data.city || null,
    data.state || null,
    data.website || null,
    data.attorney_count || null,
    data.specialties || null,
    data.source || 'manual',
    data.status || 'target'
  );

  db.close();

  return result.lastInsertRowid as number;
}

/**
 * Update prospect
 */
export function updateProspect(id: number, data: Partial<EnterpriseProspect>): void {
  const db = new Database(dbPath);

  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'id' && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const update = db.prepare(`
    UPDATE enterprise_prospects
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

  update.run(...values);
  db.close();
}

/**
 * Update prospect status
 */
export function updateProspectStatus(
  id: number,
  status: EnterpriseProspect['status'],
  additionalData?: Partial<EnterpriseProspect>
): void {
  const updateData: Partial<EnterpriseProspect> = {
    status,
    ...additionalData
  };

  updateProspect(id, updateData);
}

/**
 * Record email event
 */
export function recordEmailEvent(data: {
  prospect_id: number;
  event_type: EmailEvent['event_type'];
  email_subject?: string;
  email_template?: string;
  link_clicked?: string;
  metadata?: any;
}): number {
  const db = new Database(dbPath);

  const insert = db.prepare(`
    INSERT INTO email_events (
      prospect_id, event_type, email_subject, email_template, link_clicked, metadata
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    data.prospect_id,
    data.event_type,
    data.email_subject || null,
    data.email_template || null,
    data.link_clicked || null,
    data.metadata ? JSON.stringify(data.metadata) : null
  );

  // Update prospect based on event type
  if (data.event_type === 'opened') {
    updateProspect(data.prospect_id, { email_opened: true });
  } else if (data.event_type === 'clicked') {
    updateProspect(data.prospect_id, { email_clicked: true });
  }

  db.close();

  return result.lastInsertRowid as number;
}

/**
 * Get email events for prospect
 */
export function getEmailEvents(prospectId: number): EmailEvent[] {
  const db = new Database(dbPath);
  const events = db.prepare('SELECT * FROM email_events WHERE prospect_id = ? ORDER BY event_timestamp DESC').all(prospectId) as EmailEvent[];
  db.close();

  return events;
}

/**
 * Get campaign statistics
 */
export function getCampaignStats(campaignId: number = 1): Campaign | null {
  const db = new Database(dbPath);
  const campaign = db.prepare('SELECT * FROM outreach_campaigns WHERE id = ?').get(campaignId) as Campaign | undefined;
  db.close();

  return campaign || null;
}

/**
 * Update campaign statistics
 */
export function updateCampaignStats(campaignId: number): void {
  const db = new Database(dbPath);

  // Get all prospects in this campaign
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_prospects,
      SUM(CASE WHEN status IN ('contacted', 'opened', 'clicked', 'replied', 'demo_scheduled', 'trial_started', 'closed_won', 'closed_lost') THEN 1 ELSE 0 END) as total_sent,
      SUM(CASE WHEN email_opened = 1 THEN 1 ELSE 0 END) as total_opened,
      SUM(CASE WHEN email_clicked = 1 THEN 1 ELSE 0 END) as total_clicked,
      SUM(CASE WHEN status IN ('replied', 'demo_scheduled', 'trial_started', 'closed_won', 'closed_lost') THEN 1 ELSE 0 END) as total_replied,
      SUM(CASE WHEN status IN ('demo_scheduled', 'trial_started', 'closed_won', 'closed_lost') THEN 1 ELSE 0 END) as total_demos,
      SUM(CASE WHEN status IN ('trial_started', 'closed_won', 'closed_lost') THEN 1 ELSE 0 END) as total_trials,
      SUM(CASE WHEN status = 'closed_won' THEN 1 ELSE 0 END) as total_closed_won
    FROM enterprise_prospects
    WHERE id IN (
      SELECT prospect_id FROM campaign_prospects WHERE campaign_id = ?
    )
  `).get(campaignId) as any;

  db.prepare(`
    UPDATE outreach_campaigns
    SET
      total_prospects = ?,
      total_sent = ?,
      total_opened = ?,
      total_clicked = ?,
      total_replied = ?,
      total_demos = ?,
      total_trials = ?,
      total_closed_won = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    stats.total_prospects,
    stats.total_sent,
    stats.total_opened,
    stats.total_clicked,
    stats.total_replied,
    stats.total_demos,
    stats.total_trials,
    stats.total_closed_won,
    campaignId
  );

  db.close();
}

/**
 * Get prospects due for follow-up
 * (replied but no demo scheduled within 48 hours)
 */
export function getProspectsDueForFollowup(): EnterpriseProspect[] {
  const db = new Database(dbPath);

  const prospects = db.prepare(`
    SELECT * FROM enterprise_prospects
    WHERE status = 'replied'
      AND demo_scheduled_date IS NULL
      AND reply_date IS NOT NULL
      AND julianday('now') - julianday(reply_date) >= 2
    ORDER BY reply_date ASC
  `).all() as EnterpriseProspect[];

  db.close();

  return prospects;
}

/**
 * Get trials ending soon (within 3 days)
 */
export function getTrialsEndingSoon(): EnterpriseProspect[] {
  const db = new Database(dbPath);

  const prospects = db.prepare(`
    SELECT * FROM enterprise_prospects
    WHERE status = 'trial_started'
      AND trial_end_date IS NOT NULL
      AND julianday(trial_end_date) - julianday('now') <= 3
      AND julianday(trial_end_date) - julianday('now') >= 0
    ORDER BY trial_end_date ASC
  `).all() as EnterpriseProspect[];

  db.close();

  return prospects;
}

/**
 * Get dashboard summary
 */
export function getDashboardSummary() {
  const db = new Database(dbPath);

  const summary = db.prepare(`
    SELECT
      COUNT(*) as total_prospects,
      SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted,
      SUM(CASE WHEN email_opened = 1 THEN 1 ELSE 0 END) as opened,
      SUM(CASE WHEN email_clicked = 1 THEN 1 ELSE 0 END) as clicked,
      SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied,
      SUM(CASE WHEN status = 'demo_scheduled' THEN 1 ELSE 0 END) as demo_scheduled,
      SUM(CASE WHEN status = 'trial_started' THEN 1 ELSE 0 END) as trial_started,
      SUM(CASE WHEN status = 'closed_won' THEN 1 ELSE 0 END) as closed_won,
      SUM(CASE WHEN status = 'closed_lost' THEN 1 ELSE 0 END) as closed_lost
    FROM enterprise_prospects
  `).get() as any;

  const contacted = summary.contacted || 0;
  const openRate = contacted > 0 ? Math.round((summary.opened / contacted) * 100) : 0;
  const clickRate = contacted > 0 ? Math.round((summary.clicked / contacted) * 100) : 0;
  const replyRate = contacted > 0 ? Math.round((summary.replied / contacted) * 100) : 0;

  db.close();

  return {
    ...summary,
    openRate,
    clickRate,
    replyRate
  };
}

/**
 * Add prospect to campaign
 */
export function addProspectToCampaign(prospectId: number, campaignId: number): void {
  const db = new Database(dbPath);

  db.prepare(`
    INSERT OR IGNORE INTO campaign_prospects (campaign_id, prospect_id)
    VALUES (?, ?)
  `).run(campaignId, prospectId);

  db.close();

  // Update campaign stats
  updateCampaignStats(campaignId);
}
