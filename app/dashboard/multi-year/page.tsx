import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ChevronDown, Info, TrendingUp, DollarSign } from 'lucide-react';
import { getUserProfileByClerkId, getDatabase } from '@/lib/db';
import { calculateFTCCarryforward } from '@/lib/ftc-carryforward';
import { calculateUSFederalTax, calculateUSStateTax } from '@/lib/tax/us-calculator';
import { calculateCanadaFederalTax, calculateCanadaProvincialTax } from '@/lib/tax/canada-calculator';
import { calculateFTC } from '@/lib/tax/ftc-calculator';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TaxDisclaimer } from '@/components/legal/tax-disclaimer';
// Chart components dynamically imported only when used (recharts is ~300KB)
// import { IncomeLineChart, CumulativeTaxAreaChart, YearSelector, FTCCarryforwardBanner } from './components';

interface YearlyData {
  year: number;
  totalIncome: number;
  usTax: number;
  canadaTax: number;
  ftcSavings: number;
  entryCount: number;
}

// Server Component - fetches data at request time
export default async function MultiYearDashboard({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { userId: clerkUserId } = await auth();
  const params = await searchParams;
  const year = params.year;

  if (!clerkUserId) {
    redirect('/sign-in');
  }

  // Get user profile from database
  const userProfile = getUserProfileByClerkId(clerkUserId);

  if (!userProfile) {
    redirect('/onboarding');
  }

  // Check if user completed onboarding
  if (!userProfile.canada_province || !userProfile.us_state || !userProfile.filing_status) {
    redirect('/onboarding');
  }

  const userId = userProfile.id;
  const selectedYear = year ? parseInt(year) : new Date().getFullYear();
  const db = getDatabase();

  // Fetch RSU entries grouped by year
  const yearlyIncomeStmt = db.prepare(`
    SELECT
      year,
      SUM(fmv_usd * shares) as total_income,
      COUNT(*) as entry_count
    FROM rsu_entries
    WHERE user_id = ?
    GROUP BY year
    ORDER BY year ASC
  `);

  const yearlyIncomeData = yearlyIncomeStmt.all(userId) as Array<{
    year: number;
    total_income: number;
    entry_count: number;
  }>;

  // Calculate tax for each year
  const yearlyData: YearlyData[] = yearlyIncomeData.map((row) => {
    const income = row.total_income;

    // Calculate US tax
    const usFederalResult = calculateUSFederalTax(income, userProfile.filing_status as any);
    const usStateResult = calculateUSStateTax(
      income,
      userProfile.us_state as any
    );
    const usTotalTax = usFederalResult.tax + usStateResult.tax;

    // Calculate Canada tax
    const canadaFederalResult = calculateCanadaFederalTax(income);
    const canadaProvincialResult = calculateCanadaProvincialTax(
      income,
      userProfile.canada_province as any
    );
    const canadaTotalTax = canadaFederalResult.tax + canadaProvincialResult.tax;

    // Calculate FTC savings
    const ftcResult = calculateFTC(
      usTotalTax,
      canadaTotalTax,
      income,
      userProfile.us_state as any,
      userProfile.canada_province as any
    );

    return {
      year: row.year,
      totalIncome: income,
      usTax: usTotalTax,
      canadaTax: canadaTotalTax,
      ftcSavings: ftcResult.savings,
      entryCount: row.entry_count,
    };
  });

  // Get FTC carryforward data for selected year
  const ftcCarryforward = await calculateFTCCarryforward(userId, selectedYear);

  // Available years for selector (2022-2026)
  const availableYears = Array.from({ length: 5 }, (_, i) => 2022 + i);

  // Calculate cumulative statistics
  const totalAllTimeIncome = yearlyData.reduce((sum, d) => sum + d.totalIncome, 0);
  const totalAllTimeTax =
    yearlyData.reduce((sum, d) => sum + d.usTax + d.canadaTax - d.ftcSavings, 0);
  const averageEffectiveRate =
    totalAllTimeIncome > 0 ? (totalAllTimeTax / totalAllTimeIncome) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px),
            repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px)
          `,
        }}
      />

      {/* Header */}
      <Header />

      <main className="relative container mx-auto px-6 py-8">
        {/* Page Header with Year Selector */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">
              Multi-Year Tax Analysis
            </h1>
            <p className="text-slate-400">
              Track your RSU income and tax burden across multiple years
            </p>
          </div>

          {/* TODO: Implement YearSelector component */}
          {/* <YearSelector selectedYear={selectedYear} availableYears={availableYears} /> */}
        </div>

        {/* Tax Disclaimer */}
        <TaxDisclaimer variant="compact" />

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">All-Time Income</CardDescription>
              <CardTitle className="text-3xl text-emerald-400">
                ${totalAllTimeIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                {yearlyData.reduce((sum, d) => sum + d.entryCount, 0)} vesting events across{' '}
                {yearlyData.length} years
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Total Tax Paid</CardDescription>
              <CardTitle className="text-3xl text-blue-400">
                ${totalAllTimeTax.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">After FTC optimization</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Avg. Effective Rate</CardDescription>
              <CardTitle className="text-3xl text-purple-400">
                {averageEffectiveRate.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Combined US + Canada after credits</p>
            </CardContent>
          </Card>
        </div>

        {/* FTC Carryforward Banner */}
        {/* TODO: Implement FTCCarryforwardBanner component */}
        {/* {ftcCarryforward.availableCarryforward > 0 && (
          <FTCCarryforwardBanner
            availableCarryforward={ftcCarryforward.availableCarryforward}
            carryforwardRecords={ftcCarryforward.carryforwardRecords}
            selectedYear={selectedYear}
          />
        )} */}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Income Trend Chart */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-slate-100">RSU Income Trend</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Yearly RSU vesting income (USD)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implement IncomeLineChart component */}
              {/* <IncomeLineChart data={yearlyData} /> */}
              <p className="text-slate-500 text-center py-8">Chart visualization coming soon</p>
            </CardContent>
          </Card>

          {/* Cumulative Tax Chart */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-slate-100">Cumulative Tax Burden</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Stacked view: US (blue) + Canada (red)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implement CumulativeTaxAreaChart component */}
              {/* <CumulativeTaxAreaChart data={yearlyData} /> */}
              <p className="text-slate-500 text-center py-8">Chart visualization coming soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Yearly Breakdown Table */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Yearly Breakdown</CardTitle>
            <CardDescription className="text-slate-400">
              Detailed tax analysis by year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Year</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Income</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">US Tax</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                      Canada Tax
                    </th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                      FTC Savings
                    </th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Net Tax</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                      Effective Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyData.map((row) => {
                    const netTax = row.usTax + row.canadaTax - row.ftcSavings;
                    const effectiveRate = (netTax / row.totalIncome) * 100;

                    return (
                      <tr
                        key={row.year}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-200 font-medium">{row.year}</td>
                        <td className="py-3 px-4 text-right text-slate-200">
                          ${row.totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3 px-4 text-right text-blue-400">
                          ${row.usTax.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3 px-4 text-right text-red-400">
                          ${row.canadaTax.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-400">
                          -${row.ftcSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-200 font-medium">
                          ${netTax.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3 px-4 text-right text-purple-400">
                          {effectiveRate.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Info Banner */}
        {yearlyData.length === 0 && (
          <Alert variant="info" className="mt-8">
            <Info className="h-5 w-5" />
            <AlertTitle>No Data Available</AlertTitle>
            <AlertDescription>
              Add RSU vesting events to see your multi-year tax analysis. Navigate to the dashboard
              to enter your first vesting event.
            </AlertDescription>
          </Alert>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} TaxBridge. Multi-year tax optimization for
              cross-border tech workers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
