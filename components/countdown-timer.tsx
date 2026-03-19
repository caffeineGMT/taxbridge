'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { logger } from '@/lib/logger';

interface CountdownTimerProps {
  expiryDate: string; // ISO 8601 date string
  className?: string;
  showLabel?: boolean;
  label?: string;
  onExpire?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/**
 * Countdown Timer Component
 *
 * Displays a live countdown to a specific date/time with automatic updates.
 * Used for urgency messaging on pricing pages and promotional campaigns.
 *
 * @example
 * ```tsx
 * // Simple countdown to Product Hunt launch
 * <CountdownTimer
 *   expiryDate="2026-03-22T00:01:00Z"
 *   label="Product Hunt launch in:"
 * />
 *
 * // Discount expiry with custom styling
 * <CountdownTimer
 *   expiryDate="2026-03-25T23:59:59Z"
 *   label="HUNT20 discount expires in:"
 *   className="bg-amber-600 text-white"
 *   onExpire={() => logger.info('Discount expired!')}
 * />
 * ```
 */
export default function CountdownTimer({
  expiryDate,
  className = '',
  showLabel = true,
  label = 'Time remaining:',
  onExpire,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining => {
      const now = new Date().getTime();
      const target = new Date(expiryDate).getTime();
      const distance = target - now;

      if (distance <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      const newTime = calculateTimeRemaining();
      setTimeRemaining(newTime);

      // Trigger onExpire callback when countdown reaches zero
      if (newTime.isExpired && onExpire) {
        onExpire();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate, onExpire]);

  // Don't render if expired (unless you want to show "Expired" message)
  if (timeRemaining.isExpired) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-center gap-3 py-3 px-6 rounded-lg ${className}`}
    >
      <Clock className="w-5 h-5" />
      {showLabel && <span className="font-bold">{label}</span>}
      <div className="flex items-center gap-2 font-mono">
        {timeRemaining.days > 0 && (
          <span className="bg-white/20 px-3 py-1 rounded">
            {timeRemaining.days}d
          </span>
        )}
        <span className="bg-white/20 px-3 py-1 rounded">
          {timeRemaining.hours}h
        </span>
        <span className="bg-white/20 px-3 py-1 rounded">
          {timeRemaining.minutes}m
        </span>
        <span className="bg-white/20 px-3 py-1 rounded">
          {timeRemaining.seconds}s
        </span>
      </div>
    </div>
  );
}

/**
 * Compact version for inline use
 */
export function CompactCountdownTimer({
  expiryDate,
  className = '',
}: {
  expiryDate: string;
  className?: string;
}) {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(expiryDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeRemaining({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate]);

  if (timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
    return null;
  }

  return (
    <span className={`font-mono ${className}`}>
      {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
    </span>
  );
}
