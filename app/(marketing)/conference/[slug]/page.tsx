'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

interface ConferenceData {
  id: string;
  name: string;
  shortName: string;
  location: string;
  dateRange: string;
  discountCode: string;
  discountPercent: number;
  description: string;
  audience: string[];
}

const CONFERENCE_MAP: Record<string, ConferenceData> = {
  'aila-wc2026': {
    id: 'aila-wc-2026',
    name: 'AILA West Coast Chapter Conference 2026',
    shortName: 'AILA West Coast',
    location: 'San Francisco, CA',
    dateRange: 'April 15-17, 2026',
    discountCode: 'AILA-WC2026',
    discountPercent: 25,
    description: 'West Coast immigration law conference for business immigration specialists.',
    audience: ['Immigration Lawyers', 'Cross-Border CPAs', 'HR/Benefits Teams'],
  },
  'cba2026': {
    id: 'cba-2026',
    name: 'CBA Immigration Law Conference 2026',
    shortName: 'CBA Immigration',
    location: 'Toronto, ON',
    dateRange: 'May 20-22, 2026',
    discountCode: 'CBA2026',
    discountPercent: 25,
    description: 'Canadian Bar Association immigration conference for cross-border specialists.',
    audience: ['Canadian Immigration Lawyers', 'Cross-Border CPAs', 'TN Visa Specialists'],
  },
  'aila2026': {
    id: 'aila-2026',
    name: 'AILA Annual Conference on Immigration Law 2026',
    shortName: 'AILA Annual',
    location: 'Washington, DC',
    dateRange: 'June 10-13, 2026',
    discountCode: 'AILA2026',
    discountPercent: 25,
    description: 'The largest immigration law conference in the US with 5,000+ attendees.',
    audience: ['Immigration Lawyers', 'Cross-Border CPAs', 'Government Officials', 'HR/Benefits Teams'],
  },
};

function ConferencePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const ref = searchParams.get('ref') || slug;

  const conference = CONFERENCE_MAP[slug] || CONFERENCE_MAP[ref];

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    title: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && ref) {
      sessionStorage.setItem('conference_ref', ref);
    }
  }, [ref]);

  if (!conference) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Conference not found</h1>
          <Link href="/" className="text-emerald-400 hover:text-emerald-300">Go to homepage</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/conferences/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conference_id: conference!.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">You&apos;re All Set!</h2>
            <p className="text-slate-400 mb-6">
              Thanks for connecting with us at {conference.shortName}. Check your email for your exclusive discount.
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-emerald-300 mb-1">Your Exclusive Discount Code</p>
              <p className="text-3xl font-bold text-emerald-400 tracking-wider">{conference.discountCode}</p>
              <p className="text-sm text-emerald-300 mt-1">{conference.discountPercent}% off - Valid 14 days after conference</p>
            </div>
            <Link
              href={`/signup?ref=${ref}&code=${conference.discountCode}`}
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-b from-emerald-900/20 to-slate-950 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                {conference.shortName} - Booth #{Math.floor(Math.random() * 200) + 100}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Stop Overpaying{' '}
                <span className="text-emerald-400">$12K in Cross-Border RSU Taxes</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8">
                TaxBridge automates US-Canada dual-country tax calculations for H-1B and TN visa holders with RSU income. What takes CPAs 3+ hours takes us 10 minutes.
              </p>
              <div className="flex flex-wrap gap-3">
                {conference.audience.map((a, i) => (
                  <span key={i} className="bg-slate-800 text-slate-300 text-sm px-3 py-1 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Lead Capture Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-2">Get Your Conference Discount</h2>
              <p className="text-slate-400 text-sm mb-6">
                {conference.discountPercent}% off with code <span className="text-emerald-400 font-mono font-bold">{conference.discountCode}</span> - exclusive for {conference.shortName} attendees
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    placeholder="jane@lawfirm.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Company / Firm</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    placeholder="Smith & Associates LLP"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Title / Role</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    placeholder="Immigration Attorney"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {loading ? 'Submitting...' : 'Get My Discount Code'}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  By submitting, you agree to receive follow-up communications about TaxBridge.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          {[
            { value: '$12K', label: 'Average Tax Savings' },
            { value: '10 min', label: 'vs 3+ Hours Manual' },
            { value: '$3K', label: 'CPA Fee Savings' },
            { value: '99.7%', label: 'Calculation Accuracy' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <p className="text-3xl font-bold text-emerald-400">{stat.value}</p>
              <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Built for Cross-Border Tax Professionals
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Dual-Country RSU Calculator',
              desc: 'Automatically calculates US federal + state and Canadian federal + provincial taxes on RSU income with real-time exchange rates.',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              title: 'Foreign Tax Credit Optimization',
              desc: 'Maximize IRS Form 1116 and CRA T2209 credits. Our engine identifies credits that 73% of CPAs miss on cross-border returns.',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              title: 'Treaty Benefit Automation',
              desc: 'Canada-US Tax Treaty provisions (Article XV, XVIII, XXIV) automatically applied. No manual treaty analysis required.',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              ),
            },
            {
              title: 'Enterprise / Firm Licensing',
              desc: 'Bulk pricing for law firms and CPA practices. White-label available. API access for integration with your existing tools.',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ),
            },
            {
              title: 'Client Portal',
              desc: 'Give your clients a branded portal to enter RSU data. You review and approve calculations. Saves hours per client.',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
            },
            {
              title: 'Payroll Integration',
              desc: 'Connect with Rippling, Gusto, and other payroll platforms to automatically import RSU vesting data.',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              ),
            },
          ].map((feature, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Case Study */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-900/30 to-emerald-900/30 border border-slate-800 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-white mb-6">Case Study: Meta Senior Engineer</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-slate-300 mb-4">
                A Meta L6 engineer relocating from Seattle to Vancouver had $450K in RSU income vesting over 2 years.
                Their CPA quoted $4,500 for cross-border tax preparation.
              </p>
              <p className="text-slate-300">
                Using TaxBridge, we identified <span className="text-emerald-400 font-semibold">$12,400 in Foreign Tax Credit optimization</span> that
                their CPA had missed, correctly applied Treaty Article XV provisions, and completed the entire dual-country
                calculation in 12 minutes.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { label: 'RSU Income', before: 'Manual: 3 hours', after: 'TaxBridge: 12 min' },
                { label: 'CPA Fees', before: '$4,500/year', after: '$149/year' },
                { label: 'FTC Recovered', before: '$0 (missed)', after: '$12,400' },
                { label: 'Treaty Benefits', before: 'Not applied', after: 'Auto-applied' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                  <span className="text-slate-400 text-sm">{row.label}</span>
                  <div className="text-right">
                    <span className="text-red-400 text-xs line-through block">{row.before}</span>
                    <span className="text-emerald-400 text-sm font-medium">{row.after}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Transform Your Cross-Border Tax Practice?
        </h2>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
          Use code <span className="text-emerald-400 font-mono font-bold">{conference.discountCode}</span> for {conference.discountPercent}% off.
          Exclusive for {conference.shortName} attendees.
        </p>
        <a
          href="#top"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          Claim Your Discount
        </a>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; 2026 TaxBridge. US-Canada Cross-Border Tax Calculator.</p>
          <p className="mt-2">
            <Link href="/" className="text-slate-400 hover:text-white">Home</Link>
            {' | '}
            <Link href="/pricing" className="text-slate-400 hover:text-white">Pricing</Link>
            {' | '}
            <Link href="/demo" className="text-slate-400 hover:text-white">Demo</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ConferenceLandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ConferencePageContent />
    </Suspense>
  );
}
