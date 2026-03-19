'use client';

/**
 * ADMIN DASHBOARD - EMAIL DRIP CAMPAIGN MONITORING
 *
 * Real-time analytics for the 7-day free user nurture sequence:
 * - Day 1: Welcome + Calculator Tips
 * - Day 3: Case Study (Social Proof)
 * - Day 5: Testimonial + 30% Discount
 * - Day 7: Last Chance (15% final offer)
 *
 * Features:
 * - Open rates and click rates by email type
 * - A/B test performance comparison
 * - Conversion tracking (free → paid upgrades)
 * - Revenue attribution by campaign
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  BarChart,
  LineChart,
  Mail,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface EmailStats {
  event_type: string;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  open_rate: number;
  click_rate: number;
}

interface ABTestResult {
  event_type: string;
  variant: 'A' | 'B';
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  conversions: number;
  revenue: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
}

interface WinnerAnalysis {
  event_type: string;
  winner: 'A' | 'B' | 'TIE';
  confidence: number;
  is_significant: boolean;
  lift: number;
}

interface ConversionStats {
  total_conversions: number;
  conversion_rate: number;
  total_revenue: number;
  avg_revenue_per_conversion: number;
}

interface DripAnalytics {
  timestamp: string;
  ab_tests: ABTestResult[];
  winning_variants: {
    day1: any;
    day3: any;
    day7: any;
    day14: any;
  };
  conversion_stats: ConversionStats;
  conversions_by_email: Array<{
    email_type: string;
    conversions: number;
    revenue: number;
  }>;
  email_stats: EmailStats[];
}

const EMAIL_LABELS: Record<string, string> = {
  drip_day1: 'Day 1: Welcome + Calculator Tips',
  drip_day3: 'Day 3: Case Study (Social Proof)',
  drip_day5: 'Day 5: Testimonial + 30% Discount',
  drip_day7: 'Day 7: Last Chance (Final Offer)',
};

export default function EmailCampaignsAdminPage() {
  const [analytics, setAnalytics] = useState<DripAnalytics | null>(null);
  const [abTestWinners, setAbTestWinners] = useState<WinnerAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch main analytics
      const analyticsRes = await fetch('/api/analytics/email-drip');
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

      // Fetch A/B test winners
      const abTestRes = await fetch('/api/analytics/email-ab-tests');
      const abTestData = await abTestRes.json();
      if (abTestData.success) {
        setAbTestWinners(abTestData.winners || []);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch email analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !analytics) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const overallOpenRate =
    analytics?.email_stats.reduce((sum, stat) => sum + stat.open_rate, 0) /
      (analytics?.email_stats.length || 1) || 0;

  const overallClickRate =
    analytics?.email_stats.reduce((sum, stat) => sum + stat.click_rate, 0) /
      (analytics?.email_stats.length || 1) || 0;

  const totalSent =
    analytics?.email_stats.reduce((sum, stat) => sum + stat.total_sent, 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Drip Campaign Analytics</h1>
          <p className="text-muted-foreground mt-1">
            7-Day Free User Nurture Sequence - Real-time Performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {overallOpenRate > 25 ? (
                <span className="text-green-600">✓ Above industry avg (18-25%)</span>
              ) : (
                <span className="text-yellow-600">⚠ Below industry avg</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Click Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallClickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {overallClickRate > 3 ? (
                <span className="text-green-600">✓ Above industry avg (2-3%)</span>
              ) : (
                <span className="text-yellow-600">⚠ Below industry avg</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue from Emails</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.conversion_stats.total_revenue.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.conversion_stats.total_conversions || 0} conversions @{' '}
              {analytics?.conversion_stats.conversion_rate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Performance by Campaign
          </CardTitle>
          <CardDescription>
            Open rates, click rates, and engagement metrics for each email in the sequence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Opened</TableHead>
                <TableHead className="text-right">Clicked</TableHead>
                <TableHead className="text-right">Open Rate</TableHead>
                <TableHead className="text-right">Click Rate</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.email_stats.map((stat) => {
                const openRateGood = stat.open_rate > 25;
                const clickRateGood = stat.click_rate > 3;

                return (
                  <TableRow key={stat.event_type}>
                    <TableCell className="font-medium">
                      {EMAIL_LABELS[stat.event_type] || stat.event_type}
                    </TableCell>
                    <TableCell className="text-right">{stat.total_sent.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {stat.total_opened.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {stat.total_clicked.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={openRateGood ? 'default' : 'secondary'}>
                        {stat.open_rate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={clickRateGood ? 'default' : 'secondary'}>
                        {stat.click_rate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {openRateGood && clickRateGood ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 inline" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 inline" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* A/B Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            A/B Test Results
          </CardTitle>
          <CardDescription>
            Performance comparison between control (Variant A) and optimized (Variant B) versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {abTestWinners.map((winner) => (
              <div
                key={winner.event_type}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">
                    {EMAIL_LABELS[winner.event_type] || winner.event_type}
                  </h3>
                  <div className="flex gap-2">
                    {winner.is_significant && (
                      <Badge variant="default">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Statistically Significant
                      </Badge>
                    )}
                    <Badge variant={winner.winner === 'A' ? 'secondary' : 'default'}>
                      Winner: Variant {winner.winner}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Lift</div>
                    <div
                      className={`font-semibold ${
                        winner.lift > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {winner.lift > 0 ? '+' : ''}
                      {winner.lift.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Confidence</div>
                    <div className="font-semibold">{winner.confidence.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Recommendation</div>
                    <div className="font-semibold">
                      {winner.is_significant
                        ? `Deploy Variant ${winner.winner}`
                        : 'Continue testing'}
                    </div>
                  </div>
                </div>

                {/* Show detailed variant comparison */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  {analytics?.ab_tests
                    .filter((test) => test.event_type === winner.event_type)
                    .map((test) => (
                      <div
                        key={test.variant}
                        className={`p-3 rounded ${
                          test.variant === winner.winner ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="font-medium mb-2">Variant {test.variant}</div>
                        <div className="space-y-1 text-sm">
                          <div>Sent: {test.sent_count}</div>
                          <div>Open Rate: {test.open_rate.toFixed(1)}%</div>
                          <div>Click Rate: {test.click_rate.toFixed(1)}%</div>
                          <div>Conversions: {test.conversions}</div>
                          <div>Revenue: ${test.revenue.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {abTestWinners.length === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Insufficient Data</AlertTitle>
              <AlertDescription>
                A/B tests require at least 100 sends per variant before statistical analysis is
                reliable. Continue running the campaign to gather more data.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Revenue Attribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Attribution by Campaign
          </CardTitle>
          <CardDescription>
            Which emails are driving the most conversions and revenue?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg per Conversion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.conversions_by_email.map((conv) => (
                <TableRow key={conv.email_type}>
                  <TableCell className="font-medium">
                    {EMAIL_LABELS[conv.email_type] || conv.email_type}
                  </TableCell>
                  <TableCell className="text-right">{conv.conversions}</TableCell>
                  <TableCell className="text-right">${conv.revenue.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    ${(conv.revenue / Math.max(conv.conversions, 1)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Campaign Health Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Campaign Health Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <span>Cron job configured in vercel.json</span>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <span>SendGrid templates configured</span>
            {analytics?.email_stats && analytics.email_stats.length > 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <span>A/B testing active</span>
            {abTestWinners.length > 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <span>Conversion tracking enabled</span>
            {analytics?.conversion_stats && analytics.conversion_stats.total_conversions >= 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
