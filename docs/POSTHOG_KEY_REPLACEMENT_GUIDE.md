# PostHog Production Key Replacement Guide

**Status**: 🔴 CRITICAL - No Funnel Tracking
**Impact**: Cannot track conversions, A/B tests, or user behavior = flying blind
**Deadline**: 1 hour
**Evidence Required**: Screenshots of PostHog dashboard showing live events

---

## Executive Summary

**Problem**: PostHog is configured with placeholder keys. No analytics data is being collected from production.

**Revenue Impact**:
- ❌ Cannot measure conversion rates
- ❌ Cannot identify drop-off points
- ❌ Cannot validate pricing experiments
- ❌ Cannot track channel ROI
- ❌ Cannot optimize funnel = Lost revenue opportunity

**Solution**: Replace placeholder keys with production keys from PostHog dashboard

**Time Required**: 15 minutes

---

## Step-by-Step Instructions

### Phase 1: Get Production PostHog Key (5 minutes)

#### 1.1 Login to PostHog Dashboard

```bash
# Open in browser:
https://app.posthog.com
```

**Login Credentials**:
- Email: [Your PostHog account email]
- Password: [Your password]
- If you don't have an account, create one at https://posthog.com/signup

#### 1.2 Navigate to Project Settings

```
1. Click your project name (top left)
2. Click "Project Settings" (gear icon)
3. Find "Project API Key" section
```

#### 1.3 Copy Production API Key

**Format**: The key starts with `phc_` followed by 43 alphanumeric characters

**Example**: `phc_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbC`

**Copy the key** - you'll need it in the next step.

**IMPORTANT**: Make sure you're copying the **Project API Key**, not the Personal API Key.

---

### Phase 2: Update Vercel Environment Variables (5 minutes)

#### 2.1 Login to Vercel Dashboard

```bash
# Open in browser:
https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
```

#### 2.2 Update NEXT_PUBLIC_POSTHOG_KEY

**Current Value** (placeholder):
```
phc_YOUR_PROJECT_API_KEY
```

**New Value**:
```
phc_[paste the key you copied from PostHog]
```

**Steps**:
1. Find `NEXT_PUBLIC_POSTHOG_KEY` in the list
2. Click "Edit" (pencil icon)
3. Paste the new key
4. Make sure it's enabled for: **Production**, **Preview**, **Development**
5. Click "Save"

#### 2.3 Redeploy Production

**Option A: Automatic** (Recommended)
```bash
# The save will trigger automatic redeployment
# Wait 2-3 minutes for deployment to complete
```

**Option B: Manual**
```
1. Go to: https://vercel.com/caffeineGMT/taxbridge/deployments
2. Find the latest deployment
3. Click "..." → "Redeploy"
4. Wait 2-3 minutes
```

---

### Phase 3: Verify PostHog is Working (5 minutes)

#### 3.1 Run Local Verification Script

```bash
# Export the key locally for testing
export NEXT_PUBLIC_POSTHOG_KEY="phc_[your key]"

# Run verification
npm run verify:posthog
```

**Expected Output**:
```
✅ API Key Format: PostHog key format is correct
✅ PostHog Initialization: PostHog client initialized successfully
✅ Test Event Sent: Test event sent successfully
```

#### 3.2 Verify Production Site

```bash
# Wait 3 minutes after Vercel deployment completes, then run:
npm run verify:posthog:production
```

This script will:
1. Visit https://taxbridgecpa.com
2. Trigger test events
3. Verify PostHog is loaded
4. Check for network requests to PostHog API
5. Generate verification report with screenshots

#### 3.3 Check PostHog Dashboard for Live Events

**Manual Verification**:

1. **Visit production site**:
   ```
   https://taxbridgecpa.com
   ```

2. **Trigger events**:
   - Load homepage (triggers `landing_page_viewed`)
   - Navigate to calculator (triggers `calculator_page_viewed`)
   - Fill out calculator and submit (triggers `tax_calculation_viewed`)

3. **Open PostHog Dashboard**:
   ```
   https://app.posthog.com/project/YOUR_PROJECT_ID/events
   ```

4. **Verify events appear**:
   - Click "Activity" → "Live Events"
   - You should see events appearing in real-time
   - Look for: `landing_page_viewed`, `calculator_page_viewed`, `tax_calculation_viewed`

5. **Take screenshots**:
   - Screenshot 1: PostHog live events dashboard showing recent events
   - Screenshot 2: Specific event details (click on an event)
   - Save as: `docs/screenshots/posthog-live-events-YYYY-MM-DD.png`

---

## Verification Checklist

Before marking this task complete, verify ALL of these:

- [ ] PostHog API key copied from dashboard (starts with `phc_`)
- [ ] Vercel environment variable `NEXT_PUBLIC_POSTHOG_KEY` updated
- [ ] Vercel deployment completed successfully
- [ ] Local verification script passes (`npm run verify:posthog`)
- [ ] Production verification script passes (`npm run verify:posthog:production`)
- [ ] PostHog dashboard shows live events from production site
- [ ] Screenshots saved to `docs/screenshots/`
- [ ] Verification report generated: `docs/POSTHOG_VERIFICATION_[DATE].md`

---

## Troubleshooting

### Issue: "PostHog not loaded" in browser console

**Cause**: Environment variable not deployed yet

**Fix**:
```bash
# Wait 3 minutes after Vercel deployment
# Clear browser cache and hard reload (Cmd+Shift+R)
# Check browser console for errors
```

### Issue: "Invalid API key format"

**Cause**: Copied wrong key or included extra characters

**Fix**:
- Key must be exactly 47 characters
- Must start with `phc_`
- No spaces, quotes, or newlines
- Copy again from PostHog dashboard

### Issue: "Events not appearing in PostHog dashboard"

**Cause**: Key is correct but events buffered

**Fix**:
```bash
# Events can take up to 60 seconds to appear
# Refresh PostHog dashboard
# Check "Activity" → "Live Events" (not "Insights")
```

### Issue: "Network request blocked by ad blocker"

**Cause**: Browser extension blocking PostHog

**Fix**:
```bash
# Disable ad blockers
# Use incognito/private window
# Or whitelist app.posthog.com and us.i.posthog.com
```

---

## Evidence Requirements

To mark this task as COMPLETE, you MUST provide:

### 1. Screenshot: PostHog Dashboard Live Events

**What to capture**:
- PostHog dashboard showing live events
- Events from production site (taxbridgecpa.com)
- Recent events (within last 5 minutes)
- Event names visible: `landing_page_viewed`, `calculator_page_viewed`

**Save as**: `docs/screenshots/posthog-dashboard-live-events-2026-03-19.png`

### 2. Screenshot: PostHog Event Details

**What to capture**:
- Click on one event to see details
- Properties showing production domain
- Timestamp showing recent event

**Save as**: `docs/screenshots/posthog-event-details-2026-03-19.png`

### 3. Verification Report

**Generated automatically by**:
```bash
npm run verify:posthog:production
```

**Location**: `docs/POSTHOG_VERIFICATION_2026-03-19.md`

**Must show**:
- ✅ All verification steps passed
- ✅ PostHog loaded on production site
- ✅ Network requests detected to PostHog API
- ✅ Test events successfully sent

---

## Next Steps After Completion

Once PostHog is verified working:

1. **Set up conversion funnels**:
   ```bash
   npm run setup:posthog:funnels
   ```

2. **Configure A/B testing**:
   - See: `docs/POSTHOG_AB_TESTING_GUIDE.md`

3. **Monitor conversion rates**:
   - Dashboard: https://app.posthog.com/project/YOUR_PROJECT_ID/insights

4. **Optimize based on data**:
   - Identify drop-off points
   - Test pricing variations
   - Measure channel ROI

---

## Timeline

| Phase | Duration | Task |
|-------|----------|------|
| Phase 1 | 5 min | Get PostHog production key |
| Phase 2 | 5 min | Update Vercel environment variables |
| Phase 3 | 5 min | Verify and collect evidence |
| **Total** | **15 min** | **Complete task** |

---

## Resources

- PostHog Dashboard: https://app.posthog.com
- PostHog Docs: https://posthog.com/docs
- Vercel Environment Variables: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
- Local verification script: `scripts/verify-posthog.ts`
- Production verification script: `scripts/verify-posthog-production.ts` (created by this task)

---

## Success Criteria

✅ PostHog API key is production key (not placeholder)
✅ Vercel environment variable updated
✅ Production site loads PostHog successfully
✅ Events flowing to PostHog dashboard
✅ Screenshots captured showing live events
✅ Verification report generated
✅ Task marked complete with evidence

**When all criteria met**: Revenue optimization unblocked 🚀
