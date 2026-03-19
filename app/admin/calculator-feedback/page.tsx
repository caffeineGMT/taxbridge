'use client';

/**
 * Calculator Feedback Campaign Dashboard
 *
 * Admin dashboard to track feedback collection from non-converting calculator users.
 * Shows campaign performance, response rates, discount usage, and top reasons for not converting.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CampaignStats {
  totalRequestsSent: number;
  totalResponses: number;
  totalDiscountsUsed: number;
  responseRate: number;
  discountUsageRate: number;
  responseToConversionRate: number;
  totalRemindersSent: number;
  responsesAfterReminder: number;
}

interface TopReason {
  reasonCategory: string;
  responseCount: number;
  percentage: number;
  sampleResponses: string;
}

interface FeedbackResponse {
  responseId: number;
  userId: number;
  email: string;
  stoppedReason: string;
  pricePerception: string | null;
  wouldConsiderLater: boolean;
  likelihoodToPurchase: number | null;
  calculatorRating: number | null;
  submittedAt: string;
  discountCode: string;
  discountUsed: boolean;
}

export default function CalculatorFeedbackDashboard() {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [topReasons, setTopReasons] = useState<TopReason[]>([]);
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'test-key-123';

      const res = await fetch(`/api/calculator-feedback?key=${adminKey}`);

      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await res.json();

      setStats(data.stats);
      setTopReasons(data.topReasons || []);
      setResponses(data.responses || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Calculator Feedback Campaign</h1>
        <p className="text-gray-600">
          Track feedback from non-converting calculator users and discount code usage
        </p>
      </div>

      {/* Campaign Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests Sent</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalRequestsSent || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Feedback emails sent to non-converters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Responses</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats?.totalResponses || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Response rate: <strong>{stats?.responseRate?.toFixed(1)}%</strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Discounts Used</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats?.totalDiscountsUsed || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Conversion rate: <strong>{stats?.responseToConversionRate?.toFixed(1)}%</strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reminders Sent</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalRemindersSent || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {stats?.responsesAfterReminder || 0} responses after reminder
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Reasons for Not Converting */}
      <Card>
        <CardHeader>
          <CardTitle>Top Reasons for Not Converting</CardTitle>
          <CardDescription>What stopped users from purchasing?</CardDescription>
        </CardHeader>
        <CardContent>
          {topReasons.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No feedback responses yet</p>
          ) : (
            <div className="space-y-4">
              {topReasons.map((reason, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <h3 className="font-semibold capitalize">
                          {reason.reasonCategory?.replace(/_/g, ' ') || 'Uncategorized'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {reason.responseCount} responses ({reason.percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{reason.percentage.toFixed(0)}%</Badge>
                  </div>
                  {reason.sampleResponses && (
                    <p className="text-sm text-gray-600 mt-2 italic pl-12">
                      "{reason.sampleResponses.split(' | ')[0]?.slice(0, 200)}..."
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Feedback Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback Responses</CardTitle>
          <CardDescription>Latest feedback from non-converting users</CardDescription>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No responses yet</p>
          ) : (
            <div className="space-y-6">
              {responses.slice(0, 10).map((response) => (
                <div key={response.responseId} className="border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{response.email}</h4>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(response.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {response.discountUsed ? (
                        <Badge variant="default" className="bg-green-500">Used Discount</Badge>
                      ) : (
                        <Badge variant="outline">Discount Not Used</Badge>
                      )}
                      {response.wouldConsiderLater && (
                        <Badge variant="secondary">Would Reconsider</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    <p className="text-gray-700">
                      <strong>Why they didn't buy:</strong> {response.stoppedReason}
                    </p>

                    {response.pricePerception && (
                      <p className="text-sm text-gray-600">
                        <strong>Price perception:</strong>{' '}
                        <span className="capitalize">{response.pricePerception.replace('_', ' ')}</span>
                      </p>
                    )}

                    {response.likelihoodToPurchase !== null && (
                      <p className="text-sm text-gray-600">
                        <strong>Likelihood to purchase:</strong> {response.likelihoodToPurchase}/10
                      </p>
                    )}

                    {response.calculatorRating !== null && (
                      <p className="text-sm text-gray-600">
                        <strong>Calculator rating:</strong> {response.calculatorRating}/5 ⭐
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Discount code: <code className="bg-gray-100 px-2 py-1 rounded">{response.discountCode}</code>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="text-center">
        <Button onClick={fetchDashboardData} variant="outline">
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
