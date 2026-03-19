import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfileByClerkId } from '@/lib/db';
import { RSUEntryForm } from '@/components/rsu/rsu-entry-form';
import Header from '@/components/Header';

export default async function RSUEntryPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect('/sign-in');
  }

  // Get user profile from database
  const userProfile = await getUserProfileByClerkId(clerkUserId);

  if (!userProfile) {
    redirect('/onboarding');
  }

  // Check if user completed onboarding
  if (!userProfile.canada_province || !userProfile.us_state || !userProfile.filing_status) {
    redirect('/onboarding');
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-text mb-2">Add RSU Entry</h1>
            <p className="text-text-secondary">Record your RSU vesting events for tax calculations</p>
          </div>
          <RSUEntryForm />
        </div>
      </main>
    </>
  );
}
