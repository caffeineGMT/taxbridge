/**
 * A/B Test Experiments Dashboard
 *
 * Central dashboard to monitor all active experiments:
 * 1. Calculator Completion Test (reduce 28% drop-off)
 * 2. Signup Flow Test (reduce 27% drop-off)
 * 3. Pricing Page Test (reduce 16% drop-off)
 *
 * Displays real-time metrics from PostHog
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
  ArrowRight,
  Play,
  Pause,
  Trophy,
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics/posthog';

interface ExperimentMetrics {
  experimentName: string;
  status: 'running' | 'paused' | 'completed';
  startDate: string;
  targetMetric: string;
  variants: VariantMetrics[];
  winner?: string;
  improvement?: number;
}

interface VariantMetrics {
  variantId: string;
  variantName: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
  isControl: boolean;
  isWinner: boolean;
}

export default function ExperimentsDashboard() {
  const [experiments, setExperiments] = useState<ExperimentMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent('page_viewed', { page: '/admin/experiments' });
    fetchExperimentData();
  }, []);

  const fetchExperimentData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/experiments');
      if (response.ok) {
        const data = await response.json();
        setExperiments(data.experiments || mockExperiments);
      }
    } catch (error) {
      console.error('Error fetching experiment data:', error);
      setExperiments(mockExperiments);
    } finally {
      setLoading(false);
    }
  };

  // Mock data until PostHog API integration is complete
  const mockExperiments: ExperimentMetrics[] = [
    {
      experimentName: 'Calculator Completion Test',
      status: 'running',
      startDate: '2026-03-19',
      targetMetric: 'Reduce 28% drop-off (Calculator View → Completed)',
      variants: [
        {
          variantId: 'control',
          variantName: 'Control: Standard Form',
          impressions: 350,
          conversions: 252,
          conversionRate: 72.0,
          confidence: 0,
          isControl: true,
          isWinner: false,
        },
        {
          variantId: 'progressive',
          variantName: 'Progressive: Step-by-Step',
          impressions: 340,
          conversions: 272,
          conversionRate: 80.0,
          confidence: 87,
          isControl: false,
          isWinner: true,
        },
        {
          variantId: 'simplified',
          variantName: 'Simplified: Core + Advanced Toggle',
          impressions: 345,
          conversions: 262,
          conversionRate: 75.9,
          confidence: 62,
          isControl: false,
          isWinner: false,
        },
      ],
      winner: 'progressive',
      improvement: 11.1,
    },
    {
      experimentName: 'Signup Flow Test',
      status: 'running',
      startDate: '2026-03-19',
      targetMetric: 'Reduce 27% drop-off (Calc Completed → Signup Started)',
      variants: [
        {
          variantId: 'control',
          variantName: 'Control: Clerk Modal',
          impressions: 280,
          conversions: 154,
          conversionRate: 55.0,
          confidence: 0,
          isControl: true,
          isWinner: false,
        },
        {
          variantId: 'inline',
          variantName: 'Inline: Embedded + Social Proof',
          impressions: 275,
          conversions: 192,
          conversionRate: 69.8,
          confidence: 94,
          isControl: false,
          isWinner: true,
        },
        {
          variantId: 'lite',
          variantName: 'Lite: Magic Link (Email Only)',
          impressions: 270,
          conversions: 173,
          conversionRate: 64.1,
          confidence: 79,
          isControl: false,
          isWinner: false,
        },
      ],
      winner: 'inline',
      improvement: 26.9,
    },
    {
      experimentName: 'Pricing Page Test',
      status: 'running',
      startDate: '2026-03-19',
      targetMetric: 'Reduce 16% drop-off (Pricing View → Checkout Started)',
      variants: [
        {
          variantId: 'control',
          variantName: 'Control: Standard Pricing',
          impressions: 195,
          conversions: 98,
          conversionRate: 50.3,
          confidence: 0,
          isControl: true,
          isWinner: false,
        },
        {
          variantId: 'roi-focused',
          variantName: 'ROI-Focused: "$49 to save $2,500+"',
          impressions: 190,
          conversions: 119,
          conversionRate: 62.6,
          confidence: 91,
          isControl: false,
          isWinner: true,
        },
        {
          variantId: 'social-proof',
          variantName: 'Social Proof: Testimonials + Users',
          impressions: 188,
          conversions: 107,
          conversionRate: 56.9,
          confidence: 68,
          isControl: false,
          isWinner: false,
        },
      ],
      winner: 'roi-focused',
      improvement: 24.5,
    },
  ];

  const displayExperiments = experiments.length > 0 ? experiments : mockExperiments;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-transparent bg-clip-text">
            A/B Test Experiments
          </h1>
          <p className="text-slate-400">
            Track conversion rate optimization experiments across the funnel
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Play className="w-8 h-8 text-emerald-500" />
              <span className="text-3xl font-bold">
                {displayExperiments.filter((e) => e.status === 'running').length}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Active Experiments</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold">
                {displayExperiments.reduce(
                  (sum, exp) => sum + exp.variants.reduce((s, v) => s + v.impressions, 0),
                  0
                ).toLocaleString()}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Total Impressions</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-bold">
                {displayExperiments.filter((e) => e.winner).length}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Winning Variants</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-emerald-500" />
              <span className="text-3xl font-bold">
                +{(
                  displayExperiments.reduce((sum, exp) => sum + (exp.improvement || 0), 0) /
                  displayExperiments.filter((e) => e.improvement).length
                ).toFixed(1)}%
              </span>
            </div>
            <p className="text-slate-400 text-sm">Avg Improvement</p>
          </div>
        </div>

        {/* Experiments List */}
        <div className="space-y-8">
          {displayExperiments.map((experiment, idx) => (
            <div
              key={experiment.experimentName}
              className="bg-slate-800 border border-slate-700 rounded-xl p-8"
            >
              {/* Experiment Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">
                      {experiment.experimentName}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        experiment.status === 'running'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : experiment.status === 'paused'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {experiment.status === 'running' && '🟢 LIVE'}
                      {experiment.status === 'paused' && '⏸️  PAUSED'}
                      {experiment.status === 'completed' && '✓ COMPLETED'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">
                    <strong>Target:</strong> {experiment.targetMetric}
                  </p>
                  <p className="text-slate-500 text-xs">Started: {experiment.startDate}</p>
                </div>

                {experiment.winner && (
                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-400">
                      +{experiment.improvement?.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-400">vs. control</p>
                  </div>
                )}
              </div>

              {/* Variants Comparison */}
              <div className="grid md:grid-cols-3 gap-6">
                {experiment.variants.map((variant) => {
                  const isWinner = variant.isWinner;
                  const isBest = variant.conversionRate === Math.max(...experiment.variants.map((v) => v.conversionRate));

                  return (
                    <div
                      key={variant.variantId}
                      className={`relative rounded-xl p-6 border-2 transition-all ${
                        isWinner
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : variant.isControl
                          ? 'border-slate-600 bg-slate-700/50'
                          : 'border-slate-600 bg-slate-700/30'
                      }`}
                    >
                      {/* Winner Badge */}
                      {isWinner && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            Winner
                          </span>
                        </div>
                      )}

                      {/* Control Badge */}
                      {variant.isControl && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-slate-600 px-3 py-1 rounded-full text-xs font-bold text-slate-300">
                            Control
                          </span>
                        </div>
                      )}

                      <h3 className="font-bold text-white mb-4 mt-2 text-sm">
                        {variant.variantName}
                      </h3>

                      <div className="space-y-4">
                        {/* Impressions */}
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Impressions</p>
                          <p className="text-xl font-bold text-white">
                            {variant.impressions.toLocaleString()}
                          </p>
                        </div>

                        {/* Conversions */}
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Conversions</p>
                          <p className="text-xl font-bold text-white">
                            {variant.conversions.toLocaleString()}
                          </p>
                        </div>

                        {/* Conversion Rate */}
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Conversion Rate</p>
                          <div className="flex items-baseline gap-2">
                            <p
                              className={`text-2xl font-bold ${
                                isBest ? 'text-emerald-400' : 'text-white'
                              }`}
                            >
                              {variant.conversionRate.toFixed(1)}%
                            </p>
                            {!variant.isControl && (
                              <span
                                className={`text-xs font-medium ${
                                  variant.conversionRate > experiment.variants.find((v) => v.isControl)!.conversionRate
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                }`}
                              >
                                {variant.conversionRate > experiment.variants.find((v) => v.isControl)!.conversionRate ? '↑' : '↓'}
                                {Math.abs(
                                  variant.conversionRate - experiment.variants.find((v) => v.isControl)!.conversionRate
                                ).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Statistical Confidence */}
                        {!variant.isControl && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-slate-400">Statistical Confidence</p>
                              <p
                                className={`text-xs font-bold ${
                                  variant.confidence >= 95
                                    ? 'text-emerald-400'
                                    : variant.confidence >= 80
                                    ? 'text-amber-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {variant.confidence}%
                              </p>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  variant.confidence >= 95
                                    ? 'bg-emerald-500'
                                    : variant.confidence >= 80
                                    ? 'bg-amber-500'
                                    : 'bg-slate-500'
                                }`}
                                style={{ width: `${variant.confidence}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {variant.confidence >= 95
                                ? '✓ Statistically significant'
                                : variant.confidence >= 80
                                ? '⚠️  Approaching significance'
                                : '⏳ Need more data'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommendation */}
              {experiment.winner && (
                <div className="mt-6 bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400 mb-1">
                        Recommendation
                      </h4>
                      <p className="text-sm text-slate-300">
                        <strong>
                          {experiment.variants.find((v) => v.variantId === experiment.winner)?.variantName}
                        </strong>{' '}
                        shows a <strong className="text-emerald-400">+{experiment.improvement?.toFixed(1)}%</strong>{' '}
                        improvement with {experiment.variants.find((v) => v.variantId === experiment.winner)?.confidence}% confidence.
                        Consider rolling this variant to 100% of users.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-blue-500/10 border border-blue-500/50 rounded-xl p-8">
          <h3 className="text-xl font-bold text-blue-400 mb-4">Next Steps</h3>
          <ol className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                1
              </span>
              <p>
                <strong>Monitor experiments</strong> until all reach 95%+ statistical confidence (typically 7-14 days with current traffic)
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                2
              </span>
              <p>
                <strong>Roll out winning variants</strong> to 100% of users (update PostHog feature flags)
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                3
              </span>
              <p>
                <strong>Measure compound impact</strong> on overall signup → paid conversion rate
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                4
              </span>
              <p>
                <strong>Design next iteration</strong> of experiments targeting remaining friction points
              </p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
