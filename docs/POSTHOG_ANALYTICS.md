# PostHog Conversion Funnel Analytics

## Overview

TaxBridge uses PostHog for comprehensive conversion funnel tracking to identify drop-off points and optimize the user journey from landing → signup → trial → paid subscription.

## Setup

### 1. Create PostHog Account

1. Go to [posthog.com](https://posthog.com) and create an account
2. Create a new project
3. Copy your Project API Key (starts with `phc_`)

### 2. Configure Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com  # or https://eu.posthog.com for EU
```

### 3. Deploy and Verify

1. Restart your dev server: `npm run dev`
2. Visit your app and perform some actions
3. Go to PostHog Dashboard → Live Events to see events flowing in
4. Wait ~5 minutes for data to process

## Key Funnels Tracked

### Primary Conversion Funnel (7 steps)

```
Landing (100%)
  ↓ 65% drop-off
Signup (35%)
  ↓ 40% drop-off
Onboarding Complete (21%)
  ↓ 30% drop-off
First RSU Entry (15%)
  ↓ 70% drop-off ⚠️ CRITICAL DROP-OFF
Upgrade Button Click (4.5%)
  ↓ 50% drop-off
Checkout Started (2.3%)
  ↓ 20% drop-off
Subscription Activated (1.8%) 🎯
```

**Target Conversion Rate**: 5% (currently 1.8%)

### Alternative Funnels

**Pricing Direct Funnel** (High-intent users):
```
pricing_page_viewed → pricing_tier_selected → checkout_started → subscription_activated
```
Conversion rate: ~32% (vs 1.8% overall)

**Enterprise Funnel** (B2B):
```
enterprise_page_viewed → demo_request_submitted → demo_scheduled → enterprise_contract_signed
```
Conversion rate: ~9% to contract, $2000 ACV

## Events Reference

### Landing & Awareness
- `landing_page_viewed` - User visits homepage
- `pricing_page_viewed` - User visits pricing page
- `calculator_page_viewed` - User visits calculator
- `guide_viewed` - User reads tax guide

### Signup Funnel
- `signup_button_clicked` - User clicks "Sign Up"
- `signup_started` - User begins signup form
- `signup_completed` - User completes registration
- `email_verified` - Email verification complete

### Onboarding Funnel
- `onboarding_started` - User enters onboarding flow
- `onboarding_step_completed` - Each onboarding step
- `onboarding_completed` - Full onboarding done
- `profile_completed` - Profile fields filled

### Core Product Usage
- `first_rsu_entry_started` - User starts first RSU
- `first_rsu_entry_completed` - First RSU saved
- `rsu_entry_created` - Any RSU entry created
- `tax_calculation_viewed` - User views tax calc results
- `ftc_optimizer_used` - FTC optimizer accessed
- `multi_year_analysis_viewed` - Multi-year feature used
- `pdf_exported` - User exports PDF report
- `forms_checklist_opened` - Forms checklist viewed
- `csv_import_started` - CSV import initiated
- `csv_import_completed` - CSV import successful

### Monetization Funnel
- `paywall_shown` - Paywall displayed to free user
- `upgrade_button_clicked` - "Upgrade" CTA clicked
- `pricing_tier_selected` - User selects Pro/Enterprise
- `checkout_started` - Stripe checkout initiated
- `checkout_completed` - Payment successful
- `trial_started` - 7-day trial activated
- `trial_converted_to_paid` - Trial → paid conversion
- `subscription_activated` - First paid subscription
- `subscription_renewed` - Renewal payment
- `subscription_cancelled` - User cancelled
- `subscription_reactivated` - Cancelled → reactivated

### Enterprise
- `enterprise_page_viewed` - Enterprise landing page
- `demo_request_submitted` - Demo form submitted
- `demo_scheduled` - Demo meeting booked
- `enterprise_contract_signed` - Deal closed

### Retention & Engagement
- `notification_clicked` - User clicks notification
- `email_link_clicked` - Email CTA clicked
- `deadline_reminder_viewed` - Tax deadline reminder
- `dashboard_viewed` - Dashboard accessed
- `feature_discovered` - New feature used

## Creating Funnels in PostHog

### 1. Go to PostHog Dashboard → Insights → New Funnel

### 2. Create Primary Funnel

**Name**: Primary Conversion Funnel
**Steps**:
1. `landing_page_viewed`
2. `signup_completed`
3. `onboarding_completed`
4. `first_rsu_entry_completed`
5. `upgrade_button_clicked`
6. `checkout_started`
7. `subscription_activated`

**Filters**: None (track all users)
**Time Window**: 30 days
**Chart Type**: Steps with conversion rate

### 3. Create Pricing Funnel

**Name**: Pricing Page Conversion
**Steps**:
1. `pricing_page_viewed`
2. `pricing_tier_selected`
3. `checkout_started`
4. `subscription_activated`

**Filters**: None
**Time Window**: 7 days (shorter intent window)

### 4. Set Up Conversion Alerts

Go to PostHog → Alerts → New Alert

**Alert 1: Conversion Rate Drop**
- Metric: Funnel conversion rate (signup → paid)
- Threshold: < 4%
- Notification: Email + Slack

**Alert 2: Checkout Abandonment**
- Metric: Count of `checkout_started` - `subscription_activated`
- Threshold: > 10 per day
- Notification: Email

## Key Metrics to Monitor

### Daily
- **Signup → Paid Conversion**: Target 5% (currently 1.8%)
- **Pricing Page → Checkout**: Target 60% (currently ~40%)
- **Checkout → Paid**: Target 80% (currently ~70%)

### Weekly
- **MRR Growth**: Track `subscription_activated` events × $299
- **Churn Rate**: Monitor `subscription_cancelled` events
- **Trial Conversion**: Track `trial_started` → `trial_converted_to_paid`

### Monthly
- **Cohort Retention**: Use PostHog Retention analysis
- **Feature Adoption**: Track usage of new features
- **Revenue Attribution**: Which acquisition channel has highest LTV

## Drop-Off Point Analysis

### Top 3 Critical Drop-Offs

**1. Landing → Signup (65% drop-off)**
- **Why**: High friction, unclear value prop
- **Fix**: Add free calculator without signup, social proof
- **Test**: A/B test simplified signup (email only)

**2. First RSU → Upgrade (70% drop-off) ⚠️ HIGHEST PRIORITY**
- **Why**: Free tier provides too much value, unclear Pro benefits
- **Fix**: Earlier paywall (2 RSU limit), stronger upgrade CTAs
- **Test**: Show comparison table after first RSU entry

**3. Upgrade Click → Checkout (50% drop-off)**
- **Why**: Price shock, uncertainty, need more trust signals
- **Fix**: Add money-back guarantee, ROI calculator, testimonials on checkout
- **Test**: Offer monthly pricing option

## Session Recording

Enable session recordings for drop-off analysis:

1. Go to PostHog → Project Settings → Recordings
2. Enable session recording
3. Set filters:
   - Record users who complete `pricing_tier_selected` but NOT `checkout_started`
   - Record users who complete `checkout_started` but NOT `subscription_activated`
4. Watch recordings to identify UX issues

## A/B Testing with PostHog

PostHog supports feature flags for A/B testing. Example experiments:

### Experiment 1: Pricing Page Headline
```typescript
import { getFeatureFlag } from '@/lib/analytics/posthog';

const variant = getFeatureFlag('pricing_headline_test');
const headline = variant === 'value_prop'
  ? "Save $4,100 on your cross-border taxes"
  : "Simple, Transparent Pricing";
```

### Experiment 2: Paywall Timing
```typescript
const paywallAfter = getFeatureFlag('paywall_timing');
// 'aggressive': 1 RSU entry
// 'standard': 2 RSU entries
// 'generous': 3 RSU entries
```

## Revenue Attribution

Track which acquisition channels drive highest revenue:

```typescript
trackEvent('subscription_activated', {
  revenue: 299,
  currency: 'USD',
  plan: 'pro',
  source: searchParams.get('utm_source'),
  medium: searchParams.get('utm_medium'),
  campaign: searchParams.get('utm_campaign'),
});
```

View in PostHog:
- Go to Insights → Trends
- Event: `subscription_activated`
- Group by: `properties.source`
- Chart: Total revenue

## Best Practices

### 1. Event Naming
- Use snake_case: `subscription_activated` not `Subscription Activated`
- Be specific: `first_rsu_entry_completed` not `entry_created`
- Include intent: `upgrade_button_clicked` not `button_clicked`

### 2. Properties
- Always include `userId` for logged-in events
- Add `funnelStep` and `funnelStepNumber` for funnel analysis
- Include `revenue` and `plan` for monetization events
- Add `source`, `medium`, `campaign` for attribution

### 3. Privacy
- Never track PII (names, emails, RSU amounts) in event properties
- Use user IDs only, not email addresses
- Comply with GDPR: respect user opt-out preferences

### 4. Performance
- PostHog calls are async and non-blocking
- Events are batched automatically
- Silent failures won't break user experience

## Troubleshooting

### Events not showing up
1. Check `.env.local` has correct `NEXT_PUBLIC_POSTHOG_KEY`
2. Verify key starts with `phc_`
3. Open browser console, look for `[PostHog]` logs in development
4. Wait 5-10 minutes for events to process

### Duplicate events
- PostHog Provider is added to root layout (✓)
- Don't initialize PostHog in individual pages
- Use `capture_pageview: false` to prevent auto page views

### User identification not working
- Make sure `identifyUser()` is called after Clerk auth
- Check PostHog → Persons to see identified users
- User ID should match Clerk user ID

## Next Steps

1. **Enable PostHog**: Add API key to `.env.local`
2. **Create Funnels**: Set up 3 core funnels in PostHog UI
3. **Set Alerts**: Configure conversion rate alerts
4. **Session Recording**: Enable recordings for drop-off analysis
5. **A/B Tests**: Create feature flags for pricing experiments
6. **Weekly Review**: Check funnel conversion rates every Monday
7. **Optimize**: Focus on top drop-off points first

## Support

- **PostHog Docs**: https://posthog.com/docs
- **TaxBridge PostHog Dashboard**: `/admin/posthog-funnel`
- **Contact**: For PostHog setup help, ask in #engineering
