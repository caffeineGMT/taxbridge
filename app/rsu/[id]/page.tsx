import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaxComparison } from '@/components/tax/tax-comparison';
import { FTCOptimizer } from '@/components/tax/ftc-optimizer';
import { ArrowLeft, Building2, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getRSUData(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/rsu/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

const EMPLOYER_LOGOS: Record<string, string> = {
  meta: '🌐',
  META: '🌐',
  amazon: '📦',
  AMAZON: '📦',
  google: '🔍',
  GOOGLE: '🔍',
  microsoft: '💻',
  MICROSOFT: '💻',
};

const EMPLOYER_NAMES: Record<string, string> = {
  meta: 'Meta Platforms',
  META: 'Meta Platforms',
  amazon: 'Amazon',
  AMAZON: 'Amazon',
  google: 'Google (Alphabet)',
  GOOGLE: 'Google (Alphabet)',
  microsoft: 'Microsoft',
  MICROSOFT: 'Microsoft',
};

export default async function RSUDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getRSUData(id);

  if (!data) {
    notFound();
  }

  const { rsu, usTax, canadaTax, exchangeRate } = data;
  const employerLogo = EMPLOYER_LOGOS[rsu.employer] || '🏢';
  const employerName = EMPLOYER_NAMES[rsu.employer] || rsu.employer;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* RSU Details Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{employerLogo}</div>
              <div>
                <CardTitle className="text-3xl mb-2">{employerName} RSU</CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{rsu.tickerSymbol}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Vested: {new Date(rsu.vestingDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            {/* Shares */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Shares Vested</p>
              <p className="text-2xl font-bold">{rsu.shares.toLocaleString()}</p>
            </div>

            {/* FMV */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Fair Market Value
              </p>
              <p className="text-2xl font-bold">
                ${rsu.fmvUsd.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">per share</p>
            </div>

            {/* Total USD */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Total Value (USD)
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${rsu.totalValueUsd.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Total CAD */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Total Value (CAD)
              </p>
              <p className="text-2xl font-bold text-green-600">
                C${rsu.totalValueCad.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                @ {exchangeRate.toFixed(4)} USD/CAD
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Comparison Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Tax Breakdown</h2>
        <TaxComparison
          usTax={usTax}
          canadaTax={canadaTax}
          rsuValueUsd={rsu.totalValueUsd}
          rsuValueCad={rsu.totalValueCad}
          exchangeRate={exchangeRate}
        />
      </div>

      {/* Foreign Tax Credit Optimizer */}
      <div className="mb-8">
        <FTCOptimizer
          rsuEntry={rsu}
          usTax={usTax.total}
          canadaTax={canadaTax.netTotal}
          ftcAmount={canadaTax.ftc.amount}
          canadaTaxBeforeFTC={canadaTax.totalBeforeFTC}
        />
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl">Tax Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total US Tax</p>
              <p className="text-xl font-bold text-red-600">
                ${usTax.total.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {((usTax.total / rsu.totalValueUsd) * 100).toFixed(2)}% of USD income
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Foreign Tax Credit</p>
              <p className="text-xl font-bold text-blue-600">
                -C${canadaTax.ftc.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">Reduces Canada tax</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Net Canada Tax</p>
              <p className="text-xl font-bold text-green-600">
                C${canadaTax.netTotal.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {((canadaTax.netTotal / rsu.totalValueCad) * 100).toFixed(2)}% of CAD income
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
