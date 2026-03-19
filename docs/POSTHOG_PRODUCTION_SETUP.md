# PostHog Production Setup Guide

## 🎯 Objective
Replace PostHog test/placeholder keys with production keys to enable **LIVE conversion funnel tracking** and analytics.

## ⏱️ Time Required
**15-30 minutes** (one-time setup)

## 🔴 Current Status
**REVENUE BLOCKER** - PostHog is configured with placeholder keys:
- `NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_PROJECT_API_KEY`
- `POSTHOG_PROJECT_ID=YOUR_PROJECT_ID`

Without real keys:
- ❌ No conversion funnel tracking
- ❌ No A/B test data
- ❌ No user behavior insights
- ❌ Cannot measure Product Hunt launch impact
- ❌ Cannot optimize pricing experiments

## 📋 Prerequisites
1. PostHog account (free tier works)
2. Access to Vercel dashboard (for env vars)
3. 5 minutes to verify events flowing

---

## 🚀 Step-by-Step Activation

### Step 1: Get Production Keys from PostHog (5 min)

1. **Login to PostHog**
   - Go to: https://app.posthog.com
   - Login with your account

2. **Navigate to Project Settings**
   - Click gear icon (⚙️) in top right
   - Select "Project settings"
   - Click "Project API Key" in sidebar

3. **Copy Your Production Keys**
   You'll need these 2 values:

   ```
   Project API Key: phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Project ID: 12345
   ```

   **Where to find them:**
   - **Project API Key**: Shows immediately on "Project API Key" page
     - Format: Starts with `phc_` followed by 40 characters
     - Example: `phc_1234567890abcdefghijklmnopqrstuvwxyz`

   - **Project ID**: Shows in URL or Settings > General
     - Format: Numeric ID (e.g., `12345`)
     - Find in: URL like `https://app.posthog.com/project/12345/...`

4. **Verify Keys Format**
   ✅ Correct format:
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_1234567890abcdefghijklmnopqrstuvwxyz
   POSTHOG_PROJECT_ID=12345
   ```

   ❌ Wrong (still placeholder):
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_PROJECT_API_KEY
   POSTHOG_PROJECT_ID=YOUR_PROJECT_ID
   ```

### Step 2: Update Production Environment (3 min)

#### Option A: Via Vercel Dashboard (Recommended)

1. **Login to Vercel**
   - Go to: https://vercel.com/taxbridge/cross-border-tax
   - Navigate to Settings > Environment Variables

2. **Update PostHog Variables**

   Add/Update these variables with **Production** scope:

   | Variable Name | Value | Scope |
   |---------------|-------|-------|
   | `NEXT_PUBLIC_POSTHOG_KEY` | `phc_YOUR_ACTUAL_KEY_FROM_STEP_1` | Production |
   | `NEXT_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com` | Production |
   | `POSTHOG_PROJECT_ID` | `YOUR_ACTUAL_ID_FROM_STEP_1` | Production |

3. **Save Changes**
   - Click "Save"
   - Vercel will prompt to redeploy
   - Click "Redeploy" to activate new keys

#### Option B: Via Local .env.production (For reference)

Update `/Users/michaelguo/hivemind-projects/cross-border-tax/.env.production`:

```bash
# ═══════════════════════════════════════════════════════
# POSTHOG ANALYTICS
# ═══════════════════════════════════════════════════════
# Get keys from: https://app.posthog.com → Settings → Project API Key
NEXT_PUBLIC_POSTHOG_KEY=phc_1234567890abcdefghijklmnopqrstuvwxyz
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_PROJECT_ID=12345
```

**⚠️ IMPORTANT:**
- DO NOT commit this file with real keys
- Real keys live in Vercel dashboard only
- Local `.env.production` is for reference/documentation

### Step 3: Verify Events Flowing (10 min)

#### A. Trigger Test Events (2 min)

After deployment completes, visit your production site:

1. **Visit homepage**: https://taxbridge.vercel.app
   - ✅ Should trigger: `landing_page_viewed`

2. **Go to calculator**: https://taxbridge.vercel.app/us-canada-tax-calculator
   - ✅ Should trigger: `calculator_page_viewed`

3. **Complete a calculation**
   - Fill in: Income $100,000, RSUs $50,000, Province BC, State WA
   - Click "Calculate"
   - ✅ Should trigger: `tax_calculation_viewed`

4. **View pricing**: https://taxbridge.vercel.app/pricing
   - ✅ Should trigger: `pricing_page_viewed`

#### B. Check PostHog Dashboard (5 min)

1. **Go to PostHog Live Events**
   - https://app.posthog.com/project/YOUR_PROJECT_ID/events
   - Or: Click "Events" in sidebar

2. **Verify Events Appearing**

   You should see events in **real-time** (within 30 seconds):

   | Event Name | Properties | Status |
   |------------|-----------|--------|
   | `landing_page_viewed` | page: "/", userTier: "free" | ✅ LIVE |
   | `calculator_page_viewed` | page: "/us-canada-tax-calculator" | ✅ LIVE |
   | `tax_calculation_viewed` | usIncome, canadaIncome, ftcSavings | ✅ LIVE |
   | `pricing_page_viewed` | page: "/pricing" | ✅ LIVE |

3. **📸 Screenshot Evidence Required**

   **Take 2 screenshots for verification:**

   **Screenshot 1: PostHog Live Events Dashboard**
   - URL: https://app.posthog.com/project/YOUR_PROJECT_ID/events
   - Show: Events streaming in real-time
   - Filename: `docs/screenshots/posthog-live-events-YYYY-MM-DD.png`

   **Screenshot 2: Specific Event Details**
   - Click on one `tax_calculation_viewed` event
   - Show: Full event properties (income, province, state, etc.)
   - Filename: `docs/screenshots/posthog-event-details-YYYY-MM-DD.png`

#### C. Run Automated Verification Script (3 min)

```bash
# Run PostHog verification script
npm run verify:posthog

# Expected output:
# ✅ PostHog initialized successfully
# ✅ Sent test event: test_event_verification
# ✅ Event appeared in PostHog dashboard
# ✅ All events flowing correctly
```

### Step 4: Verify Conversion Funnel (5 min)

1. **Go to PostHog Insights**
   - https://app.posthog.com/project/YOUR_PROJECT_ID/insights
   - Click "New Insight" > "Funnel"

2. **Create Test Funnel**

   Add these steps in order:

   ```
   Step 1: landing_page_viewed
   Step 2: calculator_page_viewed
   Step 3: tax_calculation_viewed
   Step 4: pricing_page_viewed
   Step 5: checkout_started
   Step 6: subscription_activated
   ```

3. **Verify Data**
   - ✅ Should show: Real numbers for steps 1-4 (just tested)
   - ⚠️ Steps 5-6 will be zero (no test payments yet)

4. **Save Funnel**
   - Click "Save" > Name: "Main Conversion Funnel"
   - Pin to dashboard for daily monitoring

---

## 🎯 Success Criteria

### ✅ Task Complete When:

1. **Keys Replaced**
   - [ ] `NEXT_PUBLIC_POSTHOG_KEY` starts with `phc_` + 40 chars (not placeholder)
   - [ ] `POSTHOG_PROJECT_ID` is numeric (not `YOUR_PROJECT_ID`)
   - [ ] Vercel environment variables updated
   - [ ] Production site redeployed

2. **Events Flowing**
   - [ ] Visit production site, see events in PostHog within 30 seconds
   - [ ] 4+ event types visible: landing, calculator, calculation, pricing
   - [ ] Event properties populated (page, userTier, timestamp)

3. **Documentation**
   - [ ] Screenshot 1: Live events dashboard (saved to `docs/screenshots/`)
   - [ ] Screenshot 2: Event details view (saved to `docs/screenshots/`)
   - [ ] Verification report generated: `docs/POSTHOG_VERIFICATION_YYYY-MM-DD.md`

4. **Verification Script Passes**
   - [ ] Run `npm run verify:posthog`
   - [ ] All checks pass ✅
   - [ ] Zero errors in console

---

## 🔍 Troubleshooting

### Issue: "No events showing in PostHog"

**Cause:** Keys not updated correctly or deployment pending

**Fix:**
```bash
# 1. Verify Vercel deployment completed
vercel ls

# 2. Check browser console for errors
# Open: https://taxbridge.vercel.app
# Press: F12 > Console
# Look for: "[PostHog] Initialized" message

# 3. Verify environment variables deployed
vercel env ls

# 4. Force redeploy if needed
vercel --prod
```

### Issue: "PostHog init error: Invalid API key"

**Cause:** Key format wrong or copied incorrectly

**Fix:**
1. Re-copy key from PostHog dashboard
2. Ensure no extra spaces/newlines
3. Verify starts with `phc_`
4. Check length: Should be 44 characters total (`phc_` + 40 chars)

### Issue: "Events delayed by 5+ minutes"

**Cause:** PostHog ingestion lag (normal for free tier)

**Fix:**
- ✅ This is normal - free tier has slight delays
- Events should appear within 1-2 minutes
- Pro tier reduces this to real-time (<10 seconds)

### Issue: "Some events tracked, others missing"

**Cause:** Browser tracking blockers or ad blockers

**Fix:**
1. Test in incognito mode
2. Disable uBlock Origin / Privacy Badger
3. Check browser console for blocked requests
4. Verify PostHog script loading: `window.posthog`

---

## 📊 Expected Impact

### Before (Current State)
- ❌ Conversion rate: **UNKNOWN**
- ❌ Drop-off points: **UNKNOWN**
- ❌ User behavior: **BLIND**
- ❌ A/B test results: **NO DATA**
- ❌ Product Hunt ROI: **UNMEASURABLE**

### After (With PostHog Live)
- ✅ Conversion rate: **MEASURED** (landing → paid)
- ✅ Drop-off points: **IDENTIFIED** (fix highest impact issues)
- ✅ User behavior: **VISIBLE** (session recordings, heatmaps)
- ✅ A/B test results: **DATA-DRIVEN** (15-35% conversion lift)
- ✅ Product Hunt ROI: **TRACKED** (UTM attribution working)

### Revenue Impact Timeline
- **Week 1**: Baseline funnel established, identify top 3 blockers
- **Week 2**: Fix blockers → 10-20% conversion lift
- **Month 1**: A/B testing → 15-35% additional lift
- **Month 3**: $5K-$15K additional MRR from optimization

---

## 🔐 Security Notes

### ✅ Safe to Expose (Client-Side)
- `NEXT_PUBLIC_POSTHOG_KEY` - Client-side API key, safe in browser
- `NEXT_PUBLIC_POSTHOG_HOST` - Public endpoint, no security risk

### ❌ NEVER Expose
- PostHog Personal API Key (different from Project API Key)
- PostHog Team ID or Auth tokens

### Best Practices
1. **Use environment variables** - Never hardcode keys
2. **Separate test/prod** - Use different PostHog projects
3. **Review data retention** - Configure GDPR compliance
4. **Enable IP masking** - Respect user privacy

---

## 📚 Additional Resources

### PostHog Docs
- [Getting Started](https://posthog.com/docs/getting-started/install)
- [Event Tracking](https://posthog.com/docs/product-analytics/capture-events)
- [Conversion Funnels](https://posthog.com/docs/product-analytics/funnels)
- [Session Recording](https://posthog.com/docs/session-replay)

### TaxBridge Analytics
- Event tracking: `/lib/analytics/posthog.ts`
- Page tracking: `/app/providers/AnalyticsProvider.tsx`
- Conversion funnels: See `PostHogEvent` type in posthog.ts

---

## 🎉 Next Steps After Activation

1. **Set up Slack alerts** - Get notified on conversions
2. **Create dashboards** - Daily revenue, weekly signups
3. **Enable session recording** - Watch user struggles
4. **A/B test pricing** - Test $49 vs $79/year
5. **Monitor Product Hunt** - Track launch day conversions

---

## ✅ Verification Checklist

Copy this to your task completion report:

```markdown
## PostHog Production Activation - Verification

**Date**: YYYY-MM-DD
**Engineer**: [Your Name]
**Time Spent**: [X minutes]

### Keys Replaced
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` = `phc_[40_characters]` (NOT placeholder)
- [ ] `POSTHOG_PROJECT_ID` = `[numeric_id]` (NOT placeholder)
- [ ] Vercel environment variables updated
- [ ] Production deployment completed

### Events Verified
- [ ] `landing_page_viewed` ✅ LIVE
- [ ] `calculator_page_viewed` ✅ LIVE
- [ ] `tax_calculation_viewed` ✅ LIVE
- [ ] `pricing_page_viewed` ✅ LIVE

### Screenshots
- [ ] `docs/screenshots/posthog-live-events-YYYY-MM-DD.png` (events dashboard)
- [ ] `docs/screenshots/posthog-event-details-YYYY-MM-DD.png` (event properties)

### Verification
- [ ] `npm run verify:posthog` passes ✅
- [ ] Zero console errors
- [ ] Events appear <30 seconds after trigger
- [ ] Conversion funnel created in PostHog

### Documentation
- [ ] Verification report: `docs/POSTHOG_VERIFICATION_YYYY-MM-DD.md`
- [ ] Updated `.env.production` (template only, no real keys committed)
```

---

**Questions?** Check `/lib/analytics/posthog.ts` for implementation details.

**Ready to activate?** Start with Step 1: Get your PostHog keys! 🚀
