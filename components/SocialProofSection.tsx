/**
 * Social Proof Component
 *
 * Displays user count, testimonials, and trust badges
 * Used in A/B test for social proof placement (above fold vs below pricing vs sidebar)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Award, CheckCircle, Users, Star } from 'lucide-react';
import TestimonialCarousel from '@/components/TestimonialCarousel';

interface SocialProofProps {
  variant: 'above_fold' | 'below_pricing' | 'sidebar';
  showTestimonials?: boolean;
  showTrustBadges?: boolean;
  showUserCount?: boolean;
}

export function SocialProofSection({
  variant,
  showTestimonials = true,
  showTrustBadges = true,
  showUserCount = true,
}: SocialProofProps) {
  const [userCount, setUserCount] = useState(500);

  useEffect(() => {
    fetch('/api/stats/users')
      .then((res) => res.json())
      .then((data) => setUserCount(data.displayCount))
      .catch(() => setUserCount(500));
  }, []);

  // Above fold: Compact horizontal layout
  if (variant === 'above_fold') {
    return (
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 max-w-5xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-12 flex-wrap">
          {showUserCount && (
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">{userCount.toLocaleString()}+</div>
              <div className="text-slate-400">H-1B professionals trust TaxBridge</div>
            </div>
          )}
          {showTrustBadges && (
            <>
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-emerald-500" />
                <span className="text-slate-300">256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-8 h-8 text-blue-500" />
                <span className="text-slate-300">SOC 2 Type II Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-8 h-8 text-amber-500" />
                <span className="text-slate-300">CPA-Reviewed Calculations</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Below pricing: Full testimonial section
  if (variant === 'below_pricing') {
    return (
      <div className="mt-20 space-y-12">
        {showTestimonials && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              Real Results from Beta Users
            </h2>
            <TestimonialCarousel variant="default" limit={5} autoRotate={false} />
          </div>
        )}

        {showTrustBadges && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Bank-Level Security</h3>
                <p className="text-slate-400 text-sm">256-bit SSL encryption. All data encrypted in transit and at rest.</p>
              </div>
              <div className="text-center">
                <Award className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">SOC 2 Compliant</h3>
                <p className="text-slate-400 text-sm">Independently audited security controls and compliance.</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">CPA-Reviewed</h3>
                <p className="text-slate-400 text-sm">Tax calculations verified by cross-border tax professionals.</p>
              </div>
            </div>
          </div>
        )}

        {showUserCount && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-8 h-8 text-emerald-500" />
              <span className="text-5xl font-bold text-emerald-400">{userCount.toLocaleString()}+</span>
            </div>
            <p className="text-xl text-slate-300">
              H-1B and TN visa holders trust TaxBridge for accurate cross-border tax calculations
            </p>
          </div>
        )}
      </div>
    );
  }

  // Sidebar: Sticky sidebar with social proof
  if (variant === 'sidebar') {
    return (
      <div className="sticky top-24 space-y-6">
        {showUserCount && (
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-8 h-8" />
              <span className="text-4xl font-bold">{userCount.toLocaleString()}+</span>
            </div>
            <p className="text-emerald-100 text-sm">
              H-1B workers trust TaxBridge for cross-border tax optimization
            </p>
          </div>
        )}

        {showTrustBadges && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Why TaxBridge?</h3>
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Bank-Level Security</p>
                <p className="text-xs text-slate-400">256-bit SSL encryption</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">SOC 2 Compliant</p>
                <p className="text-xs text-slate-400">Audited security controls</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">CPA-Reviewed</p>
                <p className="text-xs text-slate-400">Verified calculations</p>
              </div>
            </div>
          </div>
        )}

        {showTestimonials && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-slate-400">4.9/5 rating</span>
            </div>
            <blockquote className="text-sm text-slate-300 italic mb-3">
              "Saved me $2,800 on taxes my first year. The FTC optimizer alone was worth it."
            </blockquote>
            <p className="text-xs text-slate-500">— Sarah K., H-1B Software Engineer</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
