'use client';

/**
 * Partner Referral Link Copy Button
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check } from 'lucide-react';

interface Props {
  link: string;
}

export function PartnerReferralLinkCopy({ link }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <Input
        value={link}
        readOnly
        className="bg-slate-900/50 border-slate-700 text-white font-mono text-sm"
      />
      <Button
        onClick={handleCopy}
        variant="outline"
        className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white flex-shrink-0"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
}
