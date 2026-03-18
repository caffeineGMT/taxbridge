import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Users, Building2, TrendingUp, Shield, Zap, BarChart3, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'TaxBridge Enterprise | Multi-Client Dashboard for Immigration Law Firms',
  description: 'Automate cross-border tax calculations for 50+ H-1B/TN clients. White-label solution with ROI calculator, compliance tracking, and CSV import. $2K/year per seat.',
  openGraph: {
    title: 'TaxBridge Enterprise for Immigration Law Firms',
    description: 'Save 250+ hours/year with our multi-client tax dashboard. Trusted by Bay Area, Seattle, and NYC immigration firms.',
    images: ['/og-enterprise.png'],
  },
};

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-surface to-surfaceLight">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                For Immigration Law Firms
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text leading-tight">
                Automate Cross-Border Tax for Your{' '}
                <span className="text-primary">50+ H-1B Clients</span>
              </h1>

              <p className="text-xl text-textMuted leading-relaxed">
                Multi-client dashboard built for immigration law firms managing H-1B/TN visa holders who moved to Canada.
                White-label solution with compliance tracking, CSV import, and automated tax calculations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="#demo"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
                >
                  Watch 2-Minute Demo
                </Link>
                <Link
                  href="#roi-calculator"
                  className="inline-flex items-center justify-center px-8 py-4 bg-surface hover:bg-surfaceLight text-text font-semibold rounded-lg border border-border transition-colors"
                >
                  Calculate Your ROI
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-surfaceLight border-2 border-background flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-textMuted">
                  <div className="font-semibold text-text">3 firms using TaxBridge</div>
                  <div>Bay Area • Seattle • NYC</div>
                </div>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-xl p-6">
                <div className="text-4xl font-bold text-primary mb-2">250+</div>
                <div className="text-textMuted">Hours saved per year</div>
              </div>
              <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-xl p-6">
                <div className="text-4xl font-bold text-primary mb-2">$62K</div>
                <div className="text-textMuted">Value recovered annually</div>
              </div>
              <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-xl p-6">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-textMuted">Reduction in tax questions</div>
              </div>
              <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-xl p-6">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-textMuted">Clients per dashboard</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-16 sm:py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text">
              See TaxBridge Enterprise in Action
            </h2>
            <p className="text-lg text-textMuted">
              2-minute walkthrough: multi-client dashboard, CSV import, white-label PDF exports, and compliance tracking
            </p>
          </div>

          {/* Video Embed (Wistia/Loom placeholder) */}
          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-video bg-surfaceLight rounded-xl overflow-hidden border border-border shadow-2xl">
              {/* Replace with actual Wistia/Loom embed code */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="text-textMuted">
                  <div className="font-semibold text-text text-lg mb-2">Demo Video Coming Soon</div>
                  <div className="text-sm">
                    Record with Loom: Screen recording showing:
                    <ul className="mt-2 text-left max-w-md mx-auto space-y-1">
                      <li>• Multi-client dashboard overview</li>
                      <li>• CSV import workflow (bulk client upload)</li>
                      <li>• Individual client tax calculation</li>
                      <li>• White-label PDF export</li>
                      <li>• Compliance tracking (who&apos;s filed vs. at-risk)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actual embed code will look like:
              <iframe
                src="https://fast.wistia.net/embed/iframe/YOUR_VIDEO_ID"
                title="TaxBridge Enterprise Demo"
                allow="autoplay; fullscreen"
                className="absolute inset-0 w-full h-full"
              />
              */}
            </div>
          </div>

          {/* Key Features Below Video */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
            {[
              { icon: Users, title: 'Multi-Client Dashboard', desc: 'Manage 50+ clients in one view' },
              { icon: FileText, title: 'CSV Import', desc: 'Bulk upload client data' },
              { icon: Shield, title: 'Compliance Tracking', desc: 'See who hasn&apos;t filed yet' },
              { icon: Zap, title: 'White-Label', desc: 'Your firm&apos;s branding' }
            ].map((feature, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-6 text-center">
                <feature.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="font-semibold text-text mb-1">{feature.title}</div>
                <div className="text-sm text-textMuted">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section id="roi-calculator" className="py-16 sm:py-24 bg-surface/30 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-text">
                Calculate Your Firm&apos;s ROI
              </h2>
              <p className="text-lg text-textMuted">
                See how much time and money your firm could save with TaxBridge Enterprise
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-8">
              <div className="space-y-6">
                {/* Firm Name */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Firm Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Berry Appleman & Leiden LLP"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Number of Attorneys */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Number of Attorneys</label>
                  <input
                    type="number"
                    placeholder="e.g., 50"
                    defaultValue={50}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* H-1B/TN Clients per Year */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">H-1B/TN Clients per Year</label>
                  <input
                    type="number"
                    placeholder="e.g., 200"
                    defaultValue={200}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Hours Spent on Tax Questions per Week */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Hours Spent on Tax Questions per Week</label>
                  <input
                    type="number"
                    placeholder="e.g., 5"
                    defaultValue={5}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-sm text-textMuted mt-1">
                    Include paralegal + attorney time answering client questions about cross-border tax
                  </p>
                </div>

                {/* Billable Rate */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Average Billable Rate ($/hour)</label>
                  <input
                    type="number"
                    placeholder="e.g., 250"
                    defaultValue={250}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Calculate Button */}
                <button className="w-full px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors">
                  Calculate ROI
                </button>

                {/* Results (show after calculation) */}
                <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-lg space-y-4">
                  <div className="text-lg font-bold text-primary">Your Estimated Savings</div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-text">250 hours/year</div>
                      <div className="text-sm text-textMuted">Time saved</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-text">$62,500/year</div>
                      <div className="text-sm text-textMuted">Value recovered</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-sm text-textMuted space-y-2">
                      <div>✅ 95% reduction in client tax questions</div>
                      <div>✅ Zero training required for clients</div>
                      <div>✅ Compliance tracking reduces firm liability</div>
                      <div>✅ White-label branding improves client experience</div>
                    </div>
                  </div>

                  <Link
                    href="#trial"
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
                  >
                    Start 30-Day Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 sm:py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text">
              What Immigration Firms Are Saying
            </h2>
            <p className="text-lg text-textMuted">
              Real results from firms using TaxBridge Enterprise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "Our clients love it. We used to get 10+ emails/day asking about RSU taxation. Now we just send them the TaxBridge link and they self-serve. Game changer.",
                author: "Managing Partner",
                firm: "50-attorney firm, San Francisco",
                metric: "90% reduction in support emails"
              },
              {
                quote: "The multi-client dashboard is incredible. We can see which clients haven't completed their tax calculations yet and send them reminders. Reduces our compliance risk.",
                author: "Immigration Director",
                firm: "30-attorney firm, Seattle",
                metric: "100% client compliance tracking"
              },
              {
                quote: "ROI was immediate. We recovered 200 hours in the first quarter alone. That's $50K in billable time we can now allocate to revenue-generating work.",
                author: "Partner",
                firm: "25-attorney firm, New York",
                metric: "$50K recovered in Q1"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-8">
                <div className="text-primary mb-4">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-textMuted mb-6 leading-relaxed">{testimonial.quote}</p>
                <div className="border-t border-border pt-4">
                  <div className="font-semibold text-text">{testimonial.author}</div>
                  <div className="text-sm text-textMuted mb-2">{testimonial.firm}</div>
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {testimonial.metric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 bg-surface/30 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text">
              Enterprise Features
            </h2>
            <p className="text-lg text-textMuted">
              Everything you need to manage cross-border tax for 50+ clients
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Users,
                title: 'Multi-Client Dashboard',
                description: 'Manage 50, 100, or 200+ clients in one unified view. Filter by status, deadline, or employer.'
              },
              {
                icon: FileText,
                title: 'CSV Bulk Import',
                description: 'Upload client data in bulk via CSV. Pre-fill employer (Meta, Amazon, Google, Microsoft), RSU vesting dates, FMV.'
              },
              {
                icon: Shield,
                title: 'Compliance Tracking',
                description: 'See which clients have completed their tax calculations vs. who\'s at risk. Export compliance reports.'
              },
              {
                icon: Zap,
                title: 'White-Label Branding',
                description: 'Customize with your firm logo, colors, and domain. Looks like your internal tool, not a third-party app.'
              },
              {
                icon: BarChart3,
                title: 'Analytics & Reporting',
                description: 'Track usage, completion rates, and client satisfaction. Export PDF reports for compliance audits.'
              },
              {
                icon: TrendingUp,
                title: 'ROI Tracking',
                description: 'Measure time saved, support tickets avoided, and billable hours recovered. Built-in ROI dashboard.'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-6">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-bold text-text mb-2">{feature.title}</h3>
                <p className="text-textMuted text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="trial" className="py-16 sm:py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text">
              Enterprise Pricing
            </h2>
            <p className="text-lg text-textMuted">
              Simple, transparent pricing with no hidden fees
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-surface border-2 border-primary rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="px-4 py-1 bg-primary text-white text-sm font-bold rounded-full">
                  MOST POPULAR
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-text mb-2">
                  $2,000<span className="text-2xl text-textMuted">/year</span>
                </div>
                <div className="text-textMuted">per seat • 50-seat minimum</div>
                <div className="text-sm text-textMuted mt-1">Total: $100,000/year</div>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  'Multi-client dashboard (unlimited clients)',
                  'CSV bulk import',
                  'White-label branding',
                  'Compliance tracking & reporting',
                  'Priority support (4-hour response time)',
                  'Personal onboarding call',
                  'Quarterly business reviews',
                  'Custom integrations available'
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-textMuted">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Link
                  href="mailto:enterprise@taxbridge.app?subject=30-Day Free Trial Request"
                  className="block text-center px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
                >
                  Start 30-Day Free Trial
                </Link>
                <p className="text-center text-sm text-textMuted">
                  No credit card required • Full access • Cancel anytime
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-border text-center">
                <div className="text-sm text-textMuted">
                  Questions? Email{' '}
                  <a href="mailto:enterprise@taxbridge.app" className="text-primary hover:underline">
                    enterprise@taxbridge.app
                  </a>
                  {' '}or schedule a call
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-surface to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-text">
              Ready to Save 250+ Hours per Year?
            </h2>
            <p className="text-lg text-textMuted">
              Join 3 immigration law firms already using TaxBridge Enterprise. 30-day free trial, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="mailto:enterprise@taxbridge.app?subject=30-Day Free Trial Request"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="mailto:enterprise@taxbridge.app?subject=Schedule Demo"
                className="inline-flex items-center justify-center px-8 py-4 bg-surface hover:bg-surfaceLight text-text font-semibold rounded-lg border border-border transition-colors"
              >
                Schedule Demo Call
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
