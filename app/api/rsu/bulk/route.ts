import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase, getUserProfileByClerkId } from '@/lib/db';
import { validateCSVRow, type CSVRow } from '@/lib/validation/csv';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

/**
 * Maximum number of rows allowed per import
 */
const MAX_ROWS = 1000;

/**
 * Bulk import RSU entries from CSV
 * POST /api/rsu/bulk
 * Body: { rows: Array<CSVRow> }
 * Returns: { success: number, failed: number, errors: Array<{row: number, message: string}> }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const transaction = Sentry.startTransaction({
    name: 'POST /api/rsu/bulk',
    op: 'http.server',
    tags: { route: '/api/rsu/bulk', level: 'critical' },
  });

  Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(transaction));

  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      transaction.setStatus('unauthenticated');
      transaction.finish();
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    Sentry.setUser({ id: clerkUserId });

    // Get user profile
    const userProfile = getUserProfileByClerkId(clerkUserId);
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const userId = userProfile.id;

    // Parse request body
    const body = await request.json();
    const { rows } = body;

    if (!Array.isArray(rows)) {
      return NextResponse.json(
        { error: 'Invalid request: rows must be an array' },
        { status: 400 }
      );
    }

    // Enforce row limit
    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ROWS} rows allowed per import. Please split your file.` },
        { status: 413 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No rows provided' },
        { status: 400 }
      );
    }

    // Get database instance
    const db = getDatabase();

    // Track results
    const errors: Array<{ row: number; message: string; data: any }> = [];
    let successCount = 0;

    // Prepare INSERT statement outside transaction for better performance
    const insertStmt = db.prepare(`
      INSERT INTO rsu_entries (user_id, vest_date, fmv_usd, shares, employer, ticker_symbol)
      VALUES (?, ?, ?, ?, ?, NULL)
    `);

    // Check for duplicates statement
    const checkDuplicateStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM rsu_entries
      WHERE user_id = ? AND vest_date = ? AND employer = ?
    `);

    // Use transaction for atomicity
    const insertMany = db.transaction((validatedRows: Array<{ row: CSVRow; index: number }>) => {
      for (const { row, index } of validatedRows) {
        try {
          // Check for duplicates
          const duplicate = checkDuplicateStmt.get(
            userId,
            row.vesting_date,
            row.employer
          ) as { count: number };

          if (duplicate.count > 0) {
            errors.push({
              row: index,
              message: `Duplicate entry: ${row.employer} vesting on ${row.vesting_date} already exists`,
              data: row,
            });
            continue;
          }

          // Insert row
          insertStmt.run(
            userId,
            row.vesting_date,
            row.fmv_usd,
            row.shares,
            row.employer
          );

          successCount++;
        } catch (err) {
          errors.push({
            row: index,
            message: err instanceof Error ? err.message : 'Database insertion failed',
            data: row,
          });
        }
      }
    });

    // Validate all rows first
    const validatedRows: Array<{ row: CSVRow; index: number }> = [];

    rows.forEach((rawRow, index) => {
      const rowNumber = index + 1; // 1-indexed for user display
      const validation = validateCSVRow(rawRow);

      if (!validation.valid) {
        errors.push({
          row: rowNumber,
          message: validation.errors.join('; '),
          data: rawRow,
        });
      } else if (validation.row) {
        validatedRows.push({
          row: validation.row,
          index: rowNumber,
        });
      }
    });

    // Only proceed with transaction if we have valid rows
    if (validatedRows.length > 0) {
      try {
        insertMany(validatedRows);
      } catch (err) {
        // Transaction failed - rollback is automatic
        return NextResponse.json(
          {
            error: 'Import failed: database transaction error',
            details: err instanceof Error ? err.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    // Return results
    const duration = Date.now() - startTime;
    logger.info('Bulk import completed', {
      endpoint: '/api/rsu/bulk',
      userId: clerkUserId,
      duration,
      success: successCount,
      failed: errors.length,
      total: rows.length,
    });

    transaction.setHttpStatus(200);
    transaction.finish();

    const response = NextResponse.json({
      success: successCount,
      failed: errors.length,
      total: rows.length,
      errors: errors.length > 0 ? errors : undefined,
    });

    response.headers.set('Server-Timing', `total;dur=${duration}`);
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Bulk import error', {
      endpoint: '/api/rsu/bulk',
      duration,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    Sentry.captureException(error, {
      level: 'error',
      tags: {
        route: '/api/rsu/bulk',
        level: 'critical',
      },
      contexts: {
        performance: { duration },
      },
    });

    transaction.setStatus('internal_error');
    transaction.finish();

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
