# PostHog Production Key Replacement - Quick Checklist

**Deadline**: 1 hour
**Status**: 🔴 CRITICAL
**Time Required**: 15 minutes

---

## Before You Start

**Prerequisites**:
- [ ] PostHog account credentials (https://app.posthog.com)
- [ ] Vercel dashboard access (https://vercel.com)
- [ ] 15 minutes of uninterrupted time

**If you don't have a PostHog account**:
1. Go to: https://posthog.com/signup
2. Create free account (no credit card required)
3. Create new project: "TaxBridge Production"
4. Continue with checklist below

---

## Step 1: Get PostHog Production Key ⏱️ 5 minutes

**Action Items**:
- [ ] Open browser: https://app.posthog.com
- [ ] Login with your credentials
- [ ] Navigate to: Project Settings (gear icon)
- [ ] Find section: "Project API Key"
- [ ] Copy the key (starts with `phc_`, 47 characters total)
- [ ] Verify format: `phc_` + 43 alphanumeric characters

**Example Key Format**:
```
phc_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbC
     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     43 characters
```

**⚠️ Common Mistakes**:
- ❌ Copied "Personal API Key" instead of "Project API Key"
- ❌ Included extra spaces or newlines
- ❌ Copied key from test project instead of production project

**✅ You're done when**:
- Key is in your clipboard
- Key starts with `phc_`
- Key is exactly 47 characters long

---

## Step 2: Update Vercel Environment Variable ⏱️ 5 minutes

**Action Items**:
- [ ] Open browser: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
- [ ] Find variable: `NEXT_PUBLIC_POSTHOG_KEY`
- [ ] Click: Edit (pencil icon)
- [ ] Paste your PostHog key from Step 1
- [ ] Verify enabled for: **Production**, **Preview**, **Development** (all 3 checked)
- [ ] Click: Save
- [ ] Wait for confirmation: "Environment variable updated"

**Current Value (WRONG)**:
```
phc_YOUR_PROJECT_API_KEY
```

**New Value (RIGHT)**:
```
phc_[paste your real key here]
```

**⚠️ Common Mistakes**:
- ❌ Only enabled for Development (must enable for Production too)
- ❌ Typo when pasting (use Ctrl/Cmd+V, don't type it out)
- ❌ Didn't save (must click Save button)

**✅ You're done when**:
- Vercel shows: "Environment variable updated"
- Auto-deployment triggered (you'll see notification)
- Wait 3 minutes for deployment to complete

---

## Step 3: Verify It Works ⏱️ 5 minutes

### 3A: Automated Verification

**Action Items**:
- [ ] Wait 3 minutes after Vercel deployment completes
- [ ] Open terminal in project directory
- [ ] Run command: `npm run verify:posthog:production`
- [ ] Wait for script to complete (~30 seconds)
- [ ] Check output shows: ✅ All checks passed

**Expected Output**:
```
✅ Site Accessibility: Production site is accessible
✅ API Key Verification: Valid PostHog API key detected
✅ PostHog Loaded: PostHog is loaded and initialized
✅ Network Requests: Detected 3 PostHog API request(s)
✅ Event Tracking: Calculator page navigation tracked

📸 Screenshots saved to: docs/screenshots/posthog-verification-YYYY-MM-DD/
📄 Verification report: docs/POSTHOG_PRODUCTION_VERIFICATION_YYYY-MM-DD.md
```

**If any check fails**:
- [ ] See troubleshooting section below
- [ ] Check: `docs/POSTHOG_KEY_REPLACEMENT_GUIDE.md`
- [ ] Re-run after fixing: `npm run verify:posthog:production`

---

### 3B: Manual Dashboard Verification

**Action Items**:
- [ ] Open browser: https://app.posthog.com/project/YOUR_PROJECT_ID/events
- [ ] Click: Activity → Live Events
- [ ] Open new tab: https://taxbridgecpa.com
- [ ] On production site: Click around (homepage → calculator → submit)
- [ ] Switch back to PostHog dashboard
- [ ] Verify: Events appearing in real-time (within 10 seconds)

**Events to look for**:
- [ ] `landing_page_viewed` (when you load homepage)
- [ ] `calculator_page_viewed` (when you go to calculator)
- [ ] `tax_calculation_viewed` (when you submit calculator)

**⚠️ Common Issues**:
- ❌ Events not appearing → Wait 60 seconds, then refresh dashboard
- ❌ "PostHog not loaded" → Clear browser cache, hard reload (Cmd+Shift+R)
- ❌ Ad blocker blocking PostHog → Test in incognito window

---

### 3C: Collect Evidence (Required)

**Action Items**:
- [ ] **Screenshot 1**: PostHog dashboard showing live events
  - What to capture: List of events from production site
  - Where events should be from: taxbridgecpa.com domain
  - Save as: `docs/screenshots/posthog-dashboard-live-events-2026-03-19.png`

- [ ] **Screenshot 2**: PostHog event details
  - What to capture: Click on one event → show details
  - Details should show: Production domain, timestamp, properties
  - Save as: `docs/screenshots/posthog-event-details-2026-03-19.png`

- [ ] **Verification Report** (auto-generated)
  - Location: `docs/POSTHOG_PRODUCTION_VERIFICATION_2026-03-19.md`
  - Status: Must show all checks ✅ PASSED
  - Created by: `npm run verify:posthog:production`

**✅ You're done when**:
- 2 screenshots saved to docs/screenshots/
- Verification report shows all checks passed
- PostHog dashboard shows events from production site

---

## Step 4: Commit and Deploy ⏱️ 2 minutes

**Action Items**:
- [ ] Stage all changes: `git add -A`
- [ ] Commit with evidence:
  ```bash
  git commit -m "[P0-CRITICAL] PostHog Production Key Replaced - Funnel Tracking LIVE ✅

  Evidence:
  - PostHog dashboard screenshots showing live events from production
  - Automated verification report (all checks passed)
  - Production site confirmed tracking user behavior

  What was fixed:
  1. Replaced placeholder PostHog key with production key
  2. Updated Vercel environment variable
  3. Verified tracking working on taxbridgecpa.com
  4. Events flowing to PostHog dashboard

  Revenue impact:
  - ✅ Conversion funnel tracking enabled
  - ✅ A/B testing unblocked
  - ✅ Channel ROI measurement ready
  - ✅ Data-driven optimization possible

  Screenshots:
  - docs/screenshots/posthog-dashboard-live-events-2026-03-19.png
  - docs/screenshots/posthog-event-details-2026-03-19.png

  Verification:
  - docs/POSTHOG_PRODUCTION_VERIFICATION_2026-03-19.md

  Time to complete: 15 minutes
  Next: Set up conversion funnels in PostHog dashboard"
  ```
- [ ] Push to GitHub: `git push origin main`
- [ ] Wait 3 minutes for Vercel deployment
- [ ] Mark task as COMPLETE in project tracker

---

## Troubleshooting

### Issue: "Failed to launch browser"

**Symptoms**: Script fails with Playwright error

**Fix**:
```bash
# Install Playwright browsers
npx playwright install chromium

# Re-run verification
npm run verify:posthog:production
```

---

### Issue: "PostHog not loaded on production site"

**Symptoms**: Verification shows "PostHog not loaded"

**Possible Causes & Fixes**:

1. **Deployment hasn't completed**
   - Check: https://vercel.com/caffeineGMT/taxbridge/deployments
   - Wait: 3 minutes for deployment to finish
   - Re-run: `npm run verify:posthog:production`

2. **Environment variable not set correctly**
   - Check: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
   - Verify: `NEXT_PUBLIC_POSTHOG_KEY` is set
   - Verify: Production environment is checked
   - Fix: Update and trigger manual redeploy

3. **Browser cache issue**
   - Clear: Browser cache
   - Test: In incognito window
   - Hard reload: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

### Issue: "PostHog API key is a placeholder"

**Symptoms**: Verification says key is placeholder

**Fix**:
1. Verify you copied the right key from PostHog dashboard
2. Key must start with `phc_`
3. Key must be exactly 47 characters
4. Go back to Step 1 and copy again (carefully)

---

### Issue: "No PostHog network requests detected"

**Symptoms**: No requests to posthog.com

**Possible Causes**:
- Ad blocker blocking PostHog
- Network firewall blocking requests
- Key is still a placeholder

**Fix**:
```bash
# Test in incognito window (disables extensions)
# Or whitelist in ad blocker: app.posthog.com, us.i.posthog.com

# Check browser console for errors:
# 1. Open production site
# 2. Open DevTools (F12)
# 3. Go to Console tab
# 4. Look for PostHog errors
```

---

### Issue: "Events not appearing in PostHog dashboard"

**Symptoms**: Verification passes but dashboard is empty

**Fix**:
1. Events can take up to 60 seconds to appear
2. Refresh PostHog dashboard
3. Make sure you're looking at "Live Events" not "Insights"
4. Verify you're in the right project
5. Trigger more events: Navigate around production site

---

## Resources

**Guides**:
- Comprehensive guide: `docs/POSTHOG_KEY_REPLACEMENT_GUIDE.md`
- Executive summary: `docs/POSTHOG_CEO_SUMMARY.md`
- This checklist: `docs/POSTHOG_QUICK_CHECKLIST.md`

**Scripts**:
- Production verification: `npm run verify:posthog:production`
- Local verification: `npm run verify:posthog`
- Setup wizard: `npm run setup:posthog`

**External Links**:
- PostHog Dashboard: https://app.posthog.com
- PostHog Docs: https://posthog.com/docs
- Vercel Environment Variables: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables

---

## Success Criteria

Mark this task COMPLETE when ALL of these are true:

- [x] PostHog production API key obtained from dashboard
- [x] Vercel environment variable `NEXT_PUBLIC_POSTHOG_KEY` updated
- [x] Vercel deployment completed successfully
- [x] Automated verification script passes (all ✅)
- [x] PostHog dashboard shows live events from production
- [x] 2 screenshots saved as evidence
- [x] Verification report generated
- [x] Changes committed with evidence
- [x] Changes pushed to GitHub

**When complete**:
- ✅ Revenue optimization unblocked
- ✅ Conversion funnel tracking enabled
- ✅ A/B testing ready
- ✅ Channel ROI measurable
- ✅ Data-driven growth possible

---

**Created**: 2026-03-19
**Deadline**: 1 hour from task assignment
**Estimated Time**: 15 minutes
**Priority**: P0-CRITICAL (Revenue Blocker)
