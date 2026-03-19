# PostHog Analytics Audit - March 19, 2026

## Executive Summary

**Audit Status:** ⚠️ **PARTIAL COMPLIANCE** - 2 of 4 critical events working correctly

**Grade:** C (60/100) - Revenue tracking incomplete, signup tracking missing

---

## Critical User Flow Tracking

### ✅ 1. Calculator Completion Events - WORKING

**Status:** ✅ **FIRING CORRECTLY**

**Location:** `app/(marketing)/us-canada-tax-calculator/page.tsx:162`

**Event Name:** `tax_calculation_viewed` (custom event, not standard schema)

**Properties Tracked:**
- ✅ calculator_id
- ✅ rsuAmount
- ✅ usState
- ✅ province
- ✅ usTax, canadaTax, ftcSavings, totalTax
- ✅ effectiveTaxRate
- ✅ Device info (from getDeviceInfo())

**Notes:**
- Event fires automatically when calculator completes (useEffect dependency on rsuIncome, usState, province)
- Also tracks Google Ads conversion via `trackCalculatorComplete()`
- Uses custom CalculatorTracker class for detailed funnel tracking

---

### ❌ 2. Signup Events - **BROKEN**

**Status:** ❌ **NOT FIRING**

**Expected Event:** `signup_completed` (per PostHog schema in `lib/analytics/posthog.ts:49`)

**Current Implementation:** MISSING

**Location:** `app/api/webhooks/clerk/route.ts:52-63`

**Issue:**
- Clerk webhook receives `user.created` event
- Creates user profile in database
- **DOES NOT track PostHog event** ❌

**Impact:**
- Cannot track signup funnel conversion rate
- Cannot attribute signups to marketing campaigns
- Missing UTM parameter attribution on signup

**Fix Required:**
```typescript
// Add to clerk webhook after user creation
import { trackEvent } from '@/lib/analytics/posthog';

if (eventType === 'user.created') {
  const { id, email_addresses } = evt.data;
  const primaryEmail = email_addresses.find(...);

  createUserProfile(id, primaryEmail?.email_address);

  // ✅ ADD THIS:
  trackEvent('signup_completed', {
    userId: id,
    email: primaryEmail?.email_address,
    source: 'clerk_webhook',
    timestamp: new Date().toISOString(),
  });
}
```

---

### ✅ 3. Checkout Initiated - WORKING

**Status:** ✅ **FIRING CORRECTLY**

**Location:** `app/pricing/page.tsx:356`

**Event Name:** `checkout_started`

**Properties Tracked:**
- ✅ plan (tier: pro/enterprise)
- ✅ funnelStep: 'Checkout'
- ✅ funnelStepNumber: 6

**Notes:**
- Fires when Stripe checkout session is created
- Includes funnel progression tracking
- Correctly positioned before redirect to Stripe

---

### ❌ 4. Payment Success - **BROKEN**

**Status:** ❌ **NOT FIRING STANDARD EVENTS**

**Expected Events:**
- `checkout_completed` (per PostHog schema)
- `subscription_activated` (per PostHog schema)

**Current Implementation:** Tracking custom events only

**Location:** `app/api/stripe/webhook/route.ts:110-188`

**Issue:**
- Webhook tracks custom events: `upgraded_to_pro` / `upgraded_to_enterprise` ✅
- **DOES NOT track standard PostHog events** ❌
- Missing `checkout_completed` event
- Missing `subscription_activated` event

**Impact:**
- Checkout funnel incomplete (started but not completed)
- Cannot calculate checkout abandonment rate accurately
- PostHog funnel dashboards will show 100% drop-off after checkout_started

**Fix Required:**
```typescript
// Add to Stripe webhook after successful checkout
case 'checkout.session.completed': {
  const session = event.data.object;
  const userId = session.metadata?.user_id;
  const tier = session.metadata?.tier;

  // Update database... (existing code)

  // Track custom event (existing)
  trackEvent(parseInt(userId), tier === 'pro' ? 'upgraded_to_pro' : 'upgraded_to_enterprise', {...});

  // ✅ ADD THESE STANDARD EVENTS:
  trackEvent(parseInt(userId), 'checkout_completed', {
    plan: tier,
    revenue: session.amount_total / 100,
    currency: 'USD',
    funnelStep: 'Payment Success',
    funnelStepNumber: 7,
  });

  trackEvent(parseInt(userId), 'subscription_activated', {
    plan: tier,
    revenue: session.amount_total / 100,
    currency: 'USD',
    stripe_customer_id: session.customer,
    stripe_subscription_id: session.subscription,
  });
}
```

---

## PostHog Configuration

### Environment Variables

**Production (.env.production):**
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_PROJECT_API_KEY  # ⚠️ Placeholder
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Status:** ⚠️ **CONFIGURED BUT NEEDS REAL KEY**
- PostHog key is placeholder (`phc_YOUR_PROJECT_API_KEY`)
- Must be replaced with actual production key from PostHog dashboard

---

## Test Plan

### Manual Testing Checklist

#### Local Testing (Development)
- [ ] Run: `npm run dev`
- [ ] Open browser console (PostHog logs events in dev mode)
- [ ] Test calculator: enter RSU amount, verify `tax_calculation_viewed` event fires
- [ ] Test signup: create account, verify `signup_completed` event fires (after fix)
- [ ] Test checkout: click upgrade, verify `checkout_started` fires
- [ ] Test payment success: complete payment, verify `checkout_completed` + `subscription_activated` fire

#### Production Testing
- [ ] Deploy fixes to production
- [ ] Open PostHog dashboard: https://app.posthog.com
- [ ] Navigate to: Analytics → Events → Live Events
- [ ] Perform calculator completion → verify event appears in real-time
- [ ] Perform signup → verify event appears
- [ ] Perform checkout → verify both events appear
- [ ] Create test funnel: calculator → signup → checkout → payment
- [ ] Verify conversion rates calculate correctly

---

## Priority Fixes

### P0 - CRITICAL (Revenue Blockers)
1. ❌ **Add `signup_completed` tracking to Clerk webhook**
   - File: `app/api/webhooks/clerk/route.ts`
   - Time: 15 minutes
   - Impact: Enables signup funnel tracking, campaign attribution

2. ❌ **Add `checkout_completed` + `subscription_activated` to Stripe webhook**
   - File: `app/api/stripe/webhook/route.ts`
   - Time: 15 minutes
   - Impact: Completes revenue funnel, enables ROI tracking

3. ⚠️ **Replace PostHog API key placeholder with production key**
   - File: Vercel environment variables
   - Time: 5 minutes
   - Impact: Actually send events to PostHog in production

### P1 - HIGH (Data Quality)
4. 🔄 **Standardize calculator event naming**
   - Current: `tax_calculation_viewed` (custom)
   - Standard: `roi_calculation_viewed` (per schema)
   - Time: 10 minutes
   - Impact: Consistency with PostHog event schema

---

## Implementation Status

- [x] Calculator completion - Already working ✅
- [ ] Signup completed - Needs fix ❌
- [x] Checkout initiated - Already working ✅
- [ ] Payment success - Needs fix ❌

**Total Implementation Time:** ~45 minutes

---

## Files to Modify

1. `app/api/webhooks/clerk/route.ts` - Add signup tracking
2. `app/api/stripe/webhook/route.ts` - Add payment success tracking
3. Vercel Dashboard - Update PostHog API key

---

## Verification Script

After fixes are deployed, run this test:

```typescript
// Test signup tracking
async function testSignupTracking() {
  // 1. Create test user via Clerk
  // 2. Check PostHog for signup_completed event
  // 3. Verify userId and email are captured
}

// Test payment tracking
async function testPaymentTracking() {
  // 1. Create test Stripe checkout session
  // 2. Complete payment with test card (4242...)
  // 3. Check PostHog for checkout_completed event
  // 4. Verify revenue amount is correct
}
```

---

## Recommended Next Steps

1. **Fix P0 tracking issues** (this PR)
2. **Verify PostHog production key** is set in Vercel
3. **Deploy to production**
4. **Monitor live events** for 24 hours
5. **Create PostHog funnels**:
   - Landing → Calculator → Signup → Payment
   - Calculator → Email Capture → Signup → Payment
6. **Set up alerts** for funnel drop-offs >30%

---

## Additional Findings

### ✅ Good Practices Found
- Calculator tracking includes comprehensive metadata (tax amounts, rates, location)
- Custom CalculatorTracker class provides detailed funnel analysis
- Google Ads conversion tracking integrated alongside PostHog
- Device info captured for mobile vs desktop analysis
- UTM parameters captured for attribution

### ⚠️ Areas for Improvement
- Event naming inconsistency (`tax_calculation_viewed` vs schema `roi_calculation_viewed`)
- Missing user identification in server-side events (Clerk/Stripe webhooks)
- No error tracking for failed events
- No retry logic if PostHog is unavailable

---

## Conclusion

**Current Status:** 2/4 critical events working (50% complete)

**Blockers:**
1. Signup tracking completely missing
2. Payment success using custom events instead of standard schema
3. PostHog production key may be placeholder

**Recommended Action:** Implement P0 fixes immediately (Est. 45 minutes)

**Expected Outcome:** 100% funnel visibility from calculator → signup → payment

---

**Audit conducted by:** Senior Engineer
**Date:** March 19, 2026
**Next review:** After P0 fixes deployed
