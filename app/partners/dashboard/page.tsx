/**
 * Partner Dashboard
 * Track referrals, commissions, and performance
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import {
  getAffiliatePartnerByEmail,
  getAffiliateReferralsWithUser,
  getPendingCommissions,
  getPaidCommissions,
} from '@/lib/db/queries/affiliates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import { PartnerReferralLinkCopy } from '@/components/partners/PartnerReferralLinkCopy';
import { PartnerStatusBadge } from '@/components/partners/PartnerStatusBadge';

export const dynamic = 'force-dynamic';

export default async function PartnerDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/partners/dashboard');
  }

  // Get partner by Clerk email
  // TODO: Link Clerk users to affiliate_partners table properly
  // For now, we'll need the partner to log in with their application email

  const partner = getAffiliatePartnerByEmail('example@example.com'); // TODO: Get from Clerk user

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Partner Not Found</CardTitle>
              <CardDescription className="text-slate-400">
                You don't have an active partnership account. Please apply at /partners/signup
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (partner.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-white">Application Pending</CardTitle>
              <CardDescription className="text-slate-400">
                Your partnership application is under review. We'll notify you within 48 hours.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (partner.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white">Application Rejected</CardTitle>
              <CardDescription className="text-slate-400">
                {partner.rejection_reason || 'Your partnership application was not approved at this time.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Get partner stats
  const referrals = getAffiliateReferralsWithUser(partner.id);
  const pendingCommissions = getPendingCommissions(partner.id);
  const paidCommissions = getPaidCommissions(partner.id);
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${partner.referral_code}`;
  const coBrandedLink = partner.co_branded_slug
    ? `${process.env.NEXT_PUBLIC_APP_URL}/partner/${partner.co_branded_slug}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{partner.firm_name}</h1>
            <p className="text-slate-400">Partner Dashboard</p>
          </div>
          <PartnerStatusBadge status={partner.status} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{partner.total_referrals}</div>
              <p className="text-xs text-slate-400 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pending Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">${pendingCommissions.toFixed(2)}</div>
              <p className="text-xs text-slate-400 mt-1">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Paid Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">${paidCommissions.toFixed(2)}</div>
              <p className="text-xs text-slate-400 mt-1">Total earned</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Commission Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{(partner.commission_rate * 100).toFixed(0)}%</div>
              <p className="text-xs text-slate-400 mt-1">Revenue share</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Referral Links & Resources */}
          <div className="lg:col-span-2 space-y-6">
            {/* Referral Links */}
            <Card className="bg-slate-800/50 border-blue-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Your Referral Links</CardTitle>
                <CardDescription className="text-slate-400">
                  Share these links to track conversions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    Standard Referral Link
                  </label>
                  <PartnerReferralLinkCopy link={referralLink} />
                </div>

                {coBrandedLink && (
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      Co-Branded Landing Page
                    </label>
                    <PartnerReferralLinkCopy link={coBrandedLink} />
                    <a
                      href={coBrandedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline flex items-center gap-1 mt-2"
                    >
                      Preview page <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-300">
                    💡 <strong>Tip:</strong> Use your co-branded page for email signatures and website links. Use the standard link for social media posts.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Referrals */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Recent Referrals</CardTitle>
                <CardDescription className="text-slate-400">
                  Your latest referral activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No referrals yet. Start sharing your link!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referrals.slice(0, 10).map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">
                            {referral.user_masked}
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(referral.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-semibold text-emerald-400">
                            +${referral.commission_amount.toFixed(2)}
                          </div>
                          <PartnerStatusBadge status={referral.commission_status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Resources & Support */}
          <div className="space-y-6">
            {/* Marketing Toolkit */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white text-lg">Marketing Toolkit</CardTitle>
                <CardDescription className="text-slate-400">
                  Ready-to-use promotional materials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="/partners/toolkit/email-templates"
                  className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm text-white">Email Templates</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
                <a
                  href="/partners/toolkit/social-posts"
                  className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm text-white">Social Media Posts</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
                <a
                  href="/partners/toolkit/blog-content"
                  className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm text-white">Blog Articles</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
                <a
                  href="/partners/toolkit/banners"
                  className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm text-white">Banner Images</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white text-lg">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Payment Schedule</span>
                  <span className="text-white font-semibold">Monthly (1st)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Minimum Payout</span>
                  <span className="text-white font-semibold">$100</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Payment Method</span>
                  <span className="text-white font-semibold">
                    {partner.payment_method || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Next Payment</span>
                  <span className="text-emerald-400 font-semibold">
                    {pendingCommissions >= 100 ? 'April 1, 2026' : 'Pending'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white text-lg">Partner Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-400">
                <p>
                  <strong className="text-white">Email:</strong>{' '}
                  <a href="mailto:partners@taxbridgecpa.com" className="text-blue-400 hover:underline">
                    partners@taxbridgecpa.com
                  </a>
                </p>
                <p>
                  <strong className="text-white">Phone:</strong> +1 (555) 123-4567
                </p>
                <p>
                  <strong className="text-white">Hours:</strong> Mon-Fri 9am-5pm PST
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
