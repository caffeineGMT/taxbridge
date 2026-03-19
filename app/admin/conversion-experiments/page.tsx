/**
 * Conversion Optimization Experiments Dashboard
 *
 * Real-time A/B test results for 3 simultaneous experiments:
 * 1. Pricing headline test (control vs ROI-focused vs pain-point)
 * 2. Free tier limit test (5 calcs vs unlimited)
 * 3. Social proof placement test (above fold vs below pricing vs sidebar)
 *
 * Target: 20%+ lift in free→paid conversion
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  Trophy,
  Zap,
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics/posthog';

interface VariantMetrics {
  exposures: number;
  conversions: number;
  rate: number;
}

interface ExperimentAnalysis {
  headline: Record<string, VariantMetrics>;
  freeTier: Record<string, VariantMetrics>;
  socialProof: Record<string, VariantMetrics>;
}

export default function ConversionExperimentsDashboard() {
  const [experiments, setExperiments] = useState<any>(null);
  const [analysis, setAnalysis] = useState<ExperimentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    trackEvent('page_viewed', { page: '/admin/conversion-experiments' });
    fetchExperimentData();
  }, [refreshKey]);

  const fetchExperimentData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/conversion-experiments');
      if (response.ok) {
        const data = await response.json();
        setExperiments(data.experiments);
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Error fetching experiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWinner = (variants: Record<string, VariantMetrics>) => {
    let bestVariant = '';
    let bestRate = 0;

    Object.entries(variants).forEach(([variant, metrics]) => {
      if (metrics.rate > bestRate && metrics.exposures > 20) {
        bestRate = metrics.rate;
        bestVariant = variant;
      }
    });

    return { variant: bestVariant, rate: bestRate };
  };

  const calculateLift = (variants: Record<string, VariantMetrics>, controlKey: string) => {
    const control = variants[controlKey];
    if (!control || control.rate === 0) return 0;

    const winner = getWinner(variants);
    if (winner.variant === controlKey) return 0;

    const winnerVariant = variants[winner.variant];
    return ((winnerVariant.rate - control.rate) / control.rate) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading experiment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-transparent bg-clip-text">
              Conversion Optimization Experiments
            </h1>
            <p className="text-slate-400">
              3 simultaneous A/B tests targeting 20%+ lift in free→paid conversion
            </p>
          </div>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Summary Stats */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Experiment 1: Headline */}
            <ExperimentCard
              title="Pricing Headline Test"
              description="Control vs ROI-focused vs Pain-point"
              variants={analysis.headline}
              controlKey="control"
              variantLabels={{
                control: 'Control: "Simple, Transparent Pricing"',
                roi_focused: 'ROI-Focused: "Pay $49 to Save $2,500+"',
                pain_point: 'Pain-Point: "Stop Overpaying Taxes"',
              }}
            />

            {/* Experiment 2: Free Tier */}
            <ExperimentCard
              title="Free Tier Limit Test"
              description="5 calculations vs Unlimited"
              variants={analysis.freeTier}
              controlKey="unlimited"
              variantLabels={{
                limited_5: 'Limited: 5 calculations/year',
                unlimited: 'Unlimited: Unlimited calculations',
              }}
            />

            {/* Experiment 3: Social Proof */}
            <ExperimentCard
              title="Social Proof Placement"
              description="Above fold vs Below pricing vs Sidebar"
              variants={analysis.socialProof}
              controlKey="above_fold"
              variantLabels={{
                above_fold: 'Above Fold: Hero section',
                below_pricing: 'Below Pricing: After pricing cards',
                sidebar: 'Sidebar: Sticky sidebar',
              }}
            />
          </div>
        )}

        {/* Combined Results */}
        {experiments && Object.keys(experiments).length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Combined Variant Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Variant Combination</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Exposures</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Signups</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Checkouts</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Paid</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(experiments)
                    .sort((a: any, b: any) => b[1].metrics.conversion_rate - a[1].metrics.conversion_rate)
                    .map(([key, data]: [string, any]) => {
                      const isTopPerformer = data.metrics.conversion_rate > 0 && data.metrics.exposures > 10;
                      return (
                        <tr key={key} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="text-white font-medium text-xs">
                              {data.headline_variant} / {data.free_tier_variant} / {data.social_proof_variant}
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 text-slate-300">{data.metrics.exposures}</td>
                          <td className="text-right py-3 px-4 text-slate-300">{data.metrics.signups}</td>
                          <td className="text-right py-3 px-4 text-slate-300">{data.metrics.checkouts}</td>
                          <td className="text-right py-3 px-4 text-slate-300">{data.metrics.paid}</td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-bold ${isTopPerformer ? 'text-emerald-400' : 'text-slate-300'}`}>
                              {data.metrics.conversion_rate.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data State */}
        {(!experiments || Object.keys(experiments).length === 0) && (
          <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-12 text-center">
            <Zap className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Experiments Are Live!</h3>
            <p className="text-slate-300 max-w-2xl mx-auto">
              The conversion optimization experiments are now running on the pricing page. Data will appear here as
              users interact with the different variants. Check back in 24-48 hours for initial results.
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-8">
          <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Target Goal: 20%+ Lift in Conversion Rate
          </h3>
          <ol className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                1
              </span>
              <p>
                <strong>Monitor experiments</strong> for 7-14 days until statistical significance is reached (typically 200-500 exposures per variant)
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                2
              </span>
              <p>
                <strong>Identify winning variants</strong> for each experiment (headline, free tier, social proof)
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                3
              </span>
              <p>
                <strong>Roll out winners</strong> to 100% of users by updating the experiment hooks
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                4
              </span>
              <p>
                <strong>Measure combined impact</strong> on overall free→paid conversion rate and revenue
              </p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function ExperimentCard({
  title,
  description,
  variants,
  controlKey,
  variantLabels,
}: {
  title: string;
  description: string;
  variants: Record<string, VariantMetrics>;
  controlKey: string;
  variantLabels: Record<string, string>;
}) {
  const winner = Object.entries(variants).reduce(
    (best, [variant, metrics]) => {
      if (metrics.exposures > 20 && metrics.rate > best.rate) {
        return { variant, rate: metrics.rate };
      }
      return best;
    },
    { variant: controlKey, rate: variants[controlKey]?.rate || 0 }
  );

  const controlRate = variants[controlKey]?.rate || 0;
  const winnerRate = variants[winner.variant]?.rate || 0;
  const lift = controlRate > 0 ? ((winnerRate - controlRate) / controlRate) * 100 : 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6">{description}</p>

      <div className="space-y-4">
        {Object.entries(variants)
          .sort((a, b) => b[1].rate - a[1].rate)
          .map(([variant, metrics]) => {
            const isWinner = variant === winner.variant && variant !== controlKey;
            const isControl = variant === controlKey;

            return (
              <div key={variant} className="relative">
                {isWinner && (
                  <div className="absolute -top-2 -right-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                  </div>
                )}

                <div className={`p-4 rounded-lg ${isWinner ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-slate-700/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${isControl ? 'text-slate-400' : 'text-white'}`}>
                      {variantLabels[variant] || variant}
                    </span>
                    {isControl && (
                      <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded">Control</span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className={`text-2xl font-bold ${isWinner ? 'text-emerald-400' : 'text-white'}`}>
                      {metrics.rate.toFixed(2)}%
                    </span>
                    {!isControl && (
                      <span className={`text-sm font-medium ${metrics.rate > controlRate ? 'text-emerald-400' : 'text-red-400'}`}>
                        {metrics.rate > controlRate ? '↑' : '↓'}
                        {Math.abs(metrics.rate - controlRate).toFixed(2)}%
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 mt-2">
                    {metrics.conversions} / {metrics.exposures} conversions
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {lift > 0 && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>+{lift.toFixed(1)}% lift vs control</span>
          </div>
        </div>
      )}
    </div>
  );
}
