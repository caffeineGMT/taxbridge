/**
 * Enhanced Referral Components with Share Tracking
 * Tracks when users share their referral links
 */

'use client';

import React, { useState } from 'react';
import { Copy, Check, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

/**
 * Track a share event via API
 */
async function trackShare(platform: string, metadata?: Record<string, any>) {
  try {
    const response = await fetch('/api/referrals/track-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, metadata }),
    });

    if (response.ok) {
      logger.info('Share tracked', { platform });

      // Track in PostHog
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('referral_shared', {
          platform,
          ...metadata,
        });
      }
    }
  } catch (error) {
    logger.warn('Failed to track share', { error, platform });
  }
}

/**
 * Referral Link Copy Component with Share Tracking
 */
export function ReferralLinkCopyTracked({ link }: { link: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Track the copy event as a share
    await trackShare('copy_link', { link });
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={link}
        readOnly
        className="flex-1 px-4 py-3 bg-slate-900 border border-emerald-500/30 rounded-lg text-white font-mono text-sm"
      />
      <Button
        onClick={handleCopy}
        className="px-6 bg-emerald-500 hover:bg-emerald-600 text-white"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
}

/**
 * Social Share Button Component with Tracking
 */
export function SocialShareButtonTracked({
  platform,
  icon: Icon,
  message,
  color,
}: {
  platform: string;
  icon: any;
  message: string;
  color: string;
}) {
  const handleShare = async () => {
    const urls: Record<string, string> = {
      Twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || '')}`,
    };

    // Track the share first
    await trackShare(platform.toLowerCase(), {
      message: message.substring(0, 100), // First 100 chars only
    });

    // Then open share dialog
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <Button onClick={handleShare} className={`${color} text-white w-full`}>
      <Icon className="w-4 h-4 mr-2" />
      {platform}
    </Button>
  );
}

/**
 * Email Share Button Component with Tracking
 */
export function EmailShareButtonTracked({ subject, body }: { subject: string; body: string }) {
  const handleEmail = async () => {
    // Track the email share
    await trackShare('email', {
      subject: subject.substring(0, 100),
    });

    // Open email client
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Button onClick={handleEmail} className="bg-slate-600 hover:bg-slate-700 text-white w-full">
      <Mail className="w-4 h-4 mr-2" />
      Email
    </Button>
  );
}

/**
 * Share Rate Progress Bar
 * Shows progress towards 20% share target
 */
export function ShareRateProgress({
  totalUsers,
  usersWhoShared,
  targetPercent = 20,
}: {
  totalUsers: number;
  usersWhoShared: number;
  targetPercent?: number;
}) {
  const shareRatePercent = totalUsers > 0 ? (usersWhoShared / totalUsers) * 100 : 0;
  const isOnTarget = shareRatePercent >= targetPercent;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">Share Rate</span>
        <span className={isOnTarget ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
          {shareRatePercent.toFixed(1)}% / {targetPercent}%
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            isOnTarget ? 'bg-emerald-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(shareRatePercent, 100)}%` }}
        />
      </div>
      <p className="text-xs text-slate-400">
        {usersWhoShared} of {totalUsers} users have shared their link
        {isOnTarget && ' ✓ Target reached!'}
      </p>
    </div>
  );
}
