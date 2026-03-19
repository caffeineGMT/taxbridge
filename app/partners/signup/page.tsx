/**
 * Partner Signup Page - Immigration Lawyers & CPAs
 * 30% revenue share partnership program
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartnerSignupForm } from '@/components/partners/PartnerSignupForm';
import { CheckCircle2, DollarSign, Users, TrendingUp, Briefcase, FileCheck } from 'lucide-react';

export const metadata = {
  title: 'Partner Program - TaxBridge',
  description: 'Join our partnership program and earn 30% revenue share for every client referral',
};

export default function PartnerSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
            <Briefcase className="w-4 h-4" />
            Partnership Program
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Partner with TaxBridge
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Earn <span className="text-blue-400 font-semibold">30% recurring revenue share</span> by referring H-1B and TN visa holders to our cross-border tax platform.
          </p>
        </div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">30% Commission</h3>
                  <p className="text-sm text-slate-400">Recurring revenue share on every referral</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Co-Branded Pages</h3>
                  <p className="text-sm text-slate-400">Custom landing pages for your firm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Real-Time Tracking</h3>
                  <p className="text-sm text-slate-400">Dashboard with conversion analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Benefits */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-blue-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Why Partner with TaxBridge?</CardTitle>
                <CardDescription className="text-slate-400">
                  Designed specifically for immigration lawyers and CPAs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Perfect Client Fit</h4>
                    <p className="text-sm text-slate-400">
                      Your H-1B/TN clients already need cross-border tax help. TaxBridge saves them $5K-$12K/year.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">High-Value Referrals</h4>
                    <p className="text-sm text-slate-400">
                      Pro plan: $299/year → <span className="text-emerald-400 font-semibold">$89.70/year</span> recurring commission per client
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Zero Conflict of Interest</h4>
                    <p className="text-sm text-slate-400">
                      TaxBridge handles RSU calculations only. Clients still need you for full tax prep, immigration work, and financial planning.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Marketing Support Included</h4>
                    <p className="text-sm text-slate-400">
                      We provide: email templates, social posts, blog content, and co-branded landing pages.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Monthly Payouts</h4>
                    <p className="text-sm text-slate-400">
                      Get paid on the 1st of every month via Stripe Connect or PayPal. Minimum $100 threshold.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-400" />
                  Ideal Partners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-300">Immigration Lawyers</span>
                  <span className="text-white font-semibold">H-1B/TN specialty</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-300">Cross-Border CPAs</span>
                  <span className="text-white font-semibold">US-Canada expertise</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-300">Financial Advisors</span>
                  <span className="text-white font-semibold">Tech worker clients</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-300">Immigration Consultants</span>
                  <span className="text-white font-semibold">RCIC certified</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Signup Form */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Apply to Join</CardTitle>
                <CardDescription className="text-slate-400">
                  We review all applications within 48 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PartnerSignupForm />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur mt-6">
              <CardHeader>
                <CardTitle className="text-white text-lg">Commission Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-2">Scenario: 10 referrals/month</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Revenue per client</span>
                      <span className="text-white">$299/year</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Your commission (30%)</span>
                      <span className="text-emerald-400 font-semibold">$89.70/year</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                      <span className="text-slate-300">10 clients/month</span>
                      <span className="text-white font-bold">$897/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Annual earnings</span>
                      <span className="text-emerald-400 font-bold text-lg">$10,764/year</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-300">
                    💡 <strong>Tip:</strong> Immigration lawyers typically refer 20-50 clients per year. At 30 clients, that's <strong>$2,691/year</strong> in passive income.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto text-2xl font-bold text-blue-400">
                  1
                </div>
                <h4 className="font-semibold text-white">Apply</h4>
                <p className="text-sm text-slate-400">
                  Fill out the form. We review within 48 hours.
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto text-2xl font-bold text-blue-400">
                  2
                </div>
                <h4 className="font-semibold text-white">Get Approved</h4>
                <p className="text-sm text-slate-400">
                  Receive your unique referral code and co-branded landing page.
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto text-2xl font-bold text-blue-400">
                  3
                </div>
                <h4 className="font-semibold text-white">Refer Clients</h4>
                <p className="text-sm text-slate-400">
                  Share your link with H-1B/TN clients via email, website, or in-person.
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-2xl font-bold text-emerald-400">
                  4
                </div>
                <h4 className="font-semibold text-white">Earn 30%</h4>
                <p className="text-sm text-slate-400">
                  Get paid monthly. Track everything in your partner dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-white font-semibold mb-1">What's the commission structure?</h4>
              <p className="text-sm text-slate-400">
                30% recurring revenue share on all subscriptions. Pro plan ($299/year) = $89.70/year per client, paid monthly.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">How do I get paid?</h4>
              <p className="text-sm text-slate-400">
                Monthly payouts via Stripe Connect or PayPal on the 1st of each month. $100 minimum threshold.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">Will this conflict with my existing services?</h4>
              <p className="text-sm text-slate-400">
                No. TaxBridge handles cross-border RSU tax calculations only. Clients still need immigration lawyers for visa work and CPAs for full tax prep. This is a complementary tool.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">What marketing materials do you provide?</h4>
              <p className="text-sm text-slate-400">
                Co-branded landing page, email templates, social media posts, blog content, video scripts, and banners. Everything you need to promote to your clients.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">How long does approval take?</h4>
              <p className="text-sm text-slate-400">
                We review all applications within 48 hours. Once approved, you'll receive your referral code and dashboard access immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
