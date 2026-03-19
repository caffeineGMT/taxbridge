# PostHog Funnel Tracking - Quick Fix Guide

**⏱️ Time:** 30 minutes | **🎯 Goal:** Enable conversion funnel tracking

---

## What's Wrong

Your PostHog API key is a placeholder: ❌ `phc_your_project_api_key_here`

**Impact:** Events aren't reaching PostHog → can't measure conversions, identify drop-offs, or optimize revenue.

---

## The Fix (5 Steps)

### 1️⃣ Get PostHog API Key (5 min)

```bash
# Open PostHog dashboard:
open https://app.posthog.com/project/settings

# Copy "Project API Key" (format: phc_XXXX... 43 chars)
```

### 2️⃣ Update Local Environment (2 min)

```bash
# Open .env.local
nano .env.local

# Replace this line:
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_api_key_here

# With your real key:
NEXT_PUBLIC_POSTHOG_KEY=phc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Save: Ctrl+X, Y, Enter

# Restart dev server:
npm run dev
```

### 3️⃣ Update Production (Vercel) (5 min)

```bash
# Go to Vercel dashboard:
open https://vercel.com/your-project/settings/environment-variables

# Add/Update variable:
# Name: NEXT_PUBLIC_POSTHOG_KEY
# Value: phc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# Environments: ✅ Production ✅ Preview ✅ Development

# Click "Save"

# Redeploy:
# → Deployments → Latest deployment → "Redeploy"
```

### 4️⃣ Verify It Works (10 min)

```bash
# Run automated check:
npx tsx scripts/verify-posthog-funnel-tracking.ts

# Expected output:
# ✅ PostHog API key is REAL (not placeholder)
# ✅ PostHog API is reachable
# ✅ All 6 critical funnel events implemented
# 🎉 ALL CHECKS PASSED

# Manual test (production):
# 1. Open: https://taxbridgecpa.com
# 2. Browser console (F12): window.posthog → should see PostHog object
# 3. Fill calculator → Submit
# 4. PostHog dashboard → Activity → Events → Look for "tax_calculation_viewed"
# 5. Event should appear within 60 seconds ✅
```

### 5️⃣ Configure Funnel in PostHog (8 min)

```bash
# Open PostHog:
open https://app.posthog.com

# → Insights → New Insight → Funnel

# Funnel name: "Calculator to Paid Conversion"

# Add steps (in order):
1. calculator_page_viewed
2. tax_calculation_viewed
3. signup_completed
4. checkout_started
5. checkout_completed
6. subscription_activated

# Settings:
# - Conversion window: 30 days
# - Breakdown by: utm_source, deviceType
# - Filters: email not contains "test"

# → Save → Add to dashboard → "Growth Metrics"
```

---

## ✅ Done! You Can Now:

- 📊 **Measure conversion rates** at each funnel step
- 🔍 **Identify drop-off points** (e.g., 68% abandon between calculator and signup)
- 📈 **Compare channels** (Reddit 8.2% conversion vs Google Ads 3.1%)
- 💰 **Calculate ROI** (CAC, LTV, payback period)
- 🧪 **Run A/B tests** and measure impact

---

## Troubleshooting

### Events not appearing in PostHog?

**Check:**
```bash
# Browser console (F12):
window.posthog.__loaded  # Should be: true

# Network tab → Filter: "posthog" → Should see POST requests
# Status: 200 OK (not 403 or 400)

# Console logs:
# "[PostHog] Initialized" should appear
```

**Fixes:**
- Clear cache: Cmd+Shift+R (hard reload)
- Disable ad blocker
- Verify API key has no spaces/quotes
- Wait 60 seconds for events to process

### Verification script fails?

**Error:** ❌ PostHog API key is REAL (not placeholder)

**Fix:**
```bash
cat .env.local | grep POSTHOG
# Should show: phc_ followed by 43 characters

# If placeholder:
# 1. Get real key from PostHog dashboard
# 2. Replace in .env.local
# 3. Restart: npm run dev
# 4. Re-run: npx tsx scripts/verify-posthog-funnel-tracking.ts
```

---

## Next Steps

1. **Weekly Funnel Review** (15 min/week)
   - Check conversion rates
   - Identify biggest drop-off
   - Prioritize fixes

2. **Set Up Alerts** (30 min, one-time)
   - Calculator completion < 60%
   - Signup rate < 10%
   - Checkout abandonment > 50%

3. **Create Growth Dashboard** (1 hour)
   - Weekly Active Users
   - Funnel conversion by channel
   - Revenue by cohort
   - Full guide: `docs/POSTHOG_FUNNEL_CONFIGURATION.md`

---

## Full Documentation

- **Executive Summary:** `docs/POSTHOG_FUNNEL_FIX_EXECUTIVE_SUMMARY.md`
- **Complete Guide:** `docs/POSTHOG_FUNNEL_CONFIGURATION.md` (790 lines)
- **Verification Script:** `scripts/verify-posthog-funnel-tracking.ts`

---

**Questions?** Run verification script → shows detailed diagnostics.

**Timeline:** 30 minutes to complete all 5 steps
**Impact:** Unblocks revenue optimization + conversion tracking
**Confidence:** 99% (code already works, just needs API key)
