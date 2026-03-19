import { NextRequest, NextResponse } from 'next/server';
import { posthog } from 'posthog-js';

export const runtime = 'edge';

interface ConversionEvent {
  event: string;
  timestamp: string;
  properties: {
    conversion_value: number;
    utm_campaign?: string;
    gclid?: string;
  };
}

interface CampaignMetrics {
  campaignName: string;
  spend: number;
  conversions: number;
  cac: number;
  revenue: number;
  roas: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'week';

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'all':
        startDate = new Date('2026-01-01'); // Campaign start date
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // In production, this would query PostHog API
    // For now, return mock data that matches the expected structure

    // Mock data for demonstration
    const mockMetrics = {
      overall: {
        totalSpend: 350, // $50/day * 7 days
        totalConversions: 14,
        cac: 25, // $350 / 14 = $25 (UNDER TARGET!)
        revenue: 1050, // 14 conversions * ~$75 avg
        roas: 300, // (1050 / 350) * 100 = 300%
        conversionRate: 7.2,
        avgCPC: 12.50,
        clicks: 194,
        impressions: 3880,
        ctr: 5.0, // 194 / 3880 = 5%
      },
      campaigns: [
        {
          campaignName: 'H1B RSU Tax Calculator',
          spend: 150,
          conversions: 8,
          cac: 18.75, // EXCELLENT
          revenue: 600,
          roas: 400,
          status: 'excellent' as const,
        },
        {
          campaignName: 'TN Visa Stock Tax',
          spend: 120,
          conversions: 4,
          cac: 30, // GOOD (exactly at target)
          revenue: 300,
          roas: 250,
          status: 'good' as const,
        },
        {
          campaignName: 'Cross-Border Tax Tool',
          spend: 80,
          conversions: 2,
          cac: 40, // WARNING (over target)
          revenue: 150,
          roas: 187.5,
          status: 'warning' as const,
        },
      ],
    };

    return NextResponse.json(mockMetrics);

    /*
    // PRODUCTION VERSION - Query PostHog API:

    const posthogApiKey = process.env.POSTHOG_API_KEY;
    const posthogProjectId = process.env.POSTHOG_PROJECT_ID;

    // Query PostHog for conversion events
    const conversionEvents = await fetch(
      `https://app.posthog.com/api/projects/${posthogProjectId}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${posthogApiKey}`,
        },
        body: JSON.stringify({
          after: startDate.toISOString(),
          event: 'calculator_completed',
          properties: [
            {
              key: 'utm_source',
              value: 'google',
            },
          ],
        }),
      }
    );

    const events: ConversionEvent[] = await conversionEvents.json();

    // Calculate metrics from events
    const totalConversions = events.length;
    const totalRevenue = events.reduce((sum, e) => sum + e.properties.conversion_value, 0);

    // Get ad spend from Google Ads API (requires separate integration)
    const totalSpend = await getGoogleAdsSpend(startDate, new Date());

    const cac = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const roas = totalSpend > 0 ? (totalRevenue / totalSpend) * 100 : 0;

    // Group by campaign
    const campaignMetrics = groupByCampaign(events, totalSpend);

    return NextResponse.json({
      overall: {
        totalSpend,
        totalConversions,
        cac,
        revenue: totalRevenue,
        roas,
        // ... other metrics
      },
      campaigns: campaignMetrics,
    });
    */

  } catch (error) {
    console.error('Failed to fetch Google Ads metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

/* Production helper functions:

async function getGoogleAdsSpend(startDate: Date, endDate: Date): Promise<number> {
  // Query Google Ads API for ad spend
  // Requires Google Ads API credentials and customer ID
  const googleAdsCustomerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const googleAdsAccessToken = process.env.GOOGLE_ADS_ACCESS_TOKEN;

  const response = await fetch(
    `https://googleads.googleapis.com/v14/customers/${googleAdsCustomerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleAdsAccessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
      body: JSON.stringify({
        query: `
          SELECT
            campaign.name,
            metrics.cost_micros
          FROM campaign
          WHERE segments.date >= '${startDate.toISOString().split('T')[0]}'
            AND segments.date <= '${endDate.toISOString().split('T')[0]}'
        `,
      }),
    }
  );

  const data = await response.json();
  const totalMicros = data.results.reduce((sum, row) => sum + row.metrics.cost_micros, 0);
  return totalMicros / 1_000_000; // Convert micros to dollars
}

function groupByCampaign(events: ConversionEvent[], totalSpend: number): CampaignMetrics[] {
  const campaignGroups = events.reduce((acc, event) => {
    const campaign = event.properties.utm_campaign || 'unknown';
    if (!acc[campaign]) {
      acc[campaign] = [];
    }
    acc[campaign].push(event);
    return acc;
  }, {} as Record<string, ConversionEvent[]>);

  return Object.entries(campaignGroups).map(([campaignName, events]) => {
    const conversions = events.length;
    const revenue = events.reduce((sum, e) => sum + e.properties.conversion_value, 0);

    // Estimate spend per campaign based on conversion share
    const spend = (conversions / events.length) * totalSpend;
    const cac = conversions > 0 ? spend / conversions : 0;
    const roas = spend > 0 ? (revenue / spend) * 100 : 0;

    let status: CampaignMetrics['status'];
    if (cac < 21) status = 'excellent';
    else if (cac < 30) status = 'good';
    else if (cac < 45) status = 'warning';
    else status = 'poor';

    return {
      campaignName,
      spend,
      conversions,
      cac,
      revenue,
      roas,
      status,
    };
  });
}
*/
