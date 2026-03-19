import { NextRequest, NextResponse } from 'next/server';
import { getLeadStats, getAllLeadStats } from '@/lib/conferences/leads';
import { CONFERENCES, getConferenceById } from '@/lib/conferences/config';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get('conference_id');

    if (conferenceId) {
      const conference = getConferenceById(conferenceId);
      if (!conference) {
        return NextResponse.json({ error: 'Invalid conference_id' }, { status: 400 });
      }

      const stats = getLeadStats(conferenceId);
      return NextResponse.json({
        conference: {
          id: conference.id,
          name: conference.name,
          location: conference.location,
          dateRange: conference.dateRange,
          boothCost: conference.boothCost,
        },
        stats,
        roi: {
          investmentCost: conference.boothCost,
          projectedRevenue: stats.converted * conference.revenuePerConversion,
          netRevenue: (stats.converted * conference.revenuePerConversion) - conference.boothCost,
          conversionRate: stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : '0',
          targetConversions: conference.conversionTarget,
          targetRevenue: conference.conversionTarget * conference.revenuePerConversion,
        },
      });
    }

    const allStats = getAllLeadStats();
    const totalBoothCost = CONFERENCES.reduce((sum, c) => sum + c.boothCost, 0);

    const summary = {
      conferences: CONFERENCES.map(conf => {
        const confStats = allStats.find(s => s.conferenceId === conf.id);
        const stats = confStats?.stats || {
          total: 0, hot: 0, warm: 0, cold: 0, contacted: 0,
          demos_scheduled: 0, converted: 0, total_revenue: 0, followups_sent: 0,
        };

        return {
          id: conf.id,
          name: conf.shortName,
          location: conf.location,
          dateRange: conf.dateRange,
          boothCost: conf.boothCost,
          stats,
        };
      }),
      totals: {
        totalLeads: allStats.reduce((sum, s) => sum + s.stats.total, 0),
        totalConverted: allStats.reduce((sum, s) => sum + s.stats.converted, 0),
        totalRevenue: allStats.reduce((sum, s) => sum + s.stats.total_revenue, 0),
        totalBoothCost,
        netRevenue: allStats.reduce((sum, s) => sum + s.stats.total_revenue, 0) - totalBoothCost,
        targetRevenue: CONFERENCES.reduce((sum, c) => sum + (c.conversionTarget * c.revenuePerConversion), 0),
      },
    };

    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error, { route: '/api/conferences/stats', method: request.method });
  }
}
