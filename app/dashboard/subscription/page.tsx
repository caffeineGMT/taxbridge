/**
 * Subscription Management Page
 * View and manage subscription details, billing, and payment methods
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfileByClerkId } from '@/lib/db';
import Header from '@/components/Header';
import { SubscriptionContent } from './subscription-content';

export default async function SubscriptionPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfileByClerkId(clerkUserId);

  if (!userProfile) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px),
            repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px)
          `,
        }}
      />

      <Header />

      <SubscriptionContent userProfile={userProfile} />
    </div>
  );
}
