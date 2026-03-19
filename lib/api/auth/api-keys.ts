/**
 * API Key Management
 * Generate, validate, and revoke API keys for enterprise organizations
 */

import { getDatabase } from '@/lib/db';
import { randomBytes } from 'crypto';

export interface ApiKeyValidationResult {
  valid: boolean;
  orgId?: number;
  orgName?: string;
  error?: string;
}

/**
 * Generate a new API key for an organization
 * Format: sk_live_{32_random_chars}
 */
export function generateApiKey(orgId: number): string {
  const randomPart = randomBytes(24).toString('base64url');
  const apiKey = `sk_live_${randomPart}`;

  // Update organization with new API key
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE organizations
    SET api_key = ?
    WHERE id = ?
  `);

  stmt.run(apiKey, orgId);

  return apiKey;
}

/**
 * Validate an API key and return organization info
 */
export function validateApiKey(apiKey: string): ApiKeyValidationResult {
  if (!apiKey) {
    return { valid: false, error: 'API key is required' };
  }

  if (!apiKey.startsWith('sk_live_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, name
      FROM organizations
      WHERE api_key = ?
    `);

    const org = stmt.get(apiKey) as { id: number; name: string } | undefined;

    if (!org) {
      return { valid: false, error: 'Invalid API key' };
    }

    return {
      valid: true,
      orgId: org.id,
      orgName: org.name,
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return { valid: false, error: 'Internal server error' };
  }
}

/**
 * Revoke an API key for an organization
 */
export function revokeApiKey(orgId: number): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE organizations
    SET api_key = NULL
    WHERE id = ?
  `);

  stmt.run(orgId);
}

/**
 * Get organization by ID
 */
export function getOrganization(orgId: number): { id: number; name: string; api_key: string | null } | undefined {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, name, api_key
    FROM organizations
    WHERE id = ?
  `);

  return stmt.get(orgId) as { id: number; name: string; api_key: string | null } | undefined;
}

/**
 * Log API usage for rate limiting and analytics
 */
export function logApiUsage(orgId: number, endpoint: string): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO api_usage (org_id, endpoint, request_count, last_used_at)
    VALUES (?, ?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(org_id, endpoint) DO UPDATE SET
      request_count = request_count + 1,
      last_used_at = CURRENT_TIMESTAMP
  `);

  try {
    stmt.run(orgId, endpoint);
  } catch (error) {
    // SQLite doesn't support ON CONFLICT with composite keys in older versions
    // Fallback: insert new record
    const insertStmt = db.prepare(`
      INSERT INTO api_usage (org_id, endpoint, request_count)
      VALUES (?, ?, 1)
    `);

    insertStmt.run(orgId, endpoint);
  }
}

/**
 * Get API usage stats for an organization
 */
export function getApiUsageStats(orgId: number): Array<{
  endpoint: string;
  request_count: number;
  last_used_at: string;
}> {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT endpoint, request_count, last_used_at
    FROM api_usage
    WHERE org_id = ?
    ORDER BY last_used_at DESC
  `);

  return stmt.all(orgId) as Array<{
    endpoint: string;
    request_count: number;
    last_used_at: string;
  }>;
}
