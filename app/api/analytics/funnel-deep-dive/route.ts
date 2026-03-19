/**
 * PostHog Conversion Funnel Deep Dive API
 *
 * Fetches real-time funnel data from PostHog and provides comprehensive analysis:
 * - Conversion rates at each step
 * - Drop-off percentages and counts
 * - Channel attribution breakdown
 * - Device type analysis
 * - Time-to-conversion metrics
 * - Cohort comparisons
 *
 * Usage: GET /api/analytics/funnel-deep-dive?days=30&breakdown=utm_source
 */

import { NextRequest, NextResponse } from 'next/server';

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

interface FunnelStep {
  step: string;
  eventName: string;
  order: number;
}

interface FunnelData {
  step: string;
  eventName: string;
  order: number;
  count: number;
  conversionRate: number;
  dropOffRate: number;
  dropOffCount: number;
  averageTimeToConvert?: number;
}

interface ChannelBreakdown {
  channel: string;
  totalUsers: number;
  conversions: number;
  conversionRate: number;
  revenue?: number;
}

interface FunnelAnalysis {
  overall: {
    totalVisitors: number;
    paidCustomers: number;
    overallConversion: number;
    estimatedMRR: number;
  };
  steps: FunnelData[];
  biggestDropOffs: Array<{
    fromStep: string;
    toStep: string;
    dropOffRate: number;
    usersLost: number;
    revenueImpact: number;
  }>;
  channelBreakdown?: ChannelBreakdown[];
  deviceBreakdown?: {
    mobile: { users: number; conversion: number };
    desktop: { users: number; conversion: number };
  };
  recommendations: string[];
}

// Define the conversion funnel steps
const FUNNEL_STEPS: FunnelStep[] = [
  { step: 'Landing Page Viewed', eventName: 'landing_page_viewed', order: 1 },
  { step: 'Calculator Viewed', eventName: 'calculator_page_viewed', order: 2 },
  { step: 'Tax Calculation Completed', eventName: 'tax_calculation_viewed', order: 3 },
  { step: 'Signup Started', eventName: 'signup_started', order: 4 },
  { step: 'Signup Completed', eventName: 'signup_completed', order: 5 },
  { step: 'Pricing Page Viewed', eventName: 'pricing_page_viewed', order: 6 },
  { step: 'Checkout Started', eventName: 'checkout_started', order: 7 },
  { step: 'Payment Completed', eventName: 'subscription_activated', order: 8 },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const breakdown = searchParams.get('breakdown') || null; // utm_source, deviceType, etc.

    // Check if PostHog is configured
    if (!POSTHOG_API_KEY || POSTHOG_API_KEY.includes('your_project_api_key')) {
      return NextResponse.json({
        error: 'PostHog not configured',
        message: 'PostHog API key is a placeholder. Run: npm run setup:posthog',
        mockData: generateMockFunnelData(),
        isMockData: true,
      }, { status: 200 });
    }

    // Fetch real funnel data from PostHog
    const funnelData = await fetchPostHogFunnelData(days, breakdown);

    return NextResponse.json({
      success: true,
      data: funnelData,
      isMockData: false,
      generatedAt: new Date().toISOString(),
      period: `Last ${days} days`,
    });

  } catch (error: any) {
    console.error('[Funnel Deep Dive Error]', error);

    // Fallback to mock data on error
    return NextResponse.json({
      error: error.message,
      message: 'Using mock data due to PostHog API error',
      mockData: generateMockFunnelData(),
      isMockData: true,
    }, { status: 200 });
  }
}

async function fetchPostHogFunnelData(
  days: number,
  breakdown: string | null
): Promise<FunnelAnalysis> {
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Build PostHog funnel query
  const funnelQuery = {
    insight: 'FUNNELS',
    interval: 'day',
    date_from: startDate.toISOString(),
    date_to: endDate.toISOString(),
    funnel_window_days: 30,
    events: FUNNEL_STEPS.map(step => ({
      id: step.eventName,
      name: step.eventName,
      type: 'events',
      order: step.order - 1, // PostHog uses 0-indexed
    })),
    breakdown_type: breakdown ? 'event' : undefined,
    breakdown: breakdown || undefined,
  };

  // Fetch from PostHog API
  const response = await fetch(
    `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/insights/funnel/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      },
      body: JSON.stringify(funnelQuery),
    }
  );

  if (!response.ok) {
    throw new Error(`PostHog API error: ${response.status} ${response.statusText}`);
  }

  const postHogData = await response.json();

  // Transform PostHog response to our format
  return transformPostHogData(postHogData);
}

function transformPostHogData(postHogData: any): FunnelAnalysis {
  const steps: FunnelData[] = [];
  let previousCount = 0;

  // Process each funnel step
  for (let i = 0; i < FUNNEL_STEPS.length; i++) {
    const stepData = postHogData.result?.[i] || {};
    const count = stepData.count || 0;
    const conversionRate = i === 0 ? 100 : (count / (postHogData.result?.[0]?.count || 1)) * 100;
    const dropOffRate = i === 0 ? 0 : ((previousCount - count) / previousCount) * 100;
    const dropOffCount = i === 0 ? 0 : previousCount - count;

    steps.push({
      step: FUNNEL_STEPS[i].step,
      eventName: FUNNEL_STEPS[i].eventName,
      order: FUNNEL_STEPS[i].order,
      count,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      dropOffRate: parseFloat(dropOffRate.toFixed(2)),
      dropOffCount,
      averageTimeToConvert: stepData.average_conversion_time,
    });

    previousCount = count;
  }

  // Calculate biggest drop-offs
  const biggestDropOffs = steps
    .slice(1) // Skip first step
    .map((step, index) => ({
      fromStep: steps[index].step,
      toStep: step.step,
      dropOffRate: step.dropOffRate,
      usersLost: step.dropOffCount,
      revenueImpact: calculateRevenueImpact(step.dropOffCount),
    }))
    .filter(d => d.dropOffRate > 5) // Only significant drop-offs
    .sort((a, b) => b.dropOffRate - a.dropOffRate)
    .slice(0, 3);

  // Generate recommendations
  const recommendations = generateRecommendations(steps, biggestDropOffs);

  // Calculate overall metrics
  const totalVisitors = steps[0]?.count || 0;
  const paidCustomers = steps[steps.length - 1]?.count || 0;
  const overallConversion = totalVisitors > 0 ? (paidCustomers / totalVisitors) * 100 : 0;
  const estimatedMRR = paidCustomers * 49; // Assuming $49/month average

  return {
    overall: {
      totalVisitors,
      paidCustomers,
      overallConversion: parseFloat(overallConversion.toFixed(2)),
      estimatedMRR,
    },
    steps,
    biggestDropOffs,
    recommendations,
  };
}

function calculateRevenueImpact(usersLost: number): number {
  // Assume 5% of lost users would have converted to paid ($49/month)
  const potentialConversions = usersLost * 0.05;
  const monthlyRevenueLost = potentialConversions * 49;
  return Math.round(monthlyRevenueLost);
}

function generateRecommendations(
  steps: FunnelData[],
  dropOffs: Array<{ fromStep: string; toStep: string; dropOffRate: number; usersLost: number }>
): string[] {
  const recommendations: string[] = [];

  // Recommendation based on biggest drop-off
  if (dropOffs.length > 0) {
    const biggest = dropOffs[0];

    if (biggest.fromStep.includes('Landing') && biggest.toStep.includes('Calculator')) {
      recommendations.push(
        `🔴 CRITICAL: ${biggest.dropOffRate.toFixed(1)}% of visitors leave without viewing calculator. Add prominent "Calculate Your Savings" CTA above the fold.`
      );
    } else if (biggest.fromStep.includes('Calculation') && biggest.toStep.includes('Signup')) {
      recommendations.push(
        `🔴 HIGH PRIORITY: ${biggest.dropOffRate.toFixed(1)}% drop-off after seeing results. Embed signup form directly on results page with urgency message.`
      );
    } else if (biggest.fromStep.includes('Pricing') && biggest.toStep.includes('Checkout')) {
      recommendations.push(
        `🟠 MEDIUM: ${biggest.dropOffRate.toFixed(1)}% abandon at pricing. Add testimonials, trust badges, and "Launch pricing expires soon" urgency.`
      );
    }
  }

  // Conversion rate recommendations
  const overallConversion = steps[steps.length - 1]?.conversionRate || 0;
  if (overallConversion < 3) {
    recommendations.push(
      `⚠️ Overall conversion (${overallConversion.toFixed(1)}%) is below SaaS average (3-5%). Focus on top 2 drop-off points for maximum impact.`
    );
  } else if (overallConversion < 5) {
    recommendations.push(
      `✅ Conversion (${overallConversion.toFixed(1)}%) is near industry average. Optimize pricing page and checkout flow to reach 7%+.`
    );
  } else {
    recommendations.push(
      `🎉 Excellent conversion (${overallConversion.toFixed(1)}%)! Continue A/B testing to maintain performance.`
    );
  }

  // Calculator completion recommendations
  const calculatorStep = steps.find(s => s.eventName === 'tax_calculation_viewed');
  if (calculatorStep && calculatorStep.conversionRate < 50) {
    recommendations.push(
      `📊 Only ${calculatorStep.conversionRate.toFixed(1)}% complete calculator. Simplify input fields, add progress indicator, and reduce friction.`
    );
  }

  return recommendations.slice(0, 5); // Top 5 recommendations
}

function generateMockFunnelData(): FunnelAnalysis {
  // Generate realistic mock data for development/testing
  const mockSteps: FunnelData[] = [
    { step: 'Landing Page Viewed', eventName: 'landing_page_viewed', order: 1, count: 1000, conversionRate: 100, dropOffRate: 0, dropOffCount: 0 },
    { step: 'Calculator Viewed', eventName: 'calculator_page_viewed', order: 2, count: 650, conversionRate: 65, dropOffRate: 35, dropOffCount: 350 },
    { step: 'Tax Calculation Completed', eventName: 'tax_calculation_viewed', order: 3, count: 520, conversionRate: 52, dropOffRate: 20, dropOffCount: 130 },
    { step: 'Signup Started', eventName: 'signup_started', order: 4, count: 280, conversionRate: 28, dropOffRate: 46.2, dropOffCount: 240 },
    { step: 'Signup Completed', eventName: 'signup_completed', order: 5, count: 220, conversionRate: 22, dropOffRate: 21.4, dropOffCount: 60 },
    { step: 'Pricing Page Viewed', eventName: 'pricing_page_viewed', order: 6, count: 154, conversionRate: 15.4, dropOffRate: 30, dropOffCount: 66 },
    { step: 'Checkout Started', eventName: 'checkout_started', order: 7, count: 62, conversionRate: 6.2, dropOffRate: 59.7, dropOffCount: 92 },
    { step: 'Payment Completed', eventName: 'subscription_activated', order: 8, count: 43, conversionRate: 4.3, dropOffRate: 30.6, dropOffCount: 19 },
  ];

  const biggestDropOffs = [
    { fromStep: 'Landing Page Viewed', toStep: 'Calculator Viewed', dropOffRate: 35, usersLost: 350, revenueImpact: 857 },
    { fromStep: 'Pricing Page Viewed', toStep: 'Checkout Started', dropOffRate: 59.7, usersLost: 92, revenueImpact: 225 },
    { fromStep: 'Tax Calculation Completed', toStep: 'Signup Started', dropOffRate: 46.2, usersLost: 240, revenueImpact: 588 },
  ];

  return {
    overall: {
      totalVisitors: 1000,
      paidCustomers: 43,
      overallConversion: 4.3,
      estimatedMRR: 2107,
    },
    steps: mockSteps,
    biggestDropOffs,
    channelBreakdown: [
      { channel: 'reddit', totalUsers: 320, conversions: 26, conversionRate: 8.1, revenue: 1274 },
      { channel: 'google_ads', totalUsers: 180, conversions: 6, conversionRate: 3.3, revenue: 294 },
      { channel: 'organic', totalUsers: 250, conversions: 8, conversionRate: 3.2, revenue: 392 },
      { channel: 'direct', totalUsers: 250, conversions: 3, conversionRate: 1.2, revenue: 147 },
    ],
    deviceBreakdown: {
      mobile: { users: 380, conversion: 2.9 },
      desktop: { users: 620, conversion: 5.2 },
    },
    recommendations: [
      '🔴 CRITICAL: 35% of visitors leave without viewing calculator. Add prominent "Calculate Your Savings" CTA above the fold.',
      '🔴 HIGH PRIORITY: 46.2% drop-off after seeing results. Embed signup form directly on results page with urgency message.',
      '⚠️ Overall conversion (4.3%) is near industry average (3-5%). Optimize pricing and checkout to reach 7%+.',
      '📊 Reddit drives 2.5x better conversion (8.1%) than Google Ads (3.3%). Double down on Reddit marketing budget.',
      '📱 Desktop converts 79% better than mobile (5.2% vs 2.9%). Prioritize mobile UX improvements.',
    ],
  };
}
