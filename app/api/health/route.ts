import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

/**
 * GET /api/health
 * Health check endpoint for uptime monitoring
 * Returns system status, database connection, and timestamp
 */
export async function GET(request: NextRequest) {
  // Rate limiting: generous for monitoring tools
  const rateLimitResult = await rateLimit(request, RateLimitPresets.GENEROUS);
  if (rateLimitResult) return rateLimitResult;

  try {
    const startTime = Date.now();

    // Check database connection
    let dbConnected = false;
    let dbResponseTime = 0;

    try {
      const dbStartTime = Date.now();
      const db = getDatabase();
      const result = db.prepare('SELECT 1 as health').get() as { health: number };
      dbResponseTime = Date.now() - dbStartTime;
      dbConnected = result.health === 1;
    } catch (error) {
      console.error('Database health check failed:', error);
      dbConnected = false;
    }

    const totalResponseTime = Date.now() - startTime;

    // Return healthy status if database is connected
    if (dbConnected) {
      return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          connected: true,
          responseTime: `${dbResponseTime}ms`,
        },
        responseTime: `${totalResponseTime}ms`,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'production',
      });
    } else {
      // Database connection failed - return 503 Service Unavailable
      return NextResponse.json(
        {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          database: {
            connected: false,
            error: 'Database connection failed',
          },
          responseTime: `${totalResponseTime}ms`,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/health
 * Lightweight health check (no response body)
 * Useful for load balancers and monitoring tools
 */
export async function HEAD() {
  try {
    const db = getDatabase();
    db.prepare('SELECT 1').get();
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
