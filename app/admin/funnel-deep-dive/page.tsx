'use client';

/**
 * PostHog Conversion Funnel Deep Dive Dashboard
 *
 * Interactive admin dashboard for analyzing conversion funnels:
 * - Visual funnel diagram with drop-off percentages
 * - Channel attribution breakdown
 * - Device type analysis
 * - Actionable recommendations with revenue impact
 * - Automated insights and alerts
 *
 * Access: /admin/funnel-deep-dive
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface FunnelStep {
  step: string;
  eventName: string;
  order: number;
  count: number;
  conversionRate: number;
  dropOffRate: number;
  dropOffCount: number;
  averageTimeToConvert?: number;
}

interface DropOff {
  fromStep: string;
  toStep: string;
  dropOffRate: number;
  usersLost: number;
  revenueImpact: number;
}

interface ChannelData {
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
  steps: FunnelStep[];
  biggestDropOffs: DropOff[];
  channelBreakdown?: ChannelData[];
  deviceBreakdown?: {
    mobile: { users: number; conversion: number };
    desktop: { users: number; conversion: number };
  };
  recommendations: string[];
}

export default function FunnelDeepDivePage() {
  const [analysis, setAnalysis] = useState<FunnelAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const fetchFunnelData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/funnel-deep-dive?days=${days}`);
      const result = await response.json();

      if (result.error && !result.mockData) {
        setError(result.message || result.error);
      } else {
        setAnalysis(result.data || result.mockData);
        setIsMockData(result.isMockData || false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch funnel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg">Loading funnel analysis...</span>
        </div>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">Error Loading Funnel Data</h3>
              <p className="text-red-700">{error}</p>
              <Button onClick={fetchFunnelData} className="mt-4" size="sm">
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Conversion Funnel Deep Dive</h1>
          <p className="text-gray-600">
            Comprehensive analysis of user journey from landing to paid conversion
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {isMockData && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
              Mock Data (PostHog not configured)
            </Badge>
          )}
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="border rounded-md px-3 py-2"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button onClick={fetchFunnelData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Visitors"
          value={analysis.overall.totalVisitors.toLocaleString()}
          icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
        />
        <MetricCard
          title="Paid Customers"
          value={analysis.overall.paidCustomers.toLocaleString()}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        />
        <MetricCard
          title="Overall Conversion"
          value={`${analysis.overall.overallConversion.toFixed(2)}%`}
          icon={<Zap className="h-5 w-5 text-yellow-500" />}
          subtitle={
            analysis.overall.overallConversion >= 5
              ? 'Excellent ✅'
              : analysis.overall.overallConversion >= 3
              ? 'Average ⚠️'
              : 'Below target 🔴'
          }
        />
        <MetricCard
          title="Estimated MRR"
          value={`$${analysis.overall.estimatedMRR.toLocaleString()}`}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
        />
      </div>

      {/* Funnel Visualization */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Conversion Funnel</h2>
        <div className="space-y-2">
          {analysis.steps.map((step, index) => (
            <FunnelStepBar
              key={step.eventName}
              step={step}
              isFirst={index === 0}
              maxCount={analysis.steps[0].count}
            />
          ))}
        </div>
      </Card>

      {/* Biggest Drop-Offs */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-red-500" />
          Biggest Drop-Off Points
        </h2>
        <div className="space-y-3">
          {analysis.biggestDropOffs.map((dropOff, index) => (
            <div
              key={index}
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="destructive">#{index + 1}</Badge>
                    <span className="font-semibold text-gray-900">
                      {dropOff.fromStep} → {dropOff.toStep}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-bold text-red-600">
                      {dropOff.dropOffRate.toFixed(1)}% drop-off
                    </span>
                    {' '}({dropOff.usersLost.toLocaleString()} users lost)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Revenue Impact</div>
                  <div className="text-lg font-bold text-red-600">
                    ${dropOff.revenueImpact.toLocaleString()}/mo
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Actionable Recommendations
        </h2>
        <div className="space-y-3">
          {analysis.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                rec.includes('🔴')
                  ? 'bg-red-50 border-red-200'
                  : rec.includes('🟠')
                  ? 'bg-orange-50 border-orange-200'
                  : rec.includes('✅') || rec.includes('🎉')
                  ? 'bg-green-50 border-green-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <p className="text-sm leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Channel Breakdown */}
      {analysis.channelBreakdown && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Channel Attribution</h2>
          <div className="space-y-3">
            {analysis.channelBreakdown
              .sort((a, b) => b.conversionRate - a.conversionRate)
              .map((channel) => (
                <div
                  key={channel.channel}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 capitalize">
                        {channel.channel}
                      </span>
                      <Badge
                        variant={
                          channel.conversionRate >= 7
                            ? 'default'
                            : channel.conversionRate >= 4
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {channel.conversionRate.toFixed(1)}% conversion
                      </Badge>
                    </div>
                    {channel.revenue && (
                      <span className="text-sm font-semibold text-green-600">
                        ${channel.revenue.toLocaleString()} revenue
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{channel.totalUsers.toLocaleString()} users</span>
                    <span>•</span>
                    <span>{channel.conversions} conversions</span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Device Breakdown */}
      {analysis.deviceBreakdown && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Device Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Desktop</div>
              <div className="text-2xl font-bold">
                {analysis.deviceBreakdown.desktop.conversion.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {analysis.deviceBreakdown.desktop.users.toLocaleString()} users
              </div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Mobile</div>
              <div className="text-2xl font-bold">
                {analysis.deviceBreakdown.mobile.conversion.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {analysis.deviceBreakdown.mobile.users.toLocaleString()} users
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Footer Note */}
      {isMockData && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Using mock data.</strong> PostHog API key is not configured. Run{' '}
                <code className="bg-yellow-100 px-2 py-0.5 rounded">npm run setup:posthog</code>{' '}
                to enable real-time funnel tracking.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm text-gray-600">{title}</div>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </Card>
  );
}

function FunnelStepBar({
  step,
  isFirst,
  maxCount,
}: {
  step: FunnelStep;
  isFirst: boolean;
  maxCount: number;
}) {
  const widthPercent = (step.count / maxCount) * 100;

  return (
    <div className="relative">
      <div
        className={`h-16 rounded-lg flex items-center justify-between px-4 transition-all ${
          isFirst
            ? 'bg-blue-500 text-white'
            : step.dropOffRate >= 30
            ? 'bg-red-100 border border-red-300'
            : step.dropOffRate >= 15
            ? 'bg-orange-100 border border-orange-300'
            : 'bg-green-100 border border-green-300'
        }`}
        style={{ width: `${widthPercent}%` }}
      >
        <div className="flex-1">
          <div className="font-semibold text-sm">{step.step}</div>
          <div className="text-xs opacity-80">{step.count.toLocaleString()} users</div>
        </div>
        <div className="text-right">
          <div className="font-bold">{step.conversionRate.toFixed(1)}%</div>
          {!isFirst && (
            <div className="text-xs opacity-80">-{step.dropOffRate.toFixed(1)}%</div>
          )}
        </div>
      </div>
    </div>
  );
}
