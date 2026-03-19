/**
 * Advanced Urgency Messaging Component
 *
 * Displays dynamic urgency messages:
 * - Stock scarcity (limited spots)
 * - Social proof (recent signups)
 * - Time-based urgency (countdown)
 * - FOMO triggers (spots filling fast)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Users, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/posthog';

interface UrgencyMessageProps {
  type: 'stock-scarcity' | 'social-proof' | 'time-limited' | 'fomo';
  tier?: 'pro' | 'enterprise';
}

export function UrgencyMessage({ type, tier = 'pro' }: UrgencyMessageProps) {
  const [spotsRemaining, setSpotsRemaining] = useState(tier === 'pro' ? 37 : 3);
  const [recentSignups, setRecentSignups] = useState(12);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 23, minutes: 47 });

  useEffect(() => {
    // Track urgency message impression
    trackEvent('page_viewed', {
      urgencyType: type,
      tier,
      component: 'UrgencyMessage',
    });

    // Simulate decreasing spots (would be real data in production)
    const interval = setInterval(() => {
      setSpotsRemaining((prev) => Math.max(tier === 'pro' ? 25 : 1, prev - Math.floor(Math.random() * 2)));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [type, tier]);

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const totalMinutes = prev.hours * 60 + prev.minutes - 1;
        if (totalMinutes <= 0) return { hours: 23, minutes: 59 };
        return {
          hours: Math.floor(totalMinutes / 60),
          minutes: totalMinutes % 60,
        };
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (type === 'stock-scarcity') {
    const percentage = tier === 'pro' ? (spotsRemaining / 100) * 100 : (spotsRemaining / 10) * 100;
    const urgency = percentage < 30 ? 'high' : percentage < 60 ? 'medium' : 'low';

    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${
          urgency === 'high'
            ? 'bg-red-500/10 border-red-500/50 text-red-400'
            : urgency === 'medium'
            ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
            : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
        }`}
      >
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-sm">
            {urgency === 'high' && '🔥 Almost Full!'}
            {urgency === 'medium' && '⚠️ Filling Fast'}
            {urgency === 'low' && 'Limited Spots Available'}
          </p>
          <p className="text-xs opacity-90">
            Only <strong>{spotsRemaining} spots</strong> left at this price
          </p>
        </div>
      </div>
    );
  }

  if (type === 'social-proof') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 border-2 border-emerald-500/50">
        <Users className="w-5 h-5 text-emerald-400 shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-sm text-emerald-400">🎯 High Demand</p>
          <p className="text-xs text-emerald-300 opacity-90">
            <strong>{recentSignups} people</strong> signed up in the last hour
          </p>
        </div>
      </div>
    );
  }

  if (type === 'time-limited') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border-2 border-amber-500/50">
        <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
        <div className="flex-1">
          <p className="font-bold text-sm text-amber-400">⏰ Launch Pricing Ends Soon</p>
          <p className="text-xs text-amber-300 opacity-90">
            Lock in 50% discount before it expires in{' '}
            <strong className="font-mono">
              {timeRemaining.hours}h {timeRemaining.minutes}m
            </strong>
          </p>
        </div>
      </div>
    );
  }

  if (type === 'fomo') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-500/10 border-2 border-purple-500/50">
        <TrendingUp className="w-5 h-5 text-purple-400 shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-sm text-purple-400">💰 Save $3,500+ on Tax Prep</p>
          <p className="text-xs text-purple-300 opacity-90">
            Average user saves <strong>$3,500/year</strong> vs hiring a CPA
          </p>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Sticky Urgency Banner
 * Shows at the bottom of the page after scrolling
 */
export function StickyUrgencyBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white py-4 px-6 shadow-2xl z-50 animate-slide-up">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Zap className="w-6 h-6 animate-pulse" />
          <div>
            <p className="font-bold text-lg">⚡ Launch Special: 50% OFF ends in 24 hours</p>
            <p className="text-sm opacity-90">Join 37 people who upgraded today</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              trackEvent('pricing_tier_selected', {
                plan: 'pro',
                source: 'sticky-urgency-banner',
              });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors shadow-lg"
          >
            Claim Discount Now
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
