import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/init';
import { RSUEventSchema } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validationResult = RSUEventSchema.omit({ id: true, createdAt: true }).safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Generate UUID for the new record
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Insert into database
    const stmt = db.prepare(`
      INSERT INTO rsu_events (
        id,
        employer,
        ticker_symbol,
        vesting_date,
        shares,
        fmv_usd,
        total_value_usd,
        us_state,
        canada_province,
        created_at
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

    return NextResponse.json({
      success: true,
      id,
      message: 'RSU event created successfully',
    });
  } catch (error) {
    console.error('Error creating RSU event:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM rsu_events ORDER BY vesting_date DESC');
    const events = stmt.all();

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching RSU events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
