/**
 * Webhook Event Deduplication
 * Prevents duplicate processing of Stripe webhook events
 */

import { getDatabase } from '@/lib/db';
import { logger } from '@/lib/logger';

// Schema for webhook events table
export const WEBHOOK_EVENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    processed_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    retry_count INTEGER DEFAULT 0,
    metadata TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
  CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON webhook_events(created_at);
`;

/**
 * Initialize webhook events table
 */
export function initWebhookEventsTable() {
  const db = getDatabase();
  db.exec(WEBHOOK_EVENTS_TABLE);
  logger.info('Webhook events table initialized');
}

/**
 * Check if webhook event has already been processed
 * @returns true if event is already processed, false if it's new
 */
export function isEventProcessed(eventId: string): boolean {
  const db = getDatabase();

  const event = db.prepare(`
    SELECT id FROM webhook_events WHERE id = ?
  `).get(eventId);

  return !!event;
}

/**
 * Mark webhook event as processed
 */
export function markEventProcessed(
  eventId: string,
  eventType: string,
  metadata?: Record<string, any>
): void {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);

  try {
    db.prepare(`
      INSERT OR REPLACE INTO webhook_events (id, event_type, processed_at, metadata)
      VALUES (?, ?, ?, ?)
    `).run(
      eventId,
      eventType,
      now,
      metadata ? JSON.stringify(metadata) : null
    );

    logger.info('Webhook event marked as processed', {
      eventId,
      eventType,
    });
  } catch (error) {
    logger.error('Failed to mark webhook event as processed', {
      eventId,
      eventType,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
}

/**
 * Increment retry count for a webhook event
 */
export function incrementRetryCount(eventId: string): number {
  const db = getDatabase();

  const result = db.prepare(`
    UPDATE webhook_events
    SET retry_count = retry_count + 1
    WHERE id = ?
    RETURNING retry_count
  `).get(eventId) as { retry_count: number } | undefined;

  const retryCount = result?.retry_count || 0;

  logger.info('Webhook event retry count incremented', {
    eventId,
    retryCount,
  });

  return retryCount;
}

/**
 * Get event processing details
 */
export function getEventDetails(eventId: string): {
  id: string;
  event_type: string;
  processed_at: number;
  retry_count: number;
  metadata?: string;
} | null {
  const db = getDatabase();

  const event = db.prepare(`
    SELECT id, event_type, processed_at, retry_count, metadata
    FROM webhook_events
    WHERE id = ?
  `).get(eventId) as any;

  return event || null;
}

/**
 * Clean up old webhook events (older than 90 days)
 * Call this periodically via cron job
 */
export function cleanupOldEvents(daysToKeep: number = 90): number {
  const db = getDatabase();
  const cutoffTime = Math.floor(Date.now() / 1000) - (daysToKeep * 24 * 60 * 60);

  const result = db.prepare(`
    DELETE FROM webhook_events
    WHERE created_at < ?
  `).run(cutoffTime);

  const deletedCount = result.changes;

  logger.info('Cleaned up old webhook events', {
    deletedCount,
    daysToKeep,
    cutoffTime,
  });

  return deletedCount;
}

/**
 * Get webhook event statistics
 */
export function getWebhookStats(lastNDays: number = 7): {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsWithRetries: number;
  averageRetries: number;
} {
  const db = getDatabase();
  const cutoffTime = Math.floor(Date.now() / 1000) - (lastNDays * 24 * 60 * 60);

  // Total events
  const totalResult = db.prepare(`
    SELECT COUNT(*) as total FROM webhook_events WHERE created_at >= ?
  `).get(cutoffTime) as { total: number };

  // Events by type
  const typeResults = db.prepare(`
    SELECT event_type, COUNT(*) as count
    FROM webhook_events
    WHERE created_at >= ?
    GROUP BY event_type
  `).all(cutoffTime) as Array<{ event_type: string; count: number }>;

  const eventsByType: Record<string, number> = {};
  typeResults.forEach(row => {
    eventsByType[row.event_type] = row.count;
  });

  // Events with retries
  const retriesResult = db.prepare(`
    SELECT
      COUNT(*) as events_with_retries,
      AVG(retry_count) as avg_retries
    FROM webhook_events
    WHERE created_at >= ? AND retry_count > 0
  `).get(cutoffTime) as { events_with_retries: number; avg_retries: number };

  return {
    totalEvents: totalResult.total,
    eventsByType,
    eventsWithRetries: retriesResult.events_with_retries || 0,
    averageRetries: retriesResult.avg_retries || 0,
  };
}
