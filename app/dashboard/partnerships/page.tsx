'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Partner {
  id: number;
  partner_type: 'immigration_lawyer' | 'cpa' | 'other';
  name: string;
  firm_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  specialization: string | null;
  estimated_client_count: number | null;
  location_city: string | null;
  location_state: string | null;
  revenue_share_percentage: number;
  referral_code: string;
  status: 'prospect' | 'contacted' | 'interested' | 'active' | 'inactive' | 'rejected';
  first_contacted_at: string | null;
  last_contacted_at: string | null;
  intro_call_scheduled_at: string | null;
  intro_call_completed_at: string | null;
  partnership_activated_at: string | null;
  total_referrals: number;
  successful_referrals: number;
  total_revenue_generated: number;
  total_commission_earned: number;
  created_at: string;
}

interface PartnerMetrics {
  total_referrals: number;
  successful_referrals: number;
  conversion_rate: number;
  total_revenue: number;
  total_commission: number;
  avg_referral_value: number;
}

export default function PartnershipDashboard() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'immigration_lawyer' | 'cpa'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchPartners();
  }, [filterType, filterStatus]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterType !== 'all') queryParams.append('type', filterType);
      if (filterStatus !== 'all') queryParams.append('status', filterStatus);

      const response = await fetch(`/api/partners?${queryParams.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setPartners(data.partners);
      } else {
        console.error('Failed to fetch partners:', data.error);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Partner['status']) => {
    const variants: Record<Partner['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      prospect: 'outline',
      contacted: 'secondary',
      interested: 'default',
      active: 'default',
      inactive: 'secondary',
      rejected: 'destructive',
    };

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getTypeBadge = (type: Partner['partner_type']) => {
    const labels: Record<Partner['partner_type'], string> = {
      immigration_lawyer: 'Immigration Lawyer',
      cpa: 'CPA',
      other: 'Other',
    };

    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  // Calculate aggregate metrics
  const totalPartners = partners.length;
  const activePartners = partners.filter((p) => p.status === 'active').length;
  const prospectPartners = partners.filter((p) => p.status === 'prospect').length;
  const contactedPartners = partners.filter((p) => p.status === 'contacted').length;
  const totalReferrals = partners.reduce((sum, p) => sum + p.total_referrals, 0);
  const successfulReferrals = partners.reduce((sum, p) => sum + p.successful_referrals, 0);
  const totalRevenue = partners.reduce((sum, p) => sum + p.total_revenue_generated, 0);
  const totalCommission = partners.reduce((sum, p) => sum + p.total_commission_earned, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Partnership Dashboard</h1>
        <p className="text-muted-foreground">
          Track partnership outreach, referrals, and revenue sharing
        </p>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Partners</CardDescription>
            <CardTitle className="text-3xl">{totalPartners}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {activePartners} active, {prospectPartners} prospects
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Referrals</CardDescription>
            <CardTitle className="text-3xl">{totalReferrals}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {successfulReferrals} converted (
              {totalReferrals > 0
                ? ((successfulReferrals / totalReferrals) * 100).toFixed(1)
                : 0}
              %)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl">${totalRevenue.toFixed(0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              From partner referrals
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Commissions</CardDescription>
            <CardTitle className="text-3xl">${totalCommission.toFixed(0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Paid to partners (30%)</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All Partners</TabsTrigger>
            <TabsTrigger value="immigration_lawyer">Immigration Lawyers</TabsTrigger>
            <TabsTrigger value="cpa">CPAs</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All Status
          </Button>
          <Button
            variant={filterStatus === 'prospect' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('prospect')}
          >
            Prospects
          </Button>
          <Button
            variant={filterStatus === 'contacted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('contacted')}
          >
            Contacted
          </Button>
          <Button
            variant={filterStatus === 'interested' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('interested')}
          >
            Interested
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            Active
          </Button>
        </div>
      </div>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partners ({partners.length})</CardTitle>
          <CardDescription>
            All partnership outreach contacts and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading partners...</div>
          ) : partners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No partners found. Run the outreach campaign script to add partners.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Firm</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Converted</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>{partner.firm_name}</TableCell>
                    <TableCell>{getTypeBadge(partner.partner_type)}</TableCell>
                    <TableCell>{getStatusBadge(partner.status)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {partner.referral_code}
                    </TableCell>
                    <TableCell>{partner.total_referrals}</TableCell>
                    <TableCell>{partner.successful_referrals}</TableCell>
                    <TableCell>${partner.total_revenue_generated.toFixed(0)}</TableCell>
                    <TableCell>${partner.total_commission_earned.toFixed(0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
