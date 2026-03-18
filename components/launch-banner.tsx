'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Timer } from 'lucide-react';
import Link from 'next/link';

interface LaunchBannerProps {
  /** Launch end date (PST timezone) */
  launchEndDate?: Date;
  /** Coupon code to display */
  couponCode?: string;
  /** Discount percentage */
  discountPercent?: number;
  /** Show close button */
  dismissible?: boolean;
}

export function LaunchBanner({
  launchEndDate = new Date('2026-04-10T23:59:59-07:00'), // Default: 48 hours after Apr 8 launch
  couponCode = 'HUNT20',
  discountPercent = 20,
  dismissible = true,
}: LaunchBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check if user dismissed banner previously (localStorage)
    if (dismissible) {
      const dismissed = localStorage.getItem('launch-banner-dismissed');
      if (dismissed === 'true') {
        setIsVisible(false);
        return;
      }
    }

    // Calculate time left until coupon expires
    const interval = setInterval(() => {
      const now = new Date();
      const diff = launchEndDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsVisible(false);
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [launchEndDate, dismissible]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (dismissible) {
      localStorage.setItem('launch-banner-dismissed', 'true');
    }
  };

  // Don't render on server (avoid hydration mismatch)
  if (!isMounted || !isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon */}
          <div className="hidden sm:block">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          {/* Center: Message */}
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center sm:text-left">
            <span className="font-bold text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:hidden animate-pulse" />
              🚀 Product Hunt Launch Special!
            </span>
            <span className="text-sm sm:text-base">
              Get <strong>{discountPercent}% off Pro</strong> with code{' '}
              <span className="inline-block bg-white text-orange-600 px-2 py-0.5 rounded font-mono font-bold">
                {couponCode}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              <Timer className="w-4 h-4" />
              {timeLeft}
            </span>
          </div>

          {/* Right: CTA + Close */}
          <div className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Claim Discount
            </Link>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="text-white hover:text-gray-200 transition p-1 rounded hover:bg-white/10"
                aria-label="Close banner"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="sm:hidden mt-3 flex justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition w-full sm:w-auto justify-center"
          >
            Claim Discount
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for pricing page (less intrusive)
 */
export function LaunchBannerCompact({
  launchEndDate = new Date('2026-04-10T23:59:59-07:00'),
  couponCode = 'HUNT20',
  discountPercent = 20,
}: Omit<LaunchBannerProps, 'dismissible'>) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = launchEndDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [launchEndDate]);

  if (!isMounted || isExpired) return null;

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg text-orange-700">
      <Sparkles className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium">
        <strong>{discountPercent}% off</strong> with code{' '}
        <span className="font-mono font-bold bg-orange-100 px-1.5 py-0.5 rounded">
          {couponCode}
        </span>
      </span>
      <span className="text-xs bg-orange-100 px-2 py-1 rounded-full font-medium">
        {timeLeft} left
      </span>
    </div>
  );
}

/**
 * Pricing card discount badge
 */
export function DiscountBadge({
  originalPrice,
  discountedPrice,
  couponCode = 'HUNT20',
}: {
  originalPrice: number;
  discountedPrice: number;
  couponCode?: string;
}) {
  const savingsAmount = originalPrice - discountedPrice;
  const savingsPercent = Math.round((savingsAmount / originalPrice) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">
          ${discountedPrice}
        </span>
        <span className="text-lg text-gray-500 line-through">
          ${originalPrice}
        </span>
        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
          SAVE ${savingsAmount}
        </span>
      </div>
      <p className="text-sm text-gray-600">
        Use code{' '}
        <span className="font-mono font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
          {couponCode}
        </span>{' '}
        at checkout to save {savingsPercent}%
      </p>
    </div>
  );
}

/**
 * Floating sticky banner (bottom of screen)
 */
export function LaunchBannerSticky({
  launchEndDate = new Date('2026-04-10T23:59:59-07:00'),
  couponCode = 'HUNT20',
  discountPercent = 20,
  dismissible = true,
}: LaunchBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (dismissible) {
      const dismissed = localStorage.getItem('launch-banner-sticky-dismissed');
      if (dismissed === 'true') {
        setIsVisible(false);
        return;
      }
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = launchEndDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsVisible(false);
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [launchEndDate, dismissible]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (dismissible) {
      localStorage.setItem('launch-banner-sticky-dismissed', 'true');
    }
  };

  if (!isMounted || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-semibold text-sm sm:text-base">
                🚀 Launch Special: <strong>{discountPercent}% off</strong> with code{' '}
                <span className="font-mono bg-white text-orange-600 px-2 py-0.5 rounded">
                  {couponCode}
                </span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                <Timer className="w-3 h-3" />
                {timeLeft}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/pricing"
                className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition text-sm"
              >
                Claim Now
              </Link>
              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="text-white hover:text-gray-200 transition p-1"
                  aria-label="Close banner"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
