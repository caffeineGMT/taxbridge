import { logger } from '@/lib/logger';
import {
  getDatabase,
  insertRSUEntry,
  insertTaxCalculation,
  getOrCreateDefaultUser,
  cacheExchangeRate,
  type RSUEntryInput,
  type TaxCalculationInput,
} from './index.js';

/**
 * Seed the database with sample data for testing
 */
export async function seedDatabase(): Promise<void> {
  const db = getDatabase();

  logger.info('🌱 Seeding database with sample data...');

  // Get or create default user
  const user = await getOrCreateDefaultUser();
  logger.info(`✓ User profile created: ${user.first_name} ${user.last_name} (ID: ${user.id})`);

  // Cache some exchange rates
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
  logger.info(`✓ Cached ${exchangeRates.length} exchange rates`);

  // Sample RSU entries
  const rsuEntries: RSUEntryInput[] = [
    {
      user_id: user.id,
      vest_date: '2024-01-15',
      fmv_usd: 425.50,
      shares: 50,
      employer: 'Meta',
      ticker_symbol: 'META',
    },
    {
      user_id: user.id,
      vest_date: '2024-04-15',
      fmv_usd: 445.75,
      shares: 50,
      employer: 'Meta',
      ticker_symbol: 'META',
    },
    {
      user_id: user.id,
      vest_date: '2024-07-15',
      fmv_usd: 520.25,
      shares: 50,
      employer: 'Meta',
      ticker_symbol: 'META',
    },
    {
      user_id: user.id,
      vest_date: '2024-10-15',
      fmv_usd: 585.30,
      shares: 50,
      employer: 'Meta',
      ticker_symbol: 'META',
    },
    {
      user_id: user.id,
      vest_date: '2025-01-15',
      fmv_usd: 650.00,
      shares: 100,
      employer: 'Amazon',
      ticker_symbol: 'AMZN',
    },
  ];

  const rsuIds: number[] = [];
  for (let index = 0; index < rsuEntries.length; index++) {
    const entry = rsuEntries[index];
    const id = await insertRSUEntry(entry);
    rsuIds.push(id);
    logger.info(`✓ RSU entry ${index + 1}: ${entry.employer} - ${entry.shares} shares @ $${entry.fmv_usd} on ${entry.vest_date}`);
  }

  // Sample tax calculations for each RSU entry
  for (let index = 0; index < rsuEntries.length; index++) {
    const entry = rsuEntries[index];
    const rsuId = rsuIds[index];
    const totalValue = entry.fmv_usd * entry.shares;
    const exchangeRate = exchangeRates[index].rate;
    const valueCAD = totalValue * exchangeRate;

    // Simplified tax calculation (using approximate rates)
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

    // Foreign Tax Credit (simplified - US tax converted to CAD can be claimed)
    const ftcEligible = usTotalTax;
    const ftcClaimedCAD = ftcEligible * exchangeRate;

    // Net tax = Canada tax - FTC claimed
    const netTaxPayable = Math.max(0, canadaTotalTax - ftcClaimedCAD);
    const effectiveRate = (netTaxPayable / valueCAD) * 100;

    const taxCalc: TaxCalculationInput = {
      rsu_entry_id: rsuId,
      user_id: user.id,
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
      notes: 'Sample calculation using simplified tax rates',
    };

    await insertTaxCalculation(taxCalc);
    logger.info(`  ↳ Tax calculation: Net ${netTaxPayable.toFixed(2)} CAD (${effectiveRate.toFixed(2)}% effective rate)`);
  }

  logger.info('\n✨ Database seeding completed successfully!\n');
}

// Allow running this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}
