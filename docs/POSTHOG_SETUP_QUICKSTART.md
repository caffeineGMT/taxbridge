# PostHog Funnel Tracking - 5-Minute Setup

**Status:** ⚠️ **REVENUE BLOCKER** - Funnel tracking not operational
**Fix Time:** 5 minutes (automated)
**Impact:** Enables conversion tracking, drop-off identification, and revenue optimization

---

## The Problem

PostHog funnel tracking code is **already implemented** (all 6 events), but the API key is a placeholder:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_api_key_here  # ❌ PLACEHOLDER
```

**Impact:**
- ❌ Cannot measure conversion rates
- ❌ Cannot identify where users drop off
- ❌ Cannot optimize for revenue
- ❌ Cannot track marketing ROI

---

## The Fix (5 Minutes)

### Option A: Automated Setup (Recommended)

Run the setup script - it handles everything automatically:

```bash
npx tsx scripts/setup-posthog.ts
```

**What it does:**
1. ✅ Checks current configuration
2. ✅ Prompts for PostHog API key
3. ✅ Validates key format
4. ✅ Tests API connection
5. ✅ Updates .env.local automatically
6. ✅ Provides Vercel deployment instructions
7. ✅ Shows funnel configuration guide

**You'll need:**
- PostHog account (https://posthog.com)
- Project API key from PostHog dashboard

---

### Option B: Manual Setup (30 minutes)

See: `docs/POSTHOG_FUNNEL_FIX_EXECUTIVE_SUMMARY.md`

---

## Getting Your PostHog API Key

### Step 1: Create PostHog Account (2 minutes)

1. Go to: https://posthog.com
2. Click "Get Started Free"
3. Sign up with email
4. Verify email

### Step 2: Create Project (1 minute)

1. After login, you'll see "Create Project"
2. Project name: "TaxBridge Production"
3. Click "Create Project"

### Step 3: Get API Key (30 seconds)

1. Go to: https://app.posthog.com/project/settings
2. Find "Project API Key" section
3. Copy the key (format: `phc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

That's it! Now run the setup script.

---

## After Setup

### 1. Verify Locally (2 minutes)

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000

# Open console (F12)
window.posthog  # Should return PostHog object
```

### 2. Run Verification Script (1 minute)

```bash
npx tsx scripts/verify-posthog-funnel-tracking.ts
```

**Expected output:**
```
✅ PostHog API key is REAL (not placeholder)
✅ All 6 critical funnel events implemented
✅ PostHog API is reachable
🎉 ALL CHECKS PASSED
```

### 3. Deploy to Vercel (5 minutes)

The setup script will show you exactly what to do:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `NEXT_PUBLIC_POSTHOG_KEY` with your real key
3. Redeploy production

### 4. Configure Funnels (5 minutes)

Go to PostHog dashboard and create funnel:

**Steps:**
1. `calculator_page_viewed`
2. `tax_calculation_viewed`
3. `signup_completed`
4. `checkout_started`
5. `checkout_completed`
6. `subscription_activated`

**Settings:**
- Conversion window: 30 days
- Breakdown by: `utm_source`, `deviceType`

---

## What You Get

Once configured, you can:

### 📊 Measure Conversion Rates
**Before:** ❓ "How many users convert?"
**After:** ✅ "15.2% of calculator users sign up (450/2,960 this month)"

### 🎯 Identify Drop-Offs
**Before:** ❓ "Where do users abandon?"
**After:** ✅ "68% drop off at signup → Add email capture before signup"

### 💰 Compare Channels
**Before:** ❓ "Which marketing channel works?"
**After:** ✅ "Reddit: 8.2% conversion, Google Ads: 3.1% → Double down on Reddit"

### 📈 Calculate ROI
**Before:** ❓ "What's our CAC?"
**After:** ✅ "CAC = $82, LTV = $450 → ROI = 5.5x → Profitable"

---

## Troubleshooting

### "Invalid API key format"

**Problem:** Key doesn't match `phc_` followed by 43 characters

**Fix:**
1. Go to PostHog dashboard → Project Settings
2. Copy the **Project API Key** (NOT personal API key)
3. Should start with `phc_`

### "API test failed"

**Problem:** Network error or invalid key

**Fix:**
1. Check internet connection
2. Verify key is correct (no extra spaces)
3. Try again in 30 seconds (PostHog rate limit)

### "Events not appearing in PostHog"

**Problem:** Events sent but not showing in dashboard

**Fix:**
1. Wait 60 seconds (events take time to process)
2. Check browser console → Network tab → Filter "posthog"
3. Should see POST requests to `app.posthog.com/batch`
4. If ad blocker enabled, whitelist PostHog
5. Clear browser cache + hard reload (Cmd+Shift+R)

---

## Documentation

- **Quick Start:** This file (you're reading it)
- **Executive Summary:** `docs/POSTHOG_FUNNEL_FIX_EXECUTIVE_SUMMARY.md` (30-min manual fix)
- **Comprehensive Guide:** `docs/POSTHOG_FUNNEL_CONFIGURATION.md` (790 lines, deep dive)
- **Setup Script:** `scripts/setup-posthog.ts` (automated)
- **Verification Script:** `scripts/verify-posthog-funnel-tracking.ts` (validation)

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Get PostHog API key | 3 min | Manual |
| Run setup script | 1 min | Automated |
| Verify locally | 1 min | Automated |
| **Total (Local)** | **5 min** | |
| Update Vercel | 5 min | Manual |
| Configure funnels | 5 min | Manual |
| **Total (Production)** | **15 min** | |

---

## Revenue Impact

| Without PostHog | With PostHog | Gain |
|-----------------|--------------|------|
| ❓ Unknown conversion | ✅ Measured daily | Track & optimize |
| ❓ Guessing drop-offs | ✅ Data-driven fixes | +15-30% conversion |
| ❓ All channels equal | ✅ Optimize by ROI | +20-40% efficiency |
| ❌ Can't A/B test | ✅ Validated impact | Data-backed decisions |

**Bottom Line:** 5 minutes to unblock revenue optimization.

---

## Next Steps

1. **Run setup script:** `npx tsx scripts/setup-posthog.ts`
2. **Verify it works:** `npx tsx scripts/verify-posthog-funnel-tracking.ts`
3. **Deploy to Vercel:** Follow instructions from setup script
4. **Configure funnels:** PostHog dashboard → Insights → Funnel

**Questions?** See `docs/POSTHOG_FUNNEL_FIX_EXECUTIVE_SUMMARY.md` (comprehensive guide)
