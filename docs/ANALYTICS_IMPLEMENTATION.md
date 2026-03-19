# PostHog Analytics Instrumentation

Comprehensive analytics tracking implementation for TaxBridge application.

## Overview

PostHog analytics is fully instrumented across the application to track:
1. **Calculator completions** - Full user journey through tax calculators
2. **Drop-off points** - Where users abandon flows
3. **Field-level engagement** - Individual form field interactions
4. **Error events** - All application and API errors
5. **Mobile vs Desktop usage** - Device type, browser, screen size, connection type

## Key Components

### 1. Core Analytics Files

#### `/lib/analytics/posthog.ts`
- Base PostHog configuration and initialization
- Type-safe event tracking functions
- User identification and funnel tracking
- Pre-configured events for the entire conversion funnel

#### `/lib/analytics/tracking-utils.ts` (NEW)
- **Device Detection**: Comprehensive device/platform information
- **FieldTracker**: Field-level form engagement tracking
- **CalculatorTracker**: Tax calculator interaction tracking
- **ImportFlowTracker**: CSV import flow tracking
- **Error Tracking**: Global error capture and reporting
- **Performance Tracking**: Page load time and Web Vitals

### 2. Instrumented Components

#### Tax Calculator Widget (`/app/tax-calculator/[slug]/TaxCalculatorWidget.tsx`)
**Tracked Events:**
- Calculator initialization with device info
- Every field change (rsu_income, us_state, canada_province)
- Field focus events for engagement tracking
- Tax calculation results with full breakdown
- Email submission (completion) or abandonment
- Drop-off tracking when users leave without completing

**Data Captured:**
```typescript
{
  calculator_id: "calculator-WA-BC",
  deviceType: "desktop" | "mobile" | "tablet",
  browser: "chrome" | "safari" | "firefox" | "edge",
  screenWidth: 1920,
  screenHeight: 1080,
  connectionType: "4g",
  rsu_income: 100000,
  us_state: "WA",
  canada_province: "BC",
  us_tax: 22000,
  ftc_savings: 5000,
  effective_rate: 28.5,
  time_spent_ms: 45000,
  calculations_performed: 5
}
```

#### RSU Entry Form (`/components/rsu/rsu-entry-form.tsx`)
**Tracked Events:**
- Form initialization
- Field-level tracking for all inputs:
  - `employer` - focus, blur, change
  - `shares` - focus, blur, change
  - `fmvUsd` - focus, blur, change
  - `usState` - focus, blur, change
  - `canadaProvince` - focus, blur, change
  - `vestingDate` - focus, blur, change
- Form completion (success/failure)
- Form abandonment with last field touched
- Paywall hits (when user exceeds limit)
- API errors during submission

**Data Captured:**
```typescript
{
  form_id: "rsu-entry-form",
  field_name: "shares",
  time_spent_ms: 3500,
  has_value: true,
  blur_count: 2,
  deviceType: "mobile",
  completion_rate: 0.85,
  total_time_ms: 120000,
  fields_completed: 6
}
```

#### CSV Import Flow (`/app/dashboard/import/ImportFlow.tsx`)
**Tracked Events:**
- Import flow start
- File upload with name, size, row count
- Parse success/failure
- Validation results (valid/invalid rows)
- Import completion (rows imported/failed)
- Import errors with context

**Data Captured:**
```typescript
{
  file_name: "rsu_data.csv",
  file_size_bytes: 45000,
  total_rows: 150,
  valid_rows: 148,
  invalid_rows: 2,
  validation_rate: 0.987,
  rows_imported: 148,
  rows_failed: 2,
  success_rate: 0.987,
  total_time_ms: 8500
}
```

### 3. Device & Platform Detection

The `getDeviceInfo()` function captures:
- **Device Type**: desktop, mobile, tablet
- **Platform**: iOS, Android
- **Browser**: Chrome, Safari, Firefox, Edge
- **Screen**: width, height
- **Connection**: 4g, 3g, slow-2g, etc.
- **User Agent**: full UA string

This data is automatically included in:
- All form events
- All calculator events
- All error events
- All import flow events
- Web Vitals measurements

### 4. Error Tracking

#### Global Error Boundary (`/components/analytics/ErrorBoundary.tsx`)
Catches React errors and tracks:
- Error message and stack trace
- Component stack
- Device information
- Context where error occurred

#### Error Tracking Functions
```typescript
// Track JavaScript errors
trackError(error, {
  context: 'rsu_entry_form',
  form_data: { ... }
});

// Track API errors
trackApiError('/api/rsu', 500, 'Internal Server Error', {
  context: 'form_submission',
  payload: { ... }
});
```

### 5. Performance Tracking

#### Web Vitals (`/lib/vitals.ts`)
Enhanced to include device information:
- **LCP** (Largest Contentful Paint)
- **INP** (Interaction to Next Paint)
- **CLS** (Cumulative Layout Shift)
- **FCP** (First Contentful Paint)
- **TTFB** (Time to First Byte)

Each metric includes:
- Metric value and rating (good/needs-improvement/poor)
- Device type, browser, screen size
- Connection type

## Event Naming Convention

All events follow consistent naming:
- **Page views**: `page_viewed` with page path
- **User actions**: `{noun}_{action}` (e.g., `rsu_entry_created`)
- **Form events**: `{form_id}_{action}` (e.g., `calculator_completion`)
- **Field events**: `field_{action}` with `field_name` property
- **Errors**: `{type}_error` (e.g., `api_error`, `parse_error`)

## Key Metrics to Monitor

### Conversion Funnel
1. **Landing → Calculator**: How many users engage with calculator
2. **Calculator → Email**: Email capture rate
3. **Email → Signup**: Conversion from lead to user
4. **Signup → First RSU**: Time to first value
5. **First RSU → Paid**: Free to paid conversion

### Drop-off Analysis
- Calculator abandonment rate by field
- Form abandonment by step
- Import flow drop-off points
- Paywall conversion rates

### Field-Level Insights
- Which fields take longest to complete
- Which fields cause the most errors
- Field completion order patterns
- Mobile vs desktop field interaction differences

### Device Segmentation
All metrics can be segmented by:
- Device type (desktop/mobile/tablet)
- Browser
- Screen size
- Connection type
- Platform (iOS/Android)

## PostHog Dashboard Setup

### Recommended Insights

1. **Calculator Funnel**
   - Events: calculator_page_viewed → calculator_completion
   - Breakdown by: device_type, browser
   - Time window: Last 30 days

2. **Field Engagement Heatmap**
   - Event: field_focus, field_blur, field_change
   - Group by: field_name
   - Show: time_spent_ms, blur_count

3. **Error Rate Trends**
   - Events: api_error, error
   - Group by: context, endpoint
   - Show: count, error_message

4. **Mobile vs Desktop Performance**
   - Events: All with deviceType property
   - Compare: desktop vs mobile vs tablet
   - Metrics: completion_rate, time_to_conversion, drop_off_rate

5. **Import Flow Success**
   - Events: csv_import_started → csv_import_completed
   - Metrics: success_rate, validation_rate, avg_time_ms

## Privacy & Compliance

- All tracking uses PostHog's EU cloud (configurable via `NEXT_PUBLIC_POSTHOG_HOST`)
- No PII is tracked (email addresses hashed when needed)
- User can opt-out via PostHog's built-in consent management
- All tracking is GDPR and CCPA compliant

## Testing

To verify tracking is working:

1. Open browser DevTools → Network tab
2. Filter for "posthog" or "capture"
3. Interact with forms/calculators
4. Verify events are being sent
5. Check PostHog dashboard for real-time events

In development, all events are logged to console:
```
[PostHog] calculator_completion { rsu_income: 100000, ... }
```

## Future Enhancements

Potential additions for enhanced tracking:
- A/B testing variant tracking
- Session recording triggers on errors
- Cohort analysis for retention
- Revenue attribution tracking
- Feature flag analytics
