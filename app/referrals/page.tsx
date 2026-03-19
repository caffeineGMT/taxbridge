/**
 * User Referral Program Dashboard
 * Viral loop mechanics: earn $10 credits by referring friends
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfileByClerkId } from '@/lib/db';
import {
  getUserReferralCode,
  getUserReferralStats,
  getUserReferrals,
  getCurrentMonthLeaderboard,
  getUserLeaderboardPosition,
} from '@/lib/db/queries/referrals';
import { getCreditSummary, getCreditTransactions } from '@/lib/db/queries/credits';
import { generateSocialMessages } from '@/lib/stripe/referral-tracking';
import { TrendingUp, Users, DollarSign, Gift, Crown, Award, Medal, Twitter, Linkedin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/referral-components';
import { InviteFriendsModal } from '@/components/referral/InviteFriendsModal';
import { CreditsDashboard } from '@/components/CreditsDashboard';
import {
  ReferralLinkCopyTracked,
  SocialShareButtonTracked,
  EmailShareButtonTracked,
  ShareRateProgress,
} from '@/components/referral/TrackedShareButtons';
import {
  getUserViralMetrics,
  getUserClickStats,
  getUserShareStats,
  getGlobalShareRate,
} from '@/lib/db/queries/referral-tracking';

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect('/sign-in?redirect_url=/referrals');
  }

  const user = await getUserProfileByClerkId(clerkUserId);

  if (!user) {
    return <div>User not found</div>;
  }

  // Get or generate referral code
  const referralCode = getUserReferralCode(user.id);
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${referralCode}`;

  // Get stats
  const stats = getUserReferralStats(user.id);
  const referrals = getUserReferrals(user.id);
  const leaderboard = getCurrentMonthLeaderboard(10);
  const userPosition = getUserLeaderboardPosition(user.id);

  // Get tracking stats
  const viralMetrics = getUserViralMetrics(user.id);
  const clickStats = getUserClickStats(user.id);
  const shareStats = getUserShareStats(user.id);
  const globalShareRate = getGlobalShareRate();

  // Get credits summary and transactions
  const creditsSummary = getCreditSummary(user.id);
  const creditTransactions = getCreditTransactions(user.id, 20);

  // Generate social messages
  const socialMessages = generateSocialMessages(referralCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8">
      <div className="max-width mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
            <Gift className="w-4 h-4" />
            Referral Program
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Earn $10 Credits
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Share TaxBridge with colleagues and get <span className="text-emerald-400 font-semibold">$10 credit</span> for every friend who subscribes to Pro. They get <span className="text-emerald-400 font-semibold">20% off</span> their first year!
          </p>
        </div>

        {/* Credits Dashboard */}
        <CreditsDashboard summary={creditsSummary} transactions={creditTransactions} />

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
              <div className="text-3xl font-bold text-white">{stats.total_referrals}</div>
              <p className="text-xs text-slate-400 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Successful Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">{stats.successful_conversions}</div>
              <p className="text-xs text-slate-400 mt-1">
                {stats.total_referrals > 0
                  ? `${Math.round((stats.successful_conversions / stats.total_referrals) * 100)}% conversion rate`
                  : 'Start referring!'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Rewards Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ${stats.rewards_earned.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {Math.floor(stats.rewards_earned / 10)} referrals @ $10 each
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Pending Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">{stats.pending_referrals}</div>
              <p className="text-xs text-slate-400 mt-1">Waiting to subscribe</p>
            </CardContent>
          </Card>
        </div>

        {/* Viral Growth Metrics */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Viral Growth Metrics
            </CardTitle>
            <CardDescription className="text-slate-400">
              Track your referral link performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Total Shares</div>
                <div className="text-3xl font-bold text-white">{shareStats.total_shares}</div>
                <div className="text-xs text-slate-500">
                  {shareStats.shares_last_7_days} in last 7 days
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Total Clicks</div>
                <div className="text-3xl font-bold text-white">{clickStats.total_clicks}</div>
                <div className="text-xs text-slate-500">
                  {clickStats.clicks_last_7_days} in last 7 days
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Conversion Rate</div>
                <div className="text-3xl font-bold text-emerald-400">
                  {viralMetrics.conversion_rate.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">
                  {viralMetrics.conversions} conversions from {viralMetrics.clicks} clicks
                </div>
              </div>
            </div>

            {/* Share platforms breakdown */}
            {shareStats.shares_by_platform.length > 0 && (
              <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-3">Shares by Platform</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {shareStats.shares_by_platform.map((item) => (
                    <div key={item.platform} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 capitalize">{item.platform.replace('_', ' ')}</span>
                      <span className="text-white font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Global share rate progress */}
            <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-3">Community Share Rate</h4>
              <ShareRateProgress
                totalUsers={globalShareRate.total_users}
                usersWhoShared={globalShareRate.users_who_shared}
                targetPercent={globalShareRate.target_percent}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Referral Link & Social Sharing */}
          <div className="lg:col-span-2 space-y-6">
            {/* Referral Link Card */}
            <Card className="bg-slate-800/50 border-emerald-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Your Referral Link</CardTitle>
                <CardDescription className="text-slate-400">
                  Share this link to earn $10 credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ReferralLinkCopyTracked link={referralLink} />

                {/* Quick Tips */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">💡 Quick Tips</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Share with H-1B/TN visa colleagues dealing with cross-border taxes</li>
                    <li>• Post in company Slack channels or LinkedIn</li>
                    <li>• Referrals get 20% off ($60 savings on Pro)</li>
                    <li>• You get $10 credit when they subscribe</li>
                  </ul>
                </div>

                {/* Social Sharing Buttons */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white">Share on social media</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SocialShareButtonTracked
                      platform="Twitter"
                      icon={Twitter}
                      message={socialMessages.twitter}
                      color="bg-blue-500 hover:bg-blue-600"
                    />
                    <SocialShareButtonTracked
                      platform="LinkedIn"
                      icon={Linkedin}
                      message={socialMessages.linkedin}
                      color="bg-blue-700 hover:bg-blue-800"
                    />
                    <EmailShareButtonTracked
                      subject="Save on US-Canada cross-border taxes"
                      body={`I recently used TaxBridge to manage my cross-border tax situation and it saved me thousands!\n\nIf you're dealing with RSU taxation across US and Canada, this tool makes it much easier.\n\nGet 20% off your first year: ${referralLink}`}
                    />
                  </div>
                </div>

                {/* Invite by Email Button */}
                <div className="pt-3 border-t border-slate-700">
                  <h4 className="text-sm font-semibold text-white mb-3">Send personal invitations</h4>
                  <InviteFriendsModal referralCode={referralCode} />
                </div>
              </CardContent>
            </Card>

            {/* Recent Referrals */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Recent Referrals</CardTitle>
                <CardDescription className="text-slate-400">
                  Track your referral activity
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
                            User #{referral.referred_user_id}
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
                          {referral.reward_value && (
                            <div className="text-sm font-semibold text-emerald-400">
                              +${referral.reward_value.toFixed(2)}
                            </div>
                          )}
                          <StatusBadge status={referral.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Leaderboard */}
          <div className="space-y-6">
            {/* User Position */}
            {userPosition && (
              <Card className="bg-gradient-to-br from-amber-900/30 to-emerald-900/30 border-amber-500/30 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    Your Rank This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-amber-400">
                      #{userPosition.rank || '—'}
                    </div>
                    <div className="text-sm text-slate-300 mt-2">
                      {userPosition.conversion_count} successful referrals
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Monthly Leaderboard */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Referrers This Month
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Top 3 win prizes!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <p className="text-sm">No referrals this month yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          entry.user_id === user.id
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-slate-900/50 border border-slate-700'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {index === 0 && <Crown className="w-6 h-6 text-amber-400" />}
                          {index === 1 && <Award className="w-6 h-6 text-slate-400" />}
                          {index === 2 && <Medal className="w-6 h-6 text-amber-600" />}
                          {index > 2 && (
                            <div className="w-6 h-6 flex items-center justify-center text-slate-500 font-bold text-sm">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {entry.email}
                          </div>
                          <div className="text-xs text-slate-400">
                            {entry.conversion_count} conversions
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-emerald-400">
                          ${entry.total_reward_value.toFixed(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prizes Card */}
            <Card className="bg-gradient-to-br from-emerald-900/30 to-blue-900/30 border-emerald-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-emerald-400" />
                  Monthly Prizes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">🥇 1st Place</span>
                    <span className="text-white font-semibold">$100 Amazon Gift Card</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">🥈 2nd Place</span>
                    <span className="text-white font-semibold">Free Enterprise Upgrade</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">🥉 3rd Place</span>
                    <span className="text-white font-semibold">1 Year Pro Extension</span>
                  </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-2xl">
                  1
                </div>
                <h4 className="font-semibold text-white">Share Your Link</h4>
                <p className="text-sm text-slate-400">
                  Send your unique referral link to colleagues, post on social media, or share via email
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-2xl">
                  2
                </div>
                <h4 className="font-semibold text-white">They Subscribe</h4>
                <p className="text-sm text-slate-400">
                  Your friend signs up and gets 20% off their first year ($60 savings on Pro)
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-2xl">
                  3
                </div>
                <h4 className="font-semibold text-white">You Get Rewarded</h4>
                <p className="text-sm text-slate-400">
                  Receive $10 credit automatically added to your account balance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
