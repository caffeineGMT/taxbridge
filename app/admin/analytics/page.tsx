import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';
import {
  getConversionFunnel,
  getDAU,
  getFeatureUsage,
  getMRR,
} from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default async function AnalyticsPage() {
  // Check authentication
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user details from Clerk
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  // Check if user is admin (via Clerk public metadata)
  const isAdmin = user.publicMetadata?.role === 'admin';

  if (!isAdmin) {
    redirect('/dashboard');
  }

  // Fetch analytics data
  const conversionFunnel = getConversionFunnel();
  const dauData = getDAU(30);
  const featureUsage = getFeatureUsage();
  const mrrData = getMRR();

  // Calculate conversion rates
  const profileCompletionRate = conversionFunnel.signups > 0
    ? (conversionFunnel.profileCompleted / conversionFunnel.signups) * 100
    : 0;

  const firstRSURate = conversionFunnel.profileCompleted > 0
    ? (conversionFunnel.firstRSU / conversionFunnel.profileCompleted) * 100
    : 0;

  const overallConversionRate = conversionFunnel.signups > 0
    ? (conversionFunnel.upgradedToPro / conversionFunnel.signups) * 100
    : 0;

  const totalActiveUsers = dauData.reduce((max, day) => Math.max(max, day.count), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="text-2xl font-bold text-emerald-500">
            TaxBridge <span className="text-slate-600">/</span> <span className="text-slate-400 text-base">Admin Analytics</span>
          </Link>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Admin Analytics Dashboard</h1>
          <p className="text-slate-400">Real-time metrics, conversion funnel, and revenue analytics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Total Signups</CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-400">{conversionFunnel.signups}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-slate-500">
                <Users className="h-4 w-4 mr-1" />
                All-time registrations
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Free → Pro Conversion</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-400">{overallConversionRate.toFixed(1)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-slate-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                {conversionFunnel.upgradedToPro} paid users
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Monthly Recurring Revenue</CardDescription>
              <CardTitle className="text-3xl font-bold text-purple-400">${mrrData.totalMRR.toLocaleString('en-US', { maximumFractionDigits: 0 })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-slate-500">
                <DollarSign className="h-4 w-4 mr-1" />
                ${mrrData.totalAnnual.toLocaleString('en-US', { maximumFractionDigits: 0 })} ARR
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Peak DAU (30d)</CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-400">{totalActiveUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500">Most active day</div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-slate-100">Conversion Funnel</CardTitle>
            <CardDescription className="text-slate-400">User journey from signup to paid conversion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-300">Signups</span>
                <span className="text-sm font-bold text-emerald-400">{conversionFunnel.signups}</span>
              </div>
              <div className="w-full h-8 bg-slate-700/50 rounded-lg overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-300">Profile Completed</span>
                <span className="text-sm font-bold text-blue-400">{conversionFunnel.profileCompleted} ({profileCompletionRate.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-8 bg-slate-700/50 rounded-lg overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${profileCompletionRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-300">First RSU Entry</span>
                <span className="text-sm font-bold text-purple-400">{conversionFunnel.firstRSU} ({firstRSURate.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-8 bg-slate-700/50 rounded-lg overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: `${firstRSURate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-300">Upgraded to Pro</span>
                <span className="text-sm font-bold text-amber-400">{conversionFunnel.upgradedToPro} ({overallConversionRate.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-8 bg-slate-700/50 rounded-lg overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600" style={{ width: `${overallConversionRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Usage & Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Feature Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {featureUsage.map((feature) => (
                <div key={feature.event_name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{feature.event_name.replace(/_/g, ' ')}</span>
                    <span className="text-slate-400">{feature.count} uses</span>
                  </div>
                  <div className="w-full h-4 bg-slate-700/50 rounded">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded" style={{ width: '100%' }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {mrrData.tiers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No paid subscriptions yet</div>
              ) : (
                <div className="space-y-4">
                  {mrrData.tiers.map((tier) => (
                    <div key={tier.tier}>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-slate-300 capitalize">{tier.tier}</span>
                        <span className="text-slate-200">{tier.count} users • ${(tier.annual_revenue / 12).toFixed(2)}/mo</span>
                      </div>
                      <div className="w-full h-6 bg-slate-700/50 rounded">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded" style={{ width: '100%' }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-200">Total MRR</span>
                      <span className="text-2xl font-bold text-emerald-400">${mrrData.totalMRR.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Instructions */}
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-slate-100">Admin Access Setup</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 text-sm">
            <p className="mb-2"><strong>To grant admin access:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to Clerk Dashboard → Users</li>
              <li>Select user → Metadata → Public Metadata</li>
              <li>Add: <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400">{`{ "role": "admin" }`}</code></li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
