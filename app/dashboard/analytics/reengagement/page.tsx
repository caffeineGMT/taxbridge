'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle } from 'lucide-react';

interface ReengagementMetrics {
  event_type: string;
  sent: number;
  opened: number;
  clicked: number;
  conversions: number;
  open_rate: string;
  click_rate: string;
  conversion_rate: string;
  revenue: string;
  revenue_per_email: string;
}

interface Summary {
  total_emails_sent: number;
  total_conversions: number;
  total_revenue: number;
  avg_open_rate: number;
  avg_click_rate: number;
  avg_conversion_rate: number;
  revenue_per_email: number;
}

interface AnalyticsData {
  timestamp: string;
  summary: Summary;
  campaign_performance: ReengagementMetrics[];
  discount_codes: Array<{
    code: string;
    conversions: number;
    revenue: string;
    avg_revenue: string;
  }>;
  cohorts: Array<{
    week: string;
    calculator_users: number;
    converted: number;
    conversion_rate: string;
    avg_days_to_convert: string;
    revenue: string;
  }>;
  follow_up_opportunities: {
    count: number;
    users: Array<{
      user_id: number;
      email: string;
      first_name: string;
      email_type: string;
      clicked_at: string;
      days_since_click: number;
    }>;
  };
  comparison: {
    drip_campaign: {
      total_sent: number;
      avg_open_rate: number;
      avg_click_rate: number;
    };
    reengagement_campaign: {
      total_sent: number;
      avg_open_rate: number;
      avg_click_rate: number;
    };
  };
  recommendations: string[];
}

export default function ReengagementAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics/reengagement');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Analytics
            </CardTitle>
            <CardDescription className="text-red-700">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              This usually means:
            </p>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1 mb-4">
              <li>Database migration 020 hasn't been run yet</li>
              <li>No emails have been sent yet (no data to analyze)</li>
              <li>Database connection error</li>
            </ul>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { summary, campaign_performance, discount_codes, cohorts, follow_up_opportunities, comparison, recommendations } = data;

  // Helper function to render trend indicator
  const getTrendIndicator = (value: number, threshold: number, higherIsBetter: boolean = true) => {
    if (value > threshold) {
      return higherIsBetter ? (
        <TrendingUp className="h-4 w-4 text-green-600" />
      ) : (
        <TrendingDown className="h-4 w-4 text-red-600" />
      );
    } else if (value < threshold * 0.9) {
      return higherIsBetter ? (
        <TrendingDown className="h-4 w-4 text-red-600" />
      ) : (
        <TrendingUp className="h-4 w-4 text-green-600" />
      );
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  // Benchmark thresholds
  const BENCHMARK_OPEN_RATE = 25;
  const BENCHMARK_CLICK_RATE = 6;
  const BENCHMARK_CONVERSION_RATE = 4;
  const BENCHMARK_REVENUE_PER_EMAIL = 2.0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Re-engagement Campaign Analytics</h1>
          <p className="text-gray-600 mt-1">
            Win-back sequence for calculator non-converters
          </p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Emails Sent</CardDescription>
            <CardTitle className="text-3xl">{summary.total_emails_sent.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Across 3 email sequence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              Avg Open Rate
              {getTrendIndicator(summary.avg_open_rate, BENCHMARK_OPEN_RATE)}
            </CardDescription>
            <CardTitle className="text-3xl">{summary.avg_open_rate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Target: {BENCHMARK_OPEN_RATE}%+ (Industry: 22%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              Avg Conversion Rate
              {getTrendIndicator(summary.avg_conversion_rate, BENCHMARK_CONVERSION_RATE)}
            </CardDescription>
            <CardTitle className="text-3xl">{summary.avg_conversion_rate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Target: {BENCHMARK_CONVERSION_RATE}%+ (Industry: 1.8%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              Revenue per Email
              {getTrendIndicator(summary.revenue_per_email, BENCHMARK_REVENUE_PER_EMAIL)}
            </CardDescription>
            <CardTitle className="text-3xl">${summary.revenue_per_email}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Total: ${summary.total_revenue.toFixed(2)} ({summary.total_conversions} conversions)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance by Email */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance by Email</CardTitle>
          <CardDescription>Breakdown of each email in the 3-email sequence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Email</th>
                  <th className="text-right py-2 px-4">Sent</th>
                  <th className="text-right py-2 px-4">Opened</th>
                  <th className="text-right py-2 px-4">Clicked</th>
                  <th className="text-right py-2 px-4">Conversions</th>
                  <th className="text-right py-2 px-4">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {campaign_performance.map((metric) => {
                  const emailName = metric.email_type.replace('reengagement_', 'Day ');
                  return (
                    <tr key={metric.email_type} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{emailName}</p>
                          <p className="text-sm text-gray-600">
                            {metric.email_type === 'reengagement_day3' && 'Social Proof'}
                            {metric.email_type === 'reengagement_day7' && '20% Discount'}
                            {metric.email_type === 'reengagement_day14' && 'Last Chance'}
                          </p>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{metric.sent}</td>
                      <td className="text-right py-3 px-4">
                        <div>
                          <p>{metric.opened}</p>
                          <Badge variant="outline" className="text-xs">
                            {metric.open_rate}
                          </Badge>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">
                        <div>
                          <p>{metric.clicked}</p>
                          <Badge variant="outline" className="text-xs">
                            {metric.click_rate}
                          </Badge>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">
                        <div>
                          <p>{metric.conversions}</p>
                          <Badge variant="outline" className="text-xs">
                            {metric.conversion_rate}
                          </Badge>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">
                        <div>
                          <p className="font-medium">{metric.revenue}</p>
                          <p className="text-xs text-gray-600">{metric.revenue_per_email}/email</p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Discount Codes */}
      {discount_codes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Discount Code Performance</CardTitle>
            <CardDescription>Conversions by discount code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {discount_codes.map((code) => (
                <div key={code.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-mono font-semibold">{code.code}</p>
                    <p className="text-sm text-gray-600">{code.conversions} conversions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{code.revenue} total</p>
                    <p className="text-sm text-gray-600">{code.avg_revenue} avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cohort Analysis */}
      {cohorts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cohort Analysis</CardTitle>
            <CardDescription>Calculator users by week and conversion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Week</th>
                    <th className="text-right py-2 px-4">Calculator Users</th>
                    <th className="text-right py-2 px-4">Converted</th>
                    <th className="text-right py-2 px-4">Conversion Rate</th>
                    <th className="text-right py-2 px-4">Avg Days to Convert</th>
                    <th className="text-right py-2 px-4">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.slice(0, 8).map((cohort) => (
                    <tr key={cohort.week} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{cohort.week}</td>
                      <td className="text-right py-3 px-4">{cohort.calculator_users}</td>
                      <td className="text-right py-3 px-4">{cohort.converted}</td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="outline">{cohort.conversion_rate}</Badge>
                      </td>
                      <td className="text-right py-3 px-4 text-gray-600">{cohort.avg_days_to_convert}</td>
                      <td className="text-right py-3 px-4 font-medium">{cohort.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-up Opportunities */}
      {follow_up_opportunities.count > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Follow-up Opportunities</CardTitle>
            <CardDescription className="text-yellow-700">
              {follow_up_opportunities.count} users clicked but didn't convert - potential for personal outreach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {follow_up_opportunities.users.slice(0, 5).map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200">
                  <div>
                    <p className="font-medium">{user.first_name || 'User'} ({user.email})</p>
                    <p className="text-sm text-gray-600">
                      Clicked {user.email_type.replace('reengagement_', 'Day ')} email • {user.days_since_click} days ago
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Send Follow-up
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Comparison</CardTitle>
          <CardDescription>Re-engagement vs. Drip campaign performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Drip Campaign (Welcome Sequence)</h3>
              <div className="space-y-1 text-sm">
                <p>Sent: {comparison.drip_campaign.total_sent.toLocaleString()}</p>
                <p>Avg Open Rate: {comparison.drip_campaign.avg_open_rate}%</p>
                <p>Avg Click Rate: {comparison.drip_campaign.avg_click_rate}%</p>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold mb-2">Re-engagement Campaign (Win-back)</h3>
              <div className="space-y-1 text-sm">
                <p>Sent: {comparison.reengagement_campaign.total_sent.toLocaleString()}</p>
                <p>Avg Open Rate: {comparison.reengagement_campaign.avg_open_rate}%</p>
                <p>Avg Click Rate: {comparison.reengagement_campaign.avg_click_rate}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Optimization Recommendations</CardTitle>
            <CardDescription className="text-blue-700">
              Data-driven suggestions to improve campaign performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-blue-900">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-600">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
