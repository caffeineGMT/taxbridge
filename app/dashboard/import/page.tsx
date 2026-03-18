import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfileByClerkId } from '@/lib/db';
import ImportFlow from './ImportFlow';

export default async function ImportPage() {
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

  return <ImportFlow />;
}
