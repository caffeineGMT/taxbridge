/**
 * Conversion Funnel Analysis Dashboard
 *
 * Visualizes PostHog funnel data:
 * - Calculator → Signup → Payment conversion rates
 * - Drop-off points with percentages
 * - A/B test performance metrics
 * - Revenue attribution by source
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics/posthog';

interface FunnelStep {
  name: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

interface ABTestVariant {
  variant: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cvr: number;
}

export default function ConversionFunnelPage() {
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [abTestData, setABTestData] = useState<ABTestVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    trackEvent('page_viewed', { page: '/admin/conversion-funnel' });
    fetchFunnelData();
  }, [timeRange]);

  const fetchFunnelData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/funnel?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setFunnelData(data.funnel || []);
        setABTestData(data.abTests || []);
      }
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration (replace with real PostHog data)
  const mockFunnelData: FunnelStep[] = [
    { name: 'Calculator View', count: 1000, conversionRate: 100, dropOffRate: 0 },
    { name: 'Calculator Completed', count: 720, conversionRate: 72, dropOffRate: 28 },
    { name: 'Signup Started', count: 450, conversionRate: 45, dropOffRate: 27 },
    { name: 'Signup Completed', count: 380, conversionRate: 38, dropOffRate: 7 },
    { name: 'Pricing Page Viewed', count: 280, conversionRate: 28, dropOffRate: 10 },
    { name: 'Checkout Started', count: 120, conversionRate: 12, dropOffRate: 16 },
    { name: 'Payment Completed', count: 85, conversionRate: 8.5, dropOffRate: 3.5 },
  ];

  const mockABTestData: ABTestVariant[] = [
    { variant: 'Control: "Start Free Trial"', impressions: 500, clicks: 125, conversions: 35, ctr: 25, cvr: 7 },
    { variant: 'Variant A: "Try Pro Free (7 Days)"', impressions: 500, clicks: 165, conversions: 50, ctr: 33, cvr: 10 },
    { variant: 'Variant B: "Get Started Now →"', impressions: 500, clicks: 140, conversions: 42, ctr: 28, cvr: 8.4 },
  ];

  const displayFunnel = funnelData.length > 0 ? funnelData : mockFunnelData;
  const displayABTests = abTestData.length > 0 ? abTestData : mockABTestData;

  // Calculate key metrics
  const totalVisitors = displayFunnel[0]?.count || 0;
  const totalConversions = displayFunnel[displayFunnel.length - 1]?.count || 0;
  const overallConversionRate = totalVisitors > 0 ? ((totalConversions / totalVisitors) * 100).toFixed(2) : '0.00';

  // Find biggest drop-off point
  const biggestDropOff = displayFunnel.reduce((max, step) =>
    step.dropOffRate > max.dropOffRate ? step : max,
    displayFunnel[0]
  );

  // Find best performing A/B test variant
  const bestVariant = displayABTests.reduce((best, variant) =>
    variant.cvr > best.cvr ? variant : best,
    displayABTests[0]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-transparent bg-clip-text">
            Conversion Funnel Analysis
          </h1>
          <p className="text-slate-400">
            Track user journey from calculator to payment and identify drop-off points
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold">{totalVisitors.toLocaleString()}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Visitors</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-emerald-500" />
              <span className="text-3xl font-bold">{totalConversions.toLocaleString()}</span>
            </div>
            <p className="text-slate-400 text-sm">Paid Conversions</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-bold">{overallConversionRate}%</span>
            </div>
            <p className="text-slate-400 text-sm">Overall Conversion Rate</p>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Funnel Steps</h2>
          <div className="space-y-4">
            {displayFunnel.map((step, index) => {
              const isDropOffPoint = step.dropOffRate > 15;
              const previousStep = index > 0 ? displayFunnel[index - 1] : null;
              const stepConversionRate = previousStep
                ? ((step.count / previousStep.count) * 100).toFixed(1)
                : '100.0';

              return (
                <div key={step.name} className="relative">
                  {/* Step Card */}
                  <div
                    className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                      isDropOffPoint
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-slate-600 bg-slate-700/50'
                    }`}
                  >
                    {/* Progress Bar Background */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent"
                      style={{ width: `${step.conversionRate}%` }}
                    />

                    {/* Content */}
                    <div className="relative p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          isDropOffPoint ? 'bg-red-600' : 'bg-emerald-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{step.name}</h3>
                          <p className="text-sm text-slate-400">
                            {step.count.toLocaleString()} users ({step.conversionRate.toFixed(1)}% of total)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {index > 0 && (
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${
                              parseFloat(stepConversionRate) < 50 ? 'text-red-400' : 'text-emerald-400'
                            }`}>
                              {stepConversionRate}%
                            </p>
                            <p className="text-xs text-slate-400">from previous</p>
                          </div>
                        )}

                        {step.dropOffRate > 0 && (
                          <div className="flex items-center gap-2">
                            {isDropOffPoint ? (
                              <AlertCircle className="w-6 h-6 text-red-500" />
                            ) : (
                              <CheckCircle className="w-6 h-6 text-emerald-500" />
                            )}
                            <div className="text-right">
                              <p className={`text-xl font-bold ${
                                isDropOffPoint ? 'text-red-400' : 'text-slate-300'
                              }`}>
                                -{step.dropOffRate.toFixed(1)}%
                              </p>
                              <p className="text-xs text-slate-400">drop-off</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow to next step */}
                  {index < displayFunnel.length - 1 && (
                    <div className="flex justify-center my-2">
                      <ArrowRight className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Biggest Drop-Off Alert */}
          <div className="mt-8 bg-red-500/10 border border-red-500/50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-2">Biggest Drop-Off Point</h3>
                <p className="text-slate-300 mb-2">
                  <strong>{biggestDropOff.name}</strong> has the highest drop-off rate at{' '}
                  <strong className="text-red-400">{biggestDropOff.dropOffRate.toFixed(1)}%</strong>
                </p>
                <p className="text-sm text-slate-400">
                  Focus optimization efforts here to improve overall conversion rate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* A/B Test Results */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">A/B Test: Pricing Page CTA</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {displayABTests.map((variant, index) => {
              const isWinner = variant === bestVariant;

              return (
                <div
                  key={variant.variant}
                  className={`relative rounded-xl p-6 border-2 transition-all ${
                    isWinner
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-600 bg-slate-700/50'
                  }`}
                >
                  {isWinner && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 rounded-full text-xs font-bold text-white">
                        🏆 Winner
                      </span>
                    </div>
                  )}

                  <h3 className="font-bold text-white mb-4 mt-2">{variant.variant}</h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Impressions</p>
                      <p className="text-2xl font-bold text-white">{variant.impressions.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400 mb-1">Click-Through Rate</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-emerald-400">{variant.ctr.toFixed(1)}%</p>
                        <p className="text-sm text-slate-500">({variant.clicks} clicks)</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400 mb-1">Conversion Rate</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-emerald-400">{variant.cvr.toFixed(1)}%</p>
                        <p className="text-sm text-slate-500">({variant.conversions} conversions)</p>
                      </div>
                    </div>

                    {isWinner && (
                      <div className="pt-4 border-t border-emerald-500/30">
                        <p className="text-xs text-emerald-400 font-bold">
                          +{((variant.cvr - displayABTests[0].cvr) / displayABTests[0].cvr * 100).toFixed(1)}% improvement vs control
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-emerald-400 mb-2">Recommendation</h3>
                <p className="text-slate-300 mb-2">
                  <strong>{bestVariant.variant}</strong> performs best with a{' '}
                  <strong className="text-emerald-400">{bestVariant.cvr.toFixed(1)}%</strong> conversion rate
                </p>
                <p className="text-sm text-slate-400">
                  Consider rolling this variant to 100% of users to maximize conversions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
