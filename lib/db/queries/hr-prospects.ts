/**
 * Database queries for HR prospect tracking (LinkedIn outreach)
 */

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data/taxbridge.db');

export interface HRProspect {
  id: number;
  company: string;
  name: string;
  title: string;
  linkedin_url: string;
  email?: string;
  city?: string;
  outreach_status: 'pending' | 'connection_sent' | 'connected' | 'message_sent' | 'demo_booked' | 'pilot_signed' | 'declined';
  connection_date?: string;
  connection_sent_date?: string;
  message_sent_date?: string;
  demo_booked_date?: string;
  pilot_signed_date?: string;
  calendly_url?: string;
  demo_completed: boolean;
  trial_start_date?: string;
  trial_end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LinkedInLog {
  id: number;
  action_type: 'connection_request' | 'message' | 'profile_view';
  prospect_id?: number;
  success: boolean;
  error_message?: string;
  action_timestamp: string;
}

/**
 * Get all HR prospects with optional filters
 */
export function getHRProspects(filters?: {
  status?: string;
  company?: string;
  city?: string;
  limit?: number;
  offset?: number;
}): HRProspect[] {
  const db = new Database(dbPath);

  let query = 'SELECT * FROM hr_prospects WHERE 1=1';
  const params: any[] = [];

  if (filters?.status) {
    query += ' AND outreach_status = ?';
    params.push(filters.status);
  }

  if (filters?.company) {
    query += ' AND company = ?';
    params.push(filters.company);
  }

  if (filters?.city) {
    query += ' AND city = ?';
    params.push(filters.city);
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

  const prospects = db.prepare(query).all(...params) as HRProspect[];
  db.close();

  return prospects;
}

/**
 * Get prospect by ID
 */
export function getHRProspectById(id: number): HRProspect | null {
  const db = new Database(dbPath);
  const prospect = db.prepare('SELECT * FROM hr_prospects WHERE id = ?').get(id) as HRProspect | undefined;
  db.close();

  return prospect || null;
}

/**
 * Get prospect by LinkedIn URL
 */
export function getHRProspectByLinkedIn(linkedinUrl: string): HRProspect | null {
  const db = new Database(dbPath);
  const prospect = db.prepare('SELECT * FROM hr_prospects WHERE linkedin_url = ?').get(linkedinUrl) as HRProspect | undefined;
  db.close();

  return prospect || null;
}

/**
 * Create new HR prospect
 */
export function createHRProspect(data: {
  company: string;
  name: string;
  title: string;
  linkedin_url: string;
  email?: string;
  city?: string;
  notes?: string;
}): number {
  const db = new Database(dbPath);

  const insert = db.prepare(`
    INSERT INTO hr_prospects (
      company, name, title, linkedin_url, email, city, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    data.company,
    data.name,
    data.title,
    data.linkedin_url,
    data.email || null,
    data.city || null,
    data.notes || null
  );

  db.close();

  return result.lastInsertRowid as number;
}

/**
 * Bulk insert HR prospects
 */
export function bulkCreateHRProspects(prospects: Array<{
  company: string;
  name: string;
  title: string;
  linkedin_url: string;
  email?: string;
  city?: string;
}>): number {
  const db = new Database(dbPath);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO hr_prospects (
      company, name, title, linkedin_url, email, city
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  let insertedCount = 0;

  db.transaction(() => {
    for (const prospect of prospects) {
      const result = insert.run(
        prospect.company,
        prospect.name,
        prospect.title,
        prospect.linkedin_url,
        prospect.email || null,
        prospect.city || null
      );
      if (result.changes > 0) {
        insertedCount++;
      }
    }
  })();

  db.close();

  return insertedCount;
}

/**
 * Update prospect
 */
export function updateHRProspect(id: number, data: Partial<HRProspect>): void {
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
    UPDATE hr_prospects
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

  update.run(...values);
  db.close();
}

/**
 * Update prospect status
 */
export function updateHRProspectStatus(
  id: number,
  status: HRProspect['outreach_status'],
  additionalData?: Partial<HRProspect>
): void {
  const updateData: Partial<HRProspect> = {
    outreach_status: status,
    ...additionalData
  };

  updateHRProspect(id, updateData);
}

/**
 * Log LinkedIn automation action
 */
export function logLinkedInAction(data: {
  action_type: LinkedInLog['action_type'];
  prospect_id?: number;
  success?: boolean;
  error_message?: string;
}): number {
  const db = new Database(dbPath);

  const insert = db.prepare(`
    INSERT INTO linkedin_automation_log (
      action_type, prospect_id, success, error_message
    ) VALUES (?, ?, ?, ?)
  `);

  const result = insert.run(
    data.action_type,
    data.prospect_id || null,
    data.success !== false ? 1 : 0,
    data.error_message || null
  );

  db.close();

  return result.lastInsertRowid as number;
}

/**
 * Get LinkedIn action logs for today
 */
export function getTodayLinkedInActions(actionType?: LinkedInLog['action_type']): LinkedInLog[] {
  const db = new Database(dbPath);

  let query = `
    SELECT * FROM linkedin_automation_log
    WHERE date(action_timestamp) = date('now')
  `;
  const params: any[] = [];

  if (actionType) {
    query += ' AND action_type = ?';
    params.push(actionType);
  }

  query += ' ORDER BY action_timestamp DESC';

  const logs = db.prepare(query).all(...params) as LinkedInLog[];
  db.close();

  return logs;
}

/**
 * Get count of connection requests sent today
 */
export function getTodayConnectionCount(): number {
  const db = new Database(dbPath);

  const result = db.prepare(`
    SELECT COUNT(*) as count
    FROM linkedin_automation_log
    WHERE action_type = 'connection_request'
      AND date(action_timestamp) = date('now')
      AND success = 1
  `).get() as { count: number };

  db.close();

  return result.count;
}

/**
 * Get prospects ready for connection (pending status)
 */
export function getProspectsForConnection(limit: number = 10): HRProspect[] {
  const db = new Database(dbPath);

  const prospects = db.prepare(`
    SELECT * FROM hr_prospects
    WHERE outreach_status = 'pending'
    ORDER BY created_at ASC
    LIMIT ?
  `).all(limit) as HRProspect[];

  db.close();

  return prospects;
}

/**
 * Get connected prospects ready for follow-up message
 */
export function getProspectsForMessage(limit: number = 10): HRProspect[] {
  const db = new Database(dbPath);

  const prospects = db.prepare(`
    SELECT * FROM hr_prospects
    WHERE outreach_status = 'connected'
      AND message_sent_date IS NULL
    ORDER BY connection_date ASC
    LIMIT ?
  `).all(limit) as HRProspect[];

  db.close();

  return prospects;
}

/**
 * Get dashboard summary
 */
export function getHRDashboardSummary() {
  const db = new Database(dbPath);

  const summary = db.prepare(`
    SELECT
      COUNT(*) as total_prospects,
      SUM(CASE WHEN outreach_status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN outreach_status = 'connection_sent' THEN 1 ELSE 0 END) as connection_sent,
      SUM(CASE WHEN outreach_status = 'connected' THEN 1 ELSE 0 END) as connected,
      SUM(CASE WHEN outreach_status = 'message_sent' THEN 1 ELSE 0 END) as message_sent,
      SUM(CASE WHEN outreach_status = 'demo_booked' THEN 1 ELSE 0 END) as demo_booked,
      SUM(CASE WHEN outreach_status = 'pilot_signed' THEN 1 ELSE 0 END) as pilot_signed,
      SUM(CASE WHEN outreach_status = 'declined' THEN 1 ELSE 0 END) as declined
    FROM hr_prospects
  `).get() as any;

  const connectionSent = summary.connection_sent || 0;
  const acceptedRate = connectionSent > 0 ? Math.round((summary.connected / connectionSent) * 100) : 0;
  const demoRate = summary.connected > 0 ? Math.round((summary.demo_booked / summary.connected) * 100) : 0;

  db.close();

  return {
    ...summary,
    acceptedRate,
    demoRate
  };
}

/**
 * Get prospects by company
 */
export function getProspectsByCompany(): Array<{ company: string; count: number }> {
  const db = new Database(dbPath);

  const results = db.prepare(`
    SELECT company, COUNT(*) as count
    FROM hr_prospects
    GROUP BY company
    ORDER BY count DESC
  `).all() as Array<{ company: string; count: number }>;

  db.close();

  return results;
}
