'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AttributionSummary {
  total_users: number;
  total_signups: number;
  total_conversions: number;
  total_revenue: number;
  total_ad_spend: number;
  overall_roi: number;
  avg_cac: number;
  avg_ltv: number;
}

interface ChannelPerformance {
  utm_source: string;
  utm_campaign: string | null;
  total_users: number;
  signups: number;
  calculator_users: number;
  paid_conversions: number;
  signup_rate_pct: number;
  conversion_rate_pct: number;
  total_revenue: number;
  avg_revenue_per_conversion: number;
  total_ad_spend: number;
  cost_per_acquisition: number;
  roi_pct: number;
}

interface TopChannel {
  utm_source: string;
  total_users: number;
  paid_conversions: number;
  total_revenue: number;
  conversion_rate_pct: number;
}

interface UnderperformingChannel {
  utm_source: string;
  utm_campaign: string | null;
  total_users: number;
  signups: number;
  paid_conversions: number;
  conversion_rate_pct: number;
  total_revenue: number;
}

interface AdSpend {
  utm_source: string;
  utm_campaign: string | null;
  total_spend: number;
  spend_days: number;
}

interface AttributionData {
  success: boolean;
  period: {
    days: number;
    start_date: string;
    end_date: string;
  };
  summary: AttributionSummary;
  channels: ChannelPerformance[];
  top_channels: TopChannel[];
  underperforming_channels: UnderperformingChannel[];
  ad_spend: AdSpend[];
}

export default function AttributionDashboard() {
  const [data, setData] = useState<AttributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttributionData();
  }, [days]);

  const fetchAttributionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/attribution?days=${days}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch attribution data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load attribution data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading attribution data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error || 'Failed to load attribution data'}</AlertDescription>
        </Alert>
        <Button onClick={fetchAttributionData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const { summary, channels, top_channels, underperforming_channels } = data;

  // Determine overall health
  const getOverallHealth = () => {
    if (summary.overall_roi >= 100) return { status: 'Excellent', color: 'bg-green-500', emoji: '🚀' };
    if (summary.overall_roi >= 50) return { status: 'Good', color: 'bg-blue-500', emoji: '✅' };
    if (summary.overall_roi >= 0) return { status: 'Break-even', color: 'bg-yellow-500', emoji: '⚠️' };
    return { status: 'Losing Money', color: 'bg-red-500', emoji: '❌' };
  };

  const health = getOverallHealth();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Acquisition Channels</h1>
          <p className="text-muted-foreground">
            Period: {new Date(data.period.start_date).toLocaleDateString()} - {new Date(data.period.end_date).toLocaleDateString()}
          </p>
        </div>

        {/* Time period selector */}
        <div className="flex gap-2">
          <Button
            variant={days === 7 ? 'default' : 'outline'}
            onClick={() => setDays(7)}
            size="sm"
          >
            7 Days
          </Button>
          <Button
            variant={days === 30 ? 'default' : 'outline'}
            onClick={() => setDays(30)}
            size="sm"
          >
            30 Days
          </Button>
          <Button
            variant={days === 90 ? 'default' : 'outline'}
            onClick={() => setDays(90)}
            size="sm"
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.total_revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {summary.total_conversions} paid conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
            <span className="text-2xl">{health.emoji}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.overall_roi.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              <Badge className={`${health.color} text-white`}>{health.status}</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAC (Customer Acquisition Cost)</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.avg_cac.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              ${summary.total_ad_spend.toLocaleString()} total ad spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV (Lifetime Value)</CardTitle>
            <span className="text-2xl">💵</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.avg_ltv.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.avg_ltv > 0 && summary.avg_cac > 0
                ? `${(summary.avg_ltv / summary.avg_cac).toFixed(1)}x CAC`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Overall conversion rates across all channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-3xl font-bold">{summary.total_users}</div>
              <div className="text-sm text-muted-foreground">Visitors</div>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold">{summary.total_signups}</div>
              <div className="text-sm text-muted-foreground">Signups</div>
              <div className="text-xs text-green-600">
                {summary.total_users > 0
                  ? `${((summary.total_signups / summary.total_users) * 100).toFixed(1)}%`
                  : 'N/A'}
              </div>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold">{summary.total_conversions}</div>
              <div className="text-sm text-muted-foreground">Paid</div>
              <div className="text-xs text-green-600">
                {summary.total_signups > 0
                  ? `${((summary.total_conversions / summary.total_signups) * 100).toFixed(1)}%`
                  : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all-channels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-channels">All Channels</TabsTrigger>
          <TabsTrigger value="top-performers">Top Performers 🏆</TabsTrigger>
          <TabsTrigger value="underperforming">Needs Optimization ⚠️</TabsTrigger>
        </TabsList>

        {/* All Channels */}
        <TabsContent value="all-channels" className="space-y-4">
          <div className="grid gap-4">
            {channels.length === 0 ? (
              <Alert>
                <AlertTitle>No Data Yet</AlertTitle>
                <AlertDescription>
                  No channel attribution data available for the selected period. Make sure users are landing with UTM parameters.
                </AlertDescription>
              </Alert>
            ) : (
              channels.map((channel) => (
                <Card key={`${channel.utm_source}-${channel.utm_campaign || 'all'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg capitalize">{channel.utm_source}</CardTitle>
                        {channel.utm_campaign && (
                          <CardDescription>{channel.utm_campaign}</CardDescription>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${channel.total_revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {channel.roi_pct > 0
                            ? `${channel.roi_pct.toFixed(0)}% ROI`
                            : channel.total_ad_spend > 0
                            ? 'Negative ROI'
                            : 'No ad spend'}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Visitors</p>
                        <p className="font-medium text-lg">{channel.total_users}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Signups</p>
                        <p className="font-medium text-lg">{channel.signups}</p>
                        <p className="text-xs text-green-600">{channel.signup_rate_pct.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Paid Conversions</p>
                        <p className="font-medium text-lg">{channel.paid_conversions}</p>
                        <p className="text-xs text-green-600">{channel.conversion_rate_pct.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">CAC</p>
                        <p className="font-medium text-lg">
                          {channel.cost_per_acquisition > 0
                            ? `$${channel.cost_per_acquisition.toFixed(0)}`
                            : 'N/A'}
                        </p>
                        {channel.total_ad_spend > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ${channel.total_ad_spend.toFixed(0)} spent
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Top Performers */}
        <TabsContent value="top-performers" className="space-y-4">
          <Alert>
            <AlertTitle>🏆 Your Best Channels</AlertTitle>
            <AlertDescription>
              These channels are driving the most revenue. <strong>Double down on these winners!</strong>
            </AlertDescription>
          </Alert>

          {top_channels.length === 0 ? (
            <Alert>
              <AlertTitle>No Paid Conversions Yet</AlertTitle>
              <AlertDescription>
                Once you have paid conversions, your top-performing channels will appear here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {top_channels.map((channel, index) => (
                <Card key={channel.utm_source} className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-bold text-green-600">#{index + 1}</div>
                        <div>
                          <CardTitle className="text-lg capitalize">{channel.utm_source}</CardTitle>
                          <CardDescription>{channel.paid_conversions} conversions</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${channel.total_revenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {channel.conversion_rate_pct.toFixed(1)}% conversion rate
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500 text-white">
                        {channel.total_users} total visitors
                      </Badge>
                      <Badge variant="outline">
                        ${(channel.total_revenue / channel.paid_conversions).toFixed(0)} avg revenue/user
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Underperforming */}
        <TabsContent value="underperforming" className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>⚠️ Channels Needing Optimization</AlertTitle>
            <AlertDescription>
              These channels have &lt;5% conversion rate with at least 10 signups. <strong>Consider pausing or optimizing these.</strong>
            </AlertDescription>
          </Alert>

          {underperforming_channels.length === 0 ? (
            <Alert>
              <AlertTitle>All Channels Performing Well!</AlertTitle>
              <AlertDescription>
                No underperforming channels detected. All channels with sufficient traffic (&ge;10 signups) have conversion rates above 5%.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {underperforming_channels.map((channel) => (
                <Card key={`${channel.utm_source}-${channel.utm_campaign || 'all'}`} className="border-red-200 bg-red-50/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg capitalize">{channel.utm_source}</CardTitle>
                        {channel.utm_campaign && (
                          <CardDescription>{channel.utm_campaign}</CardDescription>
                        )}
                      </div>
                      <Badge variant="destructive">
                        {channel.conversion_rate_pct?.toFixed(1) || '0.0'}% conversion
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Signups</p>
                        <p className="font-medium text-lg">{channel.signups}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversions</p>
                        <p className="font-medium text-lg">{channel.paid_conversions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-medium text-lg">${channel.total_revenue.toFixed(0)}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <strong>Recommendation:</strong> Review targeting, ad creative, and landing page. Consider pausing if performance doesn&apos;t improve.
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Items */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📋 Action Items</CardTitle>
          <CardDescription>Based on your channel performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {top_channels.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">✅ Double Down</h4>
              <p className="text-sm text-green-800">
                Increase budget for: {top_channels.slice(0, 3).map(c => c.utm_source).join(', ')}
              </p>
            </div>
          )}

          {underperforming_channels.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">❌ Kill or Optimize</h4>
              <p className="text-sm text-red-800">
                Review and optimize: {underperforming_channels.slice(0, 3).map(c => c.utm_source).join(', ')}
              </p>
            </div>
          )}

          {summary.total_users === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ No Attribution Data</h4>
              <p className="text-sm text-yellow-800">
                Make sure all traffic sources use UTM parameters. Check the UTM Generator in your marketing toolkit.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
