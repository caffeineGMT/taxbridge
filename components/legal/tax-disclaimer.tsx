'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface TaxDisclaimerProps {
  variant?: 'default' | 'compact';
}

export function TaxDisclaimer({ variant = 'default' }: TaxDisclaimerProps) {
  if (variant === 'compact') {
    return (
      <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300">
            <strong className="text-amber-400">Tax Estimation Tool:</strong> This calculator provides estimates only.
            Not a substitute for professional tax advice.{' '}
            <Link href="/terms" className="text-emerald-400 hover:text-emerald-300 underline">
              See Terms
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-amber-400 mb-2">Important Disclaimer</h3>
          <div className="text-sm text-slate-300 space-y-2">
            <p>
              <strong>TaxBridge is a tax estimation tool for informational purposes only.</strong> It is NOT a
              substitute for professional tax advice.
            </p>
            <p>
              Tax calculations are estimates based on general tax rules and may not reflect your specific
              situation. Factors such as deductions, credits, tax treaties, state-specific rules, and
              individual circumstances may significantly affect your actual tax liability.
            </p>
            <p>
              <strong className="text-amber-400">We strongly recommend consulting a licensed tax professional or
              CPA before making any tax decisions or filing returns.</strong> TaxBridge is not responsible for
              any tax errors, penalties, or interest charges.
            </p>
            <p className="mt-3">
              By using this tool, you agree to our{' '}
              <Link href="/terms" className="text-emerald-400 hover:text-emerald-300 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
