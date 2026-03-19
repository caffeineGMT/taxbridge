'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gift, X, ArrowRight, Users, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Referral Program CTA Banner
 * Promotes the referral program on the dashboard with dismissible functionality
 */
export function ReferralBanner({ referralCode }: { referralCode?: string }) {
  const [dismissed, setDismissed] = useState(false);

  // Check if user has dismissed the banner (stored in localStorage)
  if (typeof window !== 'undefined') {
    const isDismissed = localStorage.getItem('referralBannerDismissed');
    if (isDismissed && !dismissed) {
      return null;
    }
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('referralBannerDismissed', 'true');
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-emerald-900/40 via-blue-900/30 to-emerald-900/40 border-emerald-500/30 backdrop-blur-sm">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss referral banner"
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Icon & Header */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
              <Gift className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Earn Free Months with Referrals
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                New
              </span>
            </h3>
            <p className="text-slate-300 text-sm md:text-base">
              Get <span className="text-emerald-400 font-semibold">2 months free</span> for every friend who subscribes to Pro.
              They save <span className="text-emerald-400 font-semibold">20% off</span> their first year!
            </p>

            {/* Stats Preview (if referralCode exists, show quick stats) */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">Easy sharing tools</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">$50 value per referral</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/referrals"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
          >
            Start Referring
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Decorative Gradient Overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16,185,129,0.2), transparent 50%)',
        }}
      />
    </Card>
  );
}
