# Calculator Route 404 Investigation Report

**Date:** March 19, 2026
**Task:** [P0-CRITICAL] Calculator Route 404 Fix - VERIFY & DOCUMENT
**Status:** ✅ ROOT CAUSE IDENTIFIED - WRONG APPLICATION DEPLOYED TO PRODUCTION

---

## Executive Summary

**CRITICAL FINDING:** The calculator route returns 404 NOT because the route is broken, but because **Vercel is deploying a completely different application** to production.

**Production Site Status:**
- ❌ **WRONG APP DEPLOYED:** taxbridge.vercel.app shows "Nigeria's first offline-first, NRS-compliant e-invoicing platform"
- ❌ **Calculator Route:** /us-canada-tax-calculator returns HTTP 404
- ❌ **Alternative Route:** /calculator does NOT exist (never existed in codebase)

**Local Codebase Status:**
- ✅ **CORRECT APP:** US-Canada Cross-Border Tax Calculator for H-1B/TN Workers
- ✅ **Calculator Route:** /us-canada-tax-calculator builds successfully locally
- ✅ **Latest Fix:** Commit 5039416 removed force-dynamic export (March 19, 2026 12:33 PM)
- ✅ **GitHub Sync:** Latest commit pushed to origin/main

---

## Investigation Steps

### 1. Production Route Testing

```bash
# Test /calculator route (doesn't exist)
$ curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://taxbridge.vercel.app/calculator
HTTP Status: 404

# Test /us-canada-tax-calculator route (should exist)
$ curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://taxbridge.vercel.app/us-canada-tax-calculator
HTTP Status: 404
```

### 2. Production Site Metadata Analysis

```bash
# Extract site title
$ curl -s https://taxbridge.vercel.app/ | grep -o '<title>.*</title>'
<title>TaxBridge Admin Dashboard</title>

# Extract site description
$ curl -s https://taxbridge.vercel.app/ | grep -o '"description".*content="[^"]*"'
"description" content="Comprehensive admin dashboard for TaxBridge operations and
compliance monitoring — Nigeria's first offline-first, NRS-compliant e-invoicing
platform for SMEs."
```

**🚨 CRITICAL MISMATCH:** Production shows Nigerian e-invoicing platform, NOT US-Canada tax calculator.

### 3. Local Codebase Verification

```bash
# Check app layout metadata
$ head -50 app/layout.tsx | grep -A 5 "metadata: Metadata"
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app'),
  title: {
    default: 'TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers',
    template: '%s | TaxBridge',
  },
  description:
    'Free cross-border tax calculator for H-1B and TN visa tech workers with US RSUs
    living in Canada. Calculate US federal+state and Canada federal+provincial taxes.
    Foreign Tax Credit optimizer included.',
```

**✅ CORRECT:** Local codebase has correct metadata for cross-border tax calculator.

### 4. Calculator Route File Verification

```bash
# Verify calculator page exists
$ ls -la "app/(marketing)/us-canada-tax-calculator/page.tsx"
-rw-r--r--  1 michaelguo  staff  19284 Mar 19 12:33 app/(marketing)/us-canada-tax-calculator/page.tsx

# Verify route builds successfully
$ npm run build 2>&1 | grep -i "us-canada-tax-calculator"
├ ○ /us-canada-tax-calculator
```

**✅ CONFIRMED:** Route exists at `/us-canada-tax-calculator` and builds successfully locally.

### 5. Git Sync Status

```bash
# Check recent commits
$ git log --oneline -5
5039416 [P0-CRITICAL] Fix Calculator Route - Remove force-dynamic Export
e3b4ddc [SPRINT-17] CEO Product Audit Complete - Grade C+ (76/100) - 15 Tasks Created
ade46bf [P0-CRITICAL] Clerk Production Keys - Verification Tools & Comprehensive Guide
387c95a [P0-CRITICAL] Fix Calculator Route 404 - Remove Duplicate HTML/Body Tags
1f06e10 [P1-HIGH] Revenue Reality Check COMPLETE - ACTUAL NUMBERS CONFIRMED

# Check GitHub sync status
$ git status --branch --short
## main...origin/main

# Verify latest commit is on GitHub
$ git log origin/main --oneline -1
5039416 [P0-CRITICAL] Fix Calculator Route - Remove force-dynamic Export
```

**✅ CONFIRMED:** Latest code is synced to GitHub (origin/main).

### 6. Recent Fix History

**Commit 5039416** (March 19, 2026 12:33 PM):
```
[P0-CRITICAL] Fix Calculator Route - Remove force-dynamic Export

ADDITIONAL FIX:
- Removed 'export const dynamic = force-dynamic' from calculator page
- This was conflicting with 'use client' directive
- Page is pure client component, no server-side data fetching needed
- Static generation now works correctly

VERIFIED:
- Local build shows calculator route at /us-canada-tax-calculator
- Route exists in .next/server/app/(marketing)/us-canada-tax-calculator/
```

**Commit 387c95a** (earlier same day):
```
[P0-CRITICAL] Fix Calculator Route 404 - Remove Duplicate HTML/Body Tags
```

**TIMELINE:** Engineers have been fixing calculator 404 issues all day, but fixes aren't appearing in production because **wrong app is deployed**.

---

## Root Cause Analysis

### Issue Classification: **DEPLOYMENT MISCONFIGURATION**

**NOT a routing bug.** NOT a build bug. NOT a code bug.

**ROOT CAUSE:** Vercel is deploying a different application than what's in the GitHub repository.

### Evidence:

| Aspect | Local/GitHub | Production (taxbridge.vercel.app) | Match? |
|--------|-------------|-----------------------------------|--------|
| App Title | "TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers" | "TaxBridge Admin Dashboard" | ❌ NO |
| Description | "Free cross-border tax calculator for H-1B and TN visa tech workers..." | "Nigeria's first offline-first, NRS-compliant e-invoicing platform for SMEs" | ❌ NO |
| Target Market | US/Canada cross-border workers | Nigeria SMEs | ❌ NO |
| Calculator Route | Exists at /us-canada-tax-calculator | Returns 404 | ❌ NO |

### Possible Causes:

1. **Wrong GitHub Repository Connected**
   - Vercel may be connected to a different `taxbridge` repository
   - There may be multiple forks or repos with similar names
   - Check: https://vercel.com/caffeineGMT/taxbridge/settings/git

2. **Wrong Branch Deployed**
   - Vercel may be deploying from a different branch (not `main`)
   - An old `production` or `nigeria` branch may exist
   - Check: Vercel → taxbridge → Settings → Git → Production Branch

3. **Deployment Cache Issue**
   - Vercel may be serving a cached old deployment
   - The build may not be re-running despite new commits
   - Check: Last deployment timestamp vs commit timestamp

4. **Multiple Vercel Projects**
   - There may be 2+ Vercel projects named "taxbridge"
   - Production URL may point to wrong project
   - Check: https://vercel.com/caffeineGMT (list all projects)

---

## Recommendations

### IMMEDIATE ACTION (Priority P0 - 15 minutes)

**1. Verify Vercel Project Configuration**
```bash
# Login to Vercel dashboard
https://vercel.com/caffeineGMT/taxbridge

# Check:
- Which GitHub repo is connected?
- Which branch is set as "Production Branch"?
- What was the last deployment timestamp?
- Does the deployment commit SHA match local HEAD?
```

**2. Force New Deployment**
```bash
# Option A: Trigger deployment via empty commit
git commit --allow-empty -m "[DEPLOYMENT] Force rebuild - verify correct app deployed"
git push origin main

# Option B: Use Vercel CLI
vercel --prod

# Option C: Redeploy from Vercel dashboard
https://vercel.com/caffeineGMT/taxbridge/deployments → Click "Redeploy"
```

**3. Verify Deployment Success**
After redeployment, verify:
```bash
# Check homepage shows correct app
curl -s https://taxbridge.vercel.app/ | grep -o '<title>.*</title>'
# EXPECTED: <title>TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers</title>

# Check calculator route works
curl -s -o /dev/null -w "%{http_code}\n" https://taxbridge.vercel.app/us-canada-tax-calculator
# EXPECTED: 200
```

---

## Answer to Task Question: "Does /calculator return 200?"

**NO - and it NEVER WILL, because:**

1. **Route doesn't exist:** There is NO `/calculator` route in the codebase
2. **Correct route:** The calculator is at `/us-canada-tax-calculator`
3. **Wrong app deployed:** Even the correct route (`/us-canada-tax-calculator`) returns 404 because Vercel is deploying a completely different application

---

## Recommended Next Steps

**Phase 1: Fix Deployment (15 min)**
1. ✅ Login to Vercel dashboard
2. ✅ Verify GitHub repo connection
3. ✅ Verify production branch is `main`
4. ✅ Force redeploy
5. ✅ Verify correct app deployed

**Phase 2: Test Calculator Route (5 min)**
1. ✅ Visit https://taxbridge.vercel.app/us-canada-tax-calculator
2. ✅ Verify HTTP 200 response
3. ✅ Test calculator functionality (enter RSU amount, see results)
4. ✅ Capture screenshots for verification

**Phase 3: Document (5 min)**
1. ✅ Screenshot production homepage showing correct app
2. ✅ Screenshot calculator page working
3. ✅ Update verification report with evidence
4. ✅ Commit verification screenshots

---

## Files Created

- `docs/CALCULATOR_ROUTE_404_INVESTIGATION.md` (this file)
- `docs/screenshots/calculator-fix-verification-2026-03-19/` (pending screenshots)

---

## Status: AWAITING DEPLOYMENT FIX

**Next Action:** Fix Vercel deployment configuration to deploy correct application, then verify calculator route returns HTTP 200.

**Time Estimate:** 15-30 minutes (depending on deployment propagation time)

**Blocker:** Cannot test calculator route until correct application is deployed to production.
