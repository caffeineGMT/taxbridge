/**
 * Enterprise Organization Database Queries
 * Handles multi-client management, RBAC, and organization operations
 */

import { getDatabase } from '../index';
import crypto from 'crypto';

export interface Organization {
  id: number;
  name: string;
  created_at: string;
}

export interface OrganizationMember {
  id: number;
  org_id: number;
  user_id: number;
  role: 'admin' | 'member' | 'client';
  invited_at: string;
  joined_at: string | null;
}

export interface InviteToken {
  id: number;
  token: string;
  org_id: number;
  email: string;
  role: 'admin' | 'member' | 'client';
  created_at: string;
  expires_at: string;
  used: boolean;
}

export interface ClientSummary {
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  us_state: string | null;
  canada_province: string | null;
  filing_status: string | null;
  total_rsu_ytd: number;
  total_tax_owed: number;
  last_activity: string | null;
  employer: string | null;
}

export interface OrgClientFilters {
  province?: string;
  state?: string;
  employer?: string;
  search?: string;
}

/**
 * Create a new organization
 */
export function createOrganization(name: string): number {
  const db = getDatabase();

  const result = db.prepare(`
    INSERT INTO organizations (name)
    VALUES (?)
  `).run(name);

  return result.lastInsertRowid as number;
}

/**
 * Get organization by ID
 */
export function getOrganization(orgId: number): Organization | undefined {
  const db = getDatabase();

  return db.prepare(`
    SELECT * FROM organizations WHERE id = ?
  `).get(orgId) as Organization | undefined;
}

/**
 * Get all organizations for a user
 */
export function getUserOrganizations(userId: number): Organization[] {
  const db = getDatabase();

  return db.prepare(`
    SELECT o.* FROM organizations o
    INNER JOIN organization_members om ON o.id = om.org_id
    WHERE om.user_id = ?
    ORDER BY o.created_at DESC
  `).all(userId) as Organization[];
}

/**
 * Add a member to an organization
 */
export function addOrganizationMember(
  orgId: number,
  userId: number,
  role: 'admin' | 'member' | 'client'
): number {
  const db = getDatabase();

  const result = db.prepare(`
    INSERT INTO organization_members (org_id, user_id, role, joined_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `).run(orgId, userId, role);

  // Update user's org_id
  db.prepare(`
    UPDATE user_profiles SET org_id = ? WHERE id = ?
  `).run(orgId, userId);

  return result.lastInsertRowid as number;
}

/**
 * Get member's role in an organization
 */
export function getMemberRole(orgId: number, userId: number): string | undefined {
  const db = getDatabase();

  const result = db.prepare(`
    SELECT role FROM organization_members
    WHERE org_id = ? AND user_id = ?
  `).get(orgId, userId) as { role: string } | undefined;

  return result?.role;
}

/**
 * Check if user is admin of an organization
 */
export function isOrgAdmin(orgId: number, userId: number): boolean {
  const role = getMemberRole(orgId, userId);
  return role === 'admin';
}

/**
 * Get all clients for an organization with aggregated data
 */
export function getOrgClients(orgId: number, filters?: OrgClientFilters): ClientSummary[] {
  const db = getDatabase();

  let query = `
    SELECT
      up.id as user_id,
      up.email,
      up.first_name,
      up.last_name,
      up.us_state,
      up.canada_province,
      up.filing_status,
      COALESCE(SUM(rsu.total_value_usd), 0) as total_rsu_ytd,
      COALESCE(SUM(tc.net_tax_payable), 0) as total_tax_owed,
      MAX(rsu.created_at) as last_activity,
      (SELECT employer FROM rsu_entries WHERE user_id = up.id ORDER BY vest_date DESC LIMIT 1) as employer
    FROM user_profiles up
    INNER JOIN organization_members om ON up.id = om.user_id
    LEFT JOIN rsu_entries rsu ON up.id = rsu.user_id
      AND strftime('%Y', rsu.vest_date) = strftime('%Y', 'now')
    LEFT JOIN tax_calculations tc ON rsu.id = tc.rsu_entry_id
    WHERE om.org_id = ? AND om.role = 'client'
  `;

  const params: any[] = [orgId];

  // Apply filters
  if (filters?.province) {
    query += ` AND up.canada_province = ?`;
    params.push(filters.province);
  }

  if (filters?.state) {
    query += ` AND up.us_state = ?`;
    params.push(filters.state);
  }

  if (filters?.search) {
    query += ` AND (up.email LIKE ? OR up.first_name LIKE ? OR up.last_name LIKE ?)`;
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  query += `
    GROUP BY up.id
    ORDER BY up.last_name ASC, up.first_name ASC
  `;

  const clients = db.prepare(query).all(...params) as ClientSummary[];

  // Filter by employer if needed (since it's in a subquery)
  if (filters?.employer) {
    return clients.filter(c => c.employer === filters.employer);
  }

  return clients;
}

/**
 * Create an invite token for client invitation
 */
export function createInviteToken(
  orgId: number,
  email: string,
  role: 'admin' | 'member' | 'client'
): InviteToken {
  const db = getDatabase();

  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex');

  // Token expires in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const result = db.prepare(`
    INSERT INTO invite_tokens (token, org_id, email, role, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(token, orgId, email, role, expiresAt.toISOString());

  return db.prepare(`
    SELECT * FROM invite_tokens WHERE id = ?
  `).get(result.lastInsertRowid) as InviteToken;
}

/**
 * Validate and retrieve an invite token
 */
export function getInviteToken(token: string): InviteToken | undefined {
  const db = getDatabase();

  const invite = db.prepare(`
    SELECT * FROM invite_tokens
    WHERE token = ? AND used = 0 AND datetime(expires_at) > datetime('now')
  `).get(token) as InviteToken | undefined;

  return invite;
}

/**
 * Mark invite token as used
 */
export function markInviteUsed(token: string): void {
  const db = getDatabase();

  db.prepare(`
    UPDATE invite_tokens SET used = 1 WHERE token = ?
  `).run(token);
}

/**
 * Switch user's active organization
 */
export function switchUserOrg(userId: number, newOrgId: number): void {
  const db = getDatabase();

  // Verify user is member of the new org
  const membership = db.prepare(`
    SELECT id FROM organization_members WHERE org_id = ? AND user_id = ?
  `).get(newOrgId, userId);

  if (!membership) {
    throw new Error('User is not a member of this organization');
  }

  db.prepare(`
    UPDATE user_profiles SET org_id = ? WHERE id = ?
  `).run(newOrgId, userId);
}

/**
 * Get organization members count by role
 */
export function getOrgMembersCounts(orgId: number): {
  admins: number;
  members: number;
  clients: number;
  total: number;
} {
  const db = getDatabase();

  const counts = db.prepare(`
    SELECT
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
      SUM(CASE WHEN role = 'member' THEN 1 ELSE 0 END) as members,
      SUM(CASE WHEN role = 'client' THEN 1 ELSE 0 END) as clients,
      COUNT(*) as total
    FROM organization_members
    WHERE org_id = ?
  `).get(orgId) as any;

  return {
    admins: counts.admins || 0,
    members: counts.members || 0,
    clients: counts.clients || 0,
    total: counts.total || 0,
  };
}

/**
 * Delete organization member
 */
export function removeOrganizationMember(orgId: number, userId: number): void {
  const db = getDatabase();

  db.prepare(`
    DELETE FROM organization_members
    WHERE org_id = ? AND user_id = ?
  `).run(orgId, userId);

  // Clear user's org_id if it matches
  db.prepare(`
    UPDATE user_profiles SET org_id = NULL
    WHERE id = ? AND org_id = ?
  `).run(userId, orgId);
}
