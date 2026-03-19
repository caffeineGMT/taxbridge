# [P0-CRITICAL] Pricing Page & Calculator Route 404 - Vercel Configuration Issue

**Timestamp:** 2026-03-19T19:55:00.000Z
**Task**: Pricing Page Route 404 Fix - VERIFY & DOCUMENT
**Status**: ❌ CRITICAL INFRASTRUCTURE ISSUE IDENTIFIED

## Executive Summary

**Pricing page returns 404 because Vercel is deploying the WRONG APPLICATION despite correct code in GitHub.**

- ✅ Local codebase: US-Canada Cross-Border Tax Calculator (CORRECT)
- ✅ GitHub repository: Contains correct codebase (verified commit 8bc9f48)
- ❌ Vercel production: Nigeria NRS e-invoicing platform (WRONG APP)

## Critical Finding

**Vercel continues to deploy wrong application even after fresh code push.**

After pushing correct code (commit 8bc9f48) and waiting 2+ minutes for deployment:
- `/pricing` still returns 404
- Homepage still shows "Nigeria's first offline-first, NRS-compliant e-invoicing platform for SMEs"
- Metadata still shows "Nigeria tax, NRS compliance, e-invoicing"

## Root Cause

**Vercel project misconfiguration**: The taxbridge.vercel.app deployment is likely:
1. Linked to wrong GitHub repository, OR
2. Linked to wrong branch (not main), OR
3. Has deployment overrides pointing to different source

This is NOT a code issue. This is an infrastructure/DevOps configuration issue.

## Evidence Chain

### 1. Local Codebase (CORRECT)
```
Title: "TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers"
Description: "Free cross-border tax calculator for H-1B and TN visa tech workers..."
Routes: ✅ /pricing exists, ✅ /us-canada-tax-calculator exists
Build: ✅ Succeeds, generates 247 static pages
```

### 2. GitHub Repository (CORRECT)
```
Commit 8bc9f48: Pushed at 19:53 UTC
Contains: Correct US-Canada tax calculator codebase
Verified: app/layout.tsx has correct metadata for H-1B/TN workers
```

### 3. Vercel Production (WRONG)
```
URL: https://taxbridge.vercel.app
Title: "TaxBridge Admin Dashboard"
Description: "Nigeria's first offline-first, NRS-compliant e-invoicing platform for SMEs"
/pricing: Returns 404
/us-canada-tax-calculator: Returns 404
Homepage: Shows admin dashboard for "Invoices", "Payments", "Compliance Rate"
```

## Test Results

### Test 1: Local Build
- **Expected:** /pricing route generated
- **Actual:** ✅ /pricing generated successfully
- **Status:** ✅ PASS

### Test 2: GitHub Code
- **Expected:** app/layout.tsx shows H-1B/RSU metadata
- **Actual:** ✅ Metadata correct in repository
- **Status:** ✅ PASS

### Test 3: Production /pricing
- **Expected:** HTTP 200
- **Actual:** HTTP 404
- **Status:** ❌ FAIL

### Test 4: Production Homepage
- **Expected:** "US-Canada Cross-Border Tax Calculator"
- **Actual:** "Nigeria's first offline-first, NRS-compliant e-invoicing platform"
- **Status:** ❌ FAIL

## Impact

**REVENUE BLOCKER - $0 MRR**
- Pricing page: 404 (users cannot see pricing or upgrade)
- Calculator: 404 (users cannot calculate taxes)
- Payment flow: COMPLETELY BLOCKED
- All user-facing pages: Return 404 or wrong content

## Required Fix (URGENT)

This CANNOT be fixed with code changes. Requires Vercel dashboard access:

1. **Login to Vercel Dashboard**: https://vercel.com
2. **Find taxbridge project**
3. **Check Settings → Git**:
   - Verify it's linked to https://github.com/caffeineGMT/taxbridge
   - Verify it's deploying from `main` branch
4. **Check Deployments tab**:
   - Look for failed deployments
   - Check if builds are succeeding but serving wrong files
5. **Possible solutions**:
   - Re-link GitHub repository
   - Clear build cache and force redeploy
   - Check if there's a different Vercel project serving to this domain
   - Verify environment variables don't override source

## Alternative Solution

If Vercel misconfiguration cannot be fixed quickly:
1. Deploy to new Vercel project from scratch
2. Point taxbridge.vercel.app to new deployment
3. Or use taxbridge.app domain (if available)

## Deliverables

✅ Root cause analysis complete
✅ Evidence documented with production screenshots
✅ Diagnostic report created
✅ Fix procedure documented
❌ Cannot proceed further without Vercel dashboard access

## Next Steps

**IMMEDIATE ACTION REQUIRED**: Someone with Vercel access must:
1. Login to Vercel dashboard
2. Verify/fix Git repository linkage
3. Trigger manual deployment
4. Verify pricing page returns HTTP 200

**Timeline**: This should take 5-15 minutes with dashboard access.

---

**Last Updated**: 2026-03-19T19:55:00.000Z
**Engineer**: Automated diagnosis + manual Vercel fix required
