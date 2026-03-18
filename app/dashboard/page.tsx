import Link from 'next/link';
import { DollarSign, TrendingUp, FileCheck, AlertCircle } from 'lucide-react';
import { getRSUEntries } from '@/lib/db';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RSUList } from '@/components/dashboard/rsu-list';
import { QuickActions } from '@/components/dashboard/quick-actions';

// Server Component - fetches data at request time
export default async function DashboardPage() {
  // Hardcode user_id=1 for MVP (single-user application)
  const userId = 1;
  const currentYear = new Date().getFullYear();

  // Fetch all RSU events for the user
  const rsuEvents = getRSUEntries(userId);

  // Calculate YTD total RSU income
  const ytdTotal = rsuEvents
    .filter((event) => event.vest_date.startsWith(currentYear.toString()))
    .reduce((sum, event) => sum + event.total_value_usd, 0);

  // Calculate all-time total
  const allTimeTotal = rsuEvents.reduce((sum, event) => sum + event.total_value_usd, 0);

  // Determine filing status based on whether events exist
  const filingStatus = rsuEvents.length === 0
    ? 'Not Started'
    : ytdTotal > 0
      ? 'In Progress'
      : 'Complete';

  // Placeholder tax values (will be calculated by tax engine in future)
  const estimatedUSTax = ytdTotal * 0.24; // Approximate 24% federal rate
  const estimatedCanadaTax = ytdTotal * 0.26; // Approximate 26% combined rate

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
            <Link href="/" className="text-2xl font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
              TaxBridge
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="text-emerald-400 font-semibold">
              Dashboard
            </Link>
            <Link href="/rsu-entry" className="text-slate-300 hover:text-emerald-400 transition-colors">
              Add RSU
            </Link>
            <Link href="/calculator" className="text-slate-300 hover:text-emerald-400 transition-colors">
              Calculator
            </Link>
            <Link href="/forms" className="text-slate-300 hover:text-emerald-400 transition-colors">
              Forms
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-400">
            Overview of your RSU vesting events and tax calculations for {currentYear}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total RSU Income (YTD)"
            value={`$${ytdTotal.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description={`Year-to-date income for ${currentYear}`}
            icon={DollarSign}
            iconColor="from-emerald-500 to-emerald-600"
          />

          <StatsCard
            title="Est. US Tax"
            value={`$${estimatedUSTax.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description="Federal + State (estimated)"
            icon={TrendingUp}
            iconColor="from-blue-500 to-blue-600"
          />

          <StatsCard
            title="Est. Canada Tax"
            value={`$${estimatedCanadaTax.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description="Federal + Provincial (estimated)"
            icon={TrendingUp}
            iconColor="from-purple-500 to-purple-600"
          />

          <StatsCard
            title="Filing Status"
            value={filingStatus}
            description={
              filingStatus === 'Not Started'
                ? 'Add RSU entries to begin'
                : filingStatus === 'In Progress'
                  ? 'Continue adding entries'
                  : 'Ready to file'
            }
            icon={filingStatus === 'Complete' ? FileCheck : AlertCircle}
            iconColor={
              filingStatus === 'Complete'
                ? 'from-green-500 to-green-600'
                : 'from-amber-500 to-amber-600'
            }
          />
        </div>

        {/* Quick Actions and Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {/* All-time summary card */}
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-6 mb-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-50 text-sm mb-1">All-Time RSU Income</p>
                  <p className="text-white text-3xl font-bold">
                    ${allTimeTotal.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-emerald-50 text-sm mt-2">
                    {rsuEvents.length} vesting event{rsuEvents.length !== 1 ? 's' : ''} recorded
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <DollarSign className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <QuickActions />
        </div>

        {/* RSU List Table */}
        <RSUList events={rsuEvents} />

        {/* Additional Info Banner */}
        {rsuEvents.length > 0 && (
          <div className="mt-8 p-4 border border-blue-500/30 bg-blue-500/10 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-300 mb-1">
                  Tax Estimates
                </h3>
                <p className="text-sm text-slate-400">
                  Tax amounts shown are estimates based on approximate rates. Use the Tax Calculator
                  for detailed calculations including Foreign Tax Credit optimization and filing recommendations.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} TaxBridge. Built for tech workers navigating cross-border taxation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
