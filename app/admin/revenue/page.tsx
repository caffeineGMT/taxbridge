/**
 * CEO Revenue Dashboard
 *
 * Real-time revenue tracking for daily monitoring:
 * - Stripe MRR/ARR metrics
 * - PostHog conversion funnel
 * - CAC/LTV calculations
 * - Churn rate
 * - Growth trends
 *
 * All data pulled from live Stripe API and database.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Percent,
  Calendar,
} from 'lucide-react';

interface RevenueMetrics {
  mrr: number;
  arr: number;
  totalCustomers: number;
  activeSubscriptions: number;
  churnRate: number;
  growthRate: number;
  subscriptionsByTier: {
    pro: number;
    enterprise: number;
  };
  revenueByTier: {
    pro: number;
    enterprise: number;
  };
  newCustomersThisMonth: number;
  churnedCustomersThisMonth: number;
  lifetimeValue: number;
  customerAcquisitionCost: number;
  ltvcacRatio: number;
}

interface FunnelStep {
  name: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

interface FunnelMetrics {
  funnel: FunnelStep[];
  totalVisitors: number;
  totalConversions: number;
  overallConversionRate: number;
  biggestDropOffStep: string;
  biggestDropOffRate: number;
}

export default function RevenueDashboard() {
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [revenueRes, funnelRes] = await Promise.all([
        fetch('/api/analytics/revenue'),
        fetch('/api/analytics/funnel?timeRange=30d'),
      ]);

      if (!revenueRes.ok || !funnelRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const revenueData = await revenueRes.json();
      const funnelData = await funnelRes.json();

      setRevenue(revenueData);
      setFunnel({
        funnel: funnelData.funnel || [],
        totalVisitors: funnelData.totalVisitors || 0,
        totalConversions: funnelData.totalConversions || 0,
        overallConversionRate: funnelData.overallConversionRate || 0,
        biggestDropOffStep: funnelData.biggestDropOffStep || '',
        biggestDropOffRate: funnelData.biggestDropOffRate || 0,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !revenue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-transparent bg-clip-text">
              CEO Revenue Dashboard
            </h1>
            <p className="text-slate-400">
              Live metrics from Stripe & PostHog • Last updated:{' '}
              {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* MRR */}
          <MetricCard
            icon={<DollarSign className="w-6 h-6 text-emerald-500" />}
            label="MRR"
            value={formatCurrency(revenue?.mrr || 0)}
            trend={revenue?.growthRate || 0}
            trendLabel="vs last month"
          />

          {/* ARR */}
          <MetricCard
            icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
            label="ARR"
            value={formatCurrency(revenue?.arr || 0)}
            subtitle="Annual Run Rate"
          />

          {/* Active Subscriptions */}
          <MetricCard
            icon={<Users className="w-6 h-6 text-purple-500" />}
            label="Active Subscriptions"
            value={revenue?.activeSubscriptions || 0}
            subtitle={`${revenue?.newCustomersThisMonth || 0} new this month`}
          />

          {/* Churn Rate */}
          <MetricCard
            icon={<Activity className="w-6 h-6 text-amber-500" />}
            label="Churn Rate"
            value={formatPercent(revenue?.churnRate || 0)}
            trend={-(revenue?.churnRate || 0)}
            trendLabel="lower is better"
            invertTrend
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* LTV */}
          <MetricCard
            icon={<Target className="w-6 h-6 text-emerald-500" />}
            label="Lifetime Value (LTV)"
            value={formatCurrency(revenue?.lifetimeValue || 0)}
            subtitle="Average customer value"
          />

          {/* CAC */}
          <MetricCard
            icon={<DollarSign className="w-6 h-6 text-red-500" />}
            label="Customer Acquisition Cost"
            value={formatCurrency(revenue?.customerAcquisitionCost || 0)}
            subtitle="Cost to acquire one customer"
          />

          {/* LTV:CAC Ratio */}
          <MetricCard
            icon={<Percent className="w-6 h-6 text-blue-500" />}
            label="LTV:CAC Ratio"
            value={revenue?.ltvcacRatio?.toFixed(1) || '0.0'}
            subtitle={
              (revenue?.ltvcacRatio || 0) >= 3
                ? '✅ Healthy (>3)'
                : '⚠️ Target: 3+'
            }
          />
        </div>

        {/* Revenue by Tier */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Revenue Breakdown</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pro Tier */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-emerald-400">Pro Plan</h3>
                <span className="text-2xl font-bold">
                  {formatCurrency(revenue?.revenueByTier?.pro || 0)}/mo
                </span>
              </div>
              <div className="text-slate-400">
                {revenue?.subscriptionsByTier?.pro || 0} active subscriptions
              </div>
              <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                  style={{
                    width: `${
                      ((revenue?.revenueByTier?.pro || 0) /
                        ((revenue?.revenueByTier?.pro || 0) +
                          (revenue?.revenueByTier?.enterprise || 0) || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Enterprise Tier */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-400">Enterprise Plan</h3>
                <span className="text-2xl font-bold">
                  {formatCurrency(revenue?.revenueByTier?.enterprise || 0)}/mo
                </span>
              </div>
              <div className="text-slate-400">
                {revenue?.subscriptionsByTier?.enterprise || 0} active subscriptions
              </div>
              <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  style={{
                    width: `${
                      ((revenue?.revenueByTier?.enterprise || 0) /
                        ((revenue?.revenueByTier?.pro || 0) +
                          (revenue?.revenueByTier?.enterprise || 0) || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-2">Conversion Funnel</h2>
          <p className="text-slate-400 mb-6">
            Overall conversion rate: {formatPercent(funnel?.overallConversionRate || 0)} •{' '}
            Biggest drop-off: {funnel?.biggestDropOffStep} ({formatPercent(funnel?.biggestDropOffRate || 0)})
          </p>

          <div className="space-y-4">
            {funnel?.funnel.map((step, index) => (
              <div key={step.name} className="relative">
                <div
                  className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                    step.dropOffRate > 15
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-slate-600 bg-slate-700/50'
                  }`}
                >
                  {/* Progress Bar */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent"
                    style={{ width: `${step.conversionRate}%` }}
                  />

                  {/* Content */}
                  <div className="relative p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          step.dropOffRate > 15 ? 'bg-red-600' : 'bg-emerald-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{step.name}</h3>
                        <p className="text-sm text-slate-400">
                          {step.count.toLocaleString()} users
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-400">
                          {formatPercent(step.conversionRate)}
                        </p>
                        <p className="text-xs text-slate-400">of total</p>
                      </div>

                      {step.dropOffRate > 0 && (
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              step.dropOffRate > 15 ? 'text-red-400' : 'text-slate-400'
                            }`}
                          >
                            -{formatPercent(step.dropOffRate)}
                          </p>
                          <p className="text-xs text-slate-400">drop-off</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Channel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Revenue by Channel</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Organic */}
            <ChannelCard
              name="Organic / SEO"
              revenue={revenue?.revenueByChannel?.organic || 0}
              customers={revenue?.customersByChannel?.organic || 0}
              icon="🌱"
              color="emerald"
            />

            {/* Product Hunt */}
            <ChannelCard
              name="Product Hunt"
              revenue={revenue?.revenueByChannel?.productHunt || 0}
              customers={revenue?.customersByChannel?.productHunt || 0}
              icon="🚀"
              color="orange"
            />

            {/* Paid Ads */}
            <ChannelCard
              name="Google Ads"
              revenue={revenue?.revenueByChannel?.paidAds || 0}
              customers={revenue?.customersByChannel?.paidAds || 0}
              icon="📢"
              color="blue"
            />

            {/* Referral */}
            <ChannelCard
              name="Referral"
              revenue={revenue?.revenueByChannel?.referral || 0}
              customers={revenue?.customersByChannel?.referral || 0}
              icon="👥"
              color="purple"
            />

            {/* Direct */}
            <ChannelCard
              name="Direct"
              revenue={revenue?.revenueByChannel?.direct || 0}
              customers={revenue?.customersByChannel?.direct || 0}
              icon="🔗"
              color="slate"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Channel Card Component
function ChannelCard({
  name,
  revenue,
  customers,
  icon,
  color,
}: {
  name: string;
  revenue: number;
  customers: number;
  icon: string;
  color: 'emerald' | 'orange' | 'blue' | 'purple' | 'slate';
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const colorClasses = {
    emerald: 'border-emerald-600 bg-emerald-600/10',
    orange: 'border-orange-600 bg-orange-600/10',
    blue: 'border-blue-600 bg-blue-600/10',
    purple: 'border-purple-600 bg-purple-600/10',
    slate: 'border-slate-600 bg-slate-600/10',
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        <div className="text-right">
          <p className="text-sm text-slate-400">{name}</p>
        </div>
      </div>
      <div className="mb-2">
        <p className="text-2xl font-bold text-white">{formatCurrency(revenue)}/mo</p>
      </div>
      <div className="text-sm text-slate-400">{customers} customers</div>
    </div>
  );
}

// Reusable Metric Card Component
function MetricCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  trendLabel,
  invertTrend = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  invertTrend?: boolean;
}) {
  const isPositiveTrend = invertTrend ? trend && trend < 0 : trend && trend > 0;
  const isNegativeTrend = invertTrend ? trend && trend > 0 : trend && trend < 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        {icon}
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositiveTrend
                ? 'text-emerald-400'
                : isNegativeTrend
                ? 'text-red-400'
                : 'text-slate-400'
            }`}
          >
            {isPositiveTrend ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : isNegativeTrend ? (
              <ArrowDownRight className="w-4 h-4" />
            ) : null}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="mb-2">
        <p className="text-sm text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>

      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      {trendLabel && <p className="text-xs text-slate-500 mt-1">{trendLabel}</p>}
    </div>
  );
}
