import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfileByClerkId } from '@/lib/db';
import dynamic from 'next/dynamic';

const ImportFlow = dynamic(() => import('./ImportFlow'), {
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
    </div>
  ),
});

export default async function ImportPage() {
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

  return <ImportFlow />;
}
