'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, DollarSignIcon, UsersIcon, TargetIcon } from 'lucide-react';

interface CACMetrics {
  totalSpend: number;
  totalConversions: number;
  cac: number;
  revenue: number;
  roas: number;
  conversionRate: number;
  avgCPC: number;
  clicks: number;
  impressions: number;
  ctr: number;
}

interface CampaignPerformance {
  campaignName: string;
  spend: number;
  conversions: number;
  cac: number;
  revenue: number;
  roas: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
}

export default function GoogleAdsCACDashboard() {
  const [metrics, setMetrics] = useState<CACMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchCACMetrics();
  }, [timeRange]);

  async function fetchCACMetrics() {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/google-ads?range=${timeRange}`);
      const data = await response.json();
      setMetrics(data.overall);
      setCampaigns(data.campaigns);
    } catch (error) {
      console.error('Failed to fetch CAC metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: CampaignPerformance['status']) {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
    }
  }

  function getStatusBadge(cac: number, targetCAC = 30) {
    if (cac < targetCAC * 0.7) return { label: 'Excellent', variant: 'default' as const };
    if (cac < targetCAC) return { label: 'Good', variant: 'secondary' as const };
    if (cac < targetCAC * 1.5) return { label: 'Warning', variant: 'warning' as const };
    return { label: 'Poor', variant: 'destructive' as const };
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertDescription>
          No Google Ads data available. Connect your Google Ads account to see metrics.
        </AlertDescription>
      </Alert>
    );
  }

  const cacStatus = getStatusBadge(metrics.cac);
  const targetCAC = 30;
  const cacDelta = ((metrics.cac - targetCAC) / targetCAC) * 100;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['today', 'week', 'month', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* CAC Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Acquisition Cost</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">${metrics.cac.toFixed(2)}</div>
              <Badge variant={cacStatus.variant}>{cacStatus.label}</Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {cacDelta < 0 ? (
                <>
                  <ArrowDownIcon className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{Math.abs(cacDelta).toFixed(1)}% under target</span>
                </>
              ) : (
                <>
                  <ArrowUpIcon className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{cacDelta.toFixed(1)}% over target</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Target: ${targetCAC.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* ROAS Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Return on Ad Spend</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.roas.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${metrics.revenue.toFixed(2)} revenue from ${metrics.totalSpend.toFixed(2)} spend
            </p>
            <p className="text-xs text-muted-foreground mt-2">Target: &gt;300%</p>
          </CardContent>
        </Card>

        {/* Conversions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalConversions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.conversionRate.toFixed(2)}% conversion rate
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              From {metrics.clicks.toLocaleString()} clicks
            </p>
          </CardContent>
        </Card>

        {/* CTR Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ctr.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.clicks.toLocaleString()} clicks from {metrics.impressions.toLocaleString()} impressions
            </p>
            <p className="text-xs text-muted-foreground mt-2">Industry avg: 3.17%</p>
          </CardContent>
        </Card>
      </div>

      {/* CAC Alert */}
      {metrics.cac > targetCAC * 1.2 && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>CAC is {cacDelta.toFixed(0)}% over target!</strong> Consider pausing underperforming keywords or
            adjusting bids. Target CAC is ${targetCAC}.
          </AlertDescription>
        </Alert>
      )}

      {metrics.cac < targetCAC * 0.7 && (
        <Alert>
          <AlertDescription>
            <strong>Excellent CAC performance!</strong> Consider increasing budget to scale this campaign.
          </AlertDescription>
        </Alert>
      )}

      {/* Campaign Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Performance breakdown by campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Campaign</th>
                  <th className="text-right py-2 px-4">Spend</th>
                  <th className="text-right py-2 px-4">Conversions</th>
                  <th className="text-right py-2 px-4">CAC</th>
                  <th className="text-right py-2 px-4">Revenue</th>
                  <th className="text-right py-2 px-4">ROAS</th>
                  <th className="text-right py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const status = getStatusBadge(campaign.cac);
                  return (
                    <tr key={campaign.campaignName} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4 font-medium">{campaign.campaignName}</td>
                      <td className="text-right py-2 px-4">${campaign.spend.toFixed(2)}</td>
                      <td className="text-right py-2 px-4">{campaign.conversions}</td>
                      <td className="text-right py-2 px-4 font-semibold">${campaign.cac.toFixed(2)}</td>
                      <td className="text-right py-2 px-4">${campaign.revenue.toFixed(2)}</td>
                      <td className="text-right py-2 px-4">{campaign.roas.toFixed(0)}%</td>
                      <td className="text-right py-2 px-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {campaigns.filter((c) => c.cac > targetCAC * 1.5).length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-red-500">⚠️</span>
                <span>
                  Pause or lower bids for underperforming campaigns:{' '}
                  <strong>{campaigns.filter((c) => c.cac > targetCAC * 1.5).map((c) => c.campaignName).join(', ')}</strong>
                </span>
              </li>
            )}
            {campaigns.filter((c) => c.cac < targetCAC * 0.7).length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-green-500">✅</span>
                <span>
                  Scale up high-performing campaigns:{' '}
                  <strong>{campaigns.filter((c) => c.cac < targetCAC * 0.7).map((c) => c.campaignName).join(', ')}</strong>
                </span>
              </li>
            )}
            {metrics.ctr < 3 && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">💡</span>
                <span>CTR is below industry average. Test new ad copy variations.</span>
              </li>
            )}
            {metrics.conversionRate < 5 && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">💡</span>
                <span>Conversion rate is low. Optimize landing pages and CTAs.</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
