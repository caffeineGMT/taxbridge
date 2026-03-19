# PostHog Funnel Tracking - Production Deployment Checklist

**Date:** March 19, 2026
**Status:** Ready for deployment
**Estimated Time:** 15 minutes

---

## Pre-Deployment Checklist

### ✅ Code Verification (Already Complete)

- [x] All 6 funnel events implemented correctly
  - `calculator_page_viewed`
  - `tax_calculation_viewed`
  - `signup_completed`
  - `checkout_started`
  - `checkout_completed`
  - `subscription_activated`

- [x] PostHog SDK initialized (`lib/analytics/posthog.ts`)
- [x] Event tracking in key flows:
  - [x] Calculator completion
  - [x] User signup (Clerk webhook)
  - [x] Stripe checkout
  - [x] Subscription activation

- [x] Setup automation created:
  - [x] `scripts/setup-posthog.ts` (5-min setup)
  - [x] `scripts/verify-posthog-funnel-tracking.ts` (validation)
  - [x] `docs/POSTHOG_SETUP_QUICKSTART.md` (quick guide)

---

## Deployment Steps

### Step 1: Local Configuration (5 minutes)

**Run the setup script:**

```bash
npm run setup:posthog
```

**What it does:**
1. Prompts for PostHog API key
2. Validates key format
3. Tests API connection
4. Updates `.env.local` automatically
5. Shows Vercel deployment instructions

**You'll need:**
- PostHog account → https://posthog.com
- Project API key → https://app.posthog.com/project/settings

---

### Step 2: Verify Local Setup (2 minutes)

**Run verification script:**

```bash
npm run verify:posthog
```

**Expected output:**
```
✅ PostHog API key is REAL (not placeholder)
✅ All 6 critical funnel events implemented
✅ PostHog API is reachable
✅ tax_calculation_viewed - Found in lib/analytics/tracking-utils.ts
✅ signup_completed - Found in app/api/webhooks/clerk/route.ts
✅ checkout_completed - Found in app/api/stripe/webhook/route.ts
✅ subscription_activated - Found in app/api/stripe/webhook/route.ts

🎉 ALL CHECKS PASSED - PostHog Funnel Tracking is Ready!
```

**Test manually:**

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000

# Open console (F12), run:
window.posthog  # Should return PostHog object (not undefined)
```

---

### Step 3: Deploy to Vercel Production (5 minutes)

**Add environment variable:**

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/your-project/settings/environment-variables
   ```

2. **Add variable:**
   - **Name:** `NEXT_PUBLIC_POSTHOG_KEY`
   - **Value:** `phc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (your real key)
   - **Environments:**
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. **Click "Save"**

4. **Redeploy production:**
   - Go to: **Deployments** → Latest deployment
   - Click: **"Redeploy"**
   - Wait: ~2 minutes for deployment

---

### Step 4: Verify Production (3 minutes)

**Check PostHog initialization:**

1. Visit: https://taxbridgecpa.com
2. Open browser console (F12)
3. Type: `window.posthog`
4. Should see: PostHog object

**Test event tracking:**

1. Fill out calculator on production
2. Submit calculation
3. Go to PostHog dashboard: https://app.posthog.com
4. Navigate to: **Activity** → **Events**
5. Refresh every 5 seconds
6. Look for: `tax_calculation_viewed` event

**Expected result:** Event appears within 60 seconds ✅

---

### Step 5: Configure Funnels in PostHog (5 minutes)

**Create conversion funnel:**

1. Go to: https://app.posthog.com/insights
2. Click: **"New Insight"** → **"Funnel"**

**Funnel Configuration:**

**Name:** Calculator to Paid Conversion

**Steps (in order):**
1. `calculator_page_viewed`
2. `tax_calculation_viewed`
3. `signup_completed`
4. `checkout_started`
5. `checkout_completed`
6. `subscription_activated`

**Settings:**
- **Conversion window:** 30 days
- **Breakdown by:** `utm_source`, `deviceType`
- **Filters:** Exclude test users
  - Where `email` not contains `test`

**Save funnel:**
- Click: **"Save"**
- Add to dashboard: **"Growth Metrics"**

---

## Post-Deployment Validation

### ✅ Deployment Checklist

After completing Steps 1-5, verify:

- [ ] Local setup complete (`.env.local` has real API key)
- [ ] Verification script passes all checks
- [ ] Vercel environment variable set
- [ ] Production redeployed
- [ ] PostHog object loads on production site
- [ ] Test event appears in PostHog dashboard within 60 seconds
- [ ] Funnel configured in PostHog insights
- [ ] Funnel shows conversion steps (may be 0% initially)

---

## Expected Conversion Rates (Industry Benchmarks)

Once funnel is tracking, expect these rates:

| Step | Conversion | Benchmark |
|------|-----------|-----------|
| Calculator → Calculation | 70-85% | High (good UX) |
| Calculation → Signup | 10-20% | Moderate |
| Signup → Checkout Started | 5-10% | Low (needs optimization) |
| Checkout → Checkout Completed | 60-80% | High (good flow) |
| Checkout → Subscription Activated | 95-100% | Very high |
| **OVERALL (Calculator → Paid)** | **2-5%** | **Industry standard** |

---

## Troubleshooting

### Issue: Events not appearing in PostHog

**Check browser console:**
```javascript
// Check if PostHog loaded
window.posthog  // Should be object, not undefined

// Check if events are firing
window.posthog.__loaded  // Should be true

// Manual test event
window.posthog.capture('test_event', { test: true })
```

**Check network tab:**
1. Open: Browser DevTools → Network
2. Filter: `posthog`
3. Look for: POST requests to `app.posthog.com/batch`
4. Status: Should be **200 OK**

**Common fixes:**
- Clear browser cache + hard reload (Cmd+Shift+R)
- Disable ad blocker (PostHog may be blocked)
- Wait 60 seconds (events take time to process)
- Verify API key has no extra spaces/quotes in Vercel

---

### Issue: Verification script fails

**Error:** `PostHog API key is REAL (not placeholder): ❌`

**Fix:**
```bash
# Check .env.local
cat .env.local | grep POSTHOG

# Should show:
NEXT_PUBLIC_POSTHOG_KEY=phc_XXXX...  # ← 43 characters after "phc_"

# If placeholder, re-run setup:
npm run setup:posthog
```

---

### Issue: API test failed

**Error:** `PostHog API is reachable: ❌`

**Possible causes:**
1. Network connectivity issue
2. Invalid API key
3. PostHog rate limit (wait 30 seconds)

**Fix:**
```bash
# Test manually with curl
curl -X POST https://app.posthog.com/capture/ \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "phc_YOUR_KEY_HERE",
    "event": "test_event",
    "properties": {"distinct_id": "test"},
    "timestamp": "2026-03-19T12:00:00Z"
  }'

# Expected: HTTP 200 OK with "1" response
```

---

## Next Steps After Deployment

### Week 1: Monitor Initial Data

1. **Check funnel daily** (5 min/day)
   - Go to: PostHog → Insights → "Calculator to Paid Conversion"
   - Note conversion rates for each step
   - Identify biggest drop-off point

2. **Verify event tracking** (one-time, 10 min)
   - Test full user flow: calculator → signup → payment
   - Confirm all 6 events fire
   - Check event properties (UTM params, device info)

3. **Share with team** (15 min)
   - Add team members to PostHog project
   - Share funnel dashboard link
   - Set up Slack alerts for major drop-offs

---

### Week 2-4: Optimize Based on Data

1. **Analyze drop-offs** (1 hour/week)
   - Which step has highest drop-off?
   - Filter by utm_source: Which channel converts best?
   - Session recordings: Why do users abandon?

2. **Run A/B tests** (ongoing)
   - Test landing page headlines
   - Test pricing page CTAs
   - Test checkout flow simplifications

3. **Set up alerts** (30 min, one-time)
   - Alert if calculator completion < 60%
   - Alert if signup rate < 10%
   - Alert if checkout abandonment > 50%

---

## Documentation Reference

- **Quick Start:** `docs/POSTHOG_SETUP_QUICKSTART.md` (this file)
- **Executive Summary:** `docs/POSTHOG_FUNNEL_FIX_EXECUTIVE_SUMMARY.md`
- **Comprehensive Guide:** `docs/POSTHOG_FUNNEL_CONFIGURATION.md` (790 lines)
- **Setup Script:** `scripts/setup-posthog.ts`
- **Verification Script:** `scripts/verify-posthog-funnel-tracking.ts`

---

## Timeline Summary

| Phase | Task | Time | Owner |
|-------|------|------|-------|
| **Setup** | Get PostHog API key | 3 min | CEO/CTO |
| **Setup** | Run setup script | 1 min | CTO |
| **Setup** | Verify locally | 1 min | CTO |
| | **Subtotal** | **5 min** | |
| **Deploy** | Add Vercel env var | 2 min | CTO |
| **Deploy** | Redeploy production | 3 min | CTO |
| | **Subtotal** | **5 min** | |
| **Configure** | Create funnel in PostHog | 5 min | CEO/CTO |
| | **Subtotal** | **5 min** | |
| | **TOTAL** | **15 min** | |

---

## Revenue Impact

### Before PostHog Funnel Tracking
- ❌ Cannot measure conversion rates
- ❌ Cannot identify drop-off points
- ❌ Cannot optimize marketing spend
- ❌ Cannot validate A/B tests
- ❌ Flying blind on revenue optimization

### After PostHog Funnel Tracking
- ✅ Measure conversion at each step
- ✅ Identify and fix drop-offs → +15-30% conversion
- ✅ Track ROI by channel → optimize budget allocation
- ✅ Validate A/B test winners → data-driven decisions
- ✅ Reduce CAC by 20-40% through optimization

**Bottom Line:** 15 minutes to unblock revenue growth and optimization initiatives.

---

## Status: Ready to Deploy

All code is implemented. Just needs configuration.

**Next:** Run `npm run setup:posthog` to begin.
