/**
 * ManageSubscriptionButton Component
 * Opens Stripe billing portal for subscription management
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ExternalLink } from 'lucide-react';

interface ManageSubscriptionButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showIcon?: boolean;
  returnUrl?: string;
}

export function ManageSubscriptionButton({
  variant = 'default',
  size = 'default',
  className,
  showIcon = true,
  returnUrl,
}: ManageSubscriptionButtonProps) {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be signed in to manage your subscription.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          returnUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to open billing portal');
      }

      const data = await response.json();

      // Redirect to Stripe billing portal
      window.location.href = data.url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to open billing portal. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <CreditCard className="w-4 h-4 mr-2" />}
      {isLoading ? 'Opening...' : 'Manage Subscription'}
      {showIcon && !isLoading && <ExternalLink className="w-3 h-3 ml-2 opacity-50" />}
    </Button>
  );
}

/**
 * QuickManageButton - Compact version for inline use
 */
export function QuickManageButton({ className }: { className?: string }) {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!userId) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Failed to open billing portal');

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open billing portal.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`text-sm text-emerald-500 hover:text-emerald-400 underline ${className}`}
    >
      {isLoading ? 'Loading...' : 'Manage'}
    </button>
  );
}
