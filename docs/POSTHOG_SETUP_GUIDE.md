# PostHog Feature Flags Setup Guide

## Prerequisites

1. PostHog account created at https://app.posthog.com
2. Project API key available (starts with `phc_`)
3. Environment variable `NEXT_PUBLIC_POSTHOG_KEY` configured

## Step-by-Step Setup

### 1. Create Feature Flags

Navigate to PostHog → Feature Flags → New Feature Flag

#### Flag 1: Landing Headline Test

```
Name: landing-headline-test
Key: landing-headline-test
Type: Multivariate
Enabled: ✅ Yes

Variants:
- control (33%)
- pain-focused (33%)
- outcome-focused (34%)

Rollout: 100% of users
```

**Advanced Settings:**
- Persistence: User property (ensures consistency across sessions)
- Evaluation: Client-side (for fast page loads)

#### Flag 2: Landing CTA Test

```
Name: landing-cta-test
Key: landing-cta-test
Type: Multivariate
Enabled: ✅ Yes

Variants:
- control (25%)
- urgency (25%)
- value-prop (25%)
- social-proof (25%)

Rollout: 100% of users
```

#### Flag 3: Trust Signals Placement Test

```
Name: landing-trust-signals-test
Key: landing-trust-signals-test
Type: Multivariate
Enabled: ✅ Yes

Variants:
- control (33%)
- social-proof-top (33%)
- badges-inline (34%)

Rollout: 100% of users
```

---

### 2. Create Insights for Tracking

#### Insight 1: Headline Test Funnel

```
Type: Funnel
Steps:
  1. page_viewed (filter: experiment = "landing-headline-test")
  2. signup_button_clicked
  3. page_viewed (filter: page = "/dashboard")

Breakdown: variant

Filters:
  - experiment = "landing-headline-test"
  - timestamp: Last 30 days
```

#### Insight 2: CTA Test Funnel

```
Type: Funnel
Steps:
  1. page_viewed
  2. signup_button_clicked (filter: experiment = "landing-cta-test")
  3. page_viewed (filter: page = "/dashboard")

Breakdown: ctaVariant

Filters:
  - experiment = "landing-cta-test"
  - timestamp: Last 30 days
```

#### Insight 3: Trust Signals Bounce Rate

```
Type: Trends
Metric: Bounce rate

Filters:
  - experiment = "landing-trust-signals-test"

Breakdown: trustSignalsLayout
```

---

### 3. Create Dashboard

Navigate to PostHog → Dashboards → New Dashboard

**Dashboard Name:** Landing Page A/B Tests

**Tiles:**

1. **Headline Test Performance**
   - Insight: Headline Test Funnel
   - Size: Large (2x1)

2. **CTA Test Performance**
   - Insight: CTA Test Funnel
   - Size: Large (2x1)

3. **Trust Signals Bounce Impact**
   - Insight: Trust Signals Bounce Rate
   - Size: Medium (1x1)

4. **Overall Landing Page Conversions**
   - Insight: New funnel showing all experiments combined
   - Size: Large (2x1)

---

### 4. Verify Tracking

Run these commands in browser console on production:

```javascript
// Check PostHog loaded
console.log('PostHog loaded:', window.posthog?.__loaded);

// Check feature flags
console.log('Headline variant:', window.posthog?.getFeatureFlag('landing-headline-test'));
console.log('CTA variant:', window.posthog?.getFeatureFlag('landing-cta-test'));
console.log('Trust signals variant:', window.posthog?.getFeatureFlag('landing-trust-signals-test'));

// Check events being tracked
window.posthog?.capture('test_event', { test: true });
```

Expected output:
```
PostHog loaded: true
Headline variant: "pain-focused" (or "control" or "outcome-focused")
CTA variant: "urgency" (or other variants)
Trust signals variant: "social-proof-top" (or other variants)
```

---

### 5. Session Replay (Optional but Recommended)

Enable session replay to watch user interactions:

1. Navigate to PostHog → Settings → Session Replay
2. Enable: ✅ Record user sessions
3. Configure:
   - Capture console logs: ✅ Yes
   - Capture network requests: ✅ Yes (be careful with PII)
   - Sample rate: 10% (to reduce costs)

4. Add mask rules for sensitive data:
   - Mask: `.rsu-amount`, `.income-input`, `.email-field`
   - Do NOT capture: Stripe checkout page, payment forms

---

### 6. Alerts

Set up alerts for anomalies:

1. Navigate to PostHog → Alerts → New Alert

**Alert 1: Conversion Drop**
```
Name: Landing Page Conversion Drop
Metric: Conversion rate (Landing → Dashboard)
Condition: Drops below 5%
Frequency: Hourly
Notification: Email + Slack
```

**Alert 2: Experiment Sample Size**
```
Name: Experiment Sample Size Reached
Metric: Total exposures for landing-headline-test
Condition: Reaches 3,000
Frequency: Once
Notification: Email
```

---

## Testing Experiments Locally

### Force Specific Variant

Add to browser localStorage:

```javascript
// Force headline variant
localStorage.setItem('$posthog_override_feature_flag_landing-headline-test', 'pain-focused');

// Force CTA variant
localStorage.setItem('$posthog_override_feature_flag_landing-cta-test', 'value-prop');

// Force trust signals variant
localStorage.setItem('$posthog_override_feature_flag_landing-trust-signals-test', 'social-proof-top');

// Reload page
location.reload();
```

### Clear Overrides

```javascript
localStorage.clear();
location.reload();
```

---

## Troubleshooting

### Events Not Appearing

1. **Check API Key**
   ```bash
   echo $NEXT_PUBLIC_POSTHOG_KEY
   ```
   Should output: `phc_...`

2. **Check Network Tab**
   - Look for requests to `app.posthog.com/capture/`
   - Should see 200 OK responses
   - Payload should include `event` and `properties`

3. **Check PostHog Debugger**
   - Navigate to PostHog → Live Events
   - Should see events appearing in real-time

### Feature Flags Not Working

1. **Check Flag Rollout**
   - Must be 100% rollout
   - Enabled toggle must be ON

2. **Check Browser Cache**
   - PostHog caches flags for 5 minutes
   - Clear cache or wait 5 minutes after flag changes

3. **Check Client-Side Fallback**
   - If PostHog unavailable, code falls back to random assignment
   - Check browser console for `[PostHog] Initialized` message

---

## Cost Optimization

PostHog pricing is based on:
- Events tracked
- Session replays recorded
- Data retention

**To reduce costs:**

1. **Limit Session Replay**
   - Sample rate: 10% instead of 100%
   - Exclude authenticated routes (dashboard pages)
   - Only record landing page + pricing page

2. **Reduce Event Volume**
   - Don't track every click
   - Use pageviews + conversions only
   - Avoid tracking scroll depth, mouse movements

3. **Shorten Retention**
   - 30 days retention (not 1 year)
   - Export data to warehouse if long-term storage needed

---

## Expected Timeline

| Week | Sample Size | Actions |
|------|-------------|---------|
| 1 | ~750/variant | Monitor for errors, verify tracking |
| 2 | ~1,500/variant | Review intermediate results, watch for anomalies |
| 3 | ~2,250/variant | Calculate preliminary significance |
| 4 | ~3,000/variant | Declare winner if significant, or continue |

---

## Success Criteria

**Statistical Significance:**
- Confidence level: 95%
- Minimum lift: 5%
- Minimum sample size: 1,000/variant

**Business Impact:**
- Primary: Calculator → Signup conversion +5%
- Secondary: Bounce rate -10%
- Tertiary: Time on page +15%

---

## Post-Experiment

After declaring a winner:

1. **Update Code**
   - Remove A/B test hooks
   - Hardcode winning variant
   - Clean up unused components

2. **Document Learnings**
   - Add to `docs/AB_TEST_RESULTS.md`
   - Include screenshots of winning variants
   - Note insights for future tests

3. **Archive Flag**
   - Disable feature flag in PostHog
   - Keep for historical reference

4. **Plan Next Test**
   - Based on learnings, design follow-up experiments
   - Consider testing other funnel steps

---

For questions, see:
- PostHog docs: https://posthog.com/docs
- Project docs: `docs/AB_TESTING_LANDING_PAGE.md`
- Code: `hooks/use-landing-page-tests.ts`
