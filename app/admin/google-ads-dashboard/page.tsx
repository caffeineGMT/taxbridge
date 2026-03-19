import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

export const metadata: Metadata = {
  title: 'Google Ads Campaign Dashboard | TaxBridge',
  description: 'Monitor Google Ads campaign performance and conversion metrics',
};

interface CampaignMetrics {
  campaignName: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  conversionRate: number;
  cpa: number;
  roas: number;
}

interface ConversionFunnel {
  step: string;
  count: number;
  conversionRate: number;
}

async function getGoogleAdsCampaignData(): Promise<{
  campaigns: CampaignMetrics[];
  totalMetrics: CampaignMetrics;
  conversionFunnel: ConversionFunnel[];
  alerts: string[];
}> {
  // In production, this would call Google Ads API
  // For now, we'll return mock data structure

  return {
    campaigns: [
      {
        campaignName: 'H1B RSU Tax Calculator',
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0,
        ctr: 0,
        conversionRate: 0,
        cpa: 0,
        roas: 0,
      },
      {
        campaignName: 'TN Visa Stock Tax',
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0,
        ctr: 0,
        conversionRate: 0,
        cpa: 0,
        roas: 0,
      },
      {
        campaignName: 'Cross Border Tax Tool',
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0,
        ctr: 0,
        conversionRate: 0,
        cpa: 0,
        roas: 0,
      },
    ],
    totalMetrics: {
      campaignName: 'Total',
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0,
      ctr: 0,
      conversionRate: 0,
      cpa: 0,
      roas: 0,
    },
    conversionFunnel: [
      { step: 'Ad Impressions', count: 0, conversionRate: 100 },
      { step: 'Ad Clicks', count: 0, conversionRate: 0 },
      { step: 'Page Views', count: 0, conversionRate: 0 },
      { step: 'Calculator Started', count: 0, conversionRate: 0 },
      { step: 'Calculator Completed', count: 0, conversionRate: 0 },
      { step: 'Signup Completed', count: 0, conversionRate: 0 },
      { step: 'Subscription Purchase', count: 0, conversionRate: 0 },
    ],
    alerts: [],
  };
}

export default async function GoogleAdsDashboard() {
  const data = await getGoogleAdsCampaignData();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Google Ads Campaign Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor performance for H1B RSU Tax Calculator campaigns
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Daily Budget</div>
          <div className="text-2xl font-bold">$50.00</div>
          <div className="text-sm text-muted-foreground">Target CPA: $20.00</div>
        </div>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">⚠️ Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.alerts.map((alert, index) => (
                <li key={index} className="text-yellow-900">
                  • {alert}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Total Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Total Performance (Last 30 Days)</CardTitle>
          <CardDescription>
            Aggregate metrics across all campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">Impressions</div>
              <div className="text-2xl font-bold">{data.totalMetrics.impressions.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Clicks</div>
              <div className="text-2xl font-bold">{data.totalMetrics.clicks.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                CTR: {(data.totalMetrics.ctr * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Conversions</div>
              <div className="text-2xl font-bold">{data.totalMetrics.conversions}</div>
              <div className="text-xs text-muted-foreground">
                Rate: {(data.totalMetrics.conversionRate * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Spend</div>
              <div className="text-2xl font-bold">${data.totalMetrics.cost.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                CPA: ${data.totalMetrics.cpa.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>
            Individual campaign metrics and KPIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.campaigns.map((campaign) => (
              <div key={campaign.campaignName} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4">{campaign.campaignName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Impressions</div>
                    <div className="font-medium">{campaign.impressions.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Clicks</div>
                    <div className="font-medium">{campaign.clicks}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">CTR</div>
                    <div className={`font-medium ${campaign.ctr >= 0.05 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {(campaign.ctr * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Conversions</div>
                    <div className="font-medium">{campaign.conversions}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Conv. Rate</div>
                    <div className={`font-medium ${campaign.conversionRate >= 0.03 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {(campaign.conversionRate * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">CPA</div>
                    <div className={`font-medium ${campaign.cpa <= 20 ? 'text-green-600' : campaign.cpa <= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      ${campaign.cpa.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Spend</div>
                    <div className="font-medium">${campaign.cost.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>
            Track user journey from ad impression to purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.conversionFunnel.map((step, index) => (
              <div key={step.step} className="flex items-center gap-4">
                <div className="w-48 font-medium">{step.step}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full flex items-center justify-end pr-2 text-white text-sm font-medium transition-all"
                    style={{ width: `${step.conversionRate}%` }}
                  >
                    {step.conversionRate > 10 && `${step.conversionRate.toFixed(1)}%`}
                  </div>
                </div>
                <div className="w-24 text-right">
                  <div className="font-bold">{step.count.toLocaleString()}</div>
                  {index > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {step.conversionRate.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Targets</CardTitle>
          <CardDescription>
            Campaign KPI targets and current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">Click-Through Rate (CTR)</div>
              <div className="flex items-baseline gap-2 mt-1">
                <div className="text-2xl font-bold">
                  {(data.totalMetrics.ctr * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">/ 5.0% target</div>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${data.totalMetrics.ctr >= 0.05 ? 'bg-green-600' : 'bg-yellow-600'}`}
                  style={{ width: `${Math.min((data.totalMetrics.ctr / 0.05) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              <div className="flex items-baseline gap-2 mt-1">
                <div className="text-2xl font-bold">
                  {(data.totalMetrics.conversionRate * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">/ 3.0% target</div>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${data.totalMetrics.conversionRate >= 0.03 ? 'bg-green-600' : 'bg-yellow-600'}`}
                  style={{ width: `${Math.min((data.totalMetrics.conversionRate / 0.03) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Cost Per Acquisition (CPA)</div>
              <div className="flex items-baseline gap-2 mt-1">
                <div className="text-2xl font-bold">${data.totalMetrics.cpa.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">/ $20.00 target</div>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${data.totalMetrics.cpa <= 20 ? 'bg-green-600' : data.totalMetrics.cpa <= 40 ? 'bg-yellow-600' : 'bg-red-600'}`}
                  style={{ width: `${Math.min((20 / Math.max(data.totalMetrics.cpa, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Return on Ad Spend (ROAS)</div>
              <div className="flex items-baseline gap-2 mt-1">
                <div className="text-2xl font-bold">{data.totalMetrics.roas.toFixed(1)}x</div>
                <div className="text-sm text-muted-foreground">/ 5.0x target</div>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${data.totalMetrics.roas >= 5 ? 'bg-green-600' : 'bg-yellow-600'}`}
                  style={{ width: `${Math.min((data.totalMetrics.roas / 5) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common campaign management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://ads.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">View Google Ads Console</span>
              <span>→</span>
            </a>
            <a
              href="/admin/posthog-funnel"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">PostHog Conversion Funnel</span>
              <span>→</span>
            </a>
            <a
              href="/admin/revenue"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">Revenue Analytics</span>
              <span>→</span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Setup Status */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Setup Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Campaign configuration created</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Conversion tracking configured</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>PostHog integration active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠</span>
              <span>Google Ads account setup pending - see docs/GOOGLE_ADS_CAMPAIGN_SETUP.md</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠</span>
              <span>Replace placeholder conversion IDs in .env.local</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
