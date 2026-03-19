/**
 * A/B Testing Experiment Dashboard
 *
 * Internal dashboard for monitoring active experiments and conversion rates
 * Access: /dashboard/experiments (admin only)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, MousePointer, CheckCircle, AlertCircle } from 'lucide-react';

interface ExperimentMetrics {
  experimentName: string;
  variants: {
    name: string;
    exposures: number;
    conversions: number;
    conversionRate: number;
    lift?: number;
  }[];
  status: 'running' | 'completed' | 'paused';
  startDate: string;
  targetSampleSize: number;
}

export default function ExperimentDashboard() {
  const [experiments, setExperiments] = useState<ExperimentMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch experiment metrics from PostHog API or internal analytics
    fetchExperimentMetrics();
  }, []);

  const fetchExperimentMetrics = async () => {
    // In production, this would fetch from PostHog API
    // For now, showing mock data structure
    const mockData: ExperimentMetrics[] = [
      {
        experimentName: 'Landing Headline Test',
        variants: [
          { name: 'Control', exposures: 1247, conversions: 89, conversionRate: 7.14, lift: 0 },
          { name: 'Pain-Focused', exposures: 1198, conversions: 103, conversionRate: 8.60, lift: 20.4 },
          { name: 'Outcome-Focused', exposures: 1305, conversions: 117, conversionRate: 8.97, lift: 25.6 },
        ],
        status: 'running',
        startDate: '2026-03-19',
        targetSampleSize: 3000,
      },
      {
        experimentName: 'CTA Button Test',
        variants: [
          { name: 'Control', exposures: 924, conversions: 61, conversionRate: 6.60, lift: 0 },
          { name: 'Urgency', exposures: 887, conversions: 71, conversionRate: 8.00, lift: 21.2 },
          { name: 'Value-Prop', exposures: 941, conversions: 82, conversionRate: 8.71, lift: 32.0 },
          { name: 'Social-Proof', exposures: 898, conversions: 68, conversionRate: 7.57, lift: 14.7 },
        ],
        status: 'running',
        startDate: '2026-03-19',
        targetSampleSize: 4000,
      },
      {
        experimentName: 'Trust Signals Placement',
        variants: [
          { name: 'Control', exposures: 1156, conversions: 79, conversionRate: 6.83, lift: 0 },
          { name: 'Social-Proof-Top', exposures: 1089, conversions: 94, conversionRate: 8.63, lift: 26.4 },
          { name: 'Badges-Inline', exposures: 1204, conversions: 88, conversionRate: 7.31, lift: 7.0 },
        ],
        status: 'running',
        startDate: '2026-03-19',
        targetSampleSize: 3000,
      },
    ];

    setExperiments(mockData);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'running') return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-blue-500" />;
    return <AlertCircle className="w-5 h-5 text-amber-500" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'running') return 'text-emerald-500';
    if (status === 'completed') return 'text-blue-500';
    return 'text-amber-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p>Loading experiments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">A/B Testing Dashboard</h1>
          <p className="text-slate-400">Monitor active landing page experiments and conversion metrics</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Active Experiments</p>
                  <p className="text-2xl font-bold">{experiments.filter(e => e.status === 'running').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Exposures</p>
                  <p className="text-2xl font-bold">
                    {experiments.reduce((sum, exp) => sum + exp.variants.reduce((s, v) => s + v.exposures, 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <MousePointer className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Conversions</p>
                  <p className="text-2xl font-bold">
                    {experiments.reduce((sum, exp) => sum + exp.variants.reduce((s, v) => s + v.conversions, 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Avg Conversion Rate</p>
                  <p className="text-2xl font-bold">
                    {(
                      experiments.reduce((sum, exp) => {
                        const total = exp.variants.reduce((s, v) => s + v.exposures, 0);
                        const conversions = exp.variants.reduce((s, v) => s + v.conversions, 0);
                        return sum + (conversions / total) * 100;
                      }, 0) / experiments.length
                    ).toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Experiment Details */}
        <div className="space-y-6">
          {experiments.map((experiment, idx) => {
            const totalExposures = experiment.variants.reduce((sum, v) => sum + v.exposures, 0);
            const progress = (totalExposures / experiment.targetSampleSize) * 100;
            const winner = experiment.variants.reduce((max, v) => v.conversionRate > max.conversionRate ? v : max);

            return (
              <Card key={idx} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(experiment.status)}
                      <div>
                        <CardTitle className="text-xl">{experiment.experimentName}</CardTitle>
                        <CardDescription className="mt-1">
                          Started {experiment.startDate} • {totalExposures.toLocaleString()} / {experiment.targetSampleSize.toLocaleString()} exposures
                        </CardDescription>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(experiment.status)}`}>
                      {experiment.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Sample Size Progress</span>
                      <span className="text-slate-300 font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Variant Results */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {experiment.variants.map((variant, vIdx) => {
                      const isWinner = variant.name === winner.name;
                      const isControl = variant.name.toLowerCase().includes('control');

                      return (
                        <div
                          key={vIdx}
                          className={`p-4 rounded-lg border-2 ${
                            isWinner
                              ? 'border-emerald-500 bg-emerald-500/5'
                              : isControl
                              ? 'border-slate-600 bg-slate-700/50'
                              : 'border-slate-700 bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-slate-100">{variant.name}</h4>
                            {isWinner && (
                              <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded">
                                Leading
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Exposures</span>
                              <span className="font-medium text-slate-200">{variant.exposures.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Conversions</span>
                              <span className="font-medium text-slate-200">{variant.conversions}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">CVR</span>
                              <span className="font-bold text-slate-100 text-lg">{variant.conversionRate.toFixed(2)}%</span>
                            </div>
                            {variant.lift !== undefined && variant.lift !== 0 && (
                              <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                                <span className="text-slate-400">Lift vs Control</span>
                                <span className={`font-bold ${variant.lift > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {variant.lift > 0 ? '+' : ''}{variant.lift.toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Insights */}
                  {winner.lift && winner.lift > 5 && (
                    <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-sm text-emerald-300">
                        🎯 <strong>{winner.name}</strong> is outperforming control by <strong>{winner.lift.toFixed(1)}%</strong>.
                        {progress >= 80 && ' Sample size nearly complete - consider declaring winner soon.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* PostHog Integration Notice */}
        <Card className="mt-8 bg-blue-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-300">📊 Real-time Data Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm leading-relaxed">
              This dashboard shows mock data. To view real experiment metrics, configure the PostHog API integration
              in <code className="bg-slate-800 px-2 py-1 rounded text-xs">/api/experiments/metrics</code>.
              See <code className="bg-slate-800 px-2 py-1 rounded text-xs">docs/AB_TESTING_LANDING_PAGE.md</code> for setup instructions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
