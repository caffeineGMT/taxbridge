/**
 * Demo script showing Bank of Canada API integration
 * Uses recent weekday dates that should have exchange rate data
 */

import { getExchangeRate, convertUsdToCadByDate, formatCurrency } from '../lib/currency';
import { getDatabase } from '../lib/db/index';

async function demo() {
  console.log('📊 Bank of Canada Exchange Rate Integration Demo\n');

  // Test with recent weekday dates
  const dates = [
    '2024-03-15', // Friday
    '2024-06-20', // Thursday
    '2024-09-25', // Wednesday
  ];

  console.log('Fetching exchange rates from Bank of Canada API...\n');

  for (const date of dates) {
    const rate = await getExchangeRate(date);
    const usd = 10000;
    const cad = await convertUsdToCadByDate(usd, date);

    console.log(`${date}:`);
    console.log(`  Rate: ${rate.toFixed(4)} USD/CAD`);
    console.log(`  ${formatCurrency(usd, 'USD')} = ${formatCurrency(cad, 'CAD')}\n`);
  }

  // Show cached rates
  console.log('---\n');
  console.log('Cached rates in database:');
  const db = getDatabase();
  const cached = db.prepare('SELECT rate_date, usd_to_cad, source FROM exchange_rates ORDER BY rate_date DESC').all() as Array<{
    rate_date: string;
    usd_to_cad: number;
    source: string;
  }>;

  cached.forEach((row) => {
    console.log(`  ${row.rate_date}: ${row.usd_to_cad.toFixed(4)} (${row.source})`);
  });

  console.log('\n✨ Demo complete!\n');
}

demo().catch(console.error);
