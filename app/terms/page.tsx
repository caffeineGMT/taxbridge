import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'TaxBridge Terms of Service - Legal terms and conditions for using our cross-border tax calculation services.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Terms of Service</h1>
          <p className="text-slate-400 mb-8">Last Updated: {lastUpdated}</p>

          <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-amber-400 mt-0 mb-3">Important Legal Notice</h2>
            <p className="text-slate-300 mb-0">
              <strong>DISCLAIMER:</strong> TaxBridge is a tax estimation tool for informational purposes only.
              It is NOT a substitute for professional tax advice. Tax calculations are estimates based on
              general tax rules and may not reflect your specific situation. Always consult a licensed tax
              professional or CPA before making tax decisions or filing returns.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">1. Agreement to Terms</h2>
            <p className="text-slate-300 mb-4">
              By accessing or using TaxBridge ("Service", "Platform", "Website"), you agree to be bound by
              these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not
              access the Service.
            </p>
            <p className="text-slate-300">
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">2. Service Description</h2>
            <p className="text-slate-300 mb-4">TaxBridge provides:</p>
            <ul className="text-slate-300 space-y-2">
              <li>Cross-border tax estimation tools for US-Canada tax calculations</li>
              <li>RSU income tax calculations with Foreign Tax Credit optimization</li>
              <li>Tax filing checklists and educational resources</li>
              <li>Multi-year tax comparison tools</li>
              <li>Export capabilities (PDF, CSV)</li>
            </ul>
            <p className="text-slate-300 mt-4">
              <strong>The Service is an estimation tool only.</strong> It does not file taxes, provide legal
              advice, or guarantee accuracy for your specific situation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">3. Eligibility</h2>
            <p className="text-slate-300 mb-4">You must meet the following requirements to use the Service:</p>
            <ul className="text-slate-300 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be prohibited from using the Service under applicable laws</li>
              <li>Provide accurate and complete registration information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">4. User Accounts</h2>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">4.1 Account Creation</h3>
            <p className="text-slate-300 mb-4">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="text-slate-300 space-y-2 mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">4.2 Account Termination</h3>
            <p className="text-slate-300">
              We reserve the right to suspend or terminate your account at any time for violations of these
              Terms, fraudulent activity, or at our sole discretion. You may delete your account at any time
              through account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">5. Subscription Plans and Payment</h2>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">5.1 Free and Paid Plans</h3>
            <p className="text-slate-300 mb-4">We offer both free and paid subscription tiers:</p>
            <ul className="text-slate-300 space-y-2 mb-4">
              <li><strong>Free Tier:</strong> Limited calculations and basic features</li>
              <li><strong>Pro Tier:</strong> Unlimited calculations, multi-year tracking, priority support</li>
              <li><strong>Enterprise Tier:</strong> Custom solutions for organizations</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">5.2 Billing</h3>
            <ul className="text-slate-300 space-y-2 mb-4">
              <li>Subscriptions are billed monthly or annually in advance</li>
              <li>Payments are processed securely through Stripe</li>
              <li>All fees are in USD unless otherwise stated</li>
              <li>Price changes will be communicated 30 days in advance</li>
              <li>Taxes may apply based on your location</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">5.3 Refund Policy</h3>
            <p className="text-slate-300">
              We offer a 14-day money-back guarantee for new subscriptions. After 14 days, fees are
              non-refundable. Contact support@taxbridge.app for refund requests.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">6. Cancellation</h2>
            <p className="text-slate-300 mb-4">
              You may cancel your subscription at any time:
            </p>
            <ul className="text-slate-300 space-y-2">
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>You retain access to paid features until the period ends</li>
              <li>No refunds for partial billing periods</li>
              <li>Your data will be retained per our Privacy Policy unless you request deletion</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">7. Tax Disclaimer and Limitations</h2>

            <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-red-400 mt-0 mb-3">CRITICAL DISCLAIMER</h3>
              <p className="text-slate-300 mb-2">
                <strong>TaxBridge is a tax ESTIMATION tool only.</strong> By using this Service, you acknowledge:
              </p>
              <ul className="text-slate-300 space-y-2 mb-0">
                <li>Tax calculations are estimates based on general tax formulas</li>
                <li>Estimates may not reflect your specific tax situation</li>
                <li>We are NOT tax professionals, CPAs, or licensed tax advisors</li>
                <li>The Service does NOT constitute tax, legal, or financial advice</li>
                <li>You are solely responsible for the accuracy of your tax filings</li>
                <li>We are NOT liable for any tax errors, penalties, or interest charges</li>
                <li>Always consult a licensed tax professional before filing</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">7.1 No Guarantee of Accuracy</h3>
            <p className="text-slate-300 mb-4">
              While we strive for accuracy, tax calculations may contain errors or omissions due to:
            </p>
            <ul className="text-slate-300 space-y-2">
              <li>Changes in tax laws and regulations</li>
              <li>Complexity of individual tax situations</li>
              <li>User input errors or incomplete data</li>
              <li>Software bugs or calculation errors</li>
              <li>Exchange rate fluctuations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">8. Acceptable Use Policy</h2>
            <p className="text-slate-300 mb-4">You agree NOT to:</p>
            <ul className="text-slate-300 space-y-2">
              <li>Use the Service for illegal purposes or tax fraud</li>
              <li>Violate any laws, regulations, or third-party rights</li>
              <li>Attempt to circumvent security features or rate limits</li>
              <li>Reverse engineer, decompile, or extract source code</li>
              <li>Use automated tools (bots, scrapers) without permission</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Impersonate others or provide false information</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Share your account credentials with others</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">9. Intellectual Property</h2>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">9.1 Our IP</h3>
            <p className="text-slate-300 mb-4">
              All content, features, and functionality (including text, graphics, logos, code, calculators) are
              owned by TaxBridge and protected by copyright, trademark, and other laws. You may not:
            </p>
            <ul className="text-slate-300 space-y-2 mb-4">
              <li>Copy, modify, or create derivative works</li>
              <li>Distribute, sell, or sublicense our content</li>
              <li>Use our trademarks without written permission</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">9.2 Your Data</h3>
            <p className="text-slate-300">
              You retain ownership of the tax data you input. By using the Service, you grant us a limited
              license to process your data to provide the Service. See our Privacy Policy for details.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">10. Third-Party Services</h2>
            <p className="text-slate-300 mb-4">We integrate with third-party services:</p>
            <ul className="text-slate-300 space-y-2">
              <li><strong>Stripe:</strong> Payment processing (subject to Stripe's Terms)</li>
              <li><strong>Clerk:</strong> Authentication (subject to Clerk's Terms)</li>
              <li><strong>Vercel:</strong> Hosting and deployment</li>
              <li><strong>PostHog:</strong> Analytics</li>
              <li><strong>Stock APIs:</strong> Real-time stock price data</li>
            </ul>
            <p className="text-slate-300 mt-4">
              We are not responsible for third-party services, their availability, or their terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">11. Disclaimers</h2>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <p className="text-slate-300 mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
                IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="text-slate-300 space-y-2 mb-0">
                <li>Warranties of merchantability, fitness for a particular purpose</li>
                <li>Non-infringement or accuracy of content</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Security of data or freedom from viruses</li>
                <li>Accuracy of tax calculations or compliance with tax laws</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">12. Limitation of Liability</h2>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <p className="text-slate-300 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, TAXBRIDGE SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="text-slate-300 space-y-2">
                <li>Tax penalties, interest charges, or IRS/CRA audits</li>
                <li>Lost profits, revenue, data, or business opportunities</li>
                <li>Indirect, incidental, special, or consequential damages</li>
                <li>Errors in tax calculations or advice from the Service</li>
                <li>Unauthorized access to your account or data</li>
              </ul>
              <p className="text-slate-300 mt-4 mb-0">
                <strong>Our total liability to you shall not exceed the amount you paid us in the past 12 months,
                or $100, whichever is greater.</strong>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">13. Indemnification</h2>
            <p className="text-slate-300">
              You agree to indemnify, defend, and hold harmless TaxBridge, its officers, employees, and agents
              from any claims, damages, losses, or expenses (including legal fees) arising from:
            </p>
            <ul className="text-slate-300 space-y-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any laws or third-party rights</li>
              <li>Tax filing errors or penalties resulting from your use of estimates</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">14. Data Privacy and Security</h2>
            <p className="text-slate-300">
              Your use of the Service is also governed by our{' '}
              <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">
                Privacy Policy
              </Link>
              . We implement reasonable security measures but cannot guarantee absolute security. You are
              responsible for maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">15. Modifications to Service</h2>
            <p className="text-slate-300">
              We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any
              time, with or without notice. We will not be liable to you or any third party for any
              modification, suspension, or discontinuance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">16. Changes to Terms</h2>
            <p className="text-slate-300">
              We may update these Terms from time to time. Material changes will be notified via email or
              prominent notice on the Service. Continued use after changes constitutes acceptance. If you
              disagree with changes, you must stop using the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">17. Governing Law and Disputes</h2>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">17.1 Governing Law</h3>
            <p className="text-slate-300 mb-4">
              These Terms are governed by the laws of the State of California, United States, without regard
              to conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-slate-200 mb-3">17.2 Dispute Resolution</h3>
            <p className="text-slate-300 mb-4">
              Any disputes arising from these Terms or the Service shall be resolved through:
            </p>
            <ol className="text-slate-300 space-y-2">
              <li><strong>Informal Negotiation:</strong> Contact support@taxbridge.app to resolve disputes informally</li>
              <li><strong>Arbitration:</strong> If informal resolution fails, disputes shall be resolved through binding arbitration under the American Arbitration Association (AAA) rules</li>
              <li><strong>Class Action Waiver:</strong> You agree to resolve disputes individually, not as part of a class action</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">18. Severability</h2>
            <p className="text-slate-300">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions
              will continue in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">19. Entire Agreement</h2>
            <p className="text-slate-300">
              These Terms, together with our Privacy Policy and any other legal notices or agreements,
              constitute the entire agreement between you and TaxBridge regarding the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">20. Contact Information</h2>
            <p className="text-slate-300 mb-4">For questions about these Terms:</p>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
              <p className="text-slate-300 mb-2"><strong>Email:</strong> <span className="text-emerald-400">legal@taxbridge.app</span></p>
              <p className="text-slate-300 mb-2"><strong>Support:</strong> <span className="text-emerald-400">support@taxbridge.app</span></p>
              <p className="text-slate-300 mb-0"><strong>Business Inquiries:</strong> <span className="text-emerald-400">hello@taxbridge.app</span></p>
            </div>
          </section>

          <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-6 mt-12">
            <h3 className="text-xl font-semibold text-emerald-400 mb-2">Acknowledgment</h3>
            <p className="text-slate-300 mb-0">
              BY USING TAXBRIDGE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY
              THESE TERMS OF SERVICE.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
