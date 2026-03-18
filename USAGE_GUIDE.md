# Currency Exchange Rate Integration - Usage Guide

## Quick Start

### 1. Display Currency with Automatic Conversion

```tsx
import { CurrencyDisplay } from '@/components/ui/currency-display';

export default function RSUCard() {
  const vestingDate = '2024-11-15';
  const rsuValue = 50000;

  return (
    <div className="card">
      <h3>RSU Vesting Value</h3>
      <CurrencyDisplay
        amountUsd={rsuValue}
        date={vestingDate}
        className="my-4"
      />
    </div>
  );
}
```

**Output:**
```
$50,000.00 USD
C$70,395.00 CAD
```

### 2. Server-Side Conversion

```tsx
import { getExchangeRate, convertUsdToCadByDate } from '@/lib/currency';

export default async function TaxCalculator() {
  const vestDate = '2024-11-15';
  const rsuIncome = 100000;

  // Get exchange rate
  const rate = await getExchangeRate(vestDate);

  // Convert to CAD
  const cadIncome = await convertUsdToCadByDate(rsuIncome, vestDate);

  return (
    <div>
      <p>Exchange Rate: {rate.toFixed(4)}</p>
      <p>USD Income: ${rsuIncome.toLocaleString()}</p>
      <p>CAD Income: C${cadIncome.toLocaleString()}</p>
    </div>
  );
}
```

### 3. API Endpoint Usage

```typescript
// In a client component
const fetchRate = async (date: string) => {
  const response = await fetch(`/api/exchange-rate?date=${date}`);
  const data = await response.json();

  return data.rate; // e.g., 1.4079
};

// Usage
const rate = await fetchRate('2024-11-15');
console.log(`Rate: ${rate}`); // Rate: 1.4079
```

### 4. Batch Processing

```tsx
import { getExchangeRate } from '@/lib/currency';

async function processMultipleVests(vests: Array<{ date: string; amount: number }>) {
  const results = await Promise.all(
    vests.map(async (vest) => {
      const rate = await getExchangeRate(vest.date);
      const cadAmount = vest.amount * rate;

      return {
        date: vest.date,
        usd: vest.amount,
        cad: cadAmount,
        rate,
      };
    })
  );

  return results;
}

// Usage
const vests = [
  { date: '2024-01-15', amount: 10000 },
  { date: '2024-04-15', amount: 10000 },
  { date: '2024-07-15', amount: 10000 },
  { date: '2024-10-15', amount: 10000 },
];

const processed = await processMultipleVests(vests);
```

## Integration Examples

### Example 1: RSU Entry Form

```tsx
'use client';

import { useState } from 'react';
import { CurrencyDisplay } from '@/components/ui/currency-display';

export function RSUEntryForm() {
  const [vestDate, setVestDate] = useState('2024-11-15');
  const [shares, setShares] = useState(100);
  const [fmv, setFMV] = useState(250);

  const totalValue = shares * fmv;

  return (
    <form>
      <input
        type="date"
        value={vestDate}
        onChange={(e) => setVestDate(e.target.value)}
      />
      <input
        type="number"
        value={shares}
        onChange={(e) => setShares(Number(e.target.value))}
      />
      <input
        type="number"
        value={fmv}
        onChange={(e) => setFMV(Number(e.target.value))}
      />

      <div className="mt-4">
        <h4>Total RSU Value</h4>
        <CurrencyDisplay
          amountUsd={totalValue}
          date={vestDate}
          className="text-lg font-bold"
        />
      </div>
    </form>
  );
}
```

### Example 2: Tax Calculator Dashboard

```tsx
import { getExchangeRate, formatCurrency } from '@/lib/currency';

export default async function TaxDashboard({ userId }: { userId: number }) {
  const rsuEvents = await getRSUEvents(userId); // Your DB query

  const calculations = await Promise.all(
    rsuEvents.map(async (event) => {
      const rate = await getExchangeRate(event.vestDate);
      const cadValue = event.totalValueUsd * rate;

      return {
        ...event,
        rate,
        cadValue,
      };
    })
  );

  const totalUSD = calculations.reduce((sum, calc) => sum + calc.totalValueUsd, 0);
  const totalCAD = calculations.reduce((sum, calc) => sum + calc.cadValue, 0);

  return (
    <div className="dashboard">
      <h2>Tax Year Summary</h2>
      <div className="totals">
        <div>
          <span>Total RSU Income (USD):</span>
          <span className="font-bold">{formatCurrency(totalUSD, 'USD')}</span>
        </div>
        <div>
          <span>Total RSU Income (CAD):</span>
          <span className="font-bold">{formatCurrency(totalCAD, 'CAD')}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>USD</th>
            <th>Rate</th>
            <th>CAD</th>
          </tr>
        </thead>
        <tbody>
          {calculations.map((calc) => (
            <tr key={calc.id}>
              <td>{calc.vestDate}</td>
              <td>{formatCurrency(calc.totalValueUsd, 'USD')}</td>
              <td>{calc.rate.toFixed(4)}</td>
              <td>{formatCurrency(calc.cadValue, 'CAD')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Example 3: Real-time Conversion Widget

```tsx
'use client';

import { useState, useEffect } from 'react';

export function LiveConverter() {
  const [amount, setAmount] = useState(1000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRate = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/exchange-rate?date=${date}`);
        const data = await response.json();
        setRate(data.rate);
      } catch (error) {
        console.error('Failed to fetch rate:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, [date]);

  const cadAmount = rate ? amount * rate : null;

  return (
    <div className="converter">
      <h3>Currency Converter</h3>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Amount in USD"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {loading ? (
        <p>Loading rate...</p>
      ) : rate ? (
        <div className="result">
          <p>Exchange Rate: {rate.toFixed(4)}</p>
          <p>
            ${amount.toLocaleString()} USD ={' '}
            C${cadAmount?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} CAD
          </p>
        </div>
      ) : (
        <p>Unable to fetch rate</p>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Always Handle Loading States

```tsx
<CurrencyDisplay amountUsd={amount} date={date} />
// Component already handles loading internally
```

### 2. Use Memoization for Expensive Calculations

```tsx
import { useMemo } from 'react';

const totals = useMemo(() => {
  return events.reduce((acc, event) => ({
    usd: acc.usd + event.amount,
    // Note: CAD totals should be calculated server-side
  }), { usd: 0 });
}, [events]);
```

### 3. Batch API Calls Server-Side

```tsx
// ✅ Good: Server-side batch processing
const rates = await Promise.all(
  dates.map(date => getExchangeRate(date))
);

// ❌ Avoid: Client-side sequential calls
dates.forEach(async date => {
  const rate = await fetch(`/api/exchange-rate?date=${date}`);
});
```

### 4. Cache Wisely

The system already caches all fetched rates permanently. You don't need to implement additional caching.

### 5. Error Handling

```tsx
try {
  const rate = await getExchangeRate(date);
} catch (error) {
  // Fallback is automatic, but you can still handle errors
  console.error('Rate fetch failed:', error);
  // Component will show error state
}
```

## Testing

### Manual Testing

```bash
# Run verification script
npx tsx scripts/verify-implementation.ts

# Run demo
npx tsx scripts/demo-exchange-rates.ts

# Start dev server and test component
npm run dev
# Visit http://localhost:3000 and test CurrencyDisplay
```

### Test Dates

Use these dates for testing:
- **Valid**: 2024-03-15, 2024-06-20, 2024-09-25 (weekdays)
- **Invalid**: 2024-01-01, 2024-12-25 (holidays, will use fallback)
- **Recent**: Use the current date minus 1 day

### Expected Behavior

- ✅ First fetch: 200-500ms (API call + caching)
- ✅ Subsequent fetches: <1ms (database cache)
- ✅ Holidays/weekends: Instant fallback to annual average
- ✅ Network errors: Graceful fallback, no crashes

## Troubleshooting

### Issue: "No exchange rate data available"

**Cause**: Date is a holiday or weekend
**Solution**: System automatically falls back to annual average

### Issue: API endpoint returns 500

**Cause**: Network issue or Bank of Canada API down
**Solution**: Check logs, verify network connection

### Issue: Rate seems incorrect

**Verify**:
```bash
# Check Bank of Canada directly
curl "https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?start_date=2024-11-15&end_date=2024-11-15"
```

### Issue: CurrencyDisplay shows "Unable to convert"

**Check**:
1. Is the date valid? (YYYY-MM-DD format)
2. Is the API route accessible? (Try `/api/exchange-rate?date=2024-11-15`)
3. Check browser console for errors

## Performance Optimization

### Database Cache Statistics

```typescript
import { getDatabase } from '@/lib/db/index';

const stats = getDatabase()
  .prepare('SELECT COUNT(*) as count FROM exchange_rates')
  .get() as { count: number };

console.log(`Cached rates: ${stats.count}`);
```

### Clear Old Cache (Optional)

```typescript
import { getDatabase } from '@/lib/db/index';

// Clear rates older than 5 years (optional, not recommended)
getDatabase().exec(`
  DELETE FROM exchange_rates
  WHERE rate_date < date('now', '-5 years')
`);
```

## API Reference

See IMPLEMENTATION_SUMMARY.md for complete API documentation.

---

**Need Help?**
- Check IMPLEMENTATION_SUMMARY.md for technical details
- Run `npx tsx scripts/verify-implementation.ts` to test your setup
- Review the demo script: `scripts/demo-exchange-rates.ts`
