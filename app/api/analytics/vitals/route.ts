import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { VitalsPayload } from '@/lib/vitals';

/**
 * POST /api/analytics/vitals
 * Track Web Vitals metrics (LCP, FID, CLS, FCP, TTFB)
 */
export async function POST(request: NextRequest) {
  try {
    const body: VitalsPayload = await request.json();

    // Validate required fields
    if (!body.name || typeof body.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid vitals data' },
        { status: 400 }
      );
    }

    // Get user agent and IP for additional context
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Store in database
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO analytics_events (
        user_id,
        event_name,
        metadata,
        created_at
      ) VALUES (?, ?, ?, ?)
    `);

    // Store as system event (user_id = 0 for anonymous metrics)
    stmt.run(
      0,
      'web_vitals',
      JSON.stringify({
        metric: body.name,
        value: body.value,
        rating: body.rating,
        delta: body.delta,
        id: body.id,
        navigationType: body.navigationType,
        userAgent: userAgent.substring(0, 200), // Truncate UA
        ip: ip.substring(0, 45), // IPv6 max length
      }),
      Math.floor(Date.now() / 1000)
    );

    return NextResponse.json({
      success: true,
      message: 'Vitals tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking vitals:', error);
    return NextResponse.json(
      { error: 'Failed to track vitals' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/vitals
 * Retrieve Web Vitals statistics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication check here
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7', 10);
    const metric = searchParams.get('metric'); // LCP, FID, CLS, etc.

    const db = getDatabase();

    let query = `
      SELECT
        json_extract(metadata, '$.metric') as metric_name,
        json_extract(metadata, '$.value') as value,
        json_extract(metadata, '$.rating') as rating,
        created_at
      FROM analytics_events
      WHERE event_name = 'web_vitals'
      AND created_at >= unixepoch('now', '-${days} days')
    `;

    if (metric) {
      query += ` AND json_extract(metadata, '$.metric') = '${metric}'`;
    }

    query += ' ORDER BY created_at DESC LIMIT 1000';

    const stmt = db.prepare(query);
    const results = stmt.all();

    // Calculate statistics
    const stats = calculateVitalsStats(results);

    return NextResponse.json({
      success: true,
      period: `${days} days`,
      totalSamples: results.length,
      stats,
      rawData: results,
    });
  } catch (error) {
    console.error('Error retrieving vitals:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve vitals' },
      { status: 500 }
    );
  }
}

/**
 * Calculate Web Vitals statistics
 */
function calculateVitalsStats(data: any[]) {
  const metrics: Record<string, { values: number[]; ratings: string[] }> = {};

  data.forEach((row) => {
    const metric = row.metric_name;
    if (!metric) return;

    if (!metrics[metric]) {
      metrics[metric] = { values: [], ratings: [] };
    }

    metrics[metric].values.push(parseFloat(row.value));
    metrics[metric].ratings.push(row.rating);
  });

  const stats: Record<string, any> = {};

  Object.entries(metrics).forEach(([metric, data]) => {
    const values = data.values;
    const ratings = data.ratings;

    // Calculate percentiles
    const sorted = [...values].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p75 = sorted[Math.floor(sorted.length * 0.75)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    // Calculate rating distribution
    const goodCount = ratings.filter(r => r === 'good').length;
    const needsImprovementCount = ratings.filter(r => r === 'needs-improvement').length;
    const poorCount = ratings.filter(r => r === 'poor').length;

    stats[metric] = {
      samples: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50,
      p75,
      p95,
      ratings: {
        good: goodCount,
        needsImprovement: needsImprovementCount,
        poor: poorCount,
        goodPercent: ((goodCount / ratings.length) * 100).toFixed(1),
      },
    };
  });

  return stats;
}
