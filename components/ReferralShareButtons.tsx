'use client';

import React from 'react';
import { Share2, Twitter, Linkedin, Mail, Facebook } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics/posthog';

interface ReferralShareButtonsProps {
  referralCode?: string;
  context?: 'calculator' | 'dashboard';
  title?: string;
  description?: string;
}

/**
 * Social Share Buttons - Shows after calculator results
 * Viral loop mechanic: encourage users to share with friends
 */
export function ReferralShareButtons({
  referralCode,
  context = 'calculator',
  title = 'Share TaxBridge with friends',
  description = 'Earn $10 credit for each friend who subscribes. They get 20% off!',
}: ReferralShareButtonsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app';
  const referralLink = referralCode ? `${baseUrl}?ref=${referralCode}` : baseUrl;

  const shareMessages = {
    twitter: `I just saved thousands on cross-border taxes with TaxBridge! 🇺🇸🇨🇦\n\nH-1B/TN visa holders: Get 20% off → ${referralLink}`,

    linkedin: `If you're an H-1B or TN visa holder dealing with US-Canada cross-border taxes, check out TaxBridge.\n\nIt helped me calculate dual-country taxes on my RSU income and optimize foreign tax credits.\n\nGet 20% off: ${referralLink}`,

    facebook: `Just calculated my cross-border taxes with TaxBridge - saved me hours of confusion!\n\nH-1B/TN visa tech workers: Get 20% off → ${referralLink}`,

    email: {
      subject: 'Save on US-Canada cross-border taxes',
      body: `I recently used TaxBridge to manage my cross-border tax situation and it was incredibly helpful!\n\nIf you're dealing with RSU taxation across US and Canada, this tool makes it much easier.\n\nGet 20% off your first year: ${referralLink}\n\nBest regards`,
    },
  };

  const handleShare = (platform: string) => {
    trackEvent('referral_share_clicked', {
      platform,
      context,
      has_referral_code: !!referralCode,
    });

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessages.twitter)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareMessages.facebook)}`,
      email: `mailto:?subject=${encodeURIComponent(shareMessages.email.subject)}&body=${encodeURIComponent(shareMessages.email.body)}`,
    };

    if (urls[platform]) {
      if (platform === 'email') {
        window.location.href = urls[platform];
      } else {
        window.open(urls[platform], '_blank', 'width=600,height=400');
      }
    }
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-emerald-500/30">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          {/* Header */}
          <div className="flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>

          <p className="text-sm text-slate-300 max-w-md mx-auto">{description}</p>

          {/* Share Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <Button
              onClick={() => handleShare('twitter')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
            >
              <Twitter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Twitter</span>
              <span className="sm:hidden">X</span>
            </Button>

            <Button
              onClick={() => handleShare('linkedin')}
              className="bg-blue-700 hover:bg-blue-800 text-white"
              size="sm"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">LinkedIn</span>
              <span className="sm:hidden">In</span>
            </Button>

            <Button
              onClick={() => handleShare('facebook')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Facebook className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Facebook</span>
              <span className="sm:hidden">FB</span>
            </Button>

            <Button
              onClick={() => handleShare('email')}
              className="bg-slate-600 hover:bg-slate-700 text-white"
              size="sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>

          {/* Link to full referral page */}
          <div className="pt-3 border-t border-slate-700">
            <a
              href="/referrals"
              className="text-sm text-emerald-400 hover:text-emerald-300 underline"
              onClick={() => trackEvent('referral_page_link_clicked', { context })}
            >
              View your referral dashboard →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
