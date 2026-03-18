/**
 * Upgrade Modal Component
 * Shown when free users hit feature limits
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Zap, Check } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  currentCount?: number;
  limit?: number;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  feature = 'premium features',
  currentCount,
  limit,
}: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center pt-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Upgrade to Pro
          </h2>

          {currentCount !== undefined && limit !== undefined ? (
            <p className="text-gray-600 mb-6">
              You've reached the limit of <strong>{limit} RSU entry</strong> on the Free plan.
              Upgrade to Pro for unlimited RSU entries and more powerful features.
            </p>
          ) : (
            <p className="text-gray-600 mb-6">
              This feature requires a Pro subscription. Upgrade now to access {feature} and
              unlock the full power of TaxBridge.
            </p>
          )}

          {/* Pro features */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold mb-4 text-center">Pro Plan Benefits</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">
                  <strong>Unlimited RSU entries</strong> - Track all your vestings
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">
                  <strong>Foreign Tax Credit optimizer</strong> - Minimize double taxation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">
                  <strong>PDF export</strong> - Professional tax reports
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">
                  <strong>Priority support</strong> - Get help when you need it
                </span>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-3xl font-bold">$299</span>
              <span className="text-gray-500">/year</span>
            </div>
            <p className="text-sm text-gray-500">Less than $25/month</p>
          </div>

          {/* CTA buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Upgrade to Pro Now
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
