'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ABTestResult {
  event_type: string;
  variant: 'A' | 'B';
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_converted: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  total_revenue: number;
}

interface WinnerAnalysis {
  event_type: string;
  winner: 'A' | 'B' | 'TIE';
  confidence: number;
  is_significant: boolean;
  lift: number;
}

export default function EmailABTestAnalytics() {
  const [results, setResults] = useState<ABTestResult[]>([]);
  const [winners, setWinners] = useState<WinnerAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/email-ab-tests');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setResults(data.results || []);
      setWinners(data.winners || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Email A/B Test Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group results by event type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.event_type]) {
      acc[result.event_type] = { A: null, B: null };
    }
    acc[result.event_type][result.variant] = result;
    return acc;
  }, {} as Record<string, { A: ABTestResult | null; B: ABTestResult | null }>);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Email A/B Test Analytics</h1>
        <p className="text-muted-foreground">
          Track performance of personalized savings, social proof, and urgency optimizations
        </p>
      </div>

      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Campaign Performance</CardTitle>
          <CardDescription>Aggregate metrics across all A/B tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold">
                {results.reduce((sum, r) => sum + r.total_sent, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Emails Sent</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {(results.reduce((sum, r) => sum + r.open_rate, 0) / results.length || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Open Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {(results.reduce((sum, r) => sum + r.click_rate, 0) / results.length || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Click Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {(results.reduce((sum, r) => sum + r.conversion_rate, 0) / results.length || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Conversion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day 1: Personalized Savings Test */}
      {groupedResults['drip_day1'] && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Day 1: Personalized Savings Estimate</CardTitle>
                <CardDescription>
                  Testing personalized tax savings calculations in welcome email
                </CardDescription>
              </div>
              {winners.find(w => w.event_type === 'drip_day1') && (
                <WinnerBadge winner={winners.find(w => w.event_type === 'drip_day1')!} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ABTestComparison
              variantA={groupedResults['drip_day1'].A}
              variantB={groupedResults['drip_day1'].B}
              variantALabel="Control: Standard Welcome"
              variantBLabel="Test: Personalized Savings Estimate"
            />
          </CardContent>
        </Card>
      )}

      {/* Day 3: Enhanced Social Proof Test */}
      {groupedResults['drip_day3'] && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Day 3: Enhanced Social Proof</CardTitle>
                <CardDescription>
                  Testing multiple testimonials vs single case study
                </CardDescription>
              </div>
              {winners.find(w => w.event_type === 'drip_day3') && (
                <WinnerBadge winner={winners.find(w => w.event_type === 'drip_day3')!} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ABTestComparison
              variantA={groupedResults['drip_day3'].A}
              variantB={groupedResults['drip_day3'].B}
              variantALabel="Control: Single Testimonial"
              variantBLabel="Test: Multiple Testimonials + Stats"
            />
          </CardContent>
        </Card>
      )}

      {/* Day 7: Tax Deadline Urgency Test */}
      {groupedResults['drip_day7'] && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Day 7: Tax Deadline Urgency</CardTitle>
                <CardDescription>
                  Testing discount urgency + tax deadline messaging
                </CardDescription>
              </div>
              {winners.find(w => w.event_type === 'drip_day7') && (
                <WinnerBadge winner={winners.find(w => w.event_type === 'drip_day7')!} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ABTestComparison
              variantA={groupedResults['drip_day7'].A}
              variantB={groupedResults['drip_day7'].B}
              variantALabel="Control: Discount Urgency Only"
              variantBLabel="Test: Discount + Tax Deadline Urgency"
            />
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {results.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Data Yet</CardTitle>
            <CardDescription>
              Start the optimized email campaign to see A/B test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Run the optimized cron job at{' '}
              <code className="bg-muted px-2 py-1 rounded">/api/cron/email-drip-optimized</code>{' '}
              to begin collecting data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ABTestComparison({
  variantA,
  variantB,
  variantALabel,
  variantBLabel,
}: {
  variantA: ABTestResult | null;
  variantB: ABTestResult | null;
  variantALabel: string;
  variantBLabel: string;
}) {
  if (!variantA && !variantB) {
    return <p className="text-muted-foreground">No data available yet</p>;
  }

  const calculateLift = (metricA: number, metricB: number): number => {
    if (metricA === 0) return 0;
    return ((metricB - metricA) / metricA) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Variant A */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Badge variant="outline">Variant A</Badge>
            {variantALabel}
          </h3>
          {variantA ? (
            <div className="space-y-3">
              <MetricRow label="Sent" value={variantA.total_sent.toLocaleString()} />
              <MetricRow label="Opened" value={`${variantA.total_opened} (${variantA.open_rate.toFixed(1)}%)`} />
              <MetricRow label="Clicked" value={`${variantA.total_clicked} (${variantA.click_rate.toFixed(1)}%)`} />
              <MetricRow
                label="Converted"
                value={`${variantA.total_converted} (${variantA.conversion_rate.toFixed(1)}%)`}
                highlight
              />
              <MetricRow label="Revenue" value={`$${variantA.total_revenue.toFixed(2)}`} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data</p>
          )}
        </div>

        {/* Variant B */}
        <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Badge variant="default">Variant B</Badge>
            {variantBLabel}
          </h3>
          {variantB ? (
            <div className="space-y-3">
              <MetricRow label="Sent" value={variantB.total_sent.toLocaleString()} />
              <MetricRow
                label="Opened"
                value={`${variantB.total_opened} (${variantB.open_rate.toFixed(1)}%)`}
                lift={variantA ? calculateLift(variantA.open_rate, variantB.open_rate) : 0}
              />
              <MetricRow
                label="Clicked"
                value={`${variantB.total_clicked} (${variantB.click_rate.toFixed(1)}%)`}
                lift={variantA ? calculateLift(variantA.click_rate, variantB.click_rate) : 0}
              />
              <MetricRow
                label="Converted"
                value={`${variantB.total_converted} (${variantB.conversion_rate.toFixed(1)}%)`}
                highlight
                lift={variantA ? calculateLift(variantA.conversion_rate, variantB.conversion_rate) : 0}
              />
              <MetricRow
                label="Revenue"
                value={`$${variantB.total_revenue.toFixed(2)}`}
                lift={variantA ? calculateLift(variantA.total_revenue, variantB.total_revenue) : 0}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  lift,
  highlight,
}: {
  label: string;
  value: string;
  lift?: number;
  highlight?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center ${highlight ? 'font-semibold' : ''}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span>{value}</span>
        {lift !== undefined && lift !== 0 && (
          <Badge variant={lift > 0 ? 'default' : 'destructive'} className="text-xs">
            {lift > 0 ? '+' : ''}
            {lift.toFixed(1)}%
          </Badge>
        )}
      </div>
    </div>
  );
}

function WinnerBadge({ winner }: { winner: WinnerAnalysis }) {
  if (winner.winner === 'TIE' || !winner.is_significant) {
    return (
      <Badge variant="outline" className="text-sm">
        No Clear Winner Yet
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="text-sm bg-green-600">
      ✓ Variant {winner.winner} Wins ({winner.confidence.toFixed(0)}% confidence, +{winner.lift.toFixed(1)}% lift)
    </Badge>
  );
}
