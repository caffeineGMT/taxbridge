/**
 * Trust Signals Component
 *
 * Displays social proof elements that can be positioned dynamically
 * based on A/B test variants
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Award, CheckCircle, Users, TrendingUp } from 'lucide-react';

interface TrustSignalsProps {
  variant: 'below-cta' | 'above-hero' | 'inline-features';
  showUserCount?: boolean;
  showCompanyLogos?: boolean;
  showSecurityBadges?: boolean;
  className?: string;
}

export function TrustSignals({
  variant,
  showUserCount = true,
  showCompanyLogos = false,
  showSecurityBadges = true,
  className = '',
}: TrustSignalsProps) {
  const [userCount, setUserCount] = useState(1247);

  useEffect(() => {
    // Fetch live user count
    fetch('/api/stats/users')
      .then((res) => res.json())
      .then((data) => setUserCount(data.displayCount))
      .catch(() => setUserCount(1247));
  }, []);

  // Layout-specific styles
  const containerStyles = {
    'below-cta': 'flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 px-4',
    'above-hero': 'bg-slate-800/30 backdrop-blur-sm border-b border-slate-700 py-3',
    'inline-features': 'grid grid-cols-1 md:grid-cols-3 gap-4 mt-6',
  };

  if (variant === 'above-hero') {
    return (
      <div className={containerStyles[variant]}>
        <div className="container mx-auto px-4 flex items-center justify-center gap-8 flex-wrap text-sm text-slate-300">
          {showUserCount && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="text-emerald-400">{userCount.toLocaleString()}+</strong> tech workers trust TaxBridge
              </span>
            </div>
          )}
          {showCompanyLogos && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Used at Google, Meta, Amazon, Microsoft</span>
            </div>
          )}
          {showSecurityBadges && (
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>256-bit SSL • SOC 2 Type II • CPA-Reviewed</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'inline-features') {
    return (
      <div className={`${containerStyles[variant]} ${className}`}>
        {showUserCount && (
          <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg px-4 py-3">
            <Users className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-2xl font-bold text-emerald-400">{userCount.toLocaleString()}+</div>
              <div className="text-xs text-slate-400">Active users</div>
            </div>
          </div>
        )}
        {showSecurityBadges && (
          <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg px-4 py-3">
            <Shield className="w-6 h-6 text-blue-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-200">Bank-Level Security</div>
              <div className="text-xs text-slate-400">256-bit SSL encryption</div>
            </div>
          </div>
        )}
        {showCompanyLogos && (
          <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg px-4 py-3">
            <Award className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-200">CPA-Reviewed</div>
              <div className="text-xs text-slate-400">Calculations verified</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: below-cta variant
  return (
    <div className={`${containerStyles[variant]} ${className}`}>
      {showUserCount && (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>
            <strong className="text-slate-300">{userCount.toLocaleString()}+</strong> tech workers
          </span>
        </div>
      )}
      {showSecurityBadges && (
        <>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>SOC 2 Type II</span>
          </div>
        </>
      )}
      {showCompanyLogos && (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>CPA-Reviewed</span>
        </div>
      )}
    </div>
  );
}

/**
 * Company Logos Component
 * Shows logos of companies where users work
 */
export function CompanyLogos({ className = '' }: { className?: string }) {
  const companies = [
    { name: 'Google', logo: '🔍' },
    { name: 'Meta', logo: '📘' },
    { name: 'Amazon', logo: '📦' },
    { name: 'Microsoft', logo: '🪟' },
    { name: 'Apple', logo: '🍎' },
  ];

  return (
    <div className={`flex items-center justify-center gap-6 flex-wrap ${className}`}>
      <span className="text-sm text-slate-400">Trusted by engineers at:</span>
      {companies.map((company) => (
        <div
          key={company.name}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/30 rounded-lg border border-slate-700"
        >
          <span className="text-lg">{company.logo}</span>
          <span className="text-sm text-slate-300 font-medium">{company.name}</span>
        </div>
      ))}
    </div>
  );
}
