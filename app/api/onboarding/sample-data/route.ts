import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getDatabase,
  insertRSUEntry,
  insertTaxCalculation,
  getUserProfileByClerkId,
  cacheExchangeRate,
  type RSUEntryInput,
  type TaxCalculationInput,
} from '@/lib/db';

/**
 * POST /api/onboarding/sample-data
 * Creates sample RSU entries and tax calculations for new users
 */
export async function POST() {
  try {
    const { userId: clerkUserId } = auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = getUserProfileByClerkId(clerkUserId);
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const userId = userProfile.id;

    // Cache exchange rates for sample data
    const exchangeRates = [
      { date: '2024-01-15', rate: 1.3450 },
      { date: '2024-04-15', rate: 1.3620 },
      { date: '2024-07-15', rate: 1.3580 },
      { date: '2024-10-15', rate: 1.3730 },
      { date: '2025-01-15', rate: 1.3820 },
    ];

    exchangeRates.forEach(({ date, rate }) => {
      cacheExchangeRate(date, rate);
    });

    // Sample RSU entries based on user's employer preference or default to Meta
    const sampleRSUEntries: RSUEntryInput[] = [
      {
        user_id: userId,
        vest_date: '2024-01-15',
        fmv_usd: 425.50,
        shares: 50,
        employer: 'Meta',
        ticker_symbol: 'META',
      },
      {
        user_id: userId,
        vest_date: '2024-04-15',
        fmv_usd: 445.75,
        shares: 50,
        employer: 'Meta',
        ticker_symbol: 'META',
      },
      {
        user_id: userId,
        vest_date: '2024-07-15',
        fmv_usd: 520.25,
        shares: 50,
        employer: 'Meta',
        ticker_symbol: 'META',
      },
      {
        user_id: userId,
        vest_date: '2024-10-15',
        fmv_usd: 585.30,
        shares: 50,
        employer: 'Meta',
        ticker_symbol: 'META',
      },
      {
        user_id: userId,
        vest_date: '2025-01-15',
        fmv_usd: 650.00,
        shares: 100,
        employer: 'Amazon',
        ticker_symbol: 'AMZN',
      },
    ];

    const rsuIds: number[] = [];
    sampleRSUEntries.forEach((entry) => {
      const id = insertRSUEntry(entry);
      rsuIds.push(id);
    });

    // Create tax calculations for each RSU entry
    sampleRSUEntries.forEach((entry, index) => {
      const rsuId = rsuIds[index];
      const totalValue = entry.fmv_usd * entry.shares;
      const exchangeRate = exchangeRates[index].rate;
      const valueCAD = totalValue * exchangeRate;

      // Simplified tax calculation using approximate rates
      const usFederalRate = 0.24; // 24% federal bracket
      const usStateRate = 0.093; // CA state tax ~9.3%
      const canadaFederalRate = 0.26; // 26% federal bracket
      const canadaProvincialRate = 0.1229; // BC ~12.29%

      const usFederalTax = totalValue * usFederalRate;
      const usStateTax = totalValue * usStateRate;
      const usTotalTax = usFederalTax + usStateTax;

      const canadaFederalTax = valueCAD * canadaFederalRate;
      const canadaProvincialTax = valueCAD * canadaProvincialRate;
      const canadaTotalTax = canadaFederalTax + canadaProvincialTax;

      // Foreign Tax Credit (simplified)
      const ftcEligible = usTotalTax;
      const ftcClaimedCAD = ftcEligible * exchangeRate;

      // Net tax = Canada tax - FTC claimed
      const netTaxPayable = Math.max(0, canadaTotalTax - ftcClaimedCAD);
      const effectiveRate = (netTaxPayable / valueCAD) * 100;

      const taxCalc: TaxCalculationInput = {
        rsu_entry_id: rsuId,
        user_id: userId,
        rsu_income_usd: totalValue,
        rsu_income_cad: valueCAD,
        exchange_rate: exchangeRate,
        us_federal_tax: usFederalTax,
        us_state_tax: usStateTax,
        us_total_tax: usTotalTax,
        canada_federal_tax: canadaFederalTax,
        canada_provincial_tax: canadaProvincialTax,
        canada_total_tax: canadaTotalTax,
        ftc_eligible_usd: ftcEligible,
        ftc_claimed_cad: ftcClaimedCAD,
        net_tax_payable: netTaxPayable,
        effective_tax_rate: effectiveRate,
        tax_year: parseInt(entry.vest_date.split('-')[0]),
        notes: 'Sample calculation - generated during onboarding',
      };

      insertTaxCalculation(taxCalc);
    });

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      rsuCount: rsuIds.length,
    });
  } catch (error) {
    console.error('Error creating sample data:', error);
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    );
  }
}
