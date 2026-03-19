'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Home, DollarSign, Calculator, FileText, TrendingUp, Crown, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationBell from './NotificationBell';

export default function Header() {
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free');

  useEffect(() => {
    // Fetch user subscription tier
    fetch('/api/user')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user?.subscription_tier) {
          setSubscriptionTier(data.user.subscription_tier);
        }
      })
      .catch(() => {
        // Ignore errors - just use default tier
      });
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
            TaxBridge
          </Link>
        </div>

        <nav aria-label="Main navigation" className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/dashboard"
            className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/multi-year"
            className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" aria-hidden="true" />
            Multi-Year
          </Link>
          <Link
            href="/rsu-entry"
            className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" aria-hidden="true" />
            Add RSU
          </Link>
          <Link
            href="/calculator"
            className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" aria-hidden="true" />
            Calculator
          </Link>
          <Link
            href="/forms-checklist"
            className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            Forms
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Subscription Badge */}
          <Link
            href="/dashboard/subscription"
            aria-label={`Subscription tier: ${subscriptionTier === 'pro' ? 'Pro' : subscriptionTier === 'enterprise' ? 'Enterprise' : 'Free'}. Manage subscription`}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
            style={{
              background: subscriptionTier === 'pro'
                ? 'linear-gradient(to right, rgb(59 130 246), rgb(16 185 129))'
                : subscriptionTier === 'enterprise'
                ? 'linear-gradient(to right, rgb(168 85 247), rgb(236 72 153))'
                : 'rgb(51 65 85)',
              color: 'white',
            }}
          >
            {subscriptionTier === 'pro' || subscriptionTier === 'enterprise' ? (
              <Crown className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {subscriptionTier === 'pro' ? 'Pro' : subscriptionTier === 'enterprise' ? 'Enterprise' : 'Free'}
          </Link>

          {/* Notification Bell */}
          <NotificationBell />

          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9',
                userButtonPopoverCard: 'bg-slate-900 border border-slate-800',
                userButtonPopoverActions: 'text-slate-100',
                userButtonPopoverActionButton: 'hover:bg-slate-800',
                userButtonPopoverFooter: 'hidden',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
