'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Calendar, Download, AlertCircle, Crown, TrendingUp, Pause, ArrowUpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ManageSubscriptionButton } from '@/components/billing/ManageSubscriptionButton';
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow';

interface BillingInfo {
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: string | null;
  subscription_current_period_end: string | null;
  stripe_customer_id: string | null;
  payment_method_last4: string | null;
  payment_method_brand: string | null;
  usage: {
    rsu_entries: number;
    pdf_exports: number;
    ai_queries: number;
  };
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
    invoice_pdf: string;
  }>;
}

export default function BillingPage() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchBillingInfo();
    }
  }, [userId]);

  const fetchBillingInfo = async () => {
    try {
      const response = await fetch('/api/billing');
      if (response.ok) {
        const data = await response.json();
        setBillingInfo(data);
      } else {
        throw new Error('Failed to fetch billing information');
      }
    } catch (error) {
      console.error('Failed to fetch billing info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing information.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: 'pro' | 'enterprise') => {
    setProcessingAction(true);
    try {
      const priceId = tier === 'pro'
        ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID;

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          tier,
          userId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Failed to start upgrade:', error);
      toast({
        title: 'Error',
        description: 'Failed to start upgrade process. Please try again.',
        variant: 'destructive',
      });
      setProcessingAction(false);
      setShowUpgradeModal(false);
    }
  };

  const handlePauseSubscription = async () => {
    setProcessingAction(true);
    try {
      const response = await fetch('/api/stripe/pause-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast({
          title: 'Subscription paused',
          description: 'Your subscription will be paused for 3 months.',
        });
        fetchBillingInfo();
      } else {
        throw new Error('Failed to pause subscription');
      }
    } catch (error) {
      console.error('Failed to pause subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to pause subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
      setShowPauseModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading billing information...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!billingInfo) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">No billing information available.</div>
          </div>
        </div>
      </div>
    );
  }

  const tierBadge = {
    free: <Badge className="bg-slate-700 text-slate-200">Free</Badge>,
    pro: <Badge className="bg-emerald-500 text-white"><Crown className="w-3 h-3 mr-1 inline" />Pro</Badge>,
    enterprise: <Badge className="bg-purple-500 text-white"><Crown className="w-3 h-3 mr-1 inline" />Enterprise</Badge>,
  };

  const statusBadge = {
    active: <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>,
    canceled: <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Canceled</Badge>,
    past_due: <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Past Due</Badge>,
    trialing: <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Trial</Badge>,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Billing & Subscription</h1>
          <p className="text-slate-400">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>

        {/* Checkout Flow Component - shows success/error states from URL params */}
        <CheckoutFlow
          onSuccess={() => fetchBillingInfo()}
          onRetry={() => setShowUpgradeModal(true)}
        />

        {/* Current Plan Card */}
        <Card className="bg-slate-900 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Current Plan
              </span>
              {tierBadge[billingInfo.subscription_tier]}
            </CardTitle>
            <CardDescription className="text-slate-400">
              Your current subscription details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan Status */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-sm text-slate-400 mb-2">Status</div>
                <div>
                  {billingInfo.subscription_status
                    ? statusBadge[billingInfo.subscription_status as keyof typeof statusBadge]
                    : <span className="text-slate-300">No subscription</span>
                  }
                </div>
              </div>

              {/* Renewal Date */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-sm text-slate-400 mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {billingInfo.subscription_tier === 'free' ? 'Plan' : 'Renewal Date'}
                </div>
                <div className="text-slate-100 font-semibold">
                  {billingInfo.subscription_current_period_end
                    ? format(new Date(billingInfo.subscription_current_period_end), 'MMM d, yyyy')
                    : billingInfo.subscription_tier === 'free' ? 'Free Forever' : 'N/A'
                  }
                </div>
              </div>

              {/* Payment Method */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-sm text-slate-400 mb-2">Payment Method</div>
                <div className="text-slate-100 font-semibold">
                  {billingInfo.payment_method_last4
                    ? `${billingInfo.payment_method_brand?.toUpperCase()} •••• ${billingInfo.payment_method_last4}`
                    : 'No payment method'
                  }
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              {billingInfo.subscription_tier === 'free' ? (
                <Button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              ) : (
                <>
                  <ManageSubscriptionButton
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    returnUrl={`${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`}
                  />
                  {billingInfo.subscription_status === 'active' && (
                    <Button
                      onClick={() => setShowPauseModal(true)}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause for 3 Months
                    </Button>
                  )}
                </>
              )}
            </div>

            {billingInfo.subscription_status === 'past_due' && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-400 mb-1">Payment Failed</div>
                  <div className="text-sm text-slate-300">
                    Your last payment failed. Please update your payment method to avoid service interruption.
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Metrics Card */}
        <Card className="bg-slate-900 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Usage This Month
            </CardTitle>
            <CardDescription className="text-slate-400">
              Track your monthly activity and feature usage
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <div className="text-sm text-slate-400 mb-2">RSU Entries</div>
                <div className="text-3xl font-bold text-blue-400">{billingInfo.usage.rsu_entries}</div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                <div className="text-sm text-slate-400 mb-2">PDF Exports</div>
                <div className="text-3xl font-bold text-emerald-400">{billingInfo.usage.pdf_exports}</div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                <div className="text-sm text-slate-400 mb-2">AI Advisor Queries</div>
                <div className="text-3xl font-bold text-purple-400">{billingInfo.usage.ai_queries}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing History Card */}
        {billingInfo.invoices.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Download className="w-5 h-5 text-slate-400" />
                Billing History
              </CardTitle>
              <CardDescription className="text-slate-400">
                View and download your invoices
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-400">Invoice Date</TableHead>
                    <TableHead className="text-slate-400">Amount</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingInfo.invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="text-slate-300">
                        {format(new Date(invoice.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-slate-100 font-semibold">
                        ${(invoice.amount / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {invoice.status === 'paid' && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Paid</Badge>
                        )}
                        {invoice.status === 'open' && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Open</Badge>
                        )}
                        {invoice.status === 'void' && (
                          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Void</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription className="text-slate-400">
              Choose the plan that best fits your needs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg border-2 border-emerald-500 bg-emerald-500/10 cursor-pointer hover:bg-emerald-500/20 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Pro Plan
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Perfect for individuals</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-100">$29</div>
                  <div className="text-sm text-slate-400">/month</div>
                </div>
              </div>
              <ul className="text-sm text-slate-300 space-y-2 mb-4">
                <li>✓ Unlimited RSU entries</li>
                <li>✓ AI tax advisor</li>
                <li>✓ PDF export</li>
                <li>✓ Priority support</li>
              </ul>
              <Button
                onClick={() => handleUpgrade('pro')}
                disabled={processingAction}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                {processingAction ? 'Processing...' : 'Upgrade to Pro'}
              </Button>
            </div>

            <div className="p-4 rounded-lg border-2 border-purple-500 bg-purple-500/10 cursor-pointer hover:bg-purple-500/20 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Enterprise Plan
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">For agencies & firms</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-100">$99</div>
                  <div className="text-sm text-slate-400">/month</div>
                </div>
              </div>
              <ul className="text-sm text-slate-300 space-y-2 mb-4">
                <li>✓ Everything in Pro</li>
                <li>✓ Multi-client management</li>
                <li>✓ White-label reports</li>
                <li>✓ Dedicated support</li>
              </ul>
              <Button
                onClick={() => handleUpgrade('enterprise')}
                disabled={processingAction}
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                {processingAction ? 'Processing...' : 'Upgrade to Enterprise'}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause Subscription Modal */}
      <Dialog open={showPauseModal} onOpenChange={setShowPauseModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Pause Subscription</DialogTitle>
            <DialogDescription className="text-slate-400">
              Temporarily pause your subscription for 3 months
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-slate-300 mb-4">
              Your subscription will be paused for 3 months. You won't be charged during this period,
              and your account will retain all data. This is useful if you're temporarily leaving the US or Canada.
            </p>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-slate-300">
                <strong className="text-blue-400">Note:</strong> Your subscription will automatically resume
                after 3 months. You can cancel anytime from the billing portal.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPauseModal(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePauseSubscription}
              disabled={processingAction}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {processingAction ? 'Processing...' : 'Pause for 3 Months'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
