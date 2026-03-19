# PostHog Setup Quickstart Guide
## 15-Minute Setup to Enable Funnel Tracking

**Goal:** Configure PostHog API keys to enable conversion funnel tracking and analytics.

**Time:** 15-30 minutes
**Owner:** CTO
**Impact:** Enables ALL analytics, A/B testing, and conversion measurement

---

## Step 1: Get PostHog API Keys (5 minutes)

### 1.1 Login to PostHog

```bash
# Open PostHog in browser
open https://app.posthog.com
```

- Sign in with your account
- If you don't have an account, click "Sign Up" (free tier available)

### 1.2 Get Your API Key

1. Click the **Settings** icon (⚙️) in the bottom left
2. Click **Project** in the left sidebar
3. Scroll to **Project API Key** section
4. Copy your API key (starts with `phc_`)

**Example:**
```
phc_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

### 1.3 Get Your Project ID

1. Look at your browser URL bar
2. URL format: `https://app.posthog.com/project/12345/insights`
3. The number after `/project/` is your Project ID

**Example:**
```
URL: https://app.posthog.com/project/54321/insights
Project ID: 54321
```

---

## Step 2: Update Environment Variables (5 minutes)

### 2.1 Update .env.production

Open `.env.production` and replace placeholders:

```bash
# BEFORE (placeholders)
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_PROJECT_API_KEY
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_PROJECT_ID=YOUR_PROJECT_ID

# AFTER (your actual keys)
NEXT_PUBLIC_POSTHOG_KEY=phc_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_PROJECT_ID=54321
```

### 2.2 Update Vercel Environment Variables

1. Go to Vercel dashboard
2. Navigate to: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
3. Update these 3 variables with "Production" scope:

| Variable Name | Value | Scope |
|---------------|-------|-------|
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_[your_key]` | Production |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com` | Production |
| `POSTHOG_PROJECT_ID` | `[your_id]` | Production |

4. Click **Save** for each variable

---

## Step 3: Deploy to Production (2 minutes)

### 3.1 Commit Changes

```bash
# Add environment file (if not already tracked)
git add .env.production

# Commit
git commit -m "[P1-HIGH] Configure PostHog Production API - Enable Funnel Tracking

WHAT: Configure PostHog API keys in production environment
WHY: Enable conversion funnel tracking, A/B testing, and analytics
IMPACT: Unblocks $2K-6K/month optimization potential

Changes:
- Update NEXT_PUBLIC_POSTHOG_KEY with real key
- Update POSTHOG_PROJECT_ID with project ID
- Vercel environment variables updated

Testing:
- Run: npm run verify:posthog
- Check PostHog dashboard for live events within 30 seconds

Evidence:
- PostHog dashboard shows live events: ✅
- Screenshot: docs/screenshots/posthog-live-2026-03-19.png
"
```

### 3.2 Push to GitHub

```bash
# Push to trigger auto-deployment
git push origin main

# Vercel will automatically deploy within 2-5 minutes
```

---

## Step 4: Verify Tracking (5-10 minutes)

### 4.1 Run Verification Script

```bash
# Verify PostHog configuration
npm run verify:posthog

# Expected output:
# ✅ PostHog API Key configured
# ✅ Project ID configured
# ✅ Connection to PostHog API successful
# ✅ Test event sent successfully
```

### 4.2 Check PostHog Dashboard

1. Open PostHog dashboard: https://app.posthog.com
2. Go to **Events** in left sidebar
3. You should see events flowing in within 30 seconds:
   - `landing_page_viewed`
   - `roi_calculator_viewed`
   - `tax_calculation_viewed`
   - `signup_completed`
   - `checkout_started`

### 4.3 Test Event Tracking Manually

```bash
# Send test events to PostHog
npm run test:posthog

# Expected output:
# ✅ Sent test event: landing_page_viewed
# ✅ Sent test event: roi_calculator_viewed
# ✅ Sent test event: tax_calculation_viewed
# ✅ Sent test event: signup_completed
# ✅ Sent test event: checkout_started
```

**Verify in PostHog:**
- Go to Events
- Filter by "Last 5 minutes"
- You should see all 5 test events

### 4.4 Capture Screenshot

```bash
# Take screenshot of PostHog dashboard showing live events
# Save to: docs/screenshots/posthog-live-2026-03-19.png

# On Mac:
# 1. Cmd+Shift+4
# 2. Capture PostHog dashboard
# 3. Save to docs/screenshots/
```

---

## Step 5: Pull Funnel Data (After 24-48 Hours)

### Wait for Data Collection

- **Minimum:** 24-48 hours
- **Better:** 7 days (more statistically significant)
- **Ideal:** 30 days (full baseline)

### Run Funnel Analysis

```bash
# After 7-30 days of data collection
npx tsx scripts/pull-conversion-baseline.ts

# Expected output:
# 1️⃣  LANDING PAGE → CALCULATOR START RATE
#    Landing Page Views: 1,247
#    Calculator Starts:  812
#    Conversion Rate:    65.12%
#
# 2️⃣  CALCULATOR COMPLETION RATE
#    Calculator Starts:      812
#    Calculator Completions: 573
#    Completion Rate:        70.57%
#
# 3️⃣  SIGNUP CONVERSION RATE
#    Calculator Completions: 573
#    Signups Completed:      172
#    Signup Rate:            30.02%
#
# 4️⃣  PAYMENT CONVERSION RATE
#    Signups Completed:      172
#    Payments Completed:     43
#    Payment Rate:           25.00%
#
# 📊 OVERALL FUNNEL PERFORMANCE
#    Total Landing Views:    1,247
#    Total Paid Customers:   43
#    Overall Conversion:     3.45%
```

---

## Troubleshooting

### Issue 1: PostHog Events Not Showing Up

**Symptom:** Dashboard shows zero events after 5-10 minutes

**Fix:**
1. Check browser console for errors:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for PostHog errors
2. Verify API key is correct:
   - Run: `echo $NEXT_PUBLIC_POSTHOG_KEY`
   - Should start with `phc_`
3. Check network requests:
   - DevTools → Network tab
   - Filter: "posthog"
   - Should see POST requests to `https://app.posthog.com/e/`
4. Restart dev server:
   ```bash
   # Stop dev server (Ctrl+C)
   npm run dev
   ```

### Issue 2: API Key Invalid

**Symptom:** Error: "Invalid API key"

**Fix:**
1. Go back to PostHog dashboard
2. Settings → Project → Project API Key
3. Copy the FULL key (including `phc_` prefix)
4. Update .env.production
5. Redeploy to Vercel

### Issue 3: Events Sent But Not Visible

**Symptom:** Network tab shows POST requests but dashboard shows zero events

**Fix:**
1. Wait 5-10 minutes (PostHog has processing delay)
2. Check "All Events" filter (not just specific events)
3. Verify Project ID matches:
   - Run: `echo $POSTHOG_PROJECT_ID`
   - Should match URL: `https://app.posthog.com/project/[YOUR_ID]`

### Issue 4: Duplicate Events

**Symptom:** Same event tracked multiple times

**Fix:**
1. Check for duplicate `posthog.capture()` calls in code
2. Verify PostHog is initialized only once (in `app/layout.tsx`)
3. Check for dev mode hot-reloading (normal in dev, not in production)

---

## Success Criteria

After completing this guide, you should have:

- [ ] ✅ PostHog API key configured in .env.production
- [ ] ✅ Vercel environment variables updated
- [ ] ✅ Deployment pushed to production
- [ ] ✅ Verification script passes (`npm run verify:posthog`)
- [ ] ✅ PostHog dashboard shows live events within 30 seconds
- [ ] ✅ Screenshot saved to `docs/screenshots/posthog-live-2026-03-19.png`
- [ ] ✅ All 5 funnel events tracked:
  - `landing_page_viewed`
  - `roi_calculator_viewed`
  - `tax_calculation_viewed`
  - `signup_completed`
  - `checkout_started`

**Time Spent:** 15-30 minutes
**Impact:** $2K-6K/month optimization potential UNLOCKED ✅

---

## Next Steps

### Immediately After Setup
- [ ] Monitor PostHog dashboard daily
- [ ] Verify all events are tracking correctly
- [ ] Check conversion rates in real-time

### After 7 Days
- [ ] Run: `npx tsx scripts/pull-conversion-baseline.ts`
- [ ] Review initial funnel metrics
- [ ] Identify actual drop-off points (not estimates)

### After 30 Days
- [ ] Re-run: `npx tsx scripts/pull-conversion-baseline.ts`
- [ ] Compare to estimates from session recordings
- [ ] Re-prioritize optimization work based on real data
- [ ] Run A/B tests on biggest drop-offs

---

## Additional Resources

- **PostHog Documentation:** https://posthog.com/docs
- **Funnel Analysis Guide:** https://posthog.com/docs/user-guides/funnels
- **Event Tracking Best Practices:** https://posthog.com/docs/integrate/client/js

**Internal Docs:**
- Comprehensive Report: `docs/CONVERSION_FUNNEL_ANALYSIS_COMPLETE_2026-03-19.md`
- Executive Summary: `docs/CONVERSION_FUNNEL_EXECUTIVE_SUMMARY_2026-03-19.md`
- PostHog Setup Guide (this doc): `docs/POSTHOG_QUICKSTART_GUIDE.md`

---

**Created:** March 19, 2026
**Last Updated:** March 19, 2026
**Owner:** CTO
**Status:** Ready to execute
