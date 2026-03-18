/**
 * Subscription Content Component
 * Client-side subscription management UI
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Crown,
  Shield,
  Calendar,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: number;
  subscription_tier: string;
  subscription_status?: string | null;
  subscription_current_period_end?: string | null;
  stripe_customer_id?: string | null;
}

interface SubscriptionContentProps {
  userProfile: UserProfile;
}

export function SubscriptionContent({ userProfile }: SubscriptionContentProps) {
  const router = useRouter();
  const [loadingPortal, setLoadingPortal] = useState(false);

  const tier = userProfile.subscription_tier || 'free';
  const status = userProfile.subscription_status || 'inactive';
  const periodEnd = userProfile.subscription_current_period_end;

  const handleManageBilling = async () => {
    if (!userProfile.stripe_customer_id) {
      toast({
        title: 'No active subscription',
        description: 'Upgrade to Pro or Enterprise to manage billing.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingPortal(true);

    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to open billing portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: 'Failed to open billing portal',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
      setLoadingPortal(false);
    }
  };

  const getTierBadge = () => {
    switch (tier) {
      case 'pro':
        return (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold">
            <Crown className="w-4 h-4" />
            Pro Plan
          </div>
        );
      case 'enterprise':
        return (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            Enterprise Plan
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 bg-slate-700 text-slate-300 px-4 py-2 rounded-full text-sm font-medium">
            Free Plan
          </div>
        );
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return (
          <div className="inline-flex items-center gap-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Active</span>
          </div>
        );
      case 'past_due':
        return (
          <div className="inline-flex items-center gap-2 text-amber-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Past Due</span>
          </div>
        );
      case 'canceled':
        return (
          <div className="inline-flex items-center gap-2 text-slate-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Canceled</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 text-slate-400">
            <span className="font-medium">Inactive</span>
          </div>
        );
    }
  };

  return (
    <main className="relative container mx-auto px-6 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">Subscription</h1>
        <p className="text-slate-400">Manage your TaxBridge subscription and billing</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-3">Current Plan</h2>
            {getTierBadge()}
          </div>
          {tier !== 'free' && (
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="text-sm text-slate-400">Status</div>
              {getStatusBadge()}
            </div>
          )}
        </div>

        {tier !== 'free' && periodEnd && (
          <div className="flex items-center gap-3 text-slate-300 mb-6 pb-6 border-b border-slate-800">
            <Calendar className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium">
                {status === 'canceled' ? 'Access until' : 'Renews on'}
              </p>
              <p className="text-sm text-slate-400">
                {new Date(periodEnd).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}

        {/* Plan Features */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {tier === 'free' && (
            <>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">1 RSU Entry</p>
                  <p className="text-sm text-slate-400">Basic tax calculations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Dual Tax Calculation</p>
                  <p className="text-sm text-slate-400">US & Canada estimates</p>
                </div>
              </div>
            </>
          )}

          {tier === 'pro' && (
            <>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Unlimited RSU Entries</p>
                  <p className="text-sm text-slate-400">Track all your vesting events</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">FTC Optimizer</p>
                  <p className="text-sm text-slate-400">Minimize double taxation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">PDF Export</p>
                  <p className="text-sm text-slate-400">Professional reports</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Priority Support</p>
                  <p className="text-sm text-slate-400">12-hour response time</p>
                </div>
              </div>
            </>
          )}

          {tier === 'enterprise' && (
            <>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">All Pro Features</p>
                  <p className="text-sm text-slate-400">Plus enterprise tools</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Client Management</p>
                  <p className="text-sm text-slate-400">Multi-client dashboard</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">API Access</p>
                  <p className="text-sm text-slate-400">Integrate with your tools</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">24/7 Priority Support</p>
                  <p className="text-sm text-slate-400">2-hour response time</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {tier === 'free' ? (
            <button
              onClick={() => router.push('/pricing')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              Upgrade to Pro
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleManageBilling}
              disabled={loadingPortal}
              className="flex items-center justify-center gap-2 bg-slate-800 text-slate-100 px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPortal ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Manage Billing
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {tier !== 'enterprise' && (
            <button
              onClick={() => router.push('/pricing')}
              className="flex items-center justify-center gap-2 bg-slate-800 text-slate-100 px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
            >
              View All Plans
            </button>
          )}
        </div>
      </div>

      {/* Billing Portal Info */}
      {tier !== 'free' && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-slate-100 font-semibold mb-2">Secure Billing Portal</h3>
              <p className="text-sm text-slate-300 mb-3">
                Manage your subscription through Stripe's secure billing portal. You can:
              </p>
              <ul className="text-sm text-slate-300 space-y-1 ml-4 list-disc">
                <li>Update payment methods</li>
                <li>View billing history and invoices</li>
                <li>Update billing information</li>
                <li>Cancel or pause subscription</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Free tier upgrade CTA */}
      {tier === 'free' && (
        <div className="mt-6 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <Crown className="w-8 h-8 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Unlock Pro Features</h3>
              <p className="text-blue-100 mb-4">
                Get unlimited RSU entries, Foreign Tax Credit optimization, PDF exports, and priority support
                for just $299/year.
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg inline-flex items-center gap-2"
              >
                Upgrade Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
