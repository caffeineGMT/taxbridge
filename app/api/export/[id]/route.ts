import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/index';
import { calculateUSFederalTax, calculateUSStateTax } from '@/lib/tax/us-calculator';
import {
  calculateCanadaFederalTax,
  calculateCanadaProvincialTax,
  calculateForeignTaxCredit,
} from '@/lib/tax/canada-calculator';
import { getYearFromDate, getAverageRate } from '@/lib/currency';
import { generateTaxSummaryPDF } from '@/lib/pdf/tax-summary-generator';
import { trackEvent } from '@/lib/analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();

    // Fetch RSU entry from database with user profile
    const stmt = db.prepare(`
      SELECT
        r.id,
        r.user_id,
        r.vest_date,
        r.fmv_usd,
        r.shares,
        r.employer,
        r.ticker_symbol,
        r.fmv_usd * r.shares as total_value_usd,
        u.us_state,
        u.canada_province
      FROM rsu_entries r
      LEFT JOIN user_profiles u ON r.user_id = u.id
      WHERE r.id = ?
    `);
    const rsu = stmt.get(id) as any;

    if (!rsu) {
      return NextResponse.json({ error: 'RSU entry not found' }, { status: 404 });
    }

    // Get exchange rate based on vesting year
    const vestingYear = getYearFromDate(rsu.vest_date);
    const exchangeRate = getAverageRate(vestingYear);

    // Convert RSU value to CAD
    const totalValueCAD = rsu.total_value_usd * exchangeRate;

    // Calculate US taxes (on USD amount)
    // Use default 'WA' if us_state is null (Washington has no state income tax)
    const usState = (rsu.us_state || 'WA') as 'WA' | 'CA' | 'NY' | 'TX';
    const usFederalTax = calculateUSFederalTax(rsu.total_value_usd, 'single');
    const usStateTax = calculateUSStateTax(rsu.total_value_usd, usState);
    const totalUSTax = usFederalTax.tax + usStateTax.tax;

    // Calculate Canada taxes (on CAD amount)
    // Use default 'BC' if canada_province is null
    const canadaProvince = (rsu.canada_province || 'BC') as 'BC' | 'ON' | 'AB';
    const canadaFederalTax = calculateCanadaFederalTax(totalValueCAD);
    const canadaProvincialTax = calculateCanadaProvincialTax(totalValueCAD, canadaProvince);
    const totalCanadaTaxBeforeFTC = canadaFederalTax.tax + canadaProvincialTax.tax;

    // Calculate Foreign Tax Credit
    // For MVP, assume 100% of income is US-sourced (since it's RSUs from US companies)
    const ftc = calculateForeignTaxCredit(
      totalUSTax,
      totalValueCAD, // US-sourced income in CAD
      totalValueCAD, // Total income in CAD
      totalCanadaTaxBeforeFTC
    );

    // Prepare tax summary data
    const taxSummaryData = {
      rsu: {
        id: rsu.id,
        employer: rsu.employer,
        tickerSymbol: rsu.ticker_symbol,
        vestingDate: rsu.vest_date,
        shares: rsu.shares,
        fmvUsd: rsu.fmv_usd,
        totalValueUsd: rsu.total_value_usd,
        totalValueCad: totalValueCAD,
        usState: usState,
        canadaProvince: canadaProvince,
      },
      usTax: {
        federal: {
          tax: usFederalTax.tax,
          effectiveRate: usFederalTax.effectiveRate,
          marginalRate: usFederalTax.marginalRate,
          breakdown: usFederalTax.breakdown,
        },
        state: {
          tax: usStateTax.tax,
          effectiveRate: usStateTax.effectiveRate,
          breakdown: usStateTax.breakdown,
        },
        total: totalUSTax,
      },
      canadaTax: {
        federal: {
          tax: canadaFederalTax.tax,
          effectiveRate: canadaFederalTax.effectiveRate,
          marginalRate: canadaFederalTax.marginalRate,
          breakdown: canadaFederalTax.breakdown,
        },
        provincial: {
          tax: canadaProvincialTax.tax,
          effectiveRate: canadaProvincialTax.effectiveRate,
          breakdown: canadaProvincialTax.breakdown,
        },
        ftc: {
          amount: ftc.ftcAmount,
          explanation: ftc.explanation,
        },
        totalBeforeFTC: totalCanadaTaxBeforeFTC,
        netTotal: ftc.remainingCanadaTax,
      },
      exchangeRate,
    };

    // Generate PDF
    const pdfBuffer = generateTaxSummaryPDF(taxSummaryData);

    // Track analytics event
    trackEvent(rsu.user_id, 'pdf_exported', {
      rsu_id: rsu.id,
      employer: rsu.employer,
    });

    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="taxbridge-summary-${id}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
