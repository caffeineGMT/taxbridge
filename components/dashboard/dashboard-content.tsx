'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { DollarSign, TrendingUp, FileCheck, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RSUList } from '@/components/dashboard/rsu-list';
import { QuickActions } from '@/components/dashboard/quick-actions';
import dynamic from 'next/dynamic';

const DashboardTour = dynamic(
  () => import('@/components/dashboard/dashboard-tour').then(mod => ({ default: mod.DashboardTour })),
  { ssr: false }
);
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow';
import { RSUEntryRow } from '@/lib/db';
import { trackEvent, trackRevenue } from '@/lib/analytics/posthog';
import { toast } from '@/hooks/use-toast';

interface DashboardContentProps {
  rsuEvents: RSUEntryRow[];
  ytdTotal: number;
  estimatedUSTax: number;
  estimatedCanadaTax: number;
  filingStatus: string;
  allTimeTotal: number;
  currentYear: number;
}

export function DashboardContent({
  rsuEvents,
  ytdTotal,
  estimatedUSTax,
  estimatedCanadaTax,
  filingStatus,
  allTimeTotal,
  currentYear,
}: DashboardContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  // Track subscription completion from Stripe checkout
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');

    if (upgrade === 'success') {
      // Track subscription activation in PostHog
      const tier = (user?.publicMetadata?.subscriptionTier as string) || 'pro';
      const revenue = tier === 'enterprise' ? 2000 : 299;

      trackEvent('subscription_activated', {
        plan: tier,
        revenue,
        currency: 'USD',
        billingInterval: 'annual',
        funnelStep: 'Subscription Activated',
        funnelStepNumber: 7,
        userId: user?.id,
      });

      // Track revenue event
      trackRevenue(revenue, tier as 'pro' | 'enterprise', 'subscription_activated');

      // Show success toast
      toast({
        title: '🎉 Subscription activated!',
        description: `Welcome to TaxBridge ${tier === 'enterprise' ? 'Enterprise' : 'Pro'}! Your account has been upgraded.`,
        duration: 8000,
      });

      // Clean up URL
      router.replace('/dashboard');
    }
  }, [searchParams, router, user]);

  // Track dashboard view
  useEffect(() => {
    trackEvent('dashboard_viewed', {
      page: '/dashboard',
      userId: user?.id,
      userTier: (user?.publicMetadata?.subscriptionTier as string) || 'free',
      rsuCount: rsuEvents.length,
    });
  }, [user, rsuEvents.length]);

  return (
    <>
      <DashboardTour />

      {/* Checkout Flow - shows success/error modal after payment */}
      <CheckoutFlow
        onSuccess={() => {
          // Refresh the page to update subscription tier
          window.location.reload();
        }}
        onRetry={() => router.push('/pricing')}
      />

      <main id="main-content" className="relative container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">Dashboard</h1>
          <p className="text-slate-400">
            Overview of your RSU vesting events and tax calculations for {currentYear}
          </p>
        </div>

        {/* Stats Grid */}
        <section
          aria-label="Tax summary statistics"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          data-tour="stats-cards"
        >
          <StatsCard
            title="Total RSU Income (YTD)"
            value={`$${ytdTotal.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description={`Year-to-date income for ${currentYear}`}
            icon={DollarSign}
            iconColor="from-emerald-500 to-emerald-600"
            tooltip="Total fair market value of all RSU shares that vested this year, in USD. This is the taxable income from your equity compensation."
          />

          <StatsCard
            title="Est. US Tax"
            value={`$${estimatedUSTax.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description="Federal + State (estimated)"
            icon={TrendingUp}
            iconColor="from-blue-500 to-blue-600"
            tooltip="Estimated combined US federal and state income tax on your RSU income. Your employer typically withholds a portion; the final amount depends on your total income and deductions."
          />

          <StatsCard
            title="Est. Canada Tax"
            value={`$${estimatedCanadaTax.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description="Federal + Provincial (estimated)"
            icon={TrendingUp}
            iconColor="from-purple-500 to-purple-600"
            tooltip="Estimated Canadian federal and provincial tax on your RSU income, after applying the Foreign Tax Credit (FTC) for taxes already paid to the US."
          />

          <StatsCard
            title="Filing Status"
            value={filingStatus}
            description={
              filingStatus === 'Not Started'
                ? 'Add RSU entries to begin'
                : filingStatus === 'In Progress'
                  ? 'Continue adding entries'
                  : 'Ready to file'
            }
            icon={filingStatus === 'Complete' ? FileCheck : AlertCircle}
            iconColor={
              filingStatus === 'Complete'
                ? 'from-green-500 to-green-600'
                : 'from-amber-500 to-amber-600'
            }
          />
        </section>

        {/* Quick Actions and Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {/* All-time summary card */}
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-6 mb-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-50 text-sm mb-1">All-Time RSU Income</p>
                  <p className="text-white text-3xl font-bold">
                    ${allTimeTotal.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-emerald-50 text-sm mt-2">
                    {rsuEvents.length} vesting event{rsuEvents.length !== 1 ? 's' : ''} recorded
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <DollarSign className="h-12 w-12 text-white" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <QuickActions />
        </div>

        {/* RSU List Table */}
        <RSUList events={rsuEvents} />

        {/* Additional Info Banner */}
        {rsuEvents.length > 0 && (
          <div className="mt-8 p-4 border border-blue-500/30 bg-blue-500/10 rounded-lg" role="note">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-semibold text-blue-300 mb-1">Tax Estimates</h3>
                <p className="text-sm text-slate-400">
                  Tax amounts shown are estimates based on approximate rates. Use the Tax Calculator
                  for detailed calculations including Foreign Tax Credit optimization and filing
                  recommendations.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
