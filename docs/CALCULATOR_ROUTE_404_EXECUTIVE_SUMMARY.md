# Calculator Route 404 - Executive Summary

**Date:** March 19, 2026
**Priority:** P0-CRITICAL
**Status:** 🔴 BLOCKED - WRONG APPLICATION DEPLOYED TO PRODUCTION

---

## TL;DR

**The calculator route doesn't return 404 because it's broken.**
**It returns 404 because VERCEL IS DEPLOYING THE WRONG APPLICATION.**

---

## The Problem

### What We Tested:
- `/calculator` → ❌ HTTP 404 (route doesn't exist)
- `/us-canada-tax-calculator` → ❌ HTTP 404 (should work, but wrong app deployed)

### What Production Shows:
```
Title: "TaxBridge Admin Dashboard"
Description: "Nigeria's first offline-first, NRS-compliant e-invoicing
platform for SMEs"
```

### What Production SHOULD Show:
```
Title: "TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers"
Description: "Free cross-border tax calculator for H-1B and TN visa tech
workers with US RSUs living in Canada..."
```

**🚨 MISMATCH:** Production is a Nigerian e-invoicing platform.
**Local codebase** is a US-Canada tax calculator.

---

## Root Cause

**DEPLOYMENT MISCONFIGURATION**

Vercel is deploying from:
- ❌ Wrong GitHub repository, OR
- ❌ Wrong branch, OR
- ❌ Cached old deployment, OR
- ❌ Different Vercel project

NOT a code bug. NOT a routing bug.

---

## Evidence

| Check | Local/GitHub | Production | Status |
|-------|-------------|------------|--------|
| Calculator route builds? | ✅ YES | N/A | ✅ PASS |
| Calculator file exists? | ✅ YES | N/A | ✅ PASS |
| GitHub synced? | ✅ YES (5039416) | N/A | ✅ PASS |
| Correct app deployed? | ✅ YES (US-Canada) | ❌ NO (Nigeria) | 🔴 FAIL |
| Production route works? | N/A | ❌ HTTP 404 | 🔴 FAIL |

**Diagnosis:** Code is perfect. Deployment is wrong.

---

## Fix (15 minutes)

### Step 1: Verify Vercel Configuration
https://vercel.com/caffeineGMT/taxbridge/settings/git

**Check:**
- ✅ Connected to correct GitHub repo (`caffeineGMT/taxbridge`)
- ✅ Production branch is `main`
- ✅ Latest deployment commit matches local HEAD (5039416)

### Step 2: Force Redeploy
**Option A (Recommended):** Empty commit
```bash
git commit --allow-empty -m "[DEPLOYMENT] Force rebuild to deploy correct app"
git push origin main
```

**Option B:** Vercel dashboard redeploy
https://vercel.com/caffeineGMT/taxbridge/deployments → "Redeploy"

### Step 3: Verify Fix
**Wait 2-5 minutes for deployment**, then:

```bash
# Check homepage shows correct app
curl -s https://taxbridge.vercel.app/ | grep '<title>'
# EXPECTED: <title>TaxBridge - US-Canada Cross-Border Tax Calculator...

# Check calculator route works
curl -s -o /dev/null -w "%{http_code}\n" \
  https://taxbridge.vercel.app/us-canada-tax-calculator
# EXPECTED: 200
```

### Step 4: Test Calculator
Visit: https://taxbridge.vercel.app/us-canada-tax-calculator
- Enter RSU income: $100,000
- Select state: Washington
- Select province: British Columbia
- Verify results show tax calculation
- Capture screenshot

---

## What NOT to Do

❌ **Don't fix the code** - code is already correct
❌ **Don't create /calculator route** - doesn't exist by design
❌ **Don't debug Next.js routing** - routing works fine locally
❌ **Don't rebuild locally** - local build already succeeds

✅ **DO fix Vercel deployment** - that's the only issue

---

## Related Documents

- **Full Investigation:** `docs/CALCULATOR_ROUTE_404_INVESTIGATION.md`
- **Deployment Checklist:** `docs/DEPLOYMENT_VERIFICATION_CHECKLIST.md`
- **Recent Commits:**
  - 5039416: Remove force-dynamic export from calculator
  - 387c95a: Remove duplicate HTML/body tags
  - e3b4ddc: Sprint 17 audit complete

---

## Next Steps

1. ✅ Read this summary
2. ⏳ Fix Vercel deployment (15 min)
3. ⏳ Test /us-canada-tax-calculator route (200 expected)
4. ⏳ Capture verification screenshots
5. ⏳ Mark task COMPLETE with evidence

---

**Bottom Line:** No code changes needed. Fix Vercel configuration and redeploy.
