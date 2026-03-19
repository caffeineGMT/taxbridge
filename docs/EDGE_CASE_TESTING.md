# Input Validation Edge Case Testing Guide

## Overview
This document provides comprehensive manual testing procedures for all input validation edge cases across TaxBridge calculators.

## Test Coverage
- ✅ Zero values (income, shares, hours)
- ✅ Extreme high values ($10M+ RSUs, 1M+ shares)
- ✅ Negative numbers
- ✅ Non-numeric input
- ✅ Special characters and copy-paste scenarios
- ✅ Boundary values (min/max limits)

---

## ROI Calculator Edge Cases

### Test Location
`/enterprise` page - ROI Calculator component

### Test Cases

#### 1. Zero Values
| Input Field | Test Value | Expected Behavior |
|-------------|------------|-------------------|
| Number of Attorneys | `0` | ❌ Error: "Must have at least 1 attorney" |
| Clients per Year | `0` | ❌ Error: "Must have at least 1 client per year" |
| Hours per Week | `0` | ✅ Accepted (valid - some firms may not have any cross-border clients yet) |
| Billable Rate | `0` | ❌ Error: "Billable rate must be at least $1" |

#### 2. Extreme High Values ($10M+ equivalent)
| Input Field | Test Value | Expected Behavior |
|-------------|------------|-------------------|
| Number of Attorneys | `100,000` | ✅ Accepted (maxed out) |
| Number of Attorneys | `100,001` | ❌ Silently capped at 100,000 |
| Clients per Year | `50,000` | ✅ Accepted |
| Hours per Week | `168` | ✅ Accepted (max hours in a week) |
| Hours per Week | `200` | ❌ Silently capped at 168 |
| Billable Rate | `$10,000` | ✅ Accepted (maxed out) |
| Billable Rate | `$15,000` | ❌ Silently capped at $10,000 |

#### 3. Negative Numbers
| Input Field | Test Value | Expected Behavior |
|-------------|------------|-------------------|
| Number of Attorneys | `-50` | ❌ Stripped to empty, then error on calculate |
| Clients per Year | `-100` | ❌ Stripped to empty, then error on calculate |
| Hours per Week | `-5` | ❌ Stripped to empty |
| Billable Rate | `-$250` | ❌ Stripped to empty |

#### 4. Non-Numeric Input
| Input Field | Test Value | Expected Behavior |
|-------------|------------|-------------------|
| Number of Attorneys | `abc` | ❌ Stripped to empty, shows 0 |
| Number of Attorneys | `50abc` | ✅ Sanitized to `50` |
| Number of Attorneys | `1e6` | ❌ Rejected (scientific notation blocked) |
| Billable Rate | `$250 USD` | ✅ Sanitized to `250` |
| Billable Rate | `C$350.50` | ✅ Sanitized to `350.50` |
| Billable Rate | `one thousand` | ❌ Stripped to empty |

#### 5. Special Characters & Copy-Paste
| Input Field | Test Value | Expected Behavior |
|-------------|------------|-------------------|
| Billable Rate | `$1,250.50` | ✅ Sanitized to `1250.50` |
| Billable Rate | `  $500  ` | ✅ Sanitized to `500` |
| Billable Rate | `+250` | ❌ Rejected (plus sign blocked) |
| Number of Attorneys | `1,000` | ✅ Sanitized to `1000` |

#### 6. Decimal Precision
| Input Field | Test Value | Expected Behavior |
|-------------|------------|-------------------|
| Hours per Week | `5.5` | ✅ Accepted (1 decimal place) |
| Hours per Week | `5.555` | ✅ Truncated to `5.5` |
| Billable Rate | `250.99` | ✅ Accepted (2 decimal places) |
| Billable Rate | `250.999` | ✅ Truncated to `250.99` |
| Number of Attorneys | `50.5` | ✅ Sanitized to `50` (integers only) |

---

## CSV Import Validation Edge Cases

### Test Location
`/dashboard/import` - CSV upload flow

### Test Cases

#### 1. Zero Values in CSV
```csv
vesting_date,employer,shares,fmv_usd,us_state,canada_province
2025-01-15,Meta,0,450.25,WA,BC
```
**Expected**: ❌ Row rejected - "Shares must be positive"

```csv
vesting_date,employer,shares,fmv_usd,us_state,canada_province
2025-01-15,Meta,100,0,WA,BC
```
**Expected**: ❌ Row rejected - "FMV must be positive"

#### 2. Extreme High Values in CSV
```csv
vesting_date,employer,shares,fmv_usd,us_state,canada_province
2025-01-15,Meta,10000000,500,WA,BC
```
**Expected**: ✅ Accepted (10M shares at max limit)

```csv
vesting_date,employer,shares,fmv_usd,us_state,canada_province
2025-01-15,Meta,10000001,500,WA,BC
```
**Expected**: ❌ Row rejected - "Shares cannot exceed 10,000,000"

```csv
vesting_date,employer,shares,fmv_usd,us_state,canada_province
2025-01-15,Meta,1000,15000,WA,BC
```
**Expected**: ❌ Row rejected - "FMV cannot exceed $10,000 per share"

#### 3. Negative Values in CSV
```csv
vesting_date,employer,shares,fmv_usd,us_state,canada_province
2025-01-15,Meta,-100,450.25,WA,BC
```
**Expected**: ❌ Row rejected - "Shares must be positive"

#### 4. Non-Numeric CSV Values
```csv
vesting_date,employer,shares,fmv_usd,us_state,canada_province
2025-01-15,Meta,abc,450.25,WA,BC
```
**Expected**: ❌ Row rejected - Invalid number format

```csv
vesting_date,employer,shares,fmv_usd,us_state,canada_province
2025-01-15,Meta,1e6,450.25,WA,BC
```
**Expected**: ✅ Accepted (JavaScript parses `1e6` as 1,000,000)

#### 5. Invalid Date Formats
```csv
vesting_date,employer,shares,fmv_usd,us_state,canada_province
01/15/2025,Meta,100,450.25,WA,BC
```
**Expected**: ❌ Row rejected - "Date must be in YYYY-MM-DD format"

```csv
vesting_date,employer,shares,fmv_usd,us_state,canada_province
2030-01-15,Meta,100,450.25,WA,BC
```
**Expected**: ❌ Row rejected - "Date must be valid and not in the future"

#### 6. Missing Required Fields
```csv
vesting_date,employer,shares,fmv_usd,us_state,canada_province
2025-01-15,Meta,,450.25,WA,BC
```
**Expected**: ❌ Row rejected - "shares: Required"

---

## Automated Test Execution

### Run Unit Tests
```bash
npm test -- lib/__tests__/input-validation.test.ts
```

### Expected Results
- ✅ All 50+ test cases should pass
- ✅ Coverage should be > 90% for input-validation.ts

---

## Manual QA Checklist

### Before Release
- [ ] Test all ROI Calculator edge cases listed above
- [ ] Test CSV import with sample files containing edge cases
- [ ] Verify error messages are user-friendly and actionable
- [ ] Confirm visual feedback (red borders, error text) appears correctly
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Test with screen reader (VoiceOver, NVDA) for accessibility
- [ ] Verify that legitimate high-value RSU grants ($1M+) are accepted
- [ ] Confirm that extreme invalid inputs don't crash the app

### User Acceptance Testing Scenarios

#### Scenario 1: Large Law Firm
- **Firm**: 500 attorneys, 5,000 clients/year
- **Expected**: Calculator should handle without errors

#### Scenario 2: Executive-Level RSU Grant
- **Input**: 10,000 shares @ $525/share = $5.25M
- **Expected**: CSV import accepts without warnings

#### Scenario 3: User Makes Typos
- **Input**: User types "100a" in attorney count field
- **Expected**: Silently strips to "100", no error

#### Scenario 4: Copy-Paste from Financial Statement
- **Input**: User pastes "$1,234.56 USD" in FMV field
- **Expected**: Sanitizes to "1234.56", calculates correctly

---

## Known Limitations

1. **Scientific Notation**: Blocked for user input (`1e6`), but CSV parsing may accept it
2. **Max Values**:
   - Shares: 10M per row (split larger grants into multiple rows)
   - FMV: $10,000/share (unusual but possible for pre-IPO grants)
3. **Decimal Precision**:
   - Currency: 2 decimal places
   - Hours: 1 decimal place
   - Shares: No decimals (integers only)

---

## Reporting Bugs

If you find an edge case that's not handled correctly:
1. Document the exact input value
2. Note the expected vs. actual behavior
3. Include browser/device info
4. Report to: dev@taxbridge.app

---

## Version History

- **v1.0.0** (2026-03-19): Initial edge case testing documentation
  - Added comprehensive test cases for ROI Calculator
  - Added CSV import validation scenarios
  - Documented known limitations
