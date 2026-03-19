import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'TaxBridge Privacy Policy - How we collect, use, and protect your personal information in compliance with GDPR and CCPA.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicy() {
  const lastUpdated = 'March 18, 2026';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <article className="prose prose-invert prose-slate max-w-none">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Privacy Policy</h1>
          <p className="text-slate-400 mb-8">Last Updated: {lastUpdated}</p>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-100 mt-0 mb-3">Your Privacy Matters</h2>
            <p className="text-slate-300 mb-0">
              TaxBridge is committed to protecting your privacy and handling your personal information with care.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
              use our tax calculation services.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">1. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">1.1 Personal Information</h3>
            <p className="text-slate-300 mb-4">We collect information that you provide directly to us:</p>
            <ul className="text-slate-300 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email address, password</li>
              <li><strong>Tax Data:</strong> RSU income, vesting dates, employer information, tax residency details</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store full credit card numbers)</li>
              <li><strong>Communications:</strong> Emails, support tickets, feedback</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">1.2 Automatically Collected Information</h3>
            <ul className="text-slate-300 space-y-2 mb-4">
              <li><strong>Usage Data:</strong> Pages viewed, features used, calculation history</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Cookies and Tracking:</strong> Session cookies, analytics cookies, marketing cookies</li>
              <li><strong>Analytics:</strong> We use PostHog, Google Analytics, Vercel Analytics, Meta Pixel, and Google Ads</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-300 mb-4">We use your information for the following purposes:</p>
            <ul className="text-slate-300 space-y-2">
              <li><strong>Service Delivery:</strong> Calculate taxes, generate reports, save calculation history</li>
              <li><strong>Account Management:</strong> Create and manage your account, process payments</li>
              <li><strong>Communication:</strong> Send important updates, respond to inquiries, provide customer support</li>
              <li><strong>Product Improvement:</strong> Analyze usage patterns, improve features, fix bugs</li>
              <li><strong>Marketing:</strong> Send promotional emails (you can opt-out anytime)</li>
              <li><strong>Legal Compliance:</strong> Comply with tax laws, prevent fraud, enforce our Terms of Service</li>
              <li><strong>Security:</strong> Protect against unauthorized access and ensure platform security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">3. Legal Basis for Processing (GDPR)</h2>
            <p className="text-slate-300 mb-4">For users in the European Economic Area (EEA), UK, and Switzerland:</p>
            <ul className="text-slate-300 space-y-2">
              <li><strong>Consent:</strong> When you provide explicit consent for marketing communications</li>
              <li><strong>Contract Performance:</strong> Processing necessary to deliver our tax calculation services</li>
              <li><strong>Legitimate Interests:</strong> Improving our services, fraud prevention, security</li>
              <li><strong>Legal Obligation:</strong> Compliance with tax and financial regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-slate-300 mb-4">We do not sell your personal information. We may share your information with:</p>
            <ul className="text-slate-300 space-y-2">
              <li><strong>Service Providers:</strong> Stripe (payments), Clerk (authentication), Vercel (hosting), PostHog (analytics)</li>
              <li><strong>Analytics Partners:</strong> Google Analytics, Meta Pixel (for advertising attribution)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">5. Your Privacy Rights</h2>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">5.1 GDPR Rights (EEA, UK, Switzerland)</h3>
            <ul className="text-slate-300 space-y-2 mb-4">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Restriction:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for marketing at any time</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">5.2 CCPA Rights (California Residents)</h3>
            <ul className="text-slate-300 space-y-2 mb-4">
              <li><strong>Right to Know:</strong> What personal information we collect, use, and share</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (we do not sell data)</li>
              <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">5.3 Canadian Privacy Rights (PIPEDA)</h3>
            <ul className="text-slate-300 space-y-2 mb-4">
              <li><strong>Right to Access:</strong> Access your personal information we hold</li>
              <li><strong>Right to Correction:</strong> Correct inaccurate information</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for certain uses</li>
              <li><strong>Right to Challenge:</strong> Challenge our compliance with PIPEDA</li>
            </ul>

            <p className="text-slate-300 mb-2">
              <strong>To exercise your rights, contact us at:</strong>
            </p>
            <p className="text-emerald-400">privacy@taxbridge.app</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">6. Data Retention</h2>
            <p className="text-slate-300 mb-4">We retain your information for as long as necessary to:</p>
            <ul className="text-slate-300 space-y-2">
              <li>Provide our services and maintain your account</li>
              <li>Comply with legal obligations (tax records: 7 years)</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>After account deletion, we may retain anonymized data for analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">7. Data Security</h2>
            <p className="text-slate-300 mb-4">We implement industry-standard security measures:</p>
            <ul className="text-slate-300 space-y-2">
              <li><strong>Encryption:</strong> TLS/SSL encryption for data in transit, AES-256 for data at rest</li>
              <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication</li>
              <li><strong>Regular Audits:</strong> Security assessments and penetration testing</li>
              <li><strong>Monitoring:</strong> 24/7 security monitoring with Sentry</li>
              <li><strong>Third-Party Security:</strong> SOC 2 compliant vendors (Stripe, Clerk, Vercel)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-slate-300 mb-4">We use cookies and similar technologies:</p>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">Essential Cookies</h3>
            <p className="text-slate-300 mb-4">Required for basic functionality (authentication, security)</p>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">Analytics Cookies</h3>
            <p className="text-slate-300 mb-4">PostHog, Google Analytics, Vercel Analytics - track usage and performance</p>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">Marketing Cookies</h3>
            <p className="text-slate-300 mb-4">Google Ads, Meta Pixel - measure ad campaign effectiveness</p>

            <p className="text-slate-300">
              You can control cookies through our cookie consent banner or your browser settings. Note that
              disabling cookies may affect functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">9. International Data Transfers</h2>
            <p className="text-slate-300 mb-4">
              Your information may be transferred to and processed in the United States and other countries.
              We ensure adequate safeguards through:
            </p>
            <ul className="text-slate-300 space-y-2">
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              <li>Data Processing Agreements with all vendors</li>
              <li>Privacy Shield Framework compliance (where applicable)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">10. Children's Privacy</h2>
            <p className="text-slate-300">
              TaxBridge is not intended for individuals under 18 years of age. We do not knowingly collect
              personal information from children. If you believe we have collected information from a child,
              please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">11. Third-Party Links</h2>
            <p className="text-slate-300">
              Our website may contain links to third-party websites. We are not responsible for the privacy
              practices of these external sites. Please review their privacy policies separately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">12. Do Not Track Signals</h2>
            <p className="text-slate-300">
              Some browsers support "Do Not Track" signals. Currently, our website does not respond to DNT
              signals. You can control tracking through our cookie consent banner.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">13. Changes to This Privacy Policy</h2>
            <p className="text-slate-300">
              We may update this Privacy Policy periodically. We will notify you of material changes via email
              or prominent notice on our website. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">14. Contact Us</h2>
            <p className="text-slate-300 mb-4">
              For privacy-related questions, data access requests, or to exercise your rights:
            </p>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
              <p className="text-slate-300 mb-2"><strong>Email:</strong> <span className="text-emerald-400">privacy@taxbridge.app</span></p>
              <p className="text-slate-300 mb-2"><strong>Data Protection Officer:</strong> <span className="text-emerald-400">dpo@taxbridge.app</span></p>
              <p className="text-slate-300 mb-0"><strong>Response Time:</strong> We will respond within 30 days (or as required by applicable law)</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">15. Supervisory Authority</h2>
            <p className="text-slate-300 mb-4">
              If you are located in the EEA, UK, or Switzerland, you have the right to lodge a complaint with
              your local data protection authority if you believe we have not complied with applicable data
              protection laws.
            </p>
          </section>

          <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-6 mt-12">
            <h3 className="text-xl font-semibold text-emerald-400 mb-2">Questions?</h3>
            <p className="text-slate-300 mb-0">
              We're here to help. Contact our privacy team at{' '}
              <a href="mailto:privacy@taxbridge.app" className="text-emerald-400 hover:text-emerald-300">
                privacy@taxbridge.app
              </a>
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
