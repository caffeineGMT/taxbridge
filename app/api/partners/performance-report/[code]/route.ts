/**
 * Performance Report API for Partners
 * Generates monthly performance report with insights and recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAffiliatePartnerByReferralCode,
  getAffiliateReferrals,
  getPendingCommissions,
  getPaidCommissions
} from '@/lib/db/queries/affiliates';
import { generatePerformanceReport } from '@/lib/partners/marketing-content';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const partner = getAffiliatePartnerByReferralCode(code);

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    if (partner.status !== 'approved') {
      return NextResponse.json(
        { error: 'Partner not approved' },
        { status: 403 }
      );
    }

    // Get referrals and calculate stats
    const referrals = getAffiliateReferrals(partner.id);
    const pendingCommissions = getPendingCommissions(partner.id);
    const paidCommissions = getPaidCommissions(partner.id);

    const totalReferrals = referrals.length;
    const last30Days = referrals.filter(r => {
      const createdAt = new Date(r.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdAt >= thirtyDaysAgo;
    }).length;

    const conversionRate = totalReferrals > 0 ? (totalReferrals / Math.max(totalReferrals * 10, 100)) * 100 : 0;

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const monthReferrals = referrals.filter(r => {
        const refDate = new Date(r.created_at);
        const refKey = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, '0')}`;
        return refKey === monthKey;
      });

      const monthRevenue = monthReferrals.reduce((sum, r) => sum + r.commission_amount, 0);

      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count: monthReferrals.length,
        revenue: monthRevenue
      });
    }

    const stats = {
      total_referrals: totalReferrals,
      total_revenue: partner.total_revenue,
      pending_commissions: pendingCommissions,
      paid_commissions: paidCommissions,
      conversion_rate: conversionRate,
      last_30_days: last30Days,
      monthly_trend: monthlyTrend
    };

    const reportMarkdown = generatePerformanceReport(
      partner.firm_name,
      partner.partner_name,
      stats
    );

    // Convert markdown to HTML for display
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Performance Report - ${partner.firm_name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #0f172a; color: #e2e8f0; line-height: 1.6; }
    h1 { color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
    h2 { color: #3b82f6; margin-top: 32px; }
    h3 { color: #10b981; margin-top: 24px; }
    hr { border: none; border-top: 1px solid #334155; margin: 32px 0; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; color: #cbd5e1; }
    strong { color: #10b981; }
    p { color: #cbd5e1; }
    .metrics { background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin: 20px 0; }
    @media print { body { background: white; color: black; } h1, h2, h3 { color: #000; } .metrics { border-color: #ccc; } }
  </style>
</head>
<body>
  ${reportMarkdown.replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>')
    .replace(/^([0-9]+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/^✅ (.+)$/gm, '<p>✅ $1</p>')
    .replace(/^⚠️ (.+)$/gm, '<p>⚠️ $1</p>')
    .replace(/^💡 (.+)$/gm, '<p>💡 $1</p>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h([0-9])><\/p>/g, '</h$1>')}
</body>
</html>
    `;

    return new Response(htmlReport, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating performance report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
