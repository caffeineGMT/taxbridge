import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getRSUEntries, getUserProfileByClerkId } from '@/lib/db';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import Header from '@/components/Header';

// Server Component - fetches data at request time
export default async function DashboardPage() {
  const { userId: clerkUserId } = auth();

  if (!clerkUserId) {
    redirect('/sign-in');
  }

  // Get user profile from database
  const userProfile = getUserProfileByClerkId(clerkUserId);

  if (!userProfile) {
    // User exists in Clerk but not in our database - redirect to onboarding
    redirect('/onboarding');
  }

  // Check if user completed onboarding
  if (!userProfile.canada_province || !userProfile.us_state || !userProfile.filing_status) {
    redirect('/onboarding');
  }

  const userId = userProfile.id;
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
      <Header />

      <DashboardContent
        rsuEvents={rsuEvents}
        ytdTotal={ytdTotal}
        estimatedUSTax={estimatedUSTax}
        estimatedCanadaTax={estimatedCanadaTax}
        filingStatus={filingStatus}
        allTimeTotal={allTimeTotal}
        currentYear={currentYear}
      />

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
