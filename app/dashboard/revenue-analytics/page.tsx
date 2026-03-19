/**
 * Revenue Analytics Dashboard
 * Real-time metrics: MRR, Churn Rate, LTV, CAC, Conversion Funnel
 * Data sources: Stripe API + PostHog Analytics + Database
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  FunnelChart,
  Funnel,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, TrendingUp, Target } from 'lucide-react';

interface StripeMetrics {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  canceledSubscriptions: number;
  churnRate: number;
  subscriptionsByTier: {
    pro: number;
    enterprise: number;
  };
  revenueByTier: {
    pro: number;
    enterprise: number;
  };
  mrrGrowth: number;
  newMRR: number;
  churnedMRR: number;
  expansionMRR: number;
}

interface RevenueMetrics {
  ltv: number;
  cac: number;
  ltvCacRatio: number;
  paybackPeriod: number;
  conversionFunnel: {
    visitors: number;
    signups: number;
    profileCompleted: number;
    firstCalculation: number;
    paidConversions: number;
    visitorToSignup: number;
    signupToProfile: number;
    profileToCalculation: number;
    calculationToPaid: number;
    overallConversion: number;
  };
  cohortAnalysis: {
    month: string;
    signups: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }[];
}

export default function RevenueAnalyticsDashboard() {
  const [stripeMetrics, setStripeMetrics] = useState<StripeMetrics | null>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Stripe metrics
        const stripeResponse = await fetch('/api/analytics/stripe-metrics');
        const stripeData = await stripeResponse.json();

        if (!stripeData.success) {
          throw new Error(stripeData.error || 'Failed to fetch Stripe metrics');
        }

        setStripeMetrics(stripeData.data);

        // Fetch revenue analytics
        const revenueResponse = await fetch('/api/analytics/revenue-metrics');
        const revenueData = await revenueResponse.json();

        if (!revenueData.success) {
          throw new Error(revenueData.error || 'Failed to fetch revenue metrics');
        }

        setRevenueMetrics(revenueData.data);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading revenue analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error Loading Analytics</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!stripeMetrics || !revenueMetrics) {
    return null;
  }

  // Prepare funnel data for visualization
  const funnelData = [
    { name: 'Visitors', value: revenueMetrics.conversionFunnel.visitors, fill: '#3b82f6' },
    { name: 'Signups', value: revenueMetrics.conversionFunnel.signups, fill: '#10b981' },
    { name: 'Profile Completed', value: revenueMetrics.conversionFunnel.profileCompleted, fill: '#f59e0b' },
    { name: 'First Calculation', value: revenueMetrics.conversionFunnel.firstCalculation, fill: '#ef4444' },
    { name: 'Paid Conversions', value: revenueMetrics.conversionFunnel.paidConversions, fill: '#8b5cf6' },
  ];

  // Prepare cohort data
  const cohortData = revenueMetrics.cohortAnalysis.map((cohort) => ({
    month: cohort.month,
    signups: cohort.signups,
    conversions: cohort.conversions,
    conversionRate: cohort.conversionRate,
  }));

  // MRR breakdown by component
  const mrrBreakdownData = [
    { name: 'New MRR', value: stripeMetrics.newMRR, fill: '#10b981' },
    { name: 'Expansion MRR', value: stripeMetrics.expansionMRR, fill: '#3b82f6' },
    { name: 'Churned MRR', value: -stripeMetrics.churnedMRR, fill: '#ef4444' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Revenue Analytics Dashboard</h1>
        <p className="text-gray-600">Real-time metrics from Stripe, PostHog, and database analytics</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{formatCurrency(stripeMetrics.mrr)}</div>
                <div className="flex items-center gap-1 mt-1">
                  {stripeMetrics.mrrGrowth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ${stripeMetrics.mrrGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(Math.abs(stripeMetrics.mrrGrowth))}
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-3 text-sm text-gray-500">
              ARR: {formatCurrency(stripeMetrics.arr)}
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stripeMetrics.activeSubscriptions}</div>
                <div className="mt-1 text-sm text-gray-500">
                  {stripeMetrics.trialingSubscriptions} trialing
                </div>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-3 text-sm text-gray-500">
              Pro: {stripeMetrics.subscriptionsByTier.pro} | Enterprise: {stripeMetrics.subscriptionsByTier.enterprise}
            </div>
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Churn Rate (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{formatPercent(stripeMetrics.churnRate)}</div>
                <div className="mt-1 text-sm text-gray-500">
                  {stripeMetrics.canceledSubscriptions} canceled
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-3 text-sm text-gray-500">
              Churned MRR: {formatCurrency(stripeMetrics.churnedMRR)}
            </div>
          </CardContent>
        </Card>

        {/* LTV:CAC Ratio */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">LTV:CAC Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{revenueMetrics.ltvCacRatio.toFixed(1)}x</div>
                <div className="mt-1 text-sm text-gray-500">
                  {revenueMetrics.ltvCacRatio >= 3 ? '✅ Healthy' : '⚠️ Below Target'}
                </div>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-3 text-sm text-gray-500">
              Target: 3.0x+ for SaaS
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LTV & CAC Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Lifetime Value (LTV)</CardTitle>
            <CardDescription>Average revenue per customer over their lifetime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lifetime Value</span>
                <span className="text-2xl font-bold">{formatCurrency(revenueMetrics.ltv)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Customer Acquisition Cost</span>
                <span className="font-semibold">{formatCurrency(revenueMetrics.cac)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Payback Period</span>
                <span className="font-semibold">{revenueMetrics.paybackPeriod.toFixed(1)} months</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MRR Movement (Last 30 Days)</CardTitle>
            <CardDescription>Breakdown of MRR growth components</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mrrBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {mrrBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="value" position="top" formatter={(value) => formatCurrency(Number(value))} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey from visitor to paying customer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="value" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Visitor → Signup</span>
                <span className="font-bold text-blue-600">{formatPercent(revenueMetrics.conversionFunnel.visitorToSignup)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Signup → Profile Completed</span>
                <span className="font-bold text-green-600">{formatPercent(revenueMetrics.conversionFunnel.signupToProfile)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-medium">Profile → First Calculation</span>
                <span className="font-bold text-orange-600">{formatPercent(revenueMetrics.conversionFunnel.profileToCalculation)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Calculation → Paid</span>
                <span className="font-bold text-purple-600">{formatPercent(revenueMetrics.conversionFunnel.calculationToPaid)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
                <span className="font-bold">Overall Conversion</span>
                <span className="font-bold text-gray-900 text-lg">{formatPercent(revenueMetrics.conversionFunnel.overallConversion)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cohort Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Analysis (Last 12 Months)</CardTitle>
          <CardDescription>Signup-to-paid conversion by signup month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} name="Signups" />
              <Line yAxisId="left" type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} name="Conversions" />
              <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#f59e0b" strokeWidth={2} name="Conversion Rate (%)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
