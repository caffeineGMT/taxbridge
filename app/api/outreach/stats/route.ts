/**
 * Outreach Campaign Statistics API
 * GET /api/outreach/stats - Real-time campaign metrics
 *
 * Returns funnel metrics, goal tracking, and revenue projections
 * for the immigration law firm outreach campaign
 */

import { NextResponse } from 'next/server';
import { getDashboardSummary, getProspects } from '@/lib/db/queries/enterprise-prospects';
import { handleApiError } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = getDashboardSummary();

    // Get prospects by status for detailed breakdown
    const allProspects = getProspects({ limit: 1000 });

    // City distribution
    const cityDistribution: Record<string, number> = {};
    allProspects.forEach(p => {
      const key = p.city && p.state ? `${p.city}, ${p.state}` : 'Unknown';
      cityDistribution[key] = (cityDistribution[key] || 0) + 1;
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentActivity = allProspects
      .filter(p => p.updated_at >= sevenDaysAgo)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 20)
      .map(p => ({
        id: p.id,
        firm_name: p.firm_name,
        city: p.city,
        state: p.state,
        status: p.status,
        last_contact_date: p.last_contact_date,
        reply_date: p.reply_date,
        demo_scheduled_date: p.demo_scheduled_date,
        updated_at: p.updated_at,
      }));

    // Prospects needing action
    const needsAction = allProspects
      .filter(p => {
        if (p.status === 'replied' && !p.demo_scheduled_date) return true;
        if (p.status === 'demo_scheduled' && p.demo_scheduled_date) {
          const demoDate = new Date(p.demo_scheduled_date);
          if (demoDate < new Date()) return true; // Past demo not updated
        }
        if (p.status === 'trial_started' && p.trial_end_date) {
          const endDate = new Date(p.trial_end_date);
          const daysUntilEnd = (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          if (daysUntilEnd <= 3 && daysUntilEnd >= 0) return true;
        }
        return false;
      })
      .map(p => ({
        id: p.id,
        firm_name: p.firm_name,
        status: p.status,
        action_needed: p.status === 'replied' ? 'Schedule demo call' :
                       p.status === 'demo_scheduled' ? 'Update demo outcome' :
                       'Trial ending soon - follow up',
      }));

    // Goal tracking
    const goals = {
      open_rate: { current: summary.openRate, target: 45, unit: '%' },
      reply_rate: { current: summary.replyRate, target: 8, unit: '%' },
      demos: { current: summary.demo_scheduled || 0, target: 6, unit: '' },
      partners_onboarded: { current: summary.closed_won || 0, target: 10, unit: '' },
      enterprise_referrals: { current: (summary.closed_won || 0) * 5, target: 50, unit: '' },
    };

    // Revenue projections
    const partnersOnboarded = summary.closed_won || 0;
    const projectedReferrals = partnersOnboarded * 5; // 5 per partner
    const avgReferralValue = 299; // Pro plan
    const commissionRate = 0.20;

    const revenue = {
      partners_onboarded: partnersOnboarded,
      projected_referrals_90_days: projectedReferrals,
      projected_revenue_90_days: projectedReferrals * avgReferralValue,
      projected_commission_payout: projectedReferrals * avgReferralValue * commissionRate,
      target_partners: 10,
      target_referrals: 50,
    };

    return NextResponse.json({
      campaign: {
        name: 'Immigration Law Firm Partner Outreach',
        target_firms: 200,
        status: 'active',
      },
      funnel: {
        total_prospects: summary.total_prospects || 0,
        contacted: summary.contacted || 0,
        opened: summary.opened || 0,
        clicked: summary.clicked || 0,
        replied: summary.replied || 0,
        demo_scheduled: summary.demo_scheduled || 0,
        trial_started: summary.trial_started || 0,
        closed_won: summary.closed_won || 0,
        closed_lost: summary.closed_lost || 0,
      },
      rates: {
        open_rate: summary.openRate || 0,
        click_rate: summary.clickRate || 0,
        reply_rate: summary.replyRate || 0,
      },
      goals,
      revenue,
      city_distribution: cityDistribution,
      recent_activity: recentActivity,
      needs_action: needsAction,
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/outreach/stats', method: req.method });
  }
}
