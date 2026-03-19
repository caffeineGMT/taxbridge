'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FeedbackResponse {
  id: number;
  email: string;
  response_type: string;
  subscription_tier: string;
  overall_satisfaction: number;
  purchase_hesitation_category?: string;
  purchase_hesitation_details?: string;
  what_convinced_purchase?: string;
  why_not_upgrade_category?: string;
  why_not_upgrade_details?: string;
  what_would_make_upgrade?: string;
  price_expectation_usd?: number;
  testimonial?: string;
  testimonial_permission?: boolean;
  would_recommend_to_friend?: boolean;
  created_at: number;
}

interface Campaign {
  id: number;
  campaign_name: string;
  campaign_type: string;
  target_user_type: string;
  status: string;
  total_sent: number;
  total_responses: number;
  target_responses: number;
  created_at: number;
  launched_at?: number;
  completed_at?: number;
}

export default function FeedbackCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await fetch('/api/feedback/campaigns');
      if (!res.ok) throw new Error('Failed to load campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCampaignResponses = async (campaignId: number) => {
    try {
      const res = await fetch(`/api/feedback/responses?campaign_id=${campaignId}`);
      if (!res.ok) throw new Error('Failed to load responses');
      const data = await res.json();
      setResponses(data.responses || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    loadCampaignResponses(campaign.id);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">User Feedback Campaigns</h1>
          <p className="text-slate-600">
            Track feedback collection campaigns and analyze responses
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Campaigns List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {campaigns.length === 0 ? (
            <Card className="col-span-3 p-8 text-center">
              <p className="text-slate-600 mb-4">No campaigns yet</p>
              <Button asChild>
                <a href="/admin/launch-campaign">Launch Your First Campaign</a>
              </Button>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedCampaign?.id === campaign.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleSelectCampaign(campaign)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{campaign.campaign_name}</h3>
                    <Badge
                      variant={
                        campaign.status === 'completed'
                          ? 'success'
                          : campaign.status === 'active'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Type:</span>
                    <span className="font-medium capitalize">{campaign.target_user_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sent:</span>
                    <span className="font-medium">{campaign.total_sent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Responses:</span>
                    <span className="font-medium">
                      {campaign.total_responses} / {campaign.target_responses}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Response Rate:</span>
                    <span className="font-medium">
                      {campaign.total_sent > 0
                        ? Math.round((campaign.total_responses / campaign.total_sent) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (campaign.total_responses / campaign.target_responses) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Selected Campaign Details */}
        {selectedCampaign && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Responses ({responses.length})
            </h2>

            {responses.length === 0 ? (
              <Card className="p-8 text-center text-slate-600">
                No responses yet. Check back soon!
              </Card>
            ) : (
              <div className="space-y-4">
                {responses.map((response) => (
                  <Card key={response.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold">{response.email}</p>
                        <p className="text-sm text-slate-600">
                          {response.subscription_tier} •{' '}
                          {new Date(response.created_at * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Satisfaction</p>
                        <p className="text-2xl font-bold">{response.overall_satisfaction}/5</p>
                      </div>
                    </div>

                    {/* Paid User Responses */}
                    {response.response_type === 'paid_barriers' && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-600">Purchase Hesitation:</p>
                          <Badge variant="outline">{response.purchase_hesitation_category}</Badge>
                          <p className="mt-2">{response.purchase_hesitation_details}</p>
                        </div>
                        {response.what_convinced_purchase && (
                          <div>
                            <p className="text-sm font-semibold text-slate-600">
                              What Convinced Them:
                            </p>
                            <p>{response.what_convinced_purchase}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Free User Responses */}
                    {response.response_type === 'free_upgrade' && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-600">Why Not Upgrade:</p>
                          <Badge variant="outline">{response.why_not_upgrade_category}</Badge>
                          <p className="mt-2">{response.why_not_upgrade_details}</p>
                        </div>
                        {response.what_would_make_upgrade && (
                          <div>
                            <p className="text-sm font-semibold text-slate-600">
                              What Would Make Them Upgrade:
                            </p>
                            <p>{response.what_would_make_upgrade}</p>
                          </div>
                        )}
                        {response.price_expectation_usd && (
                          <div>
                            <p className="text-sm font-semibold text-slate-600">
                              Price Expectation:
                            </p>
                            <p>${response.price_expectation_usd}/year</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Testimonial */}
                    {response.testimonial && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-2">
                          💬 Testimonial {response.testimonial_permission ? '(Can Use)' : '(Private)'}
                        </p>
                        <p className="italic">"{response.testimonial}"</p>
                      </div>
                    )}

                    {/* Would Recommend */}
                    {response.would_recommend_to_friend !== null && (
                      <div className="mt-4">
                        <Badge variant={response.would_recommend_to_friend ? 'success' : 'destructive'}>
                          {response.would_recommend_to_friend ? '👍 Would Recommend' : '👎 Would Not Recommend'}
                        </Badge>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
