/**
 * Pricing Analytics Dashboard
 *
 * Displays A/B test results for pricing experiment
 * Shows conversion rates, revenue impact, and recommendations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, BarChart3, RefreshCcw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PricingMetrics {
  overview: {
    total_conversions: number;
    total_revenue: number;
    avg_customer_value: number;
  };
  variants: {
    annual_49: {
      conversions: number;
      revenue: number;
      avg_revenue: number;
      percentage: string;
    };
    annual_79: {
      conversions: number;
      revenue: number;
      avg_revenue: number;
      percentage: string;
    };
    monthly_19: {
      conversions: number;
      revenue: number;
      avg_revenue: number;
      percentage: string;
    };
  };
  cohorts: {
    product_hunt: {
      total: number;
      annual_49: number;
      annual_79: number;
      monthly_19: number;
    };
    organic: {
      total: number;
      annual_49: number;
      annual_79: number;
      monthly_19: number;
    };
  };
  price_sensitivity: {
    annual_preference: number;
    monthly_preference: number;
    annual_percentage: string;
    within_annual_preference: {
      prefer_49: number;
      prefer_79: number;
      ratio_49: string;
    };
  };
  recommendations: string[];
}

export default function PricingAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<PricingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<'all' | 'product_hunt' | 'organic'>('all');

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/pricing-experiment?cohort=${selectedCohort}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch metrics');
      }

      setMetrics(data.data);
    } catch (err) {
      console.error('Error fetching pricing metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [selectedCohort]);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCcw className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="container mx-auto p-8">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Error Loading Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error || 'Failed to load metrics'}</p>
            <Button onClick={fetchMetrics}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Pricing Experiment Analytics</h1>
        <p className="text-slate-600">
          A/B test results: $49 vs $79 annual pricing + $19 monthly option
        </p>
      </div>

      {/* Cohort Filter */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedCohort === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCohort('all')}
          size="sm"
        >
          All Users
        </Button>
        <Button
          variant={selectedCohort === 'product_hunt' ? 'default' : 'outline'}
          onClick={() => setSelectedCohort('product_hunt')}
          size="sm"
        >
          Product Hunt
        </Button>
        <Button
          variant={selectedCohort === 'organic' ? 'default' : 'outline'}
          onClick={() => setSelectedCohort('organic')}
          size="sm"
        >
          Organic
        </Button>
        <Button variant="ghost" size="sm" onClick={fetchMetrics} className="ml-auto">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Conversions</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-500" />
              {metrics.overview.total_conversions}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-500" />
              ${metrics.overview.total_revenue.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Customer Value</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              ${metrics.overview.avg_customer_value.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Variant Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Variant Performance</CardTitle>
          <CardDescription>Conversion and revenue by pricing option</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Annual $49 */}
            <div className="border-l-4 border-emerald-500 pl-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">Annual $49 (Variant A)</h3>
                  <p className="text-sm text-slate-600">Launch special pricing</p>
                </div>
                <Badge variant="default" className="bg-emerald-500">
                  {metrics.variants.annual_49.percentage}%
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-sm text-slate-600">Conversions</p>
                  <p className="text-2xl font-bold">{metrics.variants.annual_49.conversions}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Revenue</p>
                  <p className="text-2xl font-bold">${metrics.variants.annual_49.revenue}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Avg Price</p>
                  <p className="text-2xl font-bold">${metrics.variants.annual_49.avg_revenue}</p>
                </div>
              </div>
            </div>

            {/* Annual $79 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">Annual $79 (Variant B)</h3>
                  <p className="text-sm text-slate-600">Standard annual pricing</p>
                </div>
                <Badge variant="secondary">{metrics.variants.annual_79.percentage}%</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-sm text-slate-600">Conversions</p>
                  <p className="text-2xl font-bold">{metrics.variants.annual_79.conversions}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Revenue</p>
                  <p className="text-2xl font-bold">${metrics.variants.annual_79.revenue}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Avg Price</p>
                  <p className="text-2xl font-bold">${metrics.variants.annual_79.avg_revenue}</p>
                </div>
              </div>
            </div>

            {/* Monthly $19 */}
            <div className="border-l-4 border-purple-500 pl-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">Monthly $19</h3>
                  <p className="text-sm text-slate-600">Flexible month-to-month</p>
                </div>
                <Badge variant="outline">{metrics.variants.monthly_19.percentage}%</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-sm text-slate-600">Conversions</p>
                  <p className="text-2xl font-bold">{metrics.variants.monthly_19.conversions}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Revenue (MRR)</p>
                  <p className="text-2xl font-bold">${metrics.variants.monthly_19.revenue}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Avg Price</p>
                  <p className="text-2xl font-bold">${metrics.variants.monthly_19.avg_revenue}/mo</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Sensitivity Insights */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Price Sensitivity Analysis</CardTitle>
          <CardDescription>How users respond to different pricing options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Annual vs Monthly Preference</span>
              <Badge variant="default" className="text-lg px-4 py-1">
                {metrics.price_sensitivity.annual_percentage}% annual
              </Badge>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-8 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full flex items-center justify-center text-white font-bold text-sm"
                style={{ width: `${metrics.price_sensitivity.annual_percentage}%` }}
              >
                Annual ({metrics.price_sensitivity.annual_preference})
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <span className="font-medium block mb-3">Within Annual Plans: $49 vs $79</span>
              <div className="w-full bg-slate-200 rounded-full h-8 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    width: `${metrics.price_sensitivity.within_annual_preference.ratio_49}%`,
                  }}
                >
                  $49 ({metrics.price_sensitivity.within_annual_preference.prefer_49})
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {metrics.price_sensitivity.within_annual_preference.ratio_49}% of annual buyers
                choose $49
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cohort Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cohort Analysis</CardTitle>
          <CardDescription>Product Hunt vs Organic users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                🚀 Product Hunt
                <Badge>{metrics.cohorts.product_hunt.total} users</Badge>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Annual $49:</span>
                  <span className="font-bold">{metrics.cohorts.product_hunt.annual_49}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual $79:</span>
                  <span className="font-bold">{metrics.cohorts.product_hunt.annual_79}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly $19:</span>
                  <span className="font-bold">{metrics.cohorts.product_hunt.monthly_19}</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                🌍 Organic
                <Badge variant="secondary">{metrics.cohorts.organic.total} users</Badge>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Annual $49:</span>
                  <span className="font-bold">{metrics.cohorts.organic.annual_49}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual $79:</span>
                  <span className="font-bold">{metrics.cohorts.organic.annual_79}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly $19:</span>
                  <span className="font-bold">{metrics.cohorts.organic.monthly_19}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Recommendations
          </CardTitle>
          <CardDescription>Data-driven insights for pricing strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recommendations.map((rec, idx) => {
              const isStrong = rec.includes('STRONG SIGNAL');
              const isWarning = rec.includes('SMALL SAMPLE') || rec.includes('MIXED RESULTS');

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    isStrong
                      ? 'bg-emerald-50 border-emerald-500'
                      : isWarning
                      ? 'bg-amber-50 border-amber-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <p className="text-sm font-medium">{rec}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
