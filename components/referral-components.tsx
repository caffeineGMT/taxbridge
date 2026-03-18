'use client';

import React from 'react';
import { Copy, Check, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Referral Link Copy Component
 * Displays referral link with copy-to-clipboard functionality
 */
export function ReferralLinkCopy({ link }: { link: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
 * Social Share Button Component
 * Opens social platform sharing dialog
 */
export function SocialShareButton({
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
  const handleShare = () => {
    const urls: Record<string, string> = {
      Twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || '')}`,
    };

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
 * Email Share Button Component
 * Opens email client with pre-filled content
 */
export function EmailShareButton({ subject, body }: { subject: string; body: string }) {
  const handleEmail = () => {
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
 * Status Badge Component
 * Displays referral status with color coding
 */
export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    rewarded: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  const labels: Record<string, string> = {
    pending: 'Pending',
    completed: 'Subscribed',
    rewarded: 'Rewarded',
  };

  return (
    <span className={`px-3 py-1 rounded-full border text-xs font-medium ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}
