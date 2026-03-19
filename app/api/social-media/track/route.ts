import { NextRequest, NextResponse } from 'next/server';

// API endpoint to track social media analytics events
// Records bio link clicks, video engagement, and conversion events

interface TrackEvent {
  event: string;
  platform: 'instagram' | 'tiktok';
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  metadata?: Record<string, string | number>;
}

// In-memory store for development; production would use a database
const events: TrackEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TrackEvent;

    if (!body.event || !body.platform) {
      return NextResponse.json(
        { error: 'Missing required fields: event, platform' },
        { status: 400 }
      );
    }

    const event: TrackEvent = {
      event: body.event,
      platform: body.platform,
      utm_source: body.utm_source || '',
      utm_medium: body.utm_medium || '',
      utm_campaign: body.utm_campaign || '',
      utm_content: body.utm_content,
      metadata: body.metadata,
    };

    events.push(event);

    // Log for server-side tracking
    console.log(`[Social Media Track] ${event.event} from ${event.platform}`, {
      campaign: event.utm_campaign,
      source: event.utm_source,
    });

    return NextResponse.json({ success: true, eventId: events.length });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const event = searchParams.get('event');

  let filtered = [...events];

  if (platform) {
    filtered = filtered.filter(e => e.platform === platform);
  }
  if (event) {
    filtered = filtered.filter(e => e.event === event);
  }

  // Aggregate metrics
  const metrics = {
    total_events: filtered.length,
    by_platform: {
      instagram: filtered.filter(e => e.platform === 'instagram').length,
      tiktok: filtered.filter(e => e.platform === 'tiktok').length,
    },
    by_event: filtered.reduce((acc, e) => {
      acc[e.event] = (acc[e.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    by_campaign: filtered.reduce((acc, e) => {
      if (e.utm_campaign) {
        acc[e.utm_campaign] = (acc[e.utm_campaign] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
  };

  return NextResponse.json({ metrics, events: filtered.slice(-50) });
}
