'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RedditMetrics {
  subreddit: string;
  sessions: number;
  calculatorCompletions: number;
  signups: number;
  paidConversions: number;
  conversionRate: number;
  avgTimeOnSite: number;
  bounceRate: number;
}

interface ContentPerformance {
  contentType: string;
  clicks: number;
  sessions: number;
  completions: number;
  ctr: number;
}

interface DailyMetrics {
  date: string;
  sessions: number;
  completions: number;
  signups: number;
  conversions: number;
}

export default function RedditAnalyticsDashboard() {
  const [subredditMetrics, setSubredditMetrics] = useState<RedditMetrics[]>([
    { subreddit: 'r/personalfinance', sessions: 0, calculatorCompletions: 0, signups: 0, paidConversions: 0, conversionRate: 0, avgTimeOnSite: 0, bounceRate: 0 },
    { subreddit: 'r/h1b', sessions: 0, calculatorCompletions: 0, signups: 0, paidConversions: 0, conversionRate: 0, avgTimeOnSite: 0, bounceRate: 0 },
    { subreddit: 'r/ImmigrationCanada', sessions: 0, calculatorCompletions: 0, signups: 0, paidConversions: 0, conversionRate: 0, avgTimeOnSite: 0, bounceRate: 0 },
  ]);

  const [contentPerformance, setContentPerformance] = useState<ContentPerformance[]>([
    { contentType: 'case-study', clicks: 0, sessions: 0, completions: 0, ctr: 0 },
    { contentType: 'comment', clicks: 0, sessions: 0, completions: 0, ctr: 0 },
    { contentType: 'post', clicks: 0, sessions: 0, completions: 0, ctr: 0 },
  ]);

  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);

  const [campaignSummary, setCampaignSummary] = useState({
    totalSessions: 0,
    totalCompletions: 0,
    totalSignups: 0,
    totalConversions: 0,
    completionRate: 0,
    signupRate: 0,
    conversionRate: 0,
    estimatedRevenue: 0,
  });

  useEffect(() => {
    // In production, fetch from PostHog API or your analytics backend
    // For now, showing how the data would be structured
    fetchRedditMetrics();
  }, []);

  const fetchRedditMetrics = async () => {
    // TODO: Integrate with PostHog API
    // Example query:
    // posthog.query({
    //   kind: 'EventsQuery',
    //   select: ['properties.utm_source', 'properties.utm_term', 'count()'],
    //   where: ['properties.utm_source = "reddit"'],
    //   groupBy: ['properties.utm_term'],
    // });

    // Mock data for demonstration
    const mockSubredditData: RedditMetrics[] = [
      {
        subreddit: 'r/personalfinance',
        sessions: 87,
        calculatorCompletions: 31,
        signups: 5,
        paidConversions: 2,
        conversionRate: 35.6,
        avgTimeOnSite: 3.2,
        bounceRate: 42.5,
      },
      {
        subreddit: 'r/h1b',
        sessions: 54,
        calculatorCompletions: 18,
        signups: 3,
        paidConversions: 1,
        conversionRate: 33.3,
        avgTimeOnSite: 2.8,
        bounceRate: 51.9,
      },
      {
        subreddit: 'r/ImmigrationCanada',
        sessions: 39,
        calculatorCompletions: 14,
        signups: 2,
        paidConversions: 1,
        conversionRate: 35.9,
        avgTimeOnSite: 3.0,
        bounceRate: 46.2,
      },
    ];

    const mockContentData: ContentPerformance[] = [
      { contentType: 'case-study', clicks: 245, sessions: 87, completions: 31, ctr: 35.5 },
      { contentType: 'comment', clicks: 128, sessions: 54, completions: 18, ctr: 42.2 },
      { contentType: 'post', clicks: 93, sessions: 39, completions: 14, ctr: 41.9 },
    ];

    const mockDailyData: DailyMetrics[] = [
      { date: '2026-03-19', sessions: 32, completions: 11, signups: 2, conversions: 1 },
      { date: '2026-03-20', sessions: 41, completions: 15, signups: 3, conversions: 1 },
      { date: '2026-03-21', sessions: 38, completions: 14, signups: 2, conversions: 1 },
      { date: '2026-03-22', sessions: 28, completions: 10, signups: 1, conversions: 0 },
      { date: '2026-03-23', sessions: 41, completions: 13, signups: 2, conversions: 1 },
    ];

    setSubredditMetrics(mockSubredditData);
    setContentPerformance(mockContentData);
    setDailyMetrics(mockDailyData);

    // Calculate campaign summary
    const totalSessions = mockSubredditData.reduce((sum, m) => sum + m.sessions, 0);
    const totalCompletions = mockSubredditData.reduce((sum, m) => sum + m.calculatorCompletions, 0);
    const totalSignups = mockSubredditData.reduce((sum, m) => sum + m.signups, 0);
    const totalConversions = mockSubredditData.reduce((sum, m) => sum + m.paidConversions, 0);

    setCampaignSummary({
      totalSessions,
      totalCompletions,
      totalSignups,
      totalConversions,
      completionRate: (totalCompletions / totalSessions) * 100,
      signupRate: (totalSignups / totalCompletions) * 100,
      conversionRate: (totalConversions / totalSignups) * 100,
      estimatedRevenue: totalConversions * 97, // $97 starter plan
    });
  };

  const getSuccessTier = () => {
    const { totalSessions, totalSignups, totalConversions } = campaignSummary;

    if (totalSessions >= 300 && totalSignups >= 20 && totalConversions >= 10) {
      return { tier: 'Exceptional', color: 'bg-green-500', description: '194% ROI' };
    } else if (totalSessions >= 200 && totalSignups >= 10 && totalConversions >= 3) {
      return { tier: 'Strong', color: 'bg-blue-500', description: '58% ROI' };
    } else if (totalSessions >= 100 && totalSignups >= 5 && totalConversions >= 1) {
      return { tier: 'Minimum Viable', color: 'bg-yellow-500', description: 'Break-even' };
    } else {
      return { tier: 'Below Target', color: 'bg-red-500', description: 'Needs improvement' };
    }
  };

  const successTier = getSuccessTier();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reddit Growth Campaign Analytics</h1>
        <p className="text-muted-foreground">
          Campaign Period: March 19-23, 2026 | Target: 100+ calculator sessions, 10+ paid conversions
        </p>
      </div>

      {/* Campaign Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignSummary.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {campaignSummary.totalSessions >= 200 ? '✅ Strong' : campaignSummary.totalSessions >= 100 ? '✅ Target met' : '❌ Below target'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calculator Completions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignSummary.totalCompletions}</div>
            <p className="text-xs text-muted-foreground">
              {campaignSummary.completionRate.toFixed(1)}% completion rate
              {campaignSummary.completionRate >= 35 ? ' ✅' : campaignSummary.completionRate >= 30 ? ' 🟡' : ' ❌'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signups</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignSummary.totalSignups}</div>
            <p className="text-xs text-muted-foreground">
              {campaignSummary.signupRate.toFixed(1)}% of completions
              {campaignSummary.totalSignups >= 10 ? ' ✅' : campaignSummary.totalSignups >= 5 ? ' 🟡' : ' ❌'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Conversions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <line x1="12" x2="12" y1="2" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignSummary.totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              ${campaignSummary.estimatedRevenue.toLocaleString()} revenue
              {campaignSummary.totalConversions >= 3 ? ' ✅' : campaignSummary.totalConversions >= 1 ? ' 🟡' : ' ❌'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Success Tier Badge */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Campaign Performance Tier</CardTitle>
          <CardDescription>Overall assessment based on traffic, conversions, and ROI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge className={`${successTier.color} text-white text-lg px-4 py-2`}>
              {successTier.tier}
            </Badge>
            <div>
              <p className="font-semibold">{successTier.description}</p>
              <p className="text-sm text-muted-foreground">
                {successTier.tier === 'Exceptional' && 'Outstanding performance! Scale this strategy.'}
                {successTier.tier === 'Strong' && 'Great results! Continue refining and scaling.'}
                {successTier.tier === 'Minimum Viable' && 'Met baseline targets. Optimize for better conversion.'}
                {successTier.tier === 'Below Target' && 'Campaign needs adjustment. Review content and targeting.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value="subreddits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subreddits">By Subreddit</TabsTrigger>
          <TabsTrigger value="content">By Content Type</TabsTrigger>
          <TabsTrigger value="daily">Daily Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="subreddits" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {subredditMetrics.map((metric) => (
              <Card key={metric.subreddit}>
                <CardHeader>
                  <CardTitle className="text-base">{metric.subreddit}</CardTitle>
                  <CardDescription>{metric.sessions} sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completions:</span>
                    <span className="font-medium">{metric.calculatorCompletions} ({metric.conversionRate.toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Signups:</span>
                    <span className="font-medium">{metric.signups}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid:</span>
                    <span className="font-medium">{metric.paidConversions} (${metric.paidConversions * 97})</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Time:</span>
                    <span className="font-medium">{metric.avgTimeOnSite.toFixed(1)} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bounce Rate:</span>
                    <span className="font-medium">{metric.bounceRate.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Type Performance</CardTitle>
              <CardDescription>Compare effectiveness of different Reddit content formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentPerformance.map((content) => (
                  <div key={content.contentType} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold capitalize">{content.contentType.replace('-', ' ')}</h3>
                      <Badge variant="outline">{content.ctr.toFixed(1)}% CTR</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Clicks</p>
                        <p className="font-medium text-lg">{content.clicks}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sessions</p>
                        <p className="font-medium text-lg">{content.sessions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completions</p>
                        <p className="font-medium text-lg">{content.completions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Campaign Progress</CardTitle>
              <CardDescription>Track performance trends across the 5-day campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dailyMetrics.map((day) => (
                  <div key={day.date} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Sessions</p>
                        <p className="font-medium">{day.sessions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Completions</p>
                        <p className="font-medium">{day.completions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Signups</p>
                        <p className="font-medium">{day.signups}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Paid</p>
                        <p className="font-medium">{day.conversions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📊 How to Track Real Data</CardTitle>
          <CardDescription>This dashboard shows mock data. Follow these steps to track real Reddit campaign metrics:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Step 1: Use UTM-tagged links</h4>
            <p className="text-sm text-muted-foreground mb-2">All Reddit posts/comments should use tracking links from <code className="bg-background px-1 py-0.5 rounded">lib/utm-generator.ts</code>:</p>
            <code className="text-xs bg-background block p-2 rounded">
              https://taxbridge.app?utm_source=reddit&utm_medium=organic&utm_campaign=reddit-growth-q1-2026&utm_term=personalfinance&utm_content=case-study
            </code>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Step 2: Track in PostHog</h4>
            <p className="text-sm text-muted-foreground mb-2">Query PostHog for Reddit-attributed events:</p>
            <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`posthog.query({
  kind: 'EventsQuery',
  select: ['properties.utm_term', 'count()'],
  where: ['properties.utm_source = "reddit"'],
  groupBy: ['properties.utm_term'],
})`}
            </pre>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Step 3: Build API endpoint</h4>
            <p className="text-sm text-muted-foreground">Create <code className="bg-background px-1 py-0.5 rounded">app/api/analytics/reddit/route.ts</code> to fetch PostHog data and serve to this dashboard.</p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Step 4: Update dashboard</h4>
            <p className="text-sm text-muted-foreground">Replace <code className="bg-background px-1 py-0.5 rounded">fetchRedditMetrics()</code> mock data with real API call to your PostHog endpoint.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
