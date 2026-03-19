/**
 * Pricing Preview Component for Landing Page A/B Test
 *
 * Display variants:
 * 1. Price only - Simple badge with price
 * 2. Full pricing card - Complete pricing breakdown
 * 3. Value comparison - Price vs. cost of incorrect filing
 *
 * Tests impact of pricing transparency on conversion
 */

'use client';

import Link from 'next/link';
import { Check, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface PricingPreviewProps {
  display: 'price-only' | 'full-card' | 'value-prop';
  onPricingClicked?: () => void;
  className?: string;
}

export function PricingPreview({
  display,
  onPricingClicked,
  className = '',
}: PricingPreviewProps) {
  // Price-only variant - minimal pricing badge
  if (display === 'price-only') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <span className="text-emerald-400 font-semibold text-lg">$79/year</span>
          <span className="text-slate-400 text-sm">• Full access • No credit card required</span>
        </div>
      </div>
    );
  }

  // Full pricing card variant
  if (display === 'full-card') {
    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-100 mb-2">Simple, Transparent Pricing</h2>
          <p className="text-slate-400">Save thousands on taxes for less than a Netflix subscription</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Tier */}
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-100">Free Calculator</CardTitle>
              <CardDescription className="text-slate-400">
                Basic tax calculation for one-time use
              </CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold text-emerald-400">$0</span>
                <span className="text-slate-400 ml-2">forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">Single tax year calculation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">Foreign Tax Credit optimizer</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">Forms checklist</span>
                </li>
              </ul>
              <Link href="/dashboard" className="block mt-6">
                <Button variant="outline" className="w-full border-slate-700 hover:border-emerald-500">
                  Start Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="border-emerald-500 bg-gradient-to-br from-emerald-950/50 to-slate-900/50 backdrop-blur-sm relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>

            <CardHeader>
              <CardTitle className="text-2xl text-slate-100">Pro</CardTitle>
              <CardDescription className="text-slate-300">
                Full access for H-1B/TN workers with RSUs
              </CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold text-emerald-400">$79</span>
                <span className="text-slate-400 ml-2">/year</span>
              </div>
              <p className="text-emerald-400 text-sm font-medium mt-1">
                Save $2,500+ on taxes • ROI: 3,000%+
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-100 text-sm font-medium">Everything in Free, plus:</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">Multi-year tax planning</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">Unlimited RSU entries & tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">CSV import from E*TRADE, Schwab, Fidelity</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">Tax deadline reminders</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">Priority email support</span>
                </li>
              </ul>
              <Link href="/pricing" onClick={onPricingClicked} className="block mt-6">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold">
                  Get Pro Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          All plans include CPA-verified calculations and data encryption. Cancel anytime.
        </p>
      </div>
    );
  }

  // Value comparison variant - show ROI vs. cost of errors
  if (display === 'value-prop') {
    return (
      <div className={`max-w-3xl mx-auto ${className}`}>
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-100 mb-2">
              The Math is Simple
            </h3>
            <p className="text-slate-400">TaxBridge pays for itself 30x over</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cost of NOT using TaxBridge */}
            <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <h4 className="text-lg font-semibold text-red-400">Without TaxBridge</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex justify-between text-sm">
                  <span className="text-slate-300">Double taxation on RSUs</span>
                  <span className="text-red-400 font-semibold">-$5,000</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-slate-300">Missed FTC optimization</span>
                  <span className="text-red-400 font-semibold">-$2,500</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-slate-300">CPA fees (if you hire one)</span>
                  <span className="text-red-400 font-semibold">-$800</span>
                </li>
                <li className="flex justify-between text-sm border-t border-red-900/50 pt-3">
                  <span className="text-slate-100 font-semibold">Total Annual Cost</span>
                  <span className="text-red-400 font-bold text-lg">-$8,300</span>
                </li>
              </ul>
            </div>

            {/* Cost WITH TaxBridge */}
            <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
                <h4 className="text-lg font-semibold text-emerald-400">With TaxBridge Pro</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex justify-between text-sm">
                  <span className="text-slate-300">TaxBridge Pro (annual)</span>
                  <span className="text-slate-400">$79</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-slate-300">Optimized FTC savings</span>
                  <span className="text-emerald-400 font-semibold">+$2,500</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-slate-300">Avoid double taxation</span>
                  <span className="text-emerald-400 font-semibold">+$5,000</span>
                </li>
                <li className="flex justify-between text-sm border-t border-emerald-900/50 pt-3">
                  <span className="text-slate-100 font-semibold">Net Annual Savings</span>
                  <span className="text-emerald-400 font-bold text-lg">+$7,421</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ROI highlight */}
          <div className="mt-6 text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-emerald-400 font-semibold text-lg">
              💰 ROI: 9,400% • Break-even in the first filing
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/pricing" onClick={onPricingClicked}>
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold">
                Get TaxBridge Pro - $79/year
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-slate-400 text-sm mt-3">No credit card required to start • Cancel anytime</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
