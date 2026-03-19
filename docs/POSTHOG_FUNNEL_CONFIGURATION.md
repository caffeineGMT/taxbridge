# PostHog Funnel Configuration Guide
**TaxBridge Analytics Setup**
**Date:** March 19, 2026
**Purpose:** Step-by-step guide to configure conversion funnels, goals, and dashboards in PostHog

---

## Prerequisites

1. **PostHog Account**: Ensure `NEXT_PUBLIC_POSTHOG_KEY` is set in `.env.local`
2. **Event Tracking**: Verify events are firing (see "Verification" section)
3. **Access Level**: Admin access to PostHog project required

---

## Part 1: Initial Setup & Verification

### Step 1: Verify Event Tracking

Navigate to PostHog → **Activity** → **Events**

**Run this verification checklist:**

```markdown
✅ Events appearing in real-time (refresh every 5 seconds)
✅ Event properties include: timestamp, environment, deviceType, browser
✅ User identification works (person_id is set for logged-in users)
✅ No duplicate events (same event firing twice for one action)
```

**Common Issues:**
- **No events appearing**: Check browser console for PostHog init errors
- **Missing properties**: Verify `getDeviceInfo()` is imported in components
- **Duplicate events**: Check for double useEffect calls in React components

---

### Step 2: Create Event Actions

PostHog Actions = Reusable event definitions for funnels

Navigate to PostHog → **Data Management** → **Actions** → **New Action**

#### Action 1: Calculator Page Viewed
```yaml
Name: "Calculator Page Viewed"
Match type: Event name
Event name: calculator_page_viewed
Description: "User landed on marketing tax calculator"
```

#### Action 2: Tax Calculation Completed
```yaml
Name: "Tax Calculation Completed"
Match type: Event name
Event name: tax_calculation_viewed
Description: "User completed tax calculation (saw results)"
```

#### Action 3: Email Captured (Lead)
```yaml
Name: "Email Captured"
Match type: Event name
Event name: email_captured
Description: "User submitted email address (lead conversion)"
```

#### Action 4: Signup Completed
```yaml
Name: "Signup Completed"
Match type: Event name
Event name: signup_completed
Description: "User created account"
```

#### Action 5: First RSU Entry
```yaml
Name: "First RSU Entry Completed"
Match type: Event name
Event name: first_rsu_entry_completed
Description: "User completed first RSU entry (activation)"
```

#### Action 6: Subscription Activated
```yaml
Name: "Subscription Activated"
Match type: Event name
Event name: subscription_activated
Description: "User subscribed to paid plan"
```

#### Action 7: ROI Calculator Viewed
```yaml
Name: "ROI Calculator Viewed"
Match type: Event name
Event name: calculator_page_viewed
Filters:
  - calculator_id = "roi-calculator-enterprise"
Description: "Enterprise ROI calculator viewed"
```

#### Action 8: Demo Request Submitted
```yaml
Name: "Demo Request Submitted"
Match type: Event name
Event name: demo_request_submitted
Description: "Enterprise demo request (high-value lead)"
```

**Save all actions before proceeding to funnels.**

---

## Part 2: Conversion Funnels

### Funnel A: Calculator to Email (Top of Funnel)
**Purpose:** Measure lead generation effectiveness

Navigate to PostHog → **Insights** → **New Insight** → **Funnel**

**Configuration:**
```yaml
Funnel Name: "Calculator to Email Capture"

Steps:
  1. Calculator Page Viewed
  2. Tax Calculation Completed
  3. Email Captured

Filters:
  - Exclude test users: person_id not contains "test"
  - Exclude internal traffic: email_domain not contains "taxbridge.app"

Conversion window: 30 minutes

Breakdown by:
  - utm_source (to compare traffic sources)
  - deviceType (mobile vs desktop)
  - browser (identify browser-specific issues)

Visualization: Funnel steps (default)
```

**Expected Conversion Rates:**
- Calculator → Calculation: 70-85% (high intent)
- Calculation → Email: 10-20% (industry benchmark)
- Overall: 7-17%

**Red Flags:**
- Calculator → Calculation < 50%: UX issue or slow loading
- Calculation → Email < 5%: Value proposition problem
- Mobile conversion << Desktop: Responsive design issue

**Save as Dashboard:** Yes → Add to "Growth Metrics" dashboard

---

### Funnel B: Signup to Activation (Middle of Funnel)
**Purpose:** Measure product onboarding effectiveness

**Configuration:**
```yaml
Funnel Name: "Signup to First RSU Entry"

Steps:
  1. Signup Completed
  2. Onboarding Completed
  3. First RSU Entry Completed

Filters:
  - Exclude test users

Conversion window: 7 days

Breakdown by:
  - referrer (identify best signup sources)
  - user_tier (free vs trial)

Visualization: Funnel steps
```

**Expected Conversion Rates:**
- Signup → Onboarding: 80-90%
- Onboarding → First RSU: 50-70%
- Overall: 40-63%

**Optimization Targets:**
- If Signup → Onboarding < 70%: Email verification or friction
- If Onboarding → First RSU < 40%: Onboarding flow too long or confusing

---

### Funnel C: Activation to Revenue (Bottom of Funnel)
**Purpose:** Measure monetization effectiveness

**Configuration:**
```yaml
Funnel Name: "Activation to Paid Subscription"

Steps:
  1. First RSU Entry Completed
  2. Paywall Shown
  3. Pricing Page Viewed
  4. Checkout Started
  5. Subscription Activated

Filters:
  - Exclude test users

Conversion window: 30 days

Breakdown by:
  - plan (pro vs enterprise)
  - feature (which feature triggered paywall)

Visualization: Funnel steps with time to convert
```

**Expected Conversion Rates:**
- First RSU → Paywall: 80-100% (should hit paywall fast)
- Paywall → Pricing: 30-50%
- Pricing → Checkout: 40-60%
- Checkout → Paid: 60-80% (Stripe conversion)
- **Overall: 5-10%** (freemium benchmark)

**Optimization Targets:**
- Paywall → Pricing < 20%: Paywall not compelling
- Checkout → Paid < 50%: Payment friction or pricing issue

---

### Funnel D: Enterprise ROI to Demo (B2B Funnel)
**Purpose:** Measure enterprise lead quality

**Configuration:**
```yaml
Funnel Name: "Enterprise: ROI Calculator to Demo"

Steps:
  1. ROI Calculator Viewed
  2. Tax Calculation Viewed (roi_calculation_viewed)
  3. Demo Request Submitted

Filters:
  - source = "roi_calculator"

Conversion window: 60 minutes

Breakdown by:
  - roi (group: <100%, 100-300%, >300%)
  - attorneyCount (firm size)

Visualization: Funnel steps
```

**Expected Conversion Rates:**
- ROI Calc → Calculation: 60-80%
- Calculation → Demo: 5-15% (high-intent B2B)
- Overall: 3-12%

**Lead Quality Indicators:**
- ROI > 300%: Hot lead (prioritize sales outreach)
- attorneyCount > 100: Enterprise tier potential
- firmName present: Serious inquiry

---

## Part 3: Retention Cohorts

### Cohort 1: Weekly Active Users
Navigate to PostHog → **Insights** → **New Insight** → **Retention**

**Configuration:**
```yaml
Cohort Name: "Weekly Active Users (WAU)"

Cohort event: signup_completed
Return event: dashboard_viewed

Time intervals: Week 0, Week 1, Week 2, Week 3, Week 4

Filters:
  - Exclude test users

Breakdown by:
  - user_tier (free vs pro)
  - referrer
```

**Target Retention:**
- Week 1: 50-60% (SaaS benchmark)
- Week 2: 30-40%
- Week 4: 20-30%

**If retention < target:**
- Implement email drip campaign
- Add product usage tips
- Trigger re-engagement notifications

---

### Cohort 2: Paid User Retention
**Configuration:**
```yaml
Cohort Name: "Paid User Retention"

Cohort event: subscription_activated
Return event: dashboard_viewed

Time intervals: Day 7, Day 14, Day 30, Day 60

Filters:
  - user_tier = "pro"
```

**Target Retention:**
- Day 7: 90%+
- Day 30: 80%+
- Day 60: 70%+

**Churn Risk Indicators:**
- No login in 14 days: Send re-engagement email
- No new RSU entries in 30 days: Product usage issue

---

## Part 4: Conversion Goals (PostHog Actions with Thresholds)

### Goal 1: Weekly Lead Target
Navigate to PostHog → **Insights** → **New Insight** → **Trends**

**Configuration:**
```yaml
Goal Name: "Weekly Lead Generation"

Event: email_captured
Aggregation: Count of events
Time range: Last 7 days

Target: 100 emails/week (adjust based on traffic)

Alert:
  - Threshold: < 80 emails in 7 days
  - Notification: Slack #growth channel
  - Frequency: Daily check at 9am
```

---

### Goal 2: Calculator Completion Rate
**Configuration:**
```yaml
Goal Name: "Calculator Completion Rate"

Formula:
  Numerator: tax_calculation_viewed (count)
  Denominator: calculator_page_viewed (count)

Time range: Last 7 days

Target: > 70% completion rate

Alert:
  - Threshold: < 60%
  - Notification: Email eng@taxbridge.app
```

---

### Goal 3: Paid Conversion Rate
**Configuration:**
```yaml
Goal Name: "Free to Paid Conversion"

Formula:
  Numerator: subscription_activated (count unique users)
  Denominator: first_rsu_entry_completed (count unique users)

Time range: Last 30 days

Target: > 5% conversion rate

Alert:
  - Threshold: < 3%
  - Notification: Slack #revenue
```

---

## Part 5: Custom Dashboards

### Dashboard 1: Growth Metrics (CEO Dashboard)
Navigate to PostHog → **Dashboards** → **New Dashboard**

**Dashboard Name:** "Growth Metrics - CEO View"

**Panels to Add:**

1. **Weekly Active Users (WAU)**
   - Chart type: Line graph
   - Event: dashboard_viewed (unique users)
   - Time range: Last 8 weeks

2. **Calculator to Email Funnel**
   - Chart type: Funnel
   - (Use Funnel A from above)

3. **Lead Volume by Source**
   - Chart type: Stacked bar
   - Event: email_captured
   - Breakdown by: utm_source
   - Time range: Last 4 weeks

4. **Activation Rate**
   - Chart type: Number (big number)
   - Formula: first_rsu_entry_completed / signup_completed
   - Time range: Last 7 days

5. **Revenue (Paid Subs)**
   - Chart type: Line graph
   - Event: subscription_activated (unique users, cumulative)
   - Time range: Last 12 weeks

6. **Churn Rate**
   - Chart type: Number
   - Formula: subscription_cancelled / subscription_activated
   - Time range: Last 30 days

**Refresh:** Auto-refresh every 5 minutes (for live monitoring)

---

### Dashboard 2: Product Usage (Engineering Dashboard)
**Dashboard Name:** "Product Usage - Engineering View"

**Panels:**

1. **Feature Usage Heatmap**
   - Events: All feature events (ftc_optimizer_used, pdf_exported, csv_import_started)
   - Breakdown by: feature_name
   - Time range: Last 7 days

2. **Field-Level Drop-off**
   - Chart type: Table
   - Event: page_viewed (where event_type = 'field_blur')
   - Columns: form_id, field_name, completion_rate (calculated)
   - Sort by: completion_rate ASC (worst first)

3. **Error Rate**
   - Chart type: Line graph
   - Event: page_viewed (where event_type = 'error')
   - Breakdown by: error_name
   - Time range: Last 7 days

4. **Performance Metrics**
   - Chart type: Line graph
   - Event: page_viewed (where event_type = 'performance')
   - Metric: Average metric_value
   - Breakdown by: metric_name (page_load_time, dns_time, etc.)

5. **Mobile vs Desktop Usage**
   - Chart type: Pie chart
   - Event: page_viewed (unique users)
   - Breakdown by: deviceType

---

### Dashboard 3: Marketing Attribution
**Dashboard Name:** "Marketing Attribution"

**Panels:**

1. **Traffic Sources**
   - Chart type: Stacked area
   - Event: calculator_page_viewed
   - Breakdown by: utm_source
   - Time range: Last 30 days

2. **Campaign Performance**
   - Chart type: Table
   - Columns: utm_campaign, Visitors, Emails Captured, Conversion Rate
   - Sort by: Conversion Rate DESC

3. **Google Ads ROI**
   - Chart type: Custom insight
   - Formula: (subscription_activated * 49) / (calculator_page_viewed * estimated_cpc)
   - Filter: utm_source = "google"

---

## Part 6: Alerts & Monitoring

### Alert 1: Calculator Completion Rate Drop
Navigate to PostHog → **Alerts** → **New Alert**

**Configuration:**
```yaml
Alert Name: "Calculator Completion Rate Drop"

Metric: Funnel conversion (Calculator → Email)
Threshold: < 10%
Time window: Last 24 hours
Notification: Slack #eng-alerts
Frequency: Check every 1 hour
```

**Action on Alert:**
1. Check for JavaScript errors in browser console
2. Verify PostHog SDK is loaded
3. Test calculator flow manually
4. Check server logs for API errors

---

### Alert 2: Payment Failure Spike
**Configuration:**
```yaml
Alert Name: "Payment Failure Spike"

Metric: checkout_started - subscription_activated
Threshold: Failure rate > 30%
Time window: Last 6 hours
Notification: Slack #revenue-alerts
```

**Action on Alert:**
1. Check Stripe dashboard for errors
2. Verify webhook delivery
3. Test payment flow with test card
4. Check Sentry for exceptions

---

### Alert 3: Churn Risk Users
**Configuration:**
```yaml
Alert Name: "Paid Users Not Logging In"

Cohort: Users where (subscription_activated in last 60 days)
Condition: No dashboard_viewed event in last 14 days
Notification: Email to sales@taxbridge.app
Frequency: Daily at 9am
```

**Action on Alert:**
- Send personalized re-engagement email
- Offer customer success call
- Survey: "What can we improve?"

---

## Part 7: Advanced Features

### Session Recording (Optional)
**Requires legal review - privacy policy update needed**

Navigate to PostHog → **Settings** → **Recordings**

**Configuration:**
```yaml
Enable session recording: Yes
Sampling rate: 10% (record 1 in 10 sessions)
Exclude sensitive fields:
  - input[type="password"]
  - input[name="email"]
  - input[name="creditCard"]

Record on events:
  - calculator_dropoff
  - form_abandonment
  - error events
```

**Use Cases:**
- Watch users struggle with specific fields
- Identify rage clicks (user clicks same element 3+ times)
- Debug mobile UX issues

**Privacy Compliance:**
- Update privacy policy: "We use session recordings to improve UX"
- Exclude PII (email, credit card, SSN fields)
- Allow opt-out via cookie banner

---

### Feature Flags (A/B Testing)
Navigate to PostHog → **Feature Flags** → **New Feature Flag**

#### Example: Test Calculator Layout
**Configuration:**
```yaml
Flag key: calculator_layout_v2
Description: "Test new 2-column calculator layout"
Rollout: 50% (A/B test)

Variants:
  - control (50%): Show original layout
  - treatment (50%): Show new layout

Success metric: email_captured (conversion rate)
Duration: 14 days
```

**Implementation in Code:**
```typescript
import { getFeatureFlag } from '@/lib/analytics/posthog';

const useNewLayout = getFeatureFlag('calculator_layout_v2') === 'treatment';
```

**Analysis:**
- Navigate to PostHog → **Experiments** → View results
- Compare email_captured rate between variants
- Ship winner if p-value < 0.05 and lift > 10%

---

## Part 8: Data Quality Checks

### Weekly Health Check Queries
Run these queries in PostHog → **SQL Explorer** every Monday

#### Query 1: Event Volume by Type
```sql
SELECT
  event AS event_name,
  COUNT(*) AS event_count,
  COUNT(DISTINCT person_id) AS unique_users,
  MIN(timestamp) AS first_event,
  MAX(timestamp) AS last_event
FROM events
WHERE timestamp >= now() - INTERVAL '7 days'
GROUP BY event
ORDER BY event_count DESC;
```

**Expected Results:**
- `page_viewed`: Highest volume
- `calculator_page_viewed`: Moderate (depends on traffic)
- `subscription_activated`: Low (bottom of funnel)

**Red Flags:**
- Any core event with 0 count: Tracking broken
- Event count dropped 50%+ week-over-week: Investigate

---

#### Query 2: Missing Properties Audit
```sql
SELECT
  event,
  COUNT(*) AS total_events,
  COUNT(CASE WHEN properties->>'deviceType' IS NULL THEN 1 END) AS missing_device,
  COUNT(CASE WHEN properties->>'browser' IS NULL THEN 1 END) AS missing_browser,
  COUNT(CASE WHEN properties->>'utm_source' IS NULL THEN 1 END) AS missing_utm
FROM events
WHERE timestamp >= now() - INTERVAL '7 days'
GROUP BY event
HAVING COUNT(CASE WHEN properties->>'deviceType' IS NULL THEN 1 END) > 0;
```

**Expected Results:**
- No missing `deviceType` or `browser` (tracked everywhere)
- Missing `utm_source` OK for direct traffic

---

#### Query 3: User Journey Sanity Check
```sql
WITH user_events AS (
  SELECT
    person_id,
    MIN(CASE WHEN event = 'calculator_page_viewed' THEN timestamp END) AS calculator_time,
    MIN(CASE WHEN event = 'email_captured' THEN timestamp END) AS email_time,
    MIN(CASE WHEN event = 'subscription_activated' THEN timestamp END) AS paid_time
  FROM events
  WHERE timestamp >= now() - INTERVAL '30 days'
  GROUP BY person_id
)
SELECT
  COUNT(*) AS users,
  COUNT(calculator_time) AS saw_calculator,
  COUNT(email_time) AS submitted_email,
  COUNT(paid_time) AS became_paid,
  COUNT(CASE WHEN email_time < calculator_time THEN 1 END) AS broken_journey
FROM user_events;
```

**Red Flags:**
- `broken_journey > 0`: Users submitted email before seeing calculator (timestamp issue)

---

## Part 9: Troubleshooting

### Issue: No Events Appearing in PostHog

**Checklist:**
1. Check `.env.local`: `NEXT_PUBLIC_POSTHOG_KEY` is set
2. Check browser console: PostHog init message appears
3. Check network tab: POST requests to `app.posthog.com/batch` succeed
4. Check environment: PostHog doesn't track in `development` mode by default
5. Verify `posthog.__loaded` is true in console

**Fix:**
```typescript
// In lib/analytics/posthog.ts
if (process.env.NODE_ENV === 'development') {
  console.log('[PostHog] Initialized:', posthog.__loaded);
}
```

---

### Issue: Events Fire Twice

**Cause:** React StrictMode mounts components twice in dev mode

**Fix:**
```typescript
// Use ref to track if event was sent
const trackedRef = useRef(false);

useEffect(() => {
  if (!trackedRef.current) {
    trackEvent('page_viewed');
    trackedRef.current = true;
  }
}, []);
```

---

### Issue: Funnel Conversion Rates = 0%

**Causes:**
1. Conversion window too short (user journey takes longer)
2. Person ID not persisted (user appears as different person)
3. Events firing out of order (timestamp issues)

**Fix:**
- Increase conversion window from 30 min → 24 hours
- Verify `posthog.identify(userId)` is called on signup
- Check event timestamps are accurate

---

## Part 10: Implementation Checklist

### Pre-Launch
- [ ] PostHog SDK initialized in app (verify with console log)
- [ ] All core events firing (calculator, signup, subscription)
- [ ] User identification works (person_id = Clerk user ID)
- [ ] Event properties include device, browser, utm params
- [ ] No duplicate events in dev mode

### Funnels Configured
- [ ] Funnel A: Calculator to Email
- [ ] Funnel B: Signup to Activation
- [ ] Funnel C: Activation to Revenue
- [ ] Funnel D: Enterprise ROI to Demo

### Dashboards Created
- [ ] Growth Metrics (CEO dashboard)
- [ ] Product Usage (Engineering dashboard)
- [ ] Marketing Attribution

### Alerts Set Up
- [ ] Calculator completion rate drop
- [ ] Payment failure spike
- [ ] Churn risk users (no login in 14 days)

### Weekly Monitoring
- [ ] Run data quality SQL queries
- [ ] Review funnel conversion rates
- [ ] Check for broken user journeys
- [ ] Review alert history

---

**Next Steps:**
1. Complete Part 1 (verify events)
2. Create Actions for all core events
3. Build 4 primary funnels
4. Set up CEO dashboard
5. Configure 3 alerts
6. Run weekly health checks

**Questions?** See `docs/ANALYTICS_DEEP_DIVE_REPORT.md` for event schema reference.
