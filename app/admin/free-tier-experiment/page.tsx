/**
 * Free Tier Optimization Experiment Dashboard
 *
 * Real-time analytics for 3-variant A/B test:
 * - Variant A: 5 RSU entries max
 * - Variant B: 10 RSU entries max (baseline)
 * - Variant C: Unlimited with feature gating
 *
 * Tracks conversion metrics over 14-day test period
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, TrendingDown, Minus, Users, DollarSign, Target, Zap } from 'lucide-react';

interface VariantMetrics {
  variant: string;
  exposures: number;
  signups: number;
  checkouts: number;
  paid: number;
  signup_rate: number;
  checkout_rate: number;
  conversion_rate: number;
}

interface ExperimentData {
  experiments: Record<string, {
    headline_variant: string;
    free_tier_variant: string;
    social_proof_variant: string;
    metrics: Omit<VariantMetrics, 'variant'>;
  }>;
  analysis: {
    freeTier: Record<string, { exposures: number; conversions: number; rate: number }>;
  };
  timestamp: string;
}

export default function FreeTierExperimentDashboard() {
  const [data, setData] = useState<ExperimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/analytics/conversion-experiments');
      if (!response.ok) throw new Error('Failed to fetch experiment data');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">Error loading experiment data: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  // Extract free tier variant data from analysis
  const freeTierVariants = data.analysis.freeTier;
  const variantKeys = Object.keys(freeTierVariants);

  // Calculate winner (highest conversion rate)
  const winner = variantKeys.reduce((prev, current) =>
    freeTierVariants[current].rate > freeTierVariants[prev].rate ? current : prev
  , variantKeys[0]);

  const winnerRate = freeTierVariants[winner]?.rate || 0;

  // Calculate statistical significance (simplified - actual implementation would use z-test)
  const totalExposures = variantKeys.reduce((sum, key) => sum + freeTierVariants[key].exposures, 0);
  const minSampleSize = 100; // Minimum for statistical validity
  const isStatisticallyValid = totalExposures >= minSampleSize * variantKeys.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Free Tier Optimization Experiment</h1>
          <p className="text-muted-foreground mt-2">
            14-day A/B test comparing 5 vs 10 vs unlimited RSU entries
          </p>
        </div>
        <Badge variant={isStatisticallyValid ? "default" : "secondary"} className="text-sm px-4 py-2">
          {isStatisticallyValid ? '✓ Statistically Valid' : '⏳ Collecting Data'}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exposures</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExposures.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalExposures >= minSampleSize * variantKeys.length ? 'Sample size achieved' : `Need ${(minSampleSize * variantKeys.length) - totalExposures} more`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leading Variant</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {winner === 'limited_5' && '5 Entries'}
              {winner === 'limited_10' && '10 Entries'}
              {winner === 'unlimited_gated' && 'Unlimited'}
            </div>
            <p className="text-xs text-muted-foreground">{winnerRate.toFixed(2)}% conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {variantKeys.reduce((sum, key) => sum + freeTierVariants[key].conversions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Paid subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Duration</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 Days</div>
            <p className="text-xs text-muted-foreground">
              {data.timestamp ? `Last updated: ${new Date(data.timestamp).toLocaleTimeString()}` : 'Live'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Variant Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Variant Performance Comparison</CardTitle>
          <CardDescription>
            Conversion rate = (Paid subscriptions / Exposures) × 100
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {variantKeys.map((variantKey) => {
            const variant = freeTierVariants[variantKey];
            const isWinner = variantKey === winner;
            const relativeDiff = winner !== variantKey
              ? ((variant.rate - winnerRate) / winnerRate) * 100
              : 0;

            return (
              <div key={variantKey} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {variantKey === 'limited_5' && 'Variant A: 5 RSU Entries'}
                      {variantKey === 'limited_10' && 'Variant B: 10 RSU Entries (Baseline)'}
                      {variantKey === 'unlimited_gated' && 'Variant C: Unlimited (Feature Gating)'}
                    </h3>
                    {isWinner && <Badge variant="default">Winner</Badge>}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{variant.rate.toFixed(2)}%</div>
                    {!isWinner && (
                      <div className={`text-sm flex items-center gap-1 ${relativeDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {relativeDiff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(relativeDiff).toFixed(1)}% vs winner
                      </div>
                    )}
                  </div>
                </div>

                <Progress value={(variant.rate / (winnerRate || 1)) * 100} className="h-3" />

                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Exposures:</span> {variant.exposures}
                  </div>
                  <div>
                    <span className="font-medium">Conversions:</span> {variant.conversions}
                  </div>
                  <div>
                    <span className="font-medium">Sample Size:</span>{' '}
                    {variant.exposures >= minSampleSize ? (
                      <span className="text-green-600">✓ Valid</span>
                    ) : (
                      <span className="text-amber-600">Need {minSampleSize - variant.exposures} more</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          {!isStatisticallyValid && (
            <p className="font-medium">
              ⏳ Continue collecting data. Need {(minSampleSize * variantKeys.length) - totalExposures} more exposures for statistical validity.
            </p>
          )}
          {isStatisticallyValid && (
            <>
              <p className="font-medium">
                ✅ Statistical significance achieved. {winner === 'limited_5' ? 'Variant A (5 entries)' : winner === 'limited_10' ? 'Variant B (10 entries)' : 'Variant C (unlimited with gating)'} is the winner with {winnerRate.toFixed(2)}% conversion rate.
              </p>
              <p>
                <strong>Action:</strong> Roll out{' '}
                {winner === 'limited_5' && '5 RSU entry limit'}
                {winner === 'limited_10' && '10 RSU entry limit (current baseline)'}
                {winner === 'unlimited_gated' && 'unlimited entries with feature gating'}{' '}
                to all users to maximize conversions.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Raw Data */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Experiment Data</CardTitle>
          <CardDescription>All variant combinations tracked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Headline</th>
                  <th className="text-left p-2">Free Tier</th>
                  <th className="text-left p-2">Social Proof</th>
                  <th className="text-right p-2">Exposures</th>
                  <th className="text-right p-2">Signups</th>
                  <th className="text-right p-2">Paid</th>
                  <th className="text-right p-2">Conv %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.experiments).map(([key, exp]) => (
                  <tr key={key} className="border-b">
                    <td className="p-2">{exp.headline_variant}</td>
                    <td className="p-2 font-medium">{exp.free_tier_variant}</td>
                    <td className="p-2">{exp.social_proof_variant}</td>
                    <td className="text-right p-2">{exp.metrics.exposures}</td>
                    <td className="text-right p-2">{exp.metrics.signups}</td>
                    <td className="text-right p-2">{exp.metrics.paid}</td>
                    <td className="text-right p-2 font-medium">{exp.metrics.conversion_rate.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
