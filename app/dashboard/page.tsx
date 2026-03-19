import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getRSUEntries, getUserProfileByClerkId } from '@/lib/db';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { calculateUSFederalTax, calculateUSStateTax } from '@/lib/tax/us-calculator';
import { calculateCanadaFederalTax, calculateCanadaProvincialTax } from '@/lib/tax/canada-calculator';

// Server Component - fetches data at request time
export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect('/sign-in');
  }

  // Get user profile from database
  const userProfile = await getUserProfileByClerkId(clerkUserId);

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
  const rsuEvents = await getRSUEntries(userId);

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

  // Calculate REAL tax estimates using actual tax engine
  let estimatedUSTax = 0;
  let estimatedCanadaTax = 0;

  if (ytdTotal > 0 && userProfile.us_state && userProfile.canada_province) {
    // US tax calculation (in USD)
    const usFederal = calculateUSFederalTax(ytdTotal, userProfile.filing_status as 'single' | 'married');
    const usState = calculateUSStateTax(ytdTotal, userProfile.us_state as 'WA' | 'CA' | 'NY' | 'TX');
    estimatedUSTax = usFederal.tax + usState.tax;

    // Canada tax calculation (assume 1.35 USD to CAD conversion)
    const ytdTotalCAD = ytdTotal * 1.35;
    const canadaFederal = calculateCanadaFederalTax(ytdTotalCAD);
    const canadaProvincial = calculateCanadaProvincialTax(ytdTotalCAD, userProfile.canada_province as 'BC' | 'ON' | 'AB');
    estimatedCanadaTax = canadaFederal.tax + canadaProvincial.tax;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        aria-hidden="true"
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
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
