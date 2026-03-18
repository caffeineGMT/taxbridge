import { getDatabase } from '@/lib/db';

export type LeadQualification = 'hot' | 'warm' | 'cold';
export type LeadStatus = 'new' | 'contacted' | 'demo_scheduled' | 'demo_completed' | 'negotiating' | 'converted' | 'lost';

export interface ConferenceLead {
  id: number;
  conference_id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  title: string | null;
  phone: string | null;
  qualification: LeadQualification;
  status: LeadStatus;
  notes: string | null;
  badge_scan_data: string | null;
  discount_code: string | null;
  followup_sent: number;
  followup_sent_at: string | null;
  demo_scheduled_at: string | null;
  converted_at: string | null;
  revenue: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadInput {
  conference_id: string;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  title?: string;
  phone?: string;
  qualification?: LeadQualification;
  notes?: string;
  badge_scan_data?: string;
  discount_code?: string;
}

export function initConferenceLeadsTable(): void {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS conference_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conference_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      title TEXT,
      phone TEXT,
      qualification TEXT NOT NULL DEFAULT 'warm' CHECK(qualification IN ('hot', 'warm', 'cold')),
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'demo_scheduled', 'demo_completed', 'negotiating', 'converted', 'lost')),
      notes TEXT,
      badge_scan_data TEXT,
      discount_code TEXT,
      followup_sent INTEGER NOT NULL DEFAULT 0,
      followup_sent_at TEXT,
      demo_scheduled_at TEXT,
      converted_at TEXT,
      revenue REAL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_conference_leads_conference ON conference_leads(conference_id);
    CREATE INDEX IF NOT EXISTS idx_conference_leads_email ON conference_leads(email);
    CREATE INDEX IF NOT EXISTS idx_conference_leads_qualification ON conference_leads(qualification);
    CREATE INDEX IF NOT EXISTS idx_conference_leads_status ON conference_leads(status);
  `);
}

export function createLead(input: CreateLeadInput): number {
  const db = getDatabase();
  initConferenceLeadsTable();

  const stmt = db.prepare(`
    INSERT INTO conference_leads (conference_id, first_name, last_name, email, company, title, phone, qualification, notes, badge_scan_data, discount_code)
    VALUES (@conference_id, @first_name, @last_name, @email, @company, @title, @phone, @qualification, @notes, @badge_scan_data, @discount_code)
  `);

  const result = stmt.run({
    conference_id: input.conference_id,
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    company: input.company || null,
    title: input.title || null,
    phone: input.phone || null,
    qualification: input.qualification || 'warm',
    notes: input.notes || null,
    badge_scan_data: input.badge_scan_data || null,
    discount_code: input.discount_code || null,
  });

  return result.lastInsertRowid as number;
}

export function getLeadsByConference(conferenceId: string): ConferenceLead[] {
  const db = getDatabase();
  initConferenceLeadsTable();

  return db.prepare(`
    SELECT * FROM conference_leads WHERE conference_id = ? ORDER BY created_at DESC
  `).all(conferenceId) as ConferenceLead[];
}

export function getLeadById(id: number): ConferenceLead | undefined {
  const db = getDatabase();
  initConferenceLeadsTable();

  return db.prepare('SELECT * FROM conference_leads WHERE id = ?').get(id) as ConferenceLead | undefined;
}

export function getLeadByEmail(email: string, conferenceId?: string): ConferenceLead | undefined {
  const db = getDatabase();
  initConferenceLeadsTable();

  if (conferenceId) {
    return db.prepare('SELECT * FROM conference_leads WHERE email = ? AND conference_id = ?').get(email, conferenceId) as ConferenceLead | undefined;
  }
  return db.prepare('SELECT * FROM conference_leads WHERE email = ? ORDER BY created_at DESC').get(email) as ConferenceLead | undefined;
}

export function updateLeadQualification(id: number, qualification: LeadQualification): void {
  const db = getDatabase();
  db.prepare(`
    UPDATE conference_leads SET qualification = ?, updated_at = datetime('now') WHERE id = ?
  `).run(qualification, id);
}

export function updateLeadStatus(id: number, status: LeadStatus): void {
  const db = getDatabase();
  const extras: Record<string, string> = {};

  if (status === 'demo_scheduled') {
    extras.demo_scheduled_at = new Date().toISOString();
  } else if (status === 'converted') {
    extras.converted_at = new Date().toISOString();
  }

  const setClauses = [`status = ?`, `updated_at = datetime('now')`];
  const values: (string | number)[] = [status];

  if (extras.demo_scheduled_at) {
    setClauses.push('demo_scheduled_at = ?');
    values.push(extras.demo_scheduled_at);
  }
  if (extras.converted_at) {
    setClauses.push('converted_at = ?');
    values.push(extras.converted_at);
  }

  values.push(id);
  db.prepare(`UPDATE conference_leads SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
}

export function markFollowupSent(id: number): void {
  const db = getDatabase();
  db.prepare(`
    UPDATE conference_leads SET followup_sent = 1, followup_sent_at = datetime('now'), updated_at = datetime('now') WHERE id = ?
  `).run(id);
}

export function updateLeadRevenue(id: number, revenue: number): void {
  const db = getDatabase();
  db.prepare(`
    UPDATE conference_leads SET revenue = ?, updated_at = datetime('now') WHERE id = ?
  `).run(revenue, id);
}

export function getLeadStats(conferenceId: string): {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  contacted: number;
  demos_scheduled: number;
  converted: number;
  total_revenue: number;
  followups_sent: number;
} {
  const db = getDatabase();
  initConferenceLeadsTable();

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN qualification = 'hot' THEN 1 ELSE 0 END) as hot,
      SUM(CASE WHEN qualification = 'warm' THEN 1 ELSE 0 END) as warm,
      SUM(CASE WHEN qualification = 'cold' THEN 1 ELSE 0 END) as cold,
      SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted,
      SUM(CASE WHEN status = 'demo_scheduled' OR status = 'demo_completed' THEN 1 ELSE 0 END) as demos_scheduled,
      SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted,
      COALESCE(SUM(revenue), 0) as total_revenue,
      SUM(CASE WHEN followup_sent = 1 THEN 1 ELSE 0 END) as followups_sent
    FROM conference_leads WHERE conference_id = ?
  `).get(conferenceId) as any;

  return {
    total: stats.total || 0,
    hot: stats.hot || 0,
    warm: stats.warm || 0,
    cold: stats.cold || 0,
    contacted: stats.contacted || 0,
    demos_scheduled: stats.demos_scheduled || 0,
    converted: stats.converted || 0,
    total_revenue: stats.total_revenue || 0,
    followups_sent: stats.followups_sent || 0,
  };
}

export function getAllLeadStats(): {
  conferenceId: string;
  stats: ReturnType<typeof getLeadStats>;
}[] {
  const db = getDatabase();
  initConferenceLeadsTable();

  const conferences = db.prepare(`
    SELECT DISTINCT conference_id FROM conference_leads
  `).all() as { conference_id: string }[];

  return conferences.map(c => ({
    conferenceId: c.conference_id,
    stats: getLeadStats(c.conference_id),
  }));
}

export function getPendingFollowups(): ConferenceLead[] {
  const db = getDatabase();
  initConferenceLeadsTable();

  return db.prepare(`
    SELECT * FROM conference_leads
    WHERE followup_sent = 0
    AND status = 'new'
    ORDER BY
      CASE qualification WHEN 'hot' THEN 1 WHEN 'warm' THEN 2 WHEN 'cold' THEN 3 END,
      created_at ASC
  `).all() as ConferenceLead[];
}
