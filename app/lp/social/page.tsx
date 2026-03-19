'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';

// Social media link-in-bio landing page
// Tracks UTM parameters from Instagram/TikTok bio links

function SocialLandingContent() {
  const searchParams = useSearchParams();
  const [source, setSource] = useState<string>('direct');

  useEffect(() => {
    const utmSource = searchParams.get('utm_source') || 'direct';
    const utmMedium = searchParams.get('utm_medium') || '';
    const utmCampaign = searchParams.get('utm_campaign') || '';
    const utmContent = searchParams.get('utm_content') || '';

    setSource(utmSource);

    // Track the visit
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).posthog) {
      (window as unknown as Record<string, unknown> & { posthog: { capture: (event: string, props: Record<string, string>) => void } }).posthog.capture('social_bio_link_click', {
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
      });
    }

    // Google Analytics event
    if (typeof window !== 'undefined' && typeof (window as unknown as Record<string, unknown>).gtag === 'function') {
      (window as unknown as Record<string, unknown> & { gtag: (...args: unknown[]) => void }).gtag('event', 'social_bio_click', {
        event_category: 'social_media',
        event_label: utmSource,
        utm_source: utmSource,
        utm_campaign: utmCampaign,
      });
    }
  }, [searchParams]);

  const isInstagram = source === 'instagram';
  const isTikTok = source === 'tiktok';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950">
      {/* Hero */}
      <div className="max-w-lg mx-auto px-4 pt-12 pb-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <span className="text-3xl font-bold text-white">TB</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          TaxBridge
        </h1>
        <p className="text-lg text-emerald-300 font-medium mb-2">
          US-Canada Cross-Border Tax Calculator
        </p>
        <p className="text-slate-400 text-sm">
          Save $12K in overpaid taxes. 10 minutes vs 3-hour manual process.
        </p>

        {(isInstagram || isTikTok) && (
          <div className="mt-4 inline-flex items-center gap-2 bg-slate-800/50 rounded-full px-4 py-1.5 text-xs text-slate-300">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Welcome from {isInstagram ? 'Instagram' : 'TikTok'}
          </div>
        )}
      </div>

      {/* Link Cards */}
      <div className="max-w-lg mx-auto px-4 space-y-3 pb-12">
        {/* Primary CTA - Calculator */}
        <LinkCard
          href={`/rsu?utm_source=${source}&utm_medium=social&utm_campaign=bio_link`}
          title="Free RSU Tax Calculator"
          subtitle="Calculate your cross-border RSU taxes in 10 minutes"
          primary
          badge="Most Popular"
        />

        {/* Tax Calculator */}
        <LinkCard
          href={`/tax-calculator?utm_source=${source}&utm_medium=social&utm_campaign=bio_link`}
          title="Cross-Border Tax Estimator"
          subtitle="See what you owe in both US and Canada"
        />

        {/* Blog */}
        <LinkCard
          href={`/blog?utm_source=${source}&utm_medium=social&utm_campaign=bio_link`}
          title="Tax Education Blog"
          subtitle="In-depth guides for H-1B & TN workers"
        />

        {/* Free Checklist */}
        <LinkCard
          href={`/forms-checklist?utm_source=${source}&utm_medium=social&utm_campaign=bio_link`}
          title="Free Filing Checklist"
          subtitle="Every form you need for US-Canada dual filing"
          badge="Free Download"
        />

        {/* Pricing */}
        <LinkCard
          href={`/pricing?utm_source=${source}&utm_medium=social&utm_campaign=bio_link`}
          title="Plans & Pricing"
          subtitle="Start free. Premium from $49/year"
        />

        {/* For CPAs / Enterprise */}
        <LinkCard
          href={`/enterprise?utm_source=${source}&utm_medium=social&utm_campaign=bio_link`}
          title="For CPAs & Enterprises"
          subtitle="White-label cross-border tools for your practice"
          badge="B2B"
        />

        {/* Separator */}
        <div className="pt-4">
          <div className="border-t border-slate-800" />
        </div>

        {/* Social proof */}
        <div className="bg-slate-800/30 rounded-2xl p-6 text-center">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-2xl font-bold text-emerald-400">$12K</div>
              <div className="text-xs text-slate-400">Avg. Savings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">10min</div>
              <div className="text-xs text-slate-400">vs 3 Hours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">$0</div>
              <div className="text-xs text-slate-400">vs $3K CPA</div>
            </div>
          </div>
          <p className="text-sm text-slate-300 italic">
            &ldquo;I was overpaying $8,000/year in taxes because I wasn&apos;t claiming the Foreign Tax Credit properly. TaxBridge caught it in minutes.&rdquo;
          </p>
          <p className="text-xs text-slate-500 mt-2">
            — Software Engineer, ex-Google, H-1B → Canada
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <TrustBadge text="SOC 2 Compliant" />
          <TrustBadge text="256-bit SSL" />
          <TrustBadge text="No data sold" />
        </div>

        {/* Follow us */}
        <div className="text-center pt-6 pb-8">
          <p className="text-xs text-slate-500 mb-3">Follow us for daily tax tips</p>
          <div className="flex justify-center gap-4">
            <a
              href="https://instagram.com/taxbridge.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-pink-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://tiktok.com/@taxbridge.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.3 6.3 0 001.86-4.49V8.76a8.26 8.26 0 004.72 1.48V6.8a4.84 4.84 0 01-1-.11z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkCard({
  href,
  title,
  subtitle,
  primary = false,
  badge,
}: {
  href: string;
  title: string;
  subtitle: string;
  primary?: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
        primary
          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
          : 'bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${primary ? 'text-white' : 'text-slate-200'}`}>
              {title}
            </h3>
            {badge && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                primary
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {badge}
              </span>
            )}
          </div>
          <p className={`text-sm mt-0.5 ${primary ? 'text-emerald-100' : 'text-slate-400'}`}>
            {subtitle}
          </p>
        </div>
        <svg className={`w-5 h-5 ${primary ? 'text-white' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function TrustBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-800/30 rounded-full px-3 py-1">
      <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {text}
    </span>
  );
}

export default function SocialLandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SocialLandingContent />
    </Suspense>
  );
}
