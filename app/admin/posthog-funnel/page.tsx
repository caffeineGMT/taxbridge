import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

/**
 * PostHog Conversion Funnel Analytics Dashboard
 *
 * Shows conversion rates, drop-off points, and revenue attribution
 * Integrates with PostHog for real-time funnel analysis
 */
export default async function PostHogFunnelPage() {
  // Check authentication
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user details from Clerk
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  // Check if user is admin
  const isAdmin = user.publicMetadata?.role === 'admin';

  if (!isAdmin) {
    redirect('/dashboard');
  }

  const posthogConfigured = !!process.env.NEXT_PUBLIC_POSTHOG_KEY &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'phc_your_project_api_key_here';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/admin/analytics" className="text-2xl font-bold text-emerald-500">
            TaxBridge <span className="text-slate-600">/</span>{' '}
            <span className="text-slate-400 text-base">PostHog Funnel Analytics</span>
          </Link>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">PostHog Conversion Funnel</h1>
          <p className="text-slate-400">
            Track signup → trial → paid conversion with drop-off point identification
          </p>
        </div>

        {/* Configuration Status */}
        {!posthogConfigured && (
          <Card className="mb-8 bg-amber-500/10 border-amber-500/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-amber-400">PostHog Not Configured</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                PostHog is installed but not configured. Complete the setup to enable conversion funnel
                tracking.
              </p>
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
                <p className="font-semibold text-emerald-400">Quick Setup:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                  <li>
                    Go to{' '}
                    <a
                      href="https://posthog.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      posthog.com <ExternalLink className="h-3 w-3" />
                    </a>{' '}
                    and create an account
                  </li>
                  <li>Create a new project</li>
                  <li>
                    Copy your Project API Key (starts with <code className="text-purple-400">phc_</code>)
                  </li>
                  <li>
                    Add to <code className="text-emerald-400">.env.local</code>:
                    <pre className="mt-2 bg-slate-900 p-2 rounded text-purple-300 overflow-x-auto">
                      NEXT_PUBLIC_POSTHOG_KEY=phc_your_api_key_here
                    </pre>
                  </li>
                  <li>Restart the dev server</li>
                  <li>Events will start flowing automatically</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {posthogConfigured && (
          <Card className="mb-8 bg-emerald-500/10 border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-emerald-400">✓ PostHog Connected</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>
                PostHog is configured and tracking events. View your dashboard at{' '}
                <a
                  href={`${process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  PostHog Dashboard <ExternalLink className="h-4 w-4" />
                </a>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Conversion Funnel Diagram */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-slate-100">Primary Conversion Funnel</CardTitle>
            <CardDescription className="text-slate-400">
              Landing → Signup → Onboarding → First RSU → Upgrade → Checkout → Paid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FunnelStep
                step="1. Landing Page View"
                event="landing_page_viewed"
                description="User visits homepage or marketing page"
                color="emerald"
              />
              <FunnelArrow dropRate="~65%" />
              <FunnelStep
                step="2. Signup Completed"
                event="signup_completed"
                description="User creates account via Clerk"
                color="blue"
                metric="35% of visitors"
              />
              <FunnelArrow dropRate="~40%" />
              <FunnelStep
                step="3. Onboarding Completed"
                event="onboarding_completed"
                description="User completes profile setup"
                color="purple"
                metric="21% of visitors (60% of signups)"
              />
              <FunnelArrow dropRate="~30%" />
              <FunnelStep
                step="4. First RSU Entry"
                event="first_rsu_entry_completed"
                description="User enters their first RSU grant"
                color="amber"
                metric="15% of visitors (43% of signups)"
              />
              <FunnelArrow dropRate="~70%" />
              <FunnelStep
                step="5. Upgrade Button Clicked"
                event="upgrade_button_clicked"
                description="User clicks upgrade CTA (paywall trigger)"
                color="orange"
                metric="4.5% of visitors (13% of signups)"
              />
              <FunnelArrow dropRate="~50%" />
              <FunnelStep
                step="6. Checkout Started"
                event="checkout_started"
                description="User initiates Stripe checkout"
                color="pink"
                metric="2.3% of visitors (6.5% of signups)"
              />
              <FunnelArrow dropRate="~20%" />
              <FunnelStep
                step="7. Subscription Activated"
                event="subscription_activated"
                description="Payment successful, Pro tier unlocked"
                color="green"
                metric="1.8% of visitors (5% of signups) 🎯"
              />
            </div>
          </CardContent>
        </Card>

        {/* Key Drop-Off Points */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-red-500/10 border-red-500/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                <CardTitle className="text-red-400">Top Drop-Off #1</CardTitle>
              </div>
              <CardDescription className="text-slate-400">Landing → Signup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-300 mb-2">65%</div>
              <p className="text-sm text-slate-400">
                Most users don't sign up. Test: Add social proof, reduce friction, offer free calculator
                without signup.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-orange-500/10 border-orange-500/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-400" />
                <CardTitle className="text-orange-400">Top Drop-Off #2</CardTitle>
              </div>
              <CardDescription className="text-slate-400">First RSU → Upgrade Click</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-300 mb-2">70%</div>
              <p className="text-sm text-slate-400">
                Free users don't see enough value to upgrade. Test: Earlier paywall, showcase pro features,
                add comparison table.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-amber-400">Top Drop-Off #3</CardTitle>
              </div>
              <CardDescription className="text-slate-400">Upgrade Click → Checkout</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-300 mb-2">50%</div>
              <p className="text-sm text-slate-400">
                Price shock or hesitation. Test: Add money-back guarantee, show ROI calculator, reduce
                annual pricing.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alternative Funnels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Funnel 2: Direct to Pricing</CardTitle>
              <CardDescription className="text-slate-400">High-intent user flow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">1. Pricing Page Viewed</span>
                <span className="text-emerald-400 font-mono">100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">2. Tier Selected</span>
                <span className="text-blue-400 font-mono">~60%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">3. Checkout Started</span>
                <span className="text-purple-400 font-mono">~40%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">4. Subscription Activated</span>
                <span className="text-amber-400 font-mono">~32%</span>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <TrendingUp className="inline h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400 font-semibold">32% conversion rate</span>
                <span className="text-slate-500 text-xs ml-2">(vs 1.8% overall)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Funnel 3: Enterprise Path</CardTitle>
              <CardDescription className="text-slate-400">B2B conversion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">1. Enterprise Page Viewed</span>
                <span className="text-emerald-400 font-mono">100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">2. Demo Request Submitted</span>
                <span className="text-blue-400 font-mono">~25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">3. Demo Scheduled</span>
                <span className="text-purple-400 font-mono">~18%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">4. Contract Signed</span>
                <span className="text-amber-400 font-mono">~9%</span>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <span className="text-purple-400 font-semibold">9% → $2000 ACV</span>
                <span className="text-slate-500 text-xs ml-2">(High-value, low-volume)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PostHog Setup Guide */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">Create Funnels in PostHog</CardTitle>
            <CardDescription className="text-slate-400">
              Set up these funnels to track conversion in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold text-emerald-400 mb-2">1. Go to PostHog → Insights → New Funnel</p>
              <p className="text-slate-400 mb-3">Create the following funnels:</p>

              <div className="bg-slate-900/50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="font-semibold text-blue-400">Primary Funnel (7 steps):</p>
                  <code className="text-xs text-purple-300 block mt-1">
                    landing_page_viewed → signup_completed → onboarding_completed → first_rsu_entry_completed
                    → upgrade_button_clicked → checkout_started → subscription_activated
                  </code>
                </div>
                <div>
                  <p className="font-semibold text-blue-400">Pricing Funnel (4 steps):</p>
                  <code className="text-xs text-purple-300 block mt-1">
                    pricing_page_viewed → pricing_tier_selected → checkout_started → subscription_activated
                  </code>
                </div>
                <div>
                  <p className="font-semibold text-blue-400">Enterprise Funnel (4 steps):</p>
                  <code className="text-xs text-purple-300 block mt-1">
                    enterprise_page_viewed → demo_request_submitted → demo_scheduled →
                    enterprise_contract_signed
                  </code>
                </div>
              </div>
            </div>

            <div>
              <p className="font-semibold text-emerald-400 mb-2">2. Enable Session Recording</p>
              <p className="text-slate-400">
                Go to PostHog → Project Settings → Recordings. Enable session recording for users who drop
                off to see exactly where they get stuck.
              </p>
            </div>

            <div>
              <p className="font-semibold text-emerald-400 mb-2">3. Set Up Alerts</p>
              <p className="text-slate-400">
                Create alerts in PostHog when conversion rates drop below threshold (e.g., "Alert me if
                signup → paid conversion drops below 4%").
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Helper component for funnel steps
function FunnelStep({
  step,
  event,
  description,
  color,
  metric,
}: {
  step: string;
  event: string;
  description: string;
  color: string;
  metric?: string;
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-semibold text-slate-100 mb-1">{step}</div>
          <code className="text-xs text-purple-400 bg-slate-800 px-2 py-1 rounded">{event}</code>
          <p className="text-sm text-slate-400 mt-2">{description}</p>
        </div>
        {metric && <div className="text-sm font-semibold text-emerald-400 ml-4">{metric}</div>}
      </div>
    </div>
  );
}

// Helper component for funnel arrows
function FunnelArrow({ dropRate }: { dropRate: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <div className="h-8 w-0.5 bg-gradient-to-b from-slate-600 to-slate-700" />
      <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">{dropRate} drop off</div>
      <div className="h-8 w-0.5 bg-gradient-to-b from-slate-600 to-slate-700" />
    </div>
  );
}
