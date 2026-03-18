# Revenue Monitoring & MRR Tracking

## Overview

TaxBridge uses a multi-layer revenue monitoring system with automated alerts for payment failures and comprehensive funnel tracking.

**Monitoring Stack:**
- **Stripe Dashboard**: Real-time payment notifications and revenue reports
- **PostHog**: Conversion funnel tracking and behavioral analytics
- **Sentry**: Payment API error alerts and performance monitoring
- **SQL Queries**: Custom MRR snapshots and cohort analysis

---

## Part 1: Stripe Dashboard Email Notifications

### Setup Instructions

1. **Navigate to Stripe Dashboard**
   - Go to https://dashboard.stripe.com/settings/notifications
   - Login with your Stripe account

2. **Enable Payment Notifications**
   - ✅ **Successful payments** (Payments → Successful payments)
   - ✅ **Failed payments** (Payments → Failed payments)
   - ✅ **Chargebacks** (Disputes → New chargeback)
   - ✅ **Subscription cancellations** (Subscriptions → Customer canceled)
   - ✅ **New subscriptions** (Subscriptions → New subscription)

3. **Set Recipient Email**
   - Add recipient: `youremail@gmail.com` (or team distribution list)
   - Click "Save changes"

4. **Enable Weekly Revenue Digest**
   - Navigate to https://dashboard.stripe.com/settings/emails
   - Enable "Weekly summary" → Choose Monday 9 AM delivery
   - Select timezone: US/Pacific

5. **Test Notification**
   - Use test mode first: https://dashboard.stripe.com/test/settings/notifications
   - Trigger test payment using Task 4 test account
   - Verify email received within 5 minutes
   - Check spam folder if not received

### Stripe Notification Email Examples

**Successful Payment:**
```
Subject: Payment succeeded for $299.00
Body: Customer john@example.com successfully paid $299.00 for TaxBridge Pro Annual
```

**Failed Payment:**
```
Subject: Payment failed for $299.00
Body: Payment for customer ID cus_xxx failed. Reason: Card declined
Action: Contact customer or update payment method
```

---

## Part 2: PostHog Revenue Funnel Dashboard

### Setup Instructions

1. **Log in to PostHog**
   - URL: https://app.posthog.com (or self-hosted instance)
   - Use existing TaxBridge project

2. **Create Revenue Funnel Dashboard**
   - Click "Dashboards" (left sidebar) → "New dashboard"
   - Name: **"TaxBridge Revenue Funnel - Production"**
   - Description: "Track conversion from landing to paid subscription"

3. **Add Funnel Insight #1: Primary Conversion Funnel**

   **Configuration:**
   - Click "+ Add insight" → Select "Funnel"
   - Name: "Landing → Paid Conversion"
   - Funnel steps:
     1. `page_view` with property `pathname = /pricing` (Landing)
     2. `checkout_started` (Checkout initiated)
     3. `checkout_completed` (Payment successful)
   - **Conversion window**: 7 days
   - **Breakdown by**: `subscription_tier` (Pro vs Enterprise)
   - **Date range**: Last 30 days
   - Click "Save"

   **Expected Results:**
   ```
   Step 1: Pricing Page Viewed         1,000 users (100%)
   Step 2: Checkout Started              300 users (30%)
   Step 3: Checkout Completed            240 users (24% overall, 80% from Step 2)
   ```

4. **Add Insight #2: MRR Trend Chart**

   **Configuration:**
   - Click "+ Add insight" → Select "Trend"
   - Name: "Monthly Recurring Revenue (MRR)"
   - Event: `upgraded_to_pro` OR `upgraded_to_enterprise`
   - Formula:
     ```
     COUNT * 24.92 (for Pro tier)
     COUNT * 166.67 (for Enterprise tier)
     ```
   - **Aggregation**: Sum
   - **Date range**: Last 30 days
   - **Interval**: Daily
   - **Chart type**: Line chart
   - Click "Save"

5. **Add Insight #3: Checkout Conversion Rate**

   **Configuration:**
   - Click "+ Add insight" → Select "Trend"
   - Name: "Checkout → Payment Conversion Rate"
   - Formula: `(checkout_completed / checkout_started) * 100`
   - **Date range**: Last 7 days
   - **Goal line**: 80% (target conversion rate)
   - Click "Save"

6. **Add Insight #4: Churn Tracking**

   **Configuration:**
   - Event: `downgraded_to_free` (tracked in webhook handler)
   - **Date range**: Last 30 days
   - **Breakdown**: By reason (if tracked in metadata)

7. **Save Dashboard**
   - Click "Save dashboard"
   - Set as "Favorite" for quick access
   - Share with team via "Share" button

### PostHog Events Reference

**Payment Events (already tracked in code):**
- `checkout_started` - Tracked in `app/pricing/page.tsx` when user clicks "Start 7-Day Free Trial"
- `checkout_completed` - Tracked in `app/api/stripe/webhook/route.ts:108` on successful payment
- `upgraded_to_pro` - Tracked in `app/api/stripe/webhook/route.ts:107`
- `upgraded_to_enterprise` - Tracked in `app/api/stripe/webhook/route.ts:107`
- `downgraded_to_free` - Tracked in `app/api/stripe/webhook/route.ts:173` on cancellation

**Additional Events:**
- `pricing_page_viewed` - Track in pricing page
- `pricing_tier_selected` - Track when user clicks a tier CTA
- `subscription_cancelled` - Track cancellations

---

## Part 3: Sentry Payment Error Alerts

### Setup Instructions

1. **Log in to Sentry**
   - URL: https://sentry.io
   - Navigate to project: `taxbridge-production`

2. **Create Alert Rule #1: Payment API Errors**

   **Configuration:**
   - Go to "Alerts" → "Create Alert"
   - **Alert name**: "Payment API Errors - High Frequency"
   - **When**: Error count >= **5** in **1 hour**
   - **Filter conditions**:
     ```
     route = /api/stripe/webhook
     OR route = /api/stripe/create-checkout
     ```
   - **Environment**: production
   - **Actions**:
     - ✅ Send email to: `youremail@gmail.com`
     - ✅ Send Slack notification to: `#revenue-alerts` (if Slack integration configured)
   - **Alert frequency**: Send alert once per issue
   - Click "Save Rule"

3. **Create Alert Rule #2: Webhook Signature Failures**

   **Configuration:**
   - **Alert name**: "Stripe Webhook Signature Failures"
   - **When**: Error count >= **3** in **15 minutes**
   - **Filter conditions**:
     ```
     error.message CONTAINS "signature verification failed"
     ```
   - **Severity**: Critical (high priority)
   - **Actions**:
     - ✅ Send email immediately
     - ✅ Create PagerDuty incident (optional)
   - Click "Save Rule"

4. **Create Alert Rule #3: Database Payment Failures**

   **Configuration:**
   - **Alert name**: "Database Update Failures on Payment"
   - **When**: Error count >= **2** in **5 minutes**
   - **Filter conditions**:
     ```
     route = /api/stripe/webhook
     AND error.message CONTAINS "database"
     ```
   - **Actions**: Send email + Slack
   - Click "Save Rule"

5. **Test Alert System**

   **Option A: Use Test Endpoint**
   ```bash
   # Trigger single test error
   curl https://taxbridge.vercel.app/api/test-sentry

   # Trigger multiple errors to test threshold
   for i in {1..5}; do
     curl https://taxbridge.vercel.app/api/test-sentry
     sleep 2
   done
   ```

   **Option B: Manually Trigger Alert in Sentry**
   - Go to Sentry → Alerts → Select alert
   - Click "Test alert" button
   - Verify email received

6. **Verify Alert Delivery**
   - Check email inbox (within 2-3 minutes)
   - Subject should be: "Payment API Errors - High Frequency"
   - Body contains:
     - Error count and threshold
     - Link to Sentry issue
     - Affected routes
     - Stack trace preview

### Sentry Error Tracking (Already Configured)

The codebase already has Sentry integrated:

**Webhook Handler (`app/api/stripe/webhook/route.ts`)**
- Line 14: `import * as Sentry from '@sentry/nextjs';`
- Line 82-91: Missing metadata warning
- Line 126-129: Successful upgrade breadcrumb
- Line 254-268: Critical webhook processing failure

**Checkout Handler (`app/api/stripe/create-checkout/route.ts`)**
- Error handling on line 99-105 (console.error only)
- **Recommendation**: Add Sentry.captureException for checkout failures

**Test Route (`app/api/test-sentry/route.ts`)**
- Full test endpoint available
- Supports GET (throws test error) and POST (custom error levels)

---

## Part 4: Key Metrics & MRR Tracking

### Monthly Recurring Revenue (MRR) Formula

```
MRR = (# Pro subscribers × $24.92) + (# Enterprise subscribers × $166.67)

Where:
- Pro Tier: $299/year ÷ 12 = $24.92/month
- Enterprise Tier: $2,000/year ÷ 12 = $166.67/month
```

### Calculate MRR Manually

**Option 1: SQL Query**
```bash
# Run MRR snapshot query
sqlite3 data/taxbridge.db < docs/queries/mrr_snapshot.sql

# Output:
# pro_subscribers | enterprise_subscribers | total_mrr_usd | annual_run_rate_usd
# 42              | 5                     | $1,880.35     | $22,564.20
```

**Option 2: Stripe Dashboard**
1. Go to https://dashboard.stripe.com/revenue
2. View "Monthly Recurring Revenue" chart
3. Export CSV: "Revenue" → "Export" → "Last 30 days"

**Option 3: PostHog Dashboard**
- Open "TaxBridge Revenue Funnel - Production"
- View "MRR Trend Chart" insight
- Sum of `upgraded_to_pro` and `upgraded_to_enterprise` events

### SQL Queries

We've created two SQL query files:

1. **`docs/queries/mrr_snapshot.sql`** - Current MRR, subscriber counts, churn
2. **`docs/queries/revenue_funnel.sql`** - Signup to paid conversion rates

**Run queries:**
```bash
# MRR snapshot
sqlite3 data/taxbridge.db < docs/queries/mrr_snapshot.sql > reports/mrr_$(date +%Y-%m-%d).txt

# Revenue funnel
sqlite3 data/taxbridge.db < docs/queries/revenue_funnel.sql
```

---

## Conversion Funnel Metrics

### Primary Funnel Steps

```
Landing Page Visits (100%)
  ↓ 70% drop-off
Pricing Page Views (30%)
  ↓ 50% drop-off
Checkout Started (15%)
  ↓ 20% drop-off
Payment Successful (12%)
```

**Target Conversion Rate**: 15-20% (landing → paid)
**Current Conversion Rate**: Track in PostHog dashboard

### Key Funnel Metrics

| Metric | Target | Critical Threshold | How to Track |
|--------|--------|-------------------|--------------|
| **Pricing → Checkout** | 60% | < 40% | PostHog funnel |
| **Checkout → Paid** | 80% | < 70% | Stripe Dashboard |
| **Trial → Paid** | 40% | < 25% | SQL query |
| **Monthly Churn Rate** | < 5% | > 10% | SQL query |

---

## Alert Thresholds & Response Actions

### Payment Failure Rate

**Threshold**: > 5% of payment attempts fail in 1 hour

**Response Actions:**
1. Check Stripe Dashboard → "Logs" → "Failed payments"
2. Identify failure reasons:
   - ❌ Card declined → Send automated retry email
   - ❌ Insufficient funds → Retry in 3 days
   - ❌ Expired card → Send update payment method email
3. If > 10 failures with same error → Check Stripe API status

### Webhook Delivery Failure

**Threshold**: > 3 webhook signature verification failures in 15 minutes

**Response Actions:**
1. Verify webhook endpoint is accessible: `curl https://taxbridge.vercel.app/api/stripe/webhook`
2. Check `STRIPE_WEBHOOK_SECRET` environment variable in Vercel
3. Regenerate webhook secret in Stripe Dashboard if compromised
4. Review Sentry for error details

### MRR Drop

**Threshold**: MRR drops > 10% week-over-week

**Response Actions:**
1. Run cancellation analysis: `sqlite3 data/taxbridge.db < docs/queries/mrr_snapshot.sql`
2. Review cancellation reasons (if collected via survey)
3. Identify cohort with highest churn:
   - Recent signups (< 30 days)?
   - Long-term users (> 6 months)?
4. Launch win-back campaign for canceled users

---

## Weekly Monitoring Checklist

Run these checks every **Monday at 9 AM PT**:

- [ ] **Review Stripe weekly digest email**
  - Check total revenue vs last week
  - Review failed payments and retry status
  - Note any unusual chargeback activity

- [ ] **Check PostHog revenue funnel**
  - Open dashboard: "TaxBridge Revenue Funnel - Production"
  - Review funnel conversion rates (landing → paid)
  - Compare to previous week (target: < 10% variance)
  - Identify biggest drop-off point

- [ ] **Review Sentry error rate**
  - Go to Sentry → Issues → Filter by `route:/api/stripe/*`
  - Check error count vs last week
  - Resolve any recurring payment API errors

- [ ] **Export MRR snapshot**
  ```bash
  sqlite3 data/taxbridge.db < docs/queries/mrr_snapshot.sql > data/revenue/$(date +%Y-%m-%d)-mrr-snapshot.csv
  ```
  - Save to Google Drive: `Revenue Reports/Weekly Snapshots/`
  - Add to weekly metrics spreadsheet

- [ ] **Analyze top cancellation reasons**
  - Review `cancellation_survey` table (if implemented)
  - Tally reasons: pricing, didn't use, competitor, missing feature
  - Update product roadmap based on feedback

- [ ] **Check trial conversion rate**
  ```sql
  SELECT
    COUNT(*) as trials_started,
    COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as trials_converted,
    ROUND(100.0 * COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) / COUNT(*), 2) || '%' as conversion_rate
  FROM user_profiles
  WHERE trial_ends_at >= unixepoch('now', '-30 days');
  ```
  - Target: > 40% conversion
  - If < 25%, investigate trial experience

---

## Monthly Deep Dive

Run these analyses on the **1st of each month**:

### 1. Cohort Retention Analysis

```sql
-- Users who signed up 30 days ago, still subscribed?
SELECT
  strftime('%Y-%m', datetime(created_at, 'unixepoch')) as cohort_month,
  COUNT(*) as signups,
  COUNT(CASE WHEN subscription_status = 'active' AND subscription_tier IN ('pro', 'enterprise') THEN 1 END) as retained,
  ROUND(100.0 * COUNT(CASE WHEN subscription_status = 'active' AND subscription_tier IN ('pro', 'enterprise') THEN 1 END) / COUNT(*), 2) || '%' as retention_rate
FROM user_profiles
WHERE created_at >= unixepoch('now', '-180 days')
GROUP BY cohort_month
ORDER BY cohort_month;
```

### 2. Revenue Attribution by Channel

Check PostHog dashboard:
- Go to Insights → Trends
- Event: `subscription_activated`
- Group by: `properties.utm_source`
- Chart: Total revenue (use formula: `COUNT * 299` for Pro)

**Top channels to track:**
- Google Ads (paid)
- Product Hunt (launch spike)
- Organic search (SEO)
- Reddit referrals
- Partner affiliates

### 3. Feature Usage Correlation

Identify which features lead to higher conversion:

```sql
-- Users who exported PDF (premium feature) vs conversion rate
SELECT
  'PDF Exporters' as segment,
  COUNT(DISTINCT user_id) as users,
  COUNT(DISTINCT CASE WHEN subscription_tier IN ('pro', 'enterprise') THEN user_id END) as paid_users,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN subscription_tier IN ('pro', 'enterprise') THEN user_id END) / COUNT(DISTINCT user_id), 2) || '%' as conversion_rate
FROM analytics_events
WHERE event_name = 'pdf_exported';
```

---

## Monitoring Tools Quick Reference

| Tool | Use Case | Access | Frequency |
|------|----------|--------|-----------|
| **Stripe Dashboard** | Real-time payments, refunds, disputes | https://dashboard.stripe.com | Daily (digest: weekly) |
| **PostHog Funnel** | Conversion rates, drop-off analysis | https://app.posthog.com | Weekly |
| **Sentry Alerts** | Payment API errors, webhook failures | https://sentry.io | Real-time (email alerts) |
| **SQL Queries** | MRR snapshots, cohort analysis | Local DB | Weekly/Monthly |
| **Stripe Sigma** | Advanced SQL on Stripe data (optional) | https://dashboard.stripe.com/sigma | Monthly |

---

## Test Checklist (Acceptance Criteria)

Before going live with revenue monitoring:

- [ ] **Stripe email notifications enabled**
  - Test email received for successful payment
  - Test email received for failed payment
  - Weekly digest scheduled (Mondays, 9 AM)

- [ ] **PostHog dashboard created**
  - "TaxBridge Revenue Funnel - Production" dashboard exists
  - 3+ insights configured (funnel, MRR trend, conversion rate)
  - Funnel tracks: Pricing → Checkout → Payment

- [ ] **Sentry alerts configured**
  - Alert rule #1: Payment API Errors (5 errors/hour)
  - Alert rule #2: Webhook Signature Failures (3 errors/15 min)
  - Test alert fired successfully (email received < 5 minutes)

- [ ] **SQL queries tested**
  - `docs/queries/mrr_snapshot.sql` runs without errors
  - `docs/queries/revenue_funnel.sql` runs without errors
  - MRR calculation matches Stripe Dashboard (within 5%)

- [ ] **Documentation complete**
  - `REVENUE_MONITORING.md` created with MRR calculation
  - Weekly monitoring checklist defined
  - Alert thresholds documented

- [ ] **Team access granted**
  - Finance team has Stripe Dashboard access (View-only)
  - Engineering has Sentry access (Admin)
  - Product/Growth has PostHog access (View + Edit)

---

## Troubleshooting

### Stripe Notifications Not Received

**Issue**: Payment succeeded but no email notification

**Solutions:**
1. Check Stripe Dashboard → Settings → Notifications
2. Verify email address is correct (check for typos)
3. Check spam/junk folder
4. Test with Stripe test mode first
5. Ensure "Successful payments" is enabled

### PostHog Funnel Shows 0 Events

**Issue**: Funnel steps show no data

**Solutions:**
1. Verify `NEXT_PUBLIC_POSTHOG_KEY` is set in `.env.local`
2. Check browser console for PostHog errors
3. Wait 5-10 minutes for events to process
4. Verify event names match exactly (case-sensitive)
5. Check PostHog → Live Events to see raw events

### Sentry Alert Not Firing

**Issue**: Triggered 5+ errors but no alert email

**Solutions:**
1. Check Sentry → Alerts → Alert rule status
2. Verify email address in alert rule settings
3. Check alert threshold (5 errors in 1 hour, not 1 minute)
4. Ensure environment filter is correct (`production`)
5. Manually trigger test alert to verify email delivery

### MRR Calculation Doesn't Match Stripe

**Issue**: SQL query shows $5,000 MRR, Stripe shows $4,800

**Possible Causes:**
1. **Trial periods**: SQL counts trialing users, Stripe doesn't
2. **Canceled subscriptions**: SQL might include recently canceled
3. **Timing**: SQL uses `updated_at`, Stripe uses billing cycle start
4. **Discounts**: SQL doesn't account for coupons/discounts

**Fix:**
```sql
-- Updated query to match Stripe exactly
SELECT
  ROUND(
    (COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) * 24.92) +
    (COUNT(CASE WHEN subscription_tier = 'enterprise' THEN 1 END) * 166.67),
    2
  ) as total_mrr_usd
FROM user_profiles
WHERE subscription_status = 'active'  -- Exclude trialing
  AND subscription_tier IN ('pro', 'enterprise')
  AND stripe_subscription_id IS NOT NULL;  -- Ensure Stripe sync
```

---

## Next Steps

1. **Set up monitoring services** (30 minutes)
   - [ ] Configure Stripe email notifications
   - [ ] Create PostHog revenue dashboard
   - [ ] Set up Sentry alert rules

2. **Test alert system** (15 minutes)
   - [ ] Trigger test payment (use Task 4 test account)
   - [ ] Verify Stripe email received
   - [ ] Trigger Sentry test errors
   - [ ] Verify alert emails received

3. **Run first MRR snapshot** (5 minutes)
   ```bash
   sqlite3 data/taxbridge.db < docs/queries/mrr_snapshot.sql > data/revenue/baseline-mrr-snapshot.txt
   ```

4. **Schedule weekly review** (5 minutes)
   - Add to calendar: Every Monday 9 AM PT
   - Create Google Sheet: "TaxBridge Weekly Revenue Metrics"
   - Share with team

5. **Document baseline metrics** (10 minutes)
   - Record current MRR
   - Record current conversion rates
   - Set Q2 targets (+50% MRR growth)

---

## Support & Resources

- **Stripe Documentation**: https://stripe.com/docs/monitoring
- **PostHog Funnels Guide**: https://posthog.com/docs/user-guides/funnels
- **Sentry Alerts Guide**: https://docs.sentry.io/product/alerts/
- **TaxBridge PostHog Events**: See `docs/POSTHOG_ANALYTICS.md`
- **Contact**: For setup help, ask in #engineering or email support@taxbridge.com

---

**Last Updated**: March 18, 2026
**Estimated Setup Time**: 30 minutes
**Maintenance**: 30 minutes/week
