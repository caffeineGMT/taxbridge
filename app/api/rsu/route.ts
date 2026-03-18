import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db/init';
import { RSUEventSchema, RSUEvent, RSUEventRow } from '@/lib/types';

// POST /api/rsu - Create a new RSU event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validationResult = RSUEventSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Generate UUID and timestamp
    const id = data.id || uuidv4();
    const createdAt = data.createdAt || new Date().toISOString();

    // Insert into database
    const stmt = db.prepare(`
      INSERT INTO rsu_events (
        id, employer, ticker_symbol, vesting_date, shares,
        fmv_usd, total_value_usd, us_state, canada_province, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.employer,
      data.tickerSymbol,
      data.vestingDate,
      data.shares,
      data.fmvUsd,
      data.totalValueUsd,
      data.usState,
      data.canadaProvince,
      createdAt
    );

    // Return created event
    const event: RSUEvent = {
      id,
      employer: data.employer,
      tickerSymbol: data.tickerSymbol,
      vestingDate: data.vestingDate,
      shares: data.shares,
      fmvUsd: data.fmvUsd,
      totalValueUsd: data.totalValueUsd,
      usState: data.usState,
      canadaProvince: data.canadaProvince,
      createdAt,
    };

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating RSU event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/rsu - Get all RSU events
export async function GET() {
  try {
    const stmt = db.prepare(`
      SELECT * FROM rsu_events
      ORDER BY vesting_date DESC
    `);

    const rows = stmt.all() as RSUEventRow[];

    // Map database rows to RSUEvent objects (convert snake_case to camelCase)
    const events: RSUEvent[] = rows.map(row => ({
      id: row.id,
      employer: row.employer,
      tickerSymbol: row.ticker_symbol,
      vestingDate: row.vesting_date,
      shares: row.shares,
      fmvUsd: row.fmv_usd,
      totalValueUsd: row.total_value_usd,
      usState: row.us_state,
      canadaProvince: row.canada_province,
      createdAt: row.created_at,
    }));

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('Error fetching RSU events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
