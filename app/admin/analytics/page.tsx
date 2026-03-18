import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import {
  getConversionFunnel,
  getDAU,
  getFeatureUsage,
  getMRR,
} from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, TrendingUp, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default async function AnalyticsPage() {
  // Check authentication
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user details from Clerk
  const user = await clerkClient().users.getUser(userId);

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

  // Calculate total active users (users who have created at least one event)
  const totalActiveUsers = dauData.reduce((max, day) => Math.max(max, day.count), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px),
            repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px)
          `,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard" className="text-2xl font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
              TaxBridge
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-medium">Admin Analytics</span>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="text-slate-300 hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/analytics" className="text-emerald-400 font-semibold">
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">
            Admin Analytics Dashboard
          </h1>
          <p className="text-slate-400">
            Real-time metrics, conversion funnel, and revenue analytics
          </p>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Signups */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Total Signups</CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-400">
                {conversionFunnel.signups}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-slate-500">
                <Users className="h-4 w-4 mr-1" />
                All-time registrations
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Free → Pro Conversion</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-400">
                {overallConversionRate.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-slate-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                {conversionFunnel.upgradedToPro} paid users
              </div>
            </CardContent>
          </Card>

          {/* MRR */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Monthly Recurring Revenue</CardDescription>
              <CardTitle className="text-3xl font-bold text-purple-400">
                ${mrrData.totalMRR.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-slate-500">
                <DollarSign className="h-4 w-4 mr-1" />
                ${mrrData.totalAnnual.toLocaleString('en-US', { maximumFractionDigits: 0 })} ARR
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Active Users</CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-400">
                {totalActiveUsers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-slate-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                Peak DAU (30d)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Active Users */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Daily Active Users (30d)</CardTitle>
              <CardDescription className="text-slate-400">
                Unique users per day over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dauData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Conversion Funnel</CardTitle>
              <CardDescription className="text-slate-400">
                User journey from signup to paid conversion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Funnel Visualization */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">Signups</span>
                    <span className="text-sm font-bold text-emerald-400">{conversionFunnel.signups}</span>
                  </div>
                  <div className="w-full h-8 bg-slate-700/50 rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">Profile Completed</span>
                    <span className="text-sm font-bold text-blue-400">
                      {conversionFunnel.profileCompleted} ({profileCompletionRate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-8 bg-slate-700/50 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: `${profileCompletionRate}%` }}
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">First RSU Entry</span>
                    <span className="text-sm font-bold text-purple-400">
                      {conversionFunnel.firstRSU} ({firstRSURate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-8 bg-slate-700/50 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                      style={{ width: `${firstRSURate}%` }}
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">Upgraded to Pro</span>
                    <span className="text-sm font-bold text-amber-400">
                      {conversionFunnel.upgradedToPro} ({overallConversionRate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-8 bg-slate-700/50 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
                      style={{ width: `${overallConversionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Usage */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Feature Usage</CardTitle>
              <CardDescription className="text-slate-400">
                Most popular features by event count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={featureUsage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <YAxis
                    dataKey="event_name"
                    type="category"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    width={180}
                    tickFormatter={(value) => {
                      const labels: Record<string, string> = {
                        tax_calculation_viewed: 'Tax Calculator',
                        ftc_optimizer_used: 'FTC Optimizer',
                        pdf_exported: 'PDF Export',
                        forms_checklist_opened: 'Forms Checklist',
                      };
                      return labels[value] || value;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Revenue Breakdown</CardTitle>
              <CardDescription className="text-slate-400">
                Monthly recurring revenue by subscription tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mrrData.tiers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No paid subscriptions yet
                </div>
              ) : (
                <>
                  {mrrData.tiers.map((tier) => (
                    <div key={tier.tier} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-300 capitalize">
                          {tier.tier}
                        </span>
                        <span className="text-sm font-bold text-slate-200">
                          {tier.count} {tier.count === 1 ? 'user' : 'users'} • ${(tier.annual_revenue / 12).toFixed(2)}/mo
                        </span>
                      </div>
                      <div className="w-full h-6 bg-slate-700/50 rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${
                            tier.tier === 'pro'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                              : 'bg-gradient-to-r from-purple-500 to-purple-600'
                          }`}
                          style={{
                            width: `${(tier.annual_revenue / mrrData.totalAnnual) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-slate-200">Total MRR</span>
                      <span className="text-2xl font-bold text-emerald-400">
                        ${mrrData.totalMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-slate-400">Annual Run Rate</span>
                      <span className="text-sm font-semibold text-slate-300">
                        ${mrrData.totalAnnual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Instructions */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-slate-100">Admin Access Setup</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2 text-sm">
            <p>
              <strong>To grant admin access:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to Clerk Dashboard → Users</li>
              <li>Select the user you want to make an admin</li>
              <li>Navigate to Metadata → Public Metadata</li>
              <li>Add: <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400">{`{ "role": "admin" }`}</code></li>
              <li>Save changes</li>
            </ol>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} TaxBridge Analytics. Admin dashboard for internal use only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
