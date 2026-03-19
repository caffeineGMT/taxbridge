# Revenue Metrics - Manual Dashboard Guide

**Task:** Pull ACTUAL revenue numbers from Stripe and PostHog dashboards

**Evidence Required:** Dashboard screenshots showing:
1. Stripe: Total customers, active subscriptions, MRR, total revenue
2. PostHog: Calculator completions, signups, conversion rates (last 30 days)

---

## 🎯 Quick Answer (If You Just Want The Numbers)

### Option 1: Automated Script (Fastest - 2 minutes)

```bash
# Set your API keys first
export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY
export NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_ACTUAL_KEY
export POSTHOG_PROJECT_ID=YOUR_PROJECT_ID

# Run the script
npm run revenue:metrics

# Output saved to: docs/revenue-metrics/YYYY-MM-DD-HH-MM-SS/
```

### Option 2: Manual Dashboard Screenshots (5-10 minutes)

Follow the step-by-step guide below to capture screenshots from Stripe and PostHog dashboards.

---

## 📊 Part 1: Stripe Revenue Metrics (5 minutes)

### Step 1: Login to Stripe Dashboard

1. Go to: https://dashboard.stripe.com
2. **CRITICAL:** Verify you're in **LIVE MODE** (not test mode)
   - Look at top-left toggle
   - Should show "Viewing live data"
   - If it says "Viewing test data" → toggle to live

### Step 2: Total Customers (Lifetime)

1. Click **"Customers"** in left sidebar
2. Look at top of page for **total count**
3. **Screenshot:** Full page showing customer count
4. Save as: `docs/screenshots/stripe-total-customers-YYYY-MM-DD.png`

**What you're looking for:**
```
┌─────────────────────────────────────┐
│ Customers                           │
│ ─────────────────────────────────── │
│ 42 customers                    ← THIS NUMBER
│                                     │
│ [Customer list...]                  │
└─────────────────────────────────────┘
```

### Step 3: Active Subscriptions

1. Click **"Subscriptions"** in left sidebar
2. Filter by **"Active"** status
3. Count shown at top
4. **Screenshot:** Full page showing subscription count
5. Save as: `docs/screenshots/stripe-active-subscriptions-YYYY-MM-DD.png`

**What you're looking for:**
```
┌─────────────────────────────────────┐
│ Subscriptions                       │
│ ─────────────────────────────────── │
│ Status: Active                      │
│ 15 subscriptions                ← THIS NUMBER
│                                     │
│ [Subscription list...]              │
└─────────────────────────────────────┘
```

### Step 4: MRR (Monthly Recurring Revenue)

1. Click **"Home"** in left sidebar
2. Look for **"MRR"** widget or **"Revenue"** section
3. Note the MRR value (monthly recurring)
4. **Screenshot:** Home dashboard showing MRR
5. Save as: `docs/screenshots/stripe-mrr-YYYY-MM-DD.png`

**What you're looking for:**
```
┌─────────────────────────────────────┐
│ Revenue Overview                    │
│ ─────────────────────────────────── │
│ MRR: $1,185.00                  ← THIS NUMBER
│ Churn: 2.5%                         │
│                                     │
│ [Graph...]                          │
└─────────────────────────────────────┘
```

**Alternative (if MRR widget not showing):**
1. Go to **"Billing" → "Subscriptions"**
2. Click **"Analytics"**
3. Look for MRR chart
4. Screenshot showing current MRR

### Step 5: Total Revenue (Lifetime)

1. Click **"Payments"** in left sidebar
2. Look at **"Total volume"** at top
3. This is lifetime revenue across all successful payments
4. **Screenshot:** Payments page showing total volume
5. Save as: `docs/screenshots/stripe-total-revenue-YYYY-MM-DD.png`

**What you're looking for:**
```
┌─────────────────────────────────────┐
│ Payments                            │
│ ─────────────────────────────────── │
│ Total volume: $14,230.00        ← THIS NUMBER
│ Success rate: 98%                   │
│                                     │
│ [Payment list...]                   │
└─────────────────────────────────────┘
```

**Alternative (more accurate):**
1. Go to **"Reports"** in sidebar
2. Click **"Overview"** or **"Balance"**
3. Look for **"Gross volume"** or **"Total processed"**
4. Set date range to **"All time"**
5. Screenshot showing lifetime revenue

---

## 📈 Part 2: PostHog Funnel Metrics (5 minutes)

### Step 1: Login to PostHog

1. Go to: https://app.posthog.com
2. Select your project (likely "TaxBridge" or similar)

### Step 2: Calculator Completions (Last 30 Days)

1. Click **"Insights"** in left sidebar
2. Click **"New insight"**
3. Select **"Trends"**
4. Configure:
   - Event: `calculator_completed` or `tax_calculation_completed`
   - Date range: **Last 30 days**
   - Aggregation: **Total count**
5. **Screenshot:** Graph showing total calculator completions
6. Save as: `docs/screenshots/posthog-calculator-completions-YYYY-MM-DD.png`

**What you're looking for:**
```
┌─────────────────────────────────────┐
│ calculator_completed                │
│ ─────────────────────────────────── │
│ Last 30 days                        │
│                                     │
│ Total: 1,247                    ← THIS NUMBER
│                                     │
│ [Graph showing daily trend...]      │
└─────────────────────────────────────┘
```

### Step 3: Signups (Last 30 Days)

1. In same **"Insights"** page, create new trend
2. Configure:
   - Event: `signup_completed` or `user_signed_up`
   - Date range: **Last 30 days**
   - Aggregation: **Unique users**
3. **Screenshot:** Graph showing total signups
4. Save as: `docs/screenshots/posthog-signups-YYYY-MM-DD.png`

**What you're looking for:**
```
┌─────────────────────────────────────┐
│ signup_completed                    │
│ ─────────────────────────────────── │
│ Last 30 days                        │
│                                     │
│ Unique users: 187               ← THIS NUMBER
│                                     │
│ [Graph showing daily trend...]      │
└─────────────────────────────────────┘
```

### Step 4: Conversion Funnel (Calculator → Signup → Payment)

1. Click **"Insights"** → **"New insight"**
2. Select **"Funnel"**
3. Add steps:
   - Step 1: `calculator_completed`
   - Step 2: `signup_completed`
   - Step 3: `payment_completed` or `subscription_created`
4. Date range: **Last 30 days**
5. Click **"Calculate"**
6. **Screenshot:** Funnel showing conversion rates at each step
7. Save as: `docs/screenshots/posthog-conversion-funnel-YYYY-MM-DD.png`

**What you're looking for:**
```
┌─────────────────────────────────────────────┐
│ Conversion Funnel                           │
│ ───────────────────────────────────────────│
│ Last 30 days                                │
│                                             │
│ 1. calculator_completed      1,247 (100%)   │
│    ↓ 85.0% converted                        │ ← CONVERSION RATE
│                                             │
│ 2. signup_completed           187 (15.0%)   │
│    ↓ 21.4% converted                        │ ← CONVERSION RATE
│                                             │
│ 3. payment_completed           40 (3.2%)    │
│                                             │
│ Overall conversion: 3.2%                ← THIS NUMBER
└─────────────────────────────────────────────┘
```

**Key numbers to record:**
- Calculator completions: _______
- Signups: _______
- Payments: _______
- Calculator → Signup conversion: _______%
- Signup → Payment conversion: _______%
- Calculator → Payment conversion: _______%

### Alternative: Use Pre-built Dashboard

If you've already created a dashboard:
1. Go to **"Dashboards"** in sidebar
2. Look for **"Revenue Funnel"** or **"Conversion Metrics"** dashboard
3. Screenshot the entire dashboard
4. Should show all funnel metrics in one view

---

## 📋 Part 3: Compile Evidence Report (2 minutes)

Once you have all screenshots, create a summary document:

**File:** `docs/REVENUE_METRICS_EVIDENCE_YYYY-MM-DD.md`

```markdown
# Revenue Metrics Evidence

**Date:** YYYY-MM-DD
**Reporter:** [Your name]

## Stripe Metrics (LIVE MODE)

- **Total Customers (Lifetime):** ______
- **Active Subscriptions:** ______
- **MRR:** $______
- **ARR:** $______ (MRR × 12)
- **Total Revenue (Lifetime):** $______

**Evidence:**
- ![Stripe Customers](../screenshots/stripe-total-customers-YYYY-MM-DD.png)
- ![Stripe Subscriptions](../screenshots/stripe-active-subscriptions-YYYY-MM-DD.png)
- ![Stripe MRR](../screenshots/stripe-mrr-YYYY-MM-DD.png)
- ![Stripe Revenue](../screenshots/stripe-total-revenue-YYYY-MM-DD.png)

## PostHog Metrics (Last 30 Days)

- **Calculator Completions:** ______
- **Signups:** ______
- **Payments:** ______

**Conversion Rates:**
- **Calculator → Signup:** ______%
- **Signup → Payment:** ______%
- **Calculator → Payment:** ______%

**Evidence:**
- ![Calculator Completions](../screenshots/posthog-calculator-completions-YYYY-MM-DD.png)
- ![Signups](../screenshots/posthog-signups-YYYY-MM-DD.png)
- ![Conversion Funnel](../screenshots/posthog-conversion-funnel-YYYY-MM-DD.png)

## Critical Findings

1. **Revenue Status:** [LIVE / TEST MODE / BLOCKED]
2. **Customer Count:** [High / Medium / Low / Zero]
3. **Conversion Rate:** [Above / Below target of 3-5%]

## Next Actions

- [ ] Fix any critical blockers identified
- [ ] Set baseline metrics for tracking
- [ ] Identify biggest drop-off points
- [ ] Plan conversion optimization experiments
```

---

## ⚡ Quick Checklist

Use this checklist when pulling metrics:

### Stripe Dashboard
- [ ] Confirmed in **LIVE MODE** (not test)
- [ ] Captured total customers screenshot
- [ ] Captured active subscriptions screenshot
- [ ] Captured MRR screenshot
- [ ] Captured total revenue screenshot
- [ ] Saved all screenshots to `docs/screenshots/`

### PostHog Dashboard
- [ ] Set date range to **last 30 days**
- [ ] Captured calculator completions screenshot
- [ ] Captured signups screenshot
- [ ] Captured conversion funnel screenshot
- [ ] Recorded all conversion rates
- [ ] Saved all screenshots to `docs/screenshots/`

### Evidence Report
- [ ] Created `REVENUE_METRICS_EVIDENCE_YYYY-MM-DD.md`
- [ ] Filled in all numbers from screenshots
- [ ] Linked all screenshot files
- [ ] Identified critical findings
- [ ] Listed next actions

---

## 🚨 Troubleshooting

### Stripe Issues

**"I only see test mode data"**
- Toggle at top-left to switch to live mode
- If no live mode available → Stripe account not activated yet
- Follow: `docs/STRIPE_PRODUCTION_SETUP.md`

**"Zero customers showing"**
- Verify in correct Stripe account
- Check if payments going to different account
- Test payment flow to verify it's working

**"Can't find MRR metric"**
- Go to Home → look for Revenue widget
- Alternative: Billing → Subscriptions → Analytics
- Manual calc: Sum all active subscription amounts

### PostHog Issues

**"Events not showing"**
- Verify correct project selected
- Check if PostHog is properly configured
- Look for JavaScript errors in browser console
- Try different event names (check implementation)

**"Conversion rate showing 0%"**
- Events might be named differently in code
- Check event names in: Live events or Data Management
- Adjust funnel step names to match actual events

**"Can't create funnels"**
- Verify you have PostHog paid plan (funnels not in free tier)
- Alternative: Use Trends to get individual counts
- Manual calc: (Signups / Calculator completions) × 100

---

## 🎯 Expected Results

### Healthy Metrics (Targets)
- **Conversion Rates:**
  - Calculator → Signup: >15%
  - Signup → Payment: >30%
  - Overall: >5%
- **Revenue:**
  - MRR: >$1,000
  - ARR: >$12,000
  - Customers: >20

### Red Flags
- Zero customers = Payment flow broken
- Zero events = Analytics not configured
- Test mode = Revenue blocked
- <1% conversion = Critical UX issues

---

**Time Required:** 10-15 minutes total
**Evidence Output:** 7 screenshots + 1 markdown report
**Next Step:** Use metrics to identify biggest conversion blockers
