# Screenshot Capture Guide - Revenue Reality Check
**How to Capture Evidence for Stripe + PostHog Dashboards**

---

## 🎯 PURPOSE

This guide provides step-by-step instructions to capture screenshots proving the current revenue status of TaxBridge.

**Why Screenshots?**
- Visual proof of $0 MRR, 0 customers
- Verifies Stripe is in TEST mode
- Shows PostHog is not configured
- Evidence-based decision making

**Time Required:** 15-20 minutes total

---

## 📸 PART 1: STRIPE DASHBOARD SCREENSHOTS

### Prerequisites
- Stripe account login credentials
- Access to TaxBridge Stripe account
- Browser: Chrome/Safari (for full-page screenshots)

### Screenshot #1: Stripe Overview (Production Mode)

**Step-by-Step:**

1. **Login to Stripe**
   ```
   URL: https://dashboard.stripe.com/login
   Email: [Your Stripe login email]
   ```

2. **Switch to Production Mode**
   - Top-left corner: Click mode toggle
   - Select: "Production" (NOT "Test Data")
   - Confirm banner shows: "Viewing production data"

3. **Navigate to Dashboard**
   ```
   URL: https://dashboard.stripe.com/dashboard
   ```

4. **What to Capture**
   - Top metrics bar:
     - Total customers (should be 0)
     - Gross volume (should be $0)
     - Successful charges (should be 0)
   - Date range: Last 30 days (Feb 19 - Mar 19, 2026)
   - Revenue chart (should be flat/empty)
   - Recent payments list (should be empty)

5. **Take Screenshot**
   - **Mac:** `Cmd + Shift + 3` (full screen) OR `Cmd + Shift + 4` (selection)
   - **Windows:** `Win + Shift + S`
   - **Chrome Extension:** Full Page Screen Capture

6. **Save File**
   ```
   Location: /Users/michaelguo/hivemind-projects/cross-border-tax/docs/screenshots/
   Filename: stripe-overview-2026-03-19.png
   ```

7. **Verify Screenshot Shows:**
   - ✅ "Production" mode indicator visible
   - ✅ Date range: Last 30 days
   - ✅ Total customers: 0
   - ✅ Revenue: $0
   - ✅ Timestamp visible

---

### Screenshot #2: Customers List

**Step-by-Step:**

1. **Navigate to Customers**
   ```
   URL: https://dashboard.stripe.com/customers
   ```

2. **Apply Filters**
   - Date range: All time
   - Status: All
   - Sort by: Newest first

3. **What to Capture**
   - Empty customer list OR
   - List showing 0 results OR
   - Any test customers (if present)
   - Total count at top: "0 customers" or "N customers"

4. **Take Screenshot**
   - Full page capture (include header and footer)
   - Show search/filter bar
   - Show empty state OR customer count

5. **Save File**
   ```
   Filename: stripe-customers-2026-03-19.png
   ```

6. **Verify Screenshot Shows:**
   - ✅ URL visible: `dashboard.stripe.com/customers`
   - ✅ Customer count: 0 or actual count
   - ✅ Date range visible

---

### Screenshot #3: Active Subscriptions

**Step-by-Step:**

1. **Navigate to Subscriptions**
   ```
   URL: https://dashboard.stripe.com/subscriptions
   ```

2. **Apply Filters**
   - Status: Active
   - Date range: All time

3. **What to Capture**
   - Active subscriptions count (should be 0)
   - Empty list message OR
   - Subscription list with MRR totals

4. **Take Screenshot**
   - Include MRR summary at top
   - Show subscription list (empty or populated)

5. **Save File**
   ```
   Filename: stripe-subscriptions-2026-03-19.png
   ```

6. **Verify Screenshot Shows:**
   - ✅ Active subscriptions: 0
   - ✅ MRR: $0
   - ✅ Status filter: "Active"

---

### Screenshot #4: API Keys (Production)

**Step-by-Step:**

1. **Navigate to API Keys**
   ```
   URL: https://dashboard.stripe.com/apikeys
   ```

2. **Switch to Production Mode**
   - Confirm toggle shows "Production"

3. **What to Capture**
   - Publishable key (starts with `pk_live_`)
   - Secret key placeholder (starts with `sk_live_...****`)
   - **REDACT** full secret key (show only prefix)
   - Key creation dates
   - Restricted keys section (if any)

4. **Take Screenshot**
   - Show both keys
   - REDACT full secret key (blur/hide last 20+ characters)
   - Include mode indicator

5. **Save File**
   ```
   Filename: stripe-api-keys-2026-03-19.png
   ```

6. **Security Notes**
   - ⚠️ NEVER share full secret key (`sk_live_...`)
   - ✅ OK to show: `sk_live_51Abc...****` (last 4 chars only)
   - ✅ OK to show: Full publishable key (`pk_live_...`)

7. **Verify Screenshot Shows:**
   - ✅ Production mode active
   - ✅ `pk_live_` key visible
   - ✅ `sk_live_` key REDACTED
   - ✅ Keys exist OR placeholders present

---

### Screenshot #5: Payments List (Last 30 Days)

**Step-by-Step:**

1. **Navigate to Payments**
   ```
   URL: https://dashboard.stripe.com/payments
   ```

2. **Apply Filters**
   - Date range: Last 30 days (Feb 19 - Mar 19, 2026)
   - Status: All
   - Sort by: Newest first

3. **What to Capture**
   - Total payment count (should be 0)
   - Empty state message OR
   - List of payments (if any test payments exist)
   - Total amount processed

4. **Take Screenshot**
   - Full page capture
   - Include date filter
   - Show "0 payments" message OR payment list

5. **Save File**
   ```
   Filename: stripe-payments-30d-2026-03-19.png
   ```

---

### Screenshot #6: MRR Summary

**Step-by-Step:**

1. **Navigate to MRR Report**
   ```
   URL: https://dashboard.stripe.com/reports/mrr
   OR
   Dashboard → Reports → MRR
   ```

2. **What to Capture**
   - Current MRR (should be $0)
   - MRR growth chart (should be flat)
   - New MRR vs Churned MRR

3. **Take Screenshot**
   - Include chart and summary stats
   - Date range: Last 30 days

4. **Save File**
   ```
   Filename: stripe-mrr-report-2026-03-19.png
   ```

---

## 📸 PART 2: POSTHOG DASHBOARD SCREENSHOTS

### Prerequisites
- PostHog account login credentials
- Access to TaxBridge PostHog project
- Browser: Chrome/Safari

### Screenshot #1: PostHog Funnel (30 Days)

**Step-by-Step:**

1. **Login to PostHog**
   ```
   URL: https://app.posthog.com/login
   Email: [Your PostHog login email]
   ```

2. **Navigate to Insights**
   ```
   URL: https://app.posthog.com/insights
   Click: "New Insight" → "Funnel"
   ```

3. **Configure Funnel**
   - **Date Range:** Feb 19 - Mar 19, 2026 (last 30 days)
   - **Funnel Steps:**
     1. `pageview` (path: `/`)
     2. `calculator_completed`
     3. `signup_clicked`
     4. `payment_succeeded`
   - Click "Calculate"

4. **What to Capture**
   - Full funnel visualization
   - Step-by-step conversion rates
   - Total volume at each step
   - Overall conversion percentage
   - Date range selector

5. **Take Screenshot**
   - Full page capture (include sidebar)
   - Show funnel chart
   - Show conversion numbers

6. **Save File**
   ```
   Filename: posthog-funnel-30d-2026-03-19.png
   ```

7. **Verify Screenshot Shows:**
   - ✅ Date range: Feb 19 - Mar 19, 2026
   - ✅ All 4 funnel steps
   - ✅ Conversion rates visible
   - ✅ Total users at step 1

---

### Screenshot #2: Event Volume

**Step-by-Step:**

1. **Navigate to Events**
   ```
   URL: https://app.posthog.com/events
   ```

2. **Apply Filters**
   - Date range: Last 30 days
   - Event type: All
   - Sort by: Most frequent

3. **What to Capture**
   - Total events count (last 30 days)
   - Unique users count
   - Top 10 events by volume
   - Event breakdown chart

4. **Take Screenshot**
   - Include summary stats
   - Show event list
   - Show date range

5. **Save File**
   ```
   Filename: posthog-events-30d-2026-03-19.png
   ```

---

### Screenshot #3: User Paths

**Step-by-Step:**

1. **Navigate to User Paths**
   ```
   URL: https://app.posthog.com/insights/new
   Select: "User Paths"
   ```

2. **Configure**
   - Date range: Last 30 days
   - Starting point: Any page
   - Steps: 5-7 steps

3. **What to Capture**
   - Most common user journeys
   - Drop-off points
   - Conversion paths

4. **Take Screenshot**
   - Full path visualization
   - Include stats

5. **Save File**
   ```
   Filename: posthog-paths-30d-2026-03-19.png
   ```

---

### Screenshot #4: Session Recordings (If Available)

**Step-by-Step:**

1. **Navigate to Recordings**
   ```
   URL: https://app.posthog.com/recordings
   ```

2. **Apply Filters**
   - Date range: Last 7 days
   - Duration: Any
   - Sort by: Newest first

3. **What to Capture**
   - Total recording count
   - List of recent sessions
   - Average session duration

4. **Take Screenshot**
   - Include recording count
   - Show first 10 recordings

5. **Save File**
   ```
   Filename: posthog-recordings-7d-2026-03-19.png
   ```

---

## 📸 PART 3: EXPECTED RESULTS

### If PostHog is NOT Configured (Expected)

**You will see:**
- ❌ "No events found" message
- ❌ Empty funnel (0% conversion)
- ❌ 0 unique users
- ❌ No session recordings

**What to Screenshot:**
- Capture the "No data" empty state
- Show date range: Feb 19 - Mar 19, 2026
- Save as: `posthog-no-data-2026-03-19.png`

**This confirms:** PostHog placeholder API key blocks tracking

---

### If Stripe is in TEST Mode (Expected)

**You will see:**
- ✅ API keys start with `pk_test_` and `sk_test_` OR
- ❌ API keys are placeholders (not real keys)
- 0 customers, $0 MRR, 0 payments

**What to Screenshot:**
- Show "Test Data" mode OR "Production" mode with 0 customers
- Capture empty customer/payment lists

**This confirms:** Stripe cannot accept real payments

---

## 📋 CHECKLIST

### Before You Start
- [ ] Browser open (Chrome/Safari recommended)
- [ ] Stripe login credentials ready
- [ ] PostHog login credentials ready
- [ ] Screenshot tool ready (Cmd+Shift+4 on Mac)
- [ ] Create folder: `docs/screenshots/`

### Stripe Screenshots (6 total)
- [ ] 1. Overview (production mode) - `stripe-overview-2026-03-19.png`
- [ ] 2. Customers list - `stripe-customers-2026-03-19.png`
- [ ] 3. Active subscriptions - `stripe-subscriptions-2026-03-19.png`
- [ ] 4. API keys (REDACTED) - `stripe-api-keys-2026-03-19.png`
- [ ] 5. Payments (30 days) - `stripe-payments-30d-2026-03-19.png`
- [ ] 6. MRR report - `stripe-mrr-report-2026-03-19.png`

### PostHog Screenshots (4 total)
- [ ] 1. Funnel (30 days) - `posthog-funnel-30d-2026-03-19.png`
- [ ] 2. Event volume - `posthog-events-30d-2026-03-19.png`
- [ ] 3. User paths - `posthog-paths-30d-2026-03-19.png`
- [ ] 4. Session recordings OR "No data" - `posthog-recordings-7d-2026-03-19.png`

### After Capturing
- [ ] All files saved to `docs/screenshots/`
- [ ] Filenames match exactly (for documentation links)
- [ ] No full secret keys visible (security check)
- [ ] Date ranges visible in screenshots
- [ ] Screenshots are readable (not blurry)

---

## 🔒 SECURITY NOTES

### ⚠️ NEVER Share These:
- Full Stripe secret key (`sk_live_...` or `sk_test_...`)
- Stripe webhook secret (`whsec_...`)
- Full PostHog API key (if shown in UI)
- Customer PII (emails, names, addresses)

### ✅ OK to Share:
- Stripe publishable key (`pk_live_...` or `pk_test_...`)
- Redacted secret keys (`sk_live_51Abc...****`)
- Aggregate metrics (customer count, MRR, conversion rates)
- Empty dashboard screenshots (no customer data)

---

## 📊 WHAT TO DO WITH SCREENSHOTS

### 1. Save to Correct Location
```bash
cd /Users/michaelguo/hivemind-projects/cross-border-tax
mkdir -p docs/screenshots
# Move/save all screenshots to this folder
```

### 2. Update Documentation
- Open: `docs/REVENUE_REALITY_CHECK_2026-03-19.md`
- Find sections marked "Screenshot Instructions"
- Add links to captured screenshots

### 3. Commit to Git
```bash
git add docs/screenshots/
git commit -m "[P0-CRITICAL] Revenue Reality Check - Stripe + PostHog screenshots documenting $0 MRR status"
git push origin main
```

### 4. Share with Team
- Send executive summary: `docs/REVENUE_REALITY_CHECK_EXEC_SUMMARY.md`
- Attach key screenshots (overview, funnel)
- Highlight critical blockers

---

## ⏱️ TIME ESTIMATE

**Total Time:** 15-20 minutes

- Stripe screenshots: 8-10 minutes
- PostHog screenshots: 5-7 minutes
- Save/organize files: 2-3 minutes

**Best Time:** Right after reading this guide (while fresh)

---

## 🆘 TROUBLESHOOTING

### Problem: Can't login to Stripe
**Solution:** Reset password at https://dashboard.stripe.com/forgot

### Problem: Can't find MRR report
**Solution:** Navigate to Dashboard → Reports → Growth → MRR

### Problem: PostHog shows "No data"
**Solution:** This is EXPECTED - API key is placeholder. Screenshot the empty state.

### Problem: Stripe shows test customers
**Solution:** Toggle to "Production" mode at top-left. If still showing test data, test mode is active (document this).

### Problem: Screenshots too large (>5MB)
**Solution:** Use PNG format, compress with TinyPNG.com

---

## ✅ SUCCESS CRITERIA

You've successfully captured evidence when:

1. ✅ All 10 screenshots saved to `docs/screenshots/`
2. ✅ Filenames match exactly (for doc links)
3. ✅ Date ranges visible (Feb 19 - Mar 19, 2026)
4. ✅ Stripe mode visible (Production vs Test)
5. ✅ No full secret keys exposed
6. ✅ Screenshots are clear and readable
7. ✅ Empty states captured (0 customers, 0 events)

**Next Step:** Share executive summary with screenshots attached

---

**Guide Version:** 1.0
**Date:** March 19, 2026
**Author:** Senior Engineer - Revenue Analysis Sprint
