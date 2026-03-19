# 🚨 EMERGENCY DEPLOYMENT FIX - Wrong Application Live

**Date:** 2026-03-19
**Severity:** P0-CRITICAL
**Impact:** $0 revenue - production site completely non-functional

## Executive Summary

The production site at `https://taxbridge.vercel.app` is serving **THE WRONG APPLICATION**:

- **Currently Deployed:** Nigerian tax compliance admin dashboard ("Nigeria's first offline-first, NRS-compliant e-invoicing platform for SMEs")
- **Should Be Deployed:** US-Canada cross-border tax calculator for H-1B/TN workers

**This is NOT a code issue or configuration bug. The Vercel project is connected to the wrong GitHub repository.**

## Evidence

### 1. Current Production Site (WRONG APP)
```bash
curl -s https://taxbridge.vercel.app/us-canada-tax-calculator | grep -o "<title>.*</title>"
# Output: <title>TaxBridge Admin Dashboard</title>

curl -s https://taxbridge.vercel.app/us-canada-tax-calculator | grep "Nigeria"
# Output: "Nigeria's first offline-first, NRS-compliant e-invoicing platform for SMEs"
```

The deployed site shows:
- **Title:** "TaxBridge Admin Dashboard"
- **Description:** "Nigeria's first offline-first, NRS-compliant e-invoicing platform"
- **404 Page:** Returns 404 for `/us-canada-tax-calculator` (our main calculator route)
- **Wrong Market:** Nigeria vs US-Canada
- **Wrong Product:** E-invoicing admin dashboard vs cross-border tax calculator

### 2. Local Codebase (CORRECT APP)
```typescript
// app/layout.tsx - Lines 36-42
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app'),
  title: {
    default: 'TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers',
    template: '%s | TaxBridge',
  },
  description:
    'Free cross-border tax calculator for H-1B and TN visa tech workers with US RSUs living in Canada.',
```

Local codebase metadata:
- **Title:** "TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers"
- **Description:** "Free cross-border tax calculator for H-1B and TN visa tech workers..."
- **Market:** US-Canada
- **Product:** Cross-border tax calculator
- **GitHub Repo:** `https://github.com/caffeineGMT/taxbridge.git`
- **Calculator Route:** `/us-canada-tax-calculator` exists at `app/(marketing)/us-canada-tax-calculator/page.tsx`

### 3. Verification Tests

**Local build:** ✅ PASSES
```bash
npm run build
# Build succeeds, generates all routes including /us-canada-tax-calculator
```

**Production smoke test:** ❌ 5/6 TESTS FAIL
- Site loads (HTTP 200) but serves wrong app
- Calculator not found (input fields timeout)
- Clerk auth widget missing
- Pricing page broken
- PostHog not loaded
- Sentry not loaded

## Root Cause

The Vercel project at `taxbridge.vercel.app` is configured to deploy from:
- **WRONG:** Some other GitHub repository (Nigerian tax platform)
- **CORRECT:** Should be `https://github.com/caffeineGMT/taxbridge.git` (main branch)

### Why This Happened

Possible scenarios:
1. Multiple Vercel projects exist, wrong one has the taxbridge.vercel.app domain
2. The Vercel project was reconfigured to a different repo by accident
3. The domain was reassigned to a different Vercel project

### Why It Persisted

Per CLAUDE.md deployment workflow:
```markdown
⚠️ CRITICAL: Pushing to GitHub = Deploying to Production
GitHub `main` branch is connected to Vercel production.
Every push automatically deploys within 2-5 minutes.
```

Since the Vercel project is connected to the **wrong repo**, pushing to the correct repo (caffeineGMT/taxbridge) doesn't trigger any deployment.

## Fix Instructions (Manual - 15 minutes)

### Step 1: Log into Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Find the team/account that owns the Vercel project

### Step 2: Identify the Problem
Look for **two separate projects**:
1. **The wrong one** (currently at taxbridge.vercel.app):
   - Name: Unknown (possibly "taxbridge" or similar)
   - Description: Nigerian tax platform
   - Repository: Unknown (NOT caffeineGMT/taxbridge)
   - Domain: taxbridge.vercel.app ⚠️

2. **The correct one** (not deployed):
   - Name: "cross-border-tax" (based on .vercel/project.json)
   - Project ID: `prj_3aEJuXVOphdif2UatRYz6H7CpM4z`
   - Repository: `https://github.com/caffeineGMT/taxbridge.git`
   - Branch: `main`
   - Domain: Probably missing or different domain

### Step 3: Fix the Domain Assignment

**Option A: Reassign Domain (Recommended - 5 minutes)**
1. Open the **CORRECT** project ("cross-border-tax")
2. Go to Settings → Domains
3. Add domain: `taxbridge.vercel.app`
4. Remove it from the wrong project if needed
5. Trigger new deployment (Deployments → Redeploy)

**Option B: Fix Repository (Alternative - 10 minutes)**
1. Open the wrong project (currently at taxbridge.vercel.app)
2. Go to Settings → Git
3. Disconnect current repository
4. Connect: `https://github.com/caffeineGMT/taxbridge.git`
5. Set production branch: `main`
6. Trigger new deployment

**Option C: Start Fresh (Nuclear - 15 minutes)**
1. Delete the wrong Vercel project entirely
2. Import new project from GitHub: caffeineGMT/taxbridge
3. Set domain: taxbridge.vercel.app
4. Configure environment variables (see below)
5. Deploy

### Step 4: Verify Environment Variables

After fixing the project connection, ensure these are set in Vercel → Settings → Environment Variables → Production:

**Critical (Revenue Blockers):**
- `STRIPE_SECRET_KEY` (starts with `sk_live_` NOT `sk_test_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_`)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

**Important (Tracking):**
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_DSN`

**Others:**
- `DATABASE_URL` (PostgreSQL connection string)
- `NEXT_PUBLIC_APP_URL=https://taxbridge.vercel.app`

### Step 5: Force Redeploy
1. Go to Deployments tab
2. Click latest deployment → ⋯ menu → Redeploy
3. OR push a commit to GitHub main branch

### Step 6: Verify Fix (Run Smoke Test)
```bash
cd /Users/michaelguo/hivemind-projects/cross-border-tax
npm run smoke-test

# Expected: 6/6 tests pass
# - ✅ Site accessibility (HTTP 200)
# - ✅ Calculator works (inputs visible, calculations work)
# - ✅ Signup/Clerk auth loads
# - ✅ Pricing page shows payment options
# - ✅ PostHog tracking active
# - ✅ Sentry monitoring active
```

## Expected Timeline

- **Fix deployment:** 5-15 minutes (manual Vercel dashboard work)
- **Vercel build + deploy:** 2-5 minutes (automatic after fix)
- **Total:** 10-20 minutes from start to production live

## Success Criteria

When fixed successfully, the homepage at https://taxbridge.vercel.app should show:
- **Title:** "TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers"
- **Content:** Calculator for RSU taxation, H-1B/TN visa workers
- **Routes Working:**
  - `/` - Landing page
  - `/us-canada-tax-calculator` - Main calculator (NOT 404)
  - `/pricing` - Payment page
  - `/sign-up` - Clerk authentication
- **Meta Tags:** US-Canada, cross-border tax, H-1B, TN visa (NOT Nigeria)

## Current Status

- ❌ **Production:** BROKEN - Wrong app deployed
- ✅ **Codebase:** Correct - US-Canada calculator
- ✅ **Build:** Passing - Local build works
- ✅ **GitHub:** Up to date - Latest commit: `1f06e10`
- ❌ **Vercel:** Misconfigured - Wrong repo or wrong project
- ⏳ **Awaiting:** Manual Vercel dashboard fix

## Smoke Test Report

Latest production smoke test (2026-03-19T18:59:43.318Z):
- **Passed:** 1/6 (16.7%)
- **Failed:** 5/6
- **Overall:** ❌ CRITICAL FAILURES - NOT PRODUCTION READY

Failed tests:
1. ❌ Calculator Flow - Timeout waiting for input fields (route returns 404)
2. ❌ Signup/Clerk - Widget not found
3. ❌ Payment/Stripe - Pricing info not visible
4. ❌ PostHog Tracking - Not loaded
5. ❌ Sentry Monitoring - Not detected

See: `docs/PRODUCTION_SMOKE_TEST_REPORT.md`

## Prevention (After Fix)

1. **Document Vercel project mapping:**
   - Project name: cross-border-tax
   - Project ID: prj_3aEJuXVOphdif2UatRYz6H7CpM4z
   - Production domain: taxbridge.vercel.app
   - Repository: github.com/caffeineGMT/taxbridge
   - Branch: main

2. **Set up monitoring:**
   - Vercel deployment notifications to Slack/email
   - UptimeRobot monitoring taxbridge.vercel.app
   - Alert if metadata changes (wrong app deployed again)

3. **Add smoke test to CI/CD:**
   - Run smoke test after every Vercel deployment
   - Block deployment if tests fail
   - Rollback automatically if wrong app detected

## Technical Details

**Local Environment:**
- Working directory: `/Users/michaelguo/hivemind-projects/cross-border-tax`
- Git remote: `https://github.com/caffeineGMT/taxbridge.git`
- Current commit: `1f06e10` (2026-03-19)
- Node version: v20+
- Next.js version: 15.5.13
- Package name: "cross-border-tax"

**Vercel Project (Local Config):**
- `.vercel/project.json` exists
- Project ID: `prj_3aEJuXVOphdif2UatRYz6H7CpM4z`
- Org ID: `team_vmXCjaALzzZziaxVGvfnYdBr`
- Project Name: "cross-border-tax"

**Production URL:**
- Domain: `taxbridge.vercel.app`
- Status: UP (HTTP 200) but serving wrong app
- Current app: Nigerian tax admin dashboard
- Expected app: US-Canada cross-border tax calculator

---

**Next Steps:** Manual Vercel dashboard fix required. Follow Step 1-6 above. ETA 10-20 minutes.
