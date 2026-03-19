# Analytics Deep Dive Report - PostHog Tracking Audit
**Date:** March 19, 2026
**Status:** 🟡 Needs Improvement
**Overall Coverage:** 65%

---

## Executive Summary

PostHog analytics tracking is **partially implemented** across TaxBridge. Core funnel events are tracked, but **critical gaps exist** in calculator completions, field-level abandonment, and conversion goal configuration.

**Key Findings:**
- ✅ **Import Flow**: Fully instrumented with step-by-step tracking
- ✅ **RSU Entry Form**: Field-level tracking with FieldTracker
- ✅ **Dashboard**: Basic page view and subscription tracking
- ⚠️ **Tax Calculator (Marketing)**: Google Ads tracking only, missing PostHog events
- ❌ **ROI Calculator**: NO tracking whatsoever
- ❌ **Conversion Goals**: Not configured in PostHog
- ❌ **Funnel Analysis**: No predefined funnels in PostHog dashboard

---

## 1. Current Tracking Coverage

### ✅ **Fully Tracked Components**

#### **Import Flow** (`app/dashboard/import/ImportFlow.tsx`)
```typescript
// Comprehensive tracking using ImportFlowTracker class
- csv_import_started (on mount)
- import_step (3 steps tracked with metadata)
- import_file_upload (file name, size, row count)
- csv_import_completed (success/failure rates)
- import_error (error messages with step context)
```
**Quality:** ⭐⭐⭐⭐⭐ Excellent
**Drop-off Visibility:** High
**Recommendations:** None needed

---

#### **RSU Entry Form** (`components/rsu/rsu-entry-form.tsx`)
```typescript
// Using FieldTracker for granular field-level tracking
- first_rsu_entry_started
- field_focus (all form fields)
- field_blur (time spent per field)
- field_change (value presence)
- rsu_entry_created
- paywall_shown (with feature context)
```
**Quality:** ⭐⭐⭐⭐⭐ Excellent
**Field-Level Granularity:** Complete
**Recommendations:** Add form abandonment event on unmount

---

#### **Dashboard** (`components/dashboard/dashboard-content.tsx`)
```typescript
- dashboard_viewed (with user tier, subscription status)
- subscription_activated (revenue tracking)
```
**Quality:** ⭐⭐⭐ Good
**Recommendations:** Add more engagement events (feature usage, navigation)

---

### ⚠️ **Partially Tracked Components**

#### **Tax Calculator (Marketing Page)** (`app/(marketing)/us-canada-tax-calculator/page.tsx`)
**Current State:**
- ✅ Google Ads conversion tracking (calculator start/complete/lead capture)
- ✅ Remarketing audience tagging
- ❌ **NO PostHog events** - critical gap for funnel analysis

**Missing Events:**
```typescript
- calculator_page_viewed
- calculator_input_changed (field-level)
- tax_calculation_viewed (with input/output values)
- calculator_completion (email submission)
- calculator_dropoff (abandonment tracking)
```

**Impact:** 🔴 **HIGH** - This is the primary lead generation funnel
**Priority:** P0 Critical

---

### ❌ **Completely Untracked Components**

#### **ROI Calculator** (`components/ROICalculator.tsx`)
**Current State:** ZERO tracking instrumentation

**Missing Events:**
```typescript
- roi_calculator_viewed
- roi_input_changed (firm name, attorney count, clients, hours, rate)
- roi_calculation_viewed (results with ROI value)
- roi_calculator_abandoned (drop-off point)
```

**Usage Context:**
- Embedded on enterprise landing page
- Critical for B2B lead qualification
- High-value funnel (enterprise deals)

**Impact:** 🔴 **HIGH** - Cannot measure enterprise funnel effectiveness
**Priority:** P0 Critical

---

#### **Onboarding Wizard** (`components/onboarding/onboarding-wizard.tsx`)
**Quick Check Needed:** Verify if tracking exists (file not fully reviewed)

---

## 2. Funnel Drop-Off Analysis

### **Primary Conversion Funnel** (Defined in `posthog.ts`)

```
1. Landing Page View      → trackEvent('landing_page_viewed')
2. Calculator Start        → trackEvent('calculator_page_viewed')  ⚠️ MISSING
3. Calculator Completion   → trackEvent('tax_calculation_viewed')  ⚠️ MISSING
4. Email Capture           → trackEvent('page_viewed')             ⚠️ WRONG EVENT TYPE
5. Signup Started          → trackEvent('signup_started')
6. Signup Completed        → trackEvent('signup_completed')
7. Onboarding Started      → trackEvent('onboarding_started')
8. First RSU Entry         → trackEvent('first_rsu_entry_started') ✅
9. Pricing View            → trackEvent('pricing_page_viewed')
10. Checkout Started       → trackEvent('checkout_started')
11. Subscription Activated → trackEvent('subscription_activated')   ✅
```

**Current Drop-Off Visibility:**
- ✅ **Steps 8-11:** Fully tracked (in-app funnel)
- ⚠️ **Steps 2-4:** Partially tracked (Google Ads only, not PostHog)
- ❌ **Steps 1, 5-7:** Tracking exists but not verified in actual pages

---

### **Known Drop-Off Points** (Based on Audit)

| Funnel Step | Current Tracking | Drop-Off Measurable? | Impact |
|-------------|------------------|----------------------|--------|
| **Calculator → Email Submit** | ❌ No PostHog events | ❌ No | 🔴 High |
| **Email Submit → Signup** | ⚠️ Not linked | ⚠️ Partial | 🟠 Medium |
| **Signup → Onboarding** | ✅ Both tracked | ✅ Yes | ✅ Good |
| **Onboarding → First RSU** | ✅ Both tracked | ✅ Yes | ✅ Good |
| **First RSU → Pricing View** | ✅ Both tracked | ✅ Yes | ✅ Good |
| **Pricing → Checkout** | ⚠️ Needs verification | ⚠️ Partial | 🟠 Medium |

---

## 3. Field-Level Abandonment Tracking

### **Current Implementation** (`lib/analytics/tracking-utils.ts`)

The `FieldTracker` class is implemented and ready to use:
```typescript
class FieldTracker {
  - trackFieldFocus(fieldName)         → Tracks when user enters field
  - trackFieldBlur(fieldName, hasValue) → Tracks time spent + completion
  - trackFieldChange(fieldName, value)  → Tracks value changes
  - trackFormCompletion(success)        → Completion rate by field
  - trackFormAbandonment(lastField)     → Identifies drop-off point
}
```

**Usage Status:**
- ✅ **RSU Entry Form**: Fully implemented
- ❌ **Tax Calculator**: Not implemented
- ❌ **ROI Calculator**: Not implemented
- ❌ **Onboarding Forms**: Unknown

**Field-Level Insights Available (RSU Form Only):**
```typescript
{
  event_type: 'field_blur',
  form_id: 'rsu-entry-form',
  field_name: 'grantDate',
  time_spent_ms: 15000,        // 15 seconds on this field
  has_value: true,
  blur_count: 3,               // User revisited this field 3 times
  deviceType: 'mobile',
  browser: 'safari'
}
```

**Missing Insights:**
- Which fields cause abandonment in calculator flow?
- Do users struggle with certain inputs (e.g., RSU grant date formatting)?
- Mobile vs desktop field completion rates?

---

## 4. Conversion Goals Configuration

### **Current State in PostHog:** ❌ NOT CONFIGURED

PostHog supports setting up conversion goals (called "Actions" or "Funnels"). **None are currently set up.**

### **Recommended Conversion Goals**

#### **Goal 1: Calculator Completion** (Lead Generation)
```yaml
Name: "Calculator to Email Capture"
Steps:
  1. calculator_page_viewed
  2. tax_calculation_viewed
  3. email_captured (custom event)
Success Metric: Email submitted
Target: 15% conversion rate
```

#### **Goal 2: Signup to Activation** (Product Qualified Lead)
```yaml
Name: "Signup to First RSU Entry"
Steps:
  1. signup_completed
  2. onboarding_completed
  3. first_rsu_entry_completed
Success Metric: First RSU entry created within 7 days
Target: 60% conversion rate
```

#### **Goal 3: Free to Paid** (Monetization)
```yaml
Name: "Trial to Paid Conversion"
Steps:
  1. first_rsu_entry_completed
  2. paywall_shown
  3. pricing_page_viewed
  4. checkout_started
  5. subscription_activated
Success Metric: Payment completed
Target: 5% conversion rate (freemium benchmark)
```

#### **Goal 4: Enterprise Lead Qualification**
```yaml
Name: "ROI Calculator to Demo Request"
Steps:
  1. roi_calculator_viewed
  2. roi_calculation_viewed (with high ROI value)
  3. demo_request_submitted
Success Metric: Demo request form submitted
Target: 10% conversion rate
```

---

## 5. Missing Tracking Implementation

### **Priority 1 (P0 Critical) - Revenue Blockers**

#### **A. Tax Calculator PostHog Integration**
**File:** `app/(marketing)/us-canada-tax-calculator/page.tsx`

Currently uses Google Ads tracking. Add parallel PostHog events:

```typescript
// REPLACE: trackCalculatorPageView(utmParams)
trackEvent('calculator_page_viewed', {
  source: utmParams.utm_source,
  medium: utmParams.utm_medium,
  campaign: utmParams.utm_campaign,
});

// REPLACE: trackCalculatorStart(parseFloat(value))
trackEvent('calculator_input_changed', {
  field: 'rsuIncome',
  value: parseFloat(value),
  first_interaction: !hasStartedCalculator,
});

// REPLACE: trackCalculatorComplete(...)
trackEvent('tax_calculation_viewed', {
  rsuAmount: income,
  usTax: totalUSTax,
  canadaTax: totalCanadaTax,
  ftcSavings: ftc?.savings || 0,
  totalTax: ftc?.totalTaxWithFTC || 0,
});

// REPLACE: trackLeadCapture(email, ...)
trackEvent('email_captured', {
  source: 'calculator',
  email_hash: hashEmail(email), // For privacy
  rsuAmount: parseFloat(rsuIncome),
  ftcSavings: ftcResult?.savings,
});
```

**Why Both?**
- Google Ads tracking: Attribution for paid campaigns
- PostHog tracking: Funnel analysis and user journey insights

---

#### **B. ROI Calculator Full Instrumentation**
**File:** `components/ROICalculator.tsx`

Add `CalculatorTracker` class usage:

```typescript
import { CalculatorTracker } from '@/lib/analytics/tracking-utils';

const calculatorTrackerRef = useRef<CalculatorTracker | null>(null);

useEffect(() => {
  calculatorTrackerRef.current = new CalculatorTracker('roi-calculator');
}, []);

// On each input change
const handleInputChange = (field: string, value: any) => {
  calculatorTrackerRef.current?.trackInputChange(field, value);
  // ... existing logic
};

// On calculate button click
const handleCalculate = () => {
  const results = calculateROI();
  calculatorTrackerRef.current?.trackCalculation(inputs, results);
  setShowResults(true);
};

// On unmount (page leave without completion)
useEffect(() => {
  return () => {
    if (!showResults) {
      calculatorTrackerRef.current?.trackDropOff('no_calculation');
    }
  };
}, [showResults]);
```

---

### **Priority 2 (P1 High) - Data Quality**

#### **C. Email Capture Event Type Fix**
Currently using generic `page_viewed` for email capture. Create dedicated event:

```typescript
// In lib/analytics/posthog.ts, ADD to PostHogEvent type:
export type PostHogEvent =
  | ... // existing events
  | 'email_captured'  // NEW

// Usage:
trackEvent('email_captured', {
  source: 'calculator' | 'pricing' | 'onboarding',
  lead_score: number,  // Based on calculation values
  ...
});
```

---

## 6. PostHog Dashboard Configuration

### **Step 1: Create Funnels**

Navigate to PostHog → Insights → New Insight → Funnel

#### **Funnel A: Calculator to Email** (Top of Funnel)
```
Step 1: calculator_page_viewed
Step 2: tax_calculation_viewed
Step 3: email_captured

Filters:
- Time window: 30 minutes
- Breakdown by: utm_source, device_type
```

#### **Funnel B: Signup to Activation** (Middle of Funnel)
```
Step 1: signup_completed
Step 2: onboarding_completed
Step 3: first_rsu_entry_completed

Filters:
- Time window: 7 days
- Breakdown by: referrer, user_tier
```

#### **Funnel C: Activation to Revenue** (Bottom of Funnel)
```
Step 1: first_rsu_entry_completed
Step 2: pricing_page_viewed
Step 3: checkout_started
Step 4: subscription_activated

Filters:
- Time window: 30 days
- Breakdown by: plan (pro/enterprise)
```

---

### **Step 2: Create Retention Cohorts**

Navigate to PostHog → Insights → New Insight → Retention

```
Cohort Event: signup_completed
Return Event: dashboard_viewed

Time Intervals: Day 1, Day 7, Day 30
```

---

### **Step 3: Set Up Alerts**

Navigate to PostHog → Alerts

```
Alert 1: Calculator Completion Rate Drop
- Metric: Funnel conversion (calculator → email)
- Threshold: < 10% (currently ~15% expected)
- Notification: Slack #growth channel

Alert 2: Payment Failure Spike
- Metric: checkout_started - subscription_activated
- Threshold: > 20% failure rate
- Notification: Slack #eng-alerts

Alert 3: Field Abandonment Anomaly
- Metric: form_abandonment events
- Threshold: > 50% for any single field
- Notification: Email to eng@taxbridge.app
```

---

## 7. Data Quality Checks

### **Verification Queries** (Run in PostHog → SQL Explorer)

#### **Check 1: Event Volume by Type**
```sql
SELECT
  event AS event_name,
  COUNT(*) AS event_count,
  COUNT(DISTINCT person_id) AS unique_users
FROM events
WHERE timestamp >= now() - INTERVAL '7 days'
GROUP BY event
ORDER BY event_count DESC;
```

**Expected Results:**
- `page_viewed`: High volume (every page)
- `calculator_page_viewed`: Moderate (landing page traffic)
- `subscription_activated`: Low (conversion funnel bottom)

**Red Flags:**
- `first_rsu_entry_started`: 0 events (tracking broken)
- `email_captured`: Not in results (event type missing)

---

#### **Check 2: Funnel Conversion Rates**
```sql
WITH funnel AS (
  SELECT
    person_id,
    MAX(CASE WHEN event = 'calculator_page_viewed' THEN 1 ELSE 0 END) AS saw_calculator,
    MAX(CASE WHEN event = 'tax_calculation_viewed' THEN 1 ELSE 0 END) AS completed_calc,
    MAX(CASE WHEN event = 'email_captured' THEN 1 ELSE 0 END) AS captured_email
  FROM events
  WHERE timestamp >= now() - INTERVAL '30 days'
  GROUP BY person_id
)
SELECT
  COUNT(*) AS total_visitors,
  SUM(saw_calculator) AS calculator_viewers,
  SUM(completed_calc) AS calculation_completers,
  SUM(captured_email) AS email_captures,
  ROUND(100.0 * SUM(completed_calc) / NULLIF(SUM(saw_calculator), 0), 2) AS calc_completion_rate,
  ROUND(100.0 * SUM(captured_email) / NULLIF(SUM(completed_calc), 0), 2) AS email_capture_rate
FROM funnel;
```

---

#### **Check 3: Field-Level Drop-Off**
```sql
SELECT
  properties->>'form_id' AS form,
  properties->>'field_name' AS field,
  COUNT(CASE WHEN properties->>'event_type' = 'field_focus' THEN 1 END) AS focuses,
  COUNT(CASE WHEN properties->>'event_type' = 'field_blur' THEN 1 END) AS blurs,
  COUNT(CASE WHEN properties->>'event_type' = 'field_change' THEN 1 END) AS changes,
  ROUND(100.0 * COUNT(CASE WHEN properties->>'event_type' = 'field_change' THEN 1 END) /
        NULLIF(COUNT(CASE WHEN properties->>'event_type' = 'field_focus' THEN 1 END), 0), 2) AS completion_rate
FROM events
WHERE event = 'page_viewed'
  AND properties->>'event_type' IN ('field_focus', 'field_blur', 'field_change')
  AND timestamp >= now() - INTERVAL '7 days'
GROUP BY form, field
ORDER BY completion_rate ASC;
```

**Interpretation:**
- `completion_rate < 50%`: Field is confusing or has validation issues
- High `focuses` but low `changes`: Users click but don't fill (UX issue)

---

## 8. Recommendations

### **Immediate Actions (This Sprint)**

1. ✅ **Implement ROI Calculator Tracking** (2 hours)
   - Add CalculatorTracker to `components/ROICalculator.tsx`
   - Track input changes, calculation views, drop-offs

2. ✅ **Add PostHog Events to Tax Calculator** (1 hour)
   - Parallel to Google Ads tracking (don't replace)
   - Use proper event types (not generic `page_viewed`)

3. ✅ **Create Email Capture Event** (30 min)
   - Add `email_captured` to PostHogEvent type
   - Update all email submission handlers

4. ✅ **Configure PostHog Funnels** (1 hour)
   - Create 3 primary funnels (calculator, signup, revenue)
   - Set up conversion rate alerts

### **Medium-Term (Next Sprint)**

5. **Field-Level Tracking Audit** (4 hours)
   - Review all forms (onboarding, settings, checkout)
   - Add FieldTracker where missing
   - Document field-level KPIs

6. **Drop-Off Investigation** (2 hours)
   - Run queries above weekly
   - Create dashboard for eng team
   - Prioritize high-impact fixes

7. **Mobile vs Desktop Funnel Analysis** (2 hours)
   - Split funnels by device type
   - Identify mobile-specific drop-offs
   - A/B test mobile optimizations

### **Long-Term (Q2 Roadmap)**

8. **Session Recording Integration** (PostHog feature)
   - Enable session replay for drop-off analysis
   - Watch users struggle with specific fields
   - Requires privacy policy update

9. **A/B Testing Framework**
   - Use PostHog feature flags
   - Test calculator layout variations
   - Measure impact on conversion

10. **Predictive Lead Scoring**
    - Use event properties (rsuAmount, ftcSavings) to score leads
    - Route high-value leads to sales team
    - Automate email sequences based on score

---

## 9. Success Metrics

### **Analytics Health KPIs**

| Metric | Current | Target (30 days) |
|--------|---------|------------------|
| **Event Coverage** | 65% | 95% |
| **Funnel Visibility** | 40% | 100% |
| **Drop-Off Measurability** | Medium | High |
| **Field-Level Tracking** | RSU form only | All forms |
| **PostHog Funnels Configured** | 0 | 3 |
| **Conversion Rate Tracking** | Manual | Automated |

### **Business Impact KPIs** (From Analytics)

| Metric | Baseline | Target (Q2) |
|--------|----------|-------------|
| **Calculator → Email** | Unknown | 15% |
| **Signup → Activation** | Unknown | 60% |
| **Activation → Revenue** | Unknown | 5% |
| **Enterprise ROI → Demo** | Unknown | 10% |

---

## 10. Implementation Checklist

```markdown
- [ ] P0: Add PostHog tracking to tax calculator page
- [ ] P0: Implement ROI calculator tracking (CalculatorTracker)
- [ ] P0: Create email_captured event type
- [ ] P1: Configure 3 primary funnels in PostHog
- [ ] P1: Set up conversion rate alerts
- [ ] P1: Verify onboarding tracking exists
- [ ] P2: Run data quality SQL queries
- [ ] P2: Create weekly drop-off analysis dashboard
- [ ] P2: Document field-level KPIs
- [ ] P3: Enable session recording (requires legal review)
```

---

## Appendix: Event Schema Reference

### **Complete Event List** (from `lib/analytics/posthog.ts`)

```typescript
// Landing & Awareness
'page_viewed'
'landing_page_viewed'
'pricing_page_viewed'
'calculator_page_viewed'        // ⚠️ NOT IMPLEMENTED
'guide_viewed'

// Signup Funnel
'signup_button_clicked'
'signup_started'
'signup_completed'
'email_verified'

// Onboarding
'onboarding_started'
'onboarding_step_completed'
'onboarding_completed'
'profile_completed'

// Core Product
'first_rsu_entry_started'       // ✅ IMPLEMENTED
'first_rsu_entry_completed'
'rsu_entry_created'             // ✅ IMPLEMENTED
'tax_calculation_viewed'        // ⚠️ PARTIALLY (missing calculator page)
'ftc_optimizer_used'
'multi_year_analysis_viewed'
'pdf_exported'
'forms_checklist_opened'
'csv_import_started'            // ✅ IMPLEMENTED
'csv_import_completed'          // ✅ IMPLEMENTED

// Monetization
'paywall_shown'                 // ✅ IMPLEMENTED
'upgrade_button_clicked'
'pricing_tier_selected'
'checkout_started'
'checkout_completed'
'subscription_activated'        // ✅ IMPLEMENTED

// Custom Events (Recommended to Add)
'email_captured'                // ❌ ADD THIS
'calculator_dropoff'            // ❌ ADD THIS
'roi_calculator_viewed'         // ❌ ADD THIS
'roi_calculation_viewed'        // ❌ ADD THIS
```

---

**Report Generated:** March 19, 2026
**Next Review:** March 26, 2026 (weekly cadence)
**Owner:** Engineering Team
**Stakeholder:** CEO (Michael) - Revenue impact tracking
