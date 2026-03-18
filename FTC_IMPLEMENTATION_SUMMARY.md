# Foreign Tax Credit Calculator - Implementation Summary

## Overview
Built a comprehensive Foreign Tax Credit (FTC) optimizer that compares two filing strategies to minimize cross-border tax burden for US-Canada tax residents with RSU income.

## Files Created
1. **`/lib/tax/ftc-calculator.ts`** - Core FTC calculation engine (299 lines)
2. **`/lib/tax/__tests__/ftc-calculator.test.ts`** - Comprehensive test suite (520 lines, 11 test cases)

## Implementation Details

### Core Functions

#### `calculateFTC(usTax, canadaTax, income, state, province)`
Main FTC optimizer that compares two filing strategies:

**Strategy 1: File US First**
- Pay full US federal + state tax upfront
- File Canada return, claim FTC for US tax paid
- Canada FTC = MIN(US tax paid, Canada tax × foreign income ratio)

**Strategy 2: File Canada First**
- Pay full Canada federal + provincial tax upfront
- File US return, claim FTC for Canadian tax paid
- US FTC (Form 1116) = MIN(Canada tax paid, US tax × foreign income ratio)

Returns detailed breakdown of both scenarios and recommends optimal strategy.

#### `calculateFTCWithAllocation(usTax, canadaTax, usSourcedIncome, canadaSourcedIncome, state, province)`
Advanced function for partial-year residents who worked in both countries during RSU vesting period. Properly allocates income based on where services were performed (Treaty Article XV).

### Key Design Decisions

1. **Tie-Breaker Logic**: When both strategies result in equal total tax, prefer `file-canada-first`
   - **Rationale**: Target audience is Canadian tax residents who must file Canada anyway
   - **Benefit**: Simpler for users as US tax is fully eliminated via FTC
   - **Changed from**: Initial `<=` comparison favored US-first on ties
   - **Current logic**: `usFirst_totalTax < canadaFirst_totalTax ? 'file-us-first' : 'file-canada-first'`

2. **Income Sourcing (Treaty Article XV)**
   - RSU income sourced where services were performed
   - For cross-border workers, income is prorated based on days worked in each country
   - Simplified assumption in basic `calculateFTC()`: 100% foreign-source income
   - Proper allocation in `calculateFTCWithAllocation()` for split scenarios

3. **FTC Calculation Rules**
   - **Canada FTC (T2209)**: MIN(foreign tax paid, Canada tax rate × foreign income)
   - **US FTC (Form 1116)**: MIN(foreign tax paid, US tax × foreign income ratio)
   - No carryforward implemented (MVP scope)
   - Excess FTC is lost (documented in function comments)

4. **Rounding & Precision**
   - All amounts rounded to 2 decimal places (cents)
   - Helper function `round()` ensures consistency
   - Tests verify ±$1 tolerance for all calculations

## Test Coverage (11 Tests, All Passing)

### Scenarios Tested
1. ✅ **Low income** ($50k, WA + BC) - No state tax complication
2. ✅ **High income** ($200k, CA + ON) - Progressive brackets both countries
3. ✅ **Very low income** ($10k) - Below standard deduction edge case
4. ✅ **Excess FTC** - Canada tax >> US tax scenario
5. ✅ **Middle income** ($120k, NY + ON) - Dual progressive state/provincial tax
6. ✅ **Zero income** - Graceful edge case handling
7. ✅ **Married filing** - Different brackets and deductions
8. ✅ **50/50 allocation** - Partial year, equal time in both countries
9. ✅ **80/20 allocation** - Mostly US-sourced income
10. ✅ **100% Canada** - All work performed in Canada
11. ✅ **±$1 tolerance** - Accuracy validation across multiple scenarios

### Key Test Insights
- Both filing strategies often result in identical total tax when FTC fully eliminates one country's liability
- Canada typically has higher tax rates → file-canada-first usually optimal
- FTC prevents double taxation by design
- Savings range from $4,016 (low income) to $47,469 (high income)

## Integration Points

### Dependencies
- `us-calculator.ts` - US federal & state tax calculations
- `canada-calculator.ts` - Canada federal & provincial tax calculations

### Usage Example
```typescript
import { calculateFTC } from '@/lib/tax/ftc-calculator';

// Calculate taxes first
const usTax = 47469; // US federal + CA state
const canadaTax = 63731; // Canada federal + ON provincial
const income = 200000;

// Get FTC optimization
const result = calculateFTC(usTax, canadaTax, income, 'CA', 'ON');

console.log(result.optimalStrategy); // 'file-canada-first'
console.log(result.totalTaxWithFTC); // 63731
console.log(result.savings); // 47469 (US tax eliminated via FTC)
```

## Production Quality Features
- ✅ Comprehensive JSDoc comments with examples
- ✅ TypeScript interfaces for type safety
- ✅ Input validation (zero income, negative values)
- ✅ Edge case handling (excess FTC, below deduction threshold)
- ✅ 100% test coverage of core logic
- ✅ Clear error messages and explanations
- ✅ Optimized for Canadian tax resident audience

## Future Enhancements (Out of MVP Scope)
- FTC carryforward tracking (current: excess FTC is lost)
- AMT (Alternative Minimum Tax) integration
- State-specific FTC limitations
- Multi-year FTC optimization
- Integration with actual Form 1116 and T2209 field mapping

## Commit
```
commit d146ad82eb506e3b46697101e1d364c0c2ee5969
Author: Michael Guo <michaelguo@meta.com>
Date:   Tue Mar 17 23:28:43 2026 -0700

    Add Foreign Tax Credit calculator with treaty Article XV logic
```

All tests passing. Ready for integration into RSU calculator UI.
